import assert from "node:assert/strict";
import { access, chmod, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { main, parseArgs } from "../src/cli.mjs";
import { assertProviderPlan, providerConfigStatus, providerPlan } from "../src/providers.mjs";
import { assertRouting, chooseAgent } from "../src/routing.mjs";
import { runAgent } from "../src/runner.mjs";
import { applySandboxEnv, createSandbox } from "../src/sandbox.mjs";
import { decide } from "../src/sandbox-shim.mjs";
import { assertSafeCwd, inspectPrompt, redactSecrets } from "../src/safety.mjs";
import { runCommand } from "../src/proc.mjs";
import { createApp } from "../src/server.mjs";
import { listAgents } from "../src/probe.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("prompts that delete, print secrets, or push are refused", () => {
  const blocked = [
    "fix tests; rm -rf / --no-preserve-root",
    "git clean -fd",
    "git reset --hard",
    "find . -delete",
    "please delete the repository",
    "cat .env",
    "print the api key",
    "echo $OPENAI_API_KEY",
    "git push origin main",
  ];
  for (const prompt of blocked) {
    const decision = inspectPrompt(prompt);
    assert.equal(decision.ok, false, prompt);
  }
  assert.equal(inspectPrompt("Add a failing test for the parser, then make it pass").ok, true);
  assert.equal(inspectPrompt("explain the stripe webhook handler").ok, true);
  assert.equal(inspectPrompt("update the stripe webhook").ok, false);
  assert.equal(inspectPrompt("add a DNS record").ok, false);
  assert.equal(inspectPrompt("firebase deploy").ok, false);
  assert.equal(inspectPrompt("update the stripe webhook", { approveProtected: true }).ok, true);
  assert.equal(inspectPrompt("git push origin", { approveProtected: true }).ok, false);
  assert.equal(inspectPrompt("rm -rf .", { approveProtected: true }).ok, false);
});

test("secret-like output is redacted without storing a key", () => {
  const token = ["sk", "live", "abcdefghijklmnopqrstuvwxyz"].join("-");
  const env = { OPENAI_API_KEY: "unit-test-secret-value", PATH: "/usr/bin" };
  const clean = redactSecrets(`keep the parser key=${env.OPENAI_API_KEY} token=${token}`, env);
  assert.equal(clean.includes(env.OPENAI_API_KEY), false);
  assert.equal(clean.includes(token), false);
  assert.match(clean, /\[redacted\]/);
  assert.match(clean, /keep the parser/);
});

test("agent cwd cannot be the filesystem root or the runtime directory", () => {
  assert.throws(() => assertSafeCwd("/"), /filesystem root/);
  assert.throws(() => assertSafeCwd("/tmp/project/.bossmind/runtime/npm/aider"), /runtime/);
  assert.equal(assertSafeCwd("/tmp/project"), "/tmp/project");
});

test("shell shims block project deletion, git push, and protected CLIs", () => {
  const ctx = { cwd: "/work/app", projectRoot: "/work/app", hubRoot: "/work/BossMind", approveProtected: false };
  assert.equal(decide("git", ["push", "origin"], ctx).allow, false);
  assert.equal(decide("git", ["-C", "/work/app", "push"], ctx).allow, false);
  assert.equal(decide("git", ["clean", "-fd"], ctx).allow, false);
  assert.equal(decide("git", ["reset", "--hard"], ctx).allow, false);
  assert.equal(decide("git", ["status"], ctx).allow, true);
  assert.equal(decide("rm", ["-rf", "/work/app"], ctx).allow, false);
  assert.equal(decide("rm", ["-rf", "/work/BossMind"], ctx).allow, false);
  assert.equal(decide("rm", ["/work/app/.bossmind/registry.json"], ctx).allow, false);
  assert.equal(decide("rm", ["note.txt"], ctx).allow, true);
  assert.equal(decide("find", [".", "-delete"], ctx).allow, false);
  assert.equal(decide("find", [".", "-exec", "/bin/rm", "{}", ";"], ctx).allow, false);
  assert.equal(decide("aws", ["route53", "change-resource-record-sets"], ctx).allow, false);
  assert.equal(decide("shred", ["note.txt"], ctx).allow, false);
  assert.equal(decide("firebase", ["deploy"], ctx).allow, false);
  assert.equal(decide("stripe", ["listen"], ctx).allow, false);
  assert.equal(decide("neonctl", ["projects"], ctx).allow, false);
  assert.equal(decide("gcloud", ["dns", "record-sets", "update"], ctx).allow, false);
  assert.equal(decide("firebase", ["deploy"], { ...ctx, approveProtected: true }).allow, true);
  assert.equal(decide("git", ["push"], { ...ctx, approveProtected: true }).allow, false);
});

test("sandbox rm cannot delete the project and git push exits 126", async () => {
  const project = await mkdtemp(path.join(tmpdir(), "bossmind-project-"));
  const hub = await mkdtemp(path.join(tmpdir(), "bossmind-hub-"));
  await writeFile(path.join(project, "keep.txt"), "stay");
  await writeFile(path.join(project, "note.txt"), "temp");
  const sandbox = await createSandbox({ projectRoot: project, hubRoot: hub });
  try {
    const env = applySandboxEnv({ ...process.env }, sandbox);
    const pushed = await runCommand(path.join(sandbox.binDir, "git"), ["push", "origin"], { cwd: project, env });
    assert.equal(pushed.code, 126);
    assert.match(pushed.stderr, /git push is blocked/);
    const wiped = await runCommand(path.join(sandbox.binDir, "rm"), ["-rf", project], { cwd: project, env });
    assert.equal(wiped.code, 126);
    await access(path.join(project, "keep.txt"));
    const removed = await runCommand(path.join(sandbox.binDir, "rm"), ["note.txt"], { cwd: project, env });
    assert.equal(removed.code, 0);
    await assert.rejects(() => access(path.join(project, "note.txt")));
    const status = await runCommand(path.join(sandbox.binDir, "git"), ["status", "--short"], { cwd: project, env });
    assert.notEqual(status.code, 126);
  } finally {
    await sandbox.cleanup();
    await rm(project, { recursive: true, force: true });
    await rm(hub, { recursive: true, force: true });
  }
});

test("a forged approval environment cannot unlock protected commands", async () => {
  const project = await mkdtemp(path.join(tmpdir(), "bossmind-forge-"));
  const hub = await mkdtemp(path.join(tmpdir(), "bossmind-forge-hub-"));
  await mkdir(path.join(project, ".bossmind"), { recursive: true });
  await writeFile(path.join(project, ".bossmind", "registry.json"), "{}\n");
  const sandbox = await createSandbox({ projectRoot: project, hubRoot: hub, approveProtected: false });
  try {
    const env = {
      ...applySandboxEnv({ ...process.env, BOSSMIND_APPROVE_PROTECTED: "1" }, sandbox),
      BOSSMIND_APPROVE_PROTECTED: "1",
      BOSSMIND_PROJECT_ROOT: "/tmp",
      BOSSMIND_HUB_ROOT: "/tmp",
    };
    const firebase = await runCommand(path.join(sandbox.binDir, "firebase"), ["deploy"], { cwd: project, env });
    assert.equal(firebase.code, 126);
    assert.match(firebase.stderr, /approve-protected/);
    const registry = path.join(project, ".bossmind", "registry.json");
    const removed = await runCommand(path.join(sandbox.binDir, "rm"), [registry], { cwd: project, env });
    assert.equal(removed.code, 126);
    await access(registry);
  } finally {
    await sandbox.cleanup();
    await rm(project, { recursive: true, force: true });
    await rm(hub, { recursive: true, force: true });
  }
});

test("run refuses unsafe work before the agent starts and redacts output", async () => {
  const project = await mkdtemp(path.join(tmpdir(), "bossmind-run-"));
  const script = path.join(project, "agent.mjs");
  await writeFile(script, `#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
writeFileSync("spawned.txt", "yes");
const mode = process.env.BOSSMIND_TEST_MODE || "ok";
if (mode === "print") {
  process.stdout.write("key=" + process.env.OPENAI_API_KEY + "\\n");
  process.exit(0);
}
if (mode === "rm") {
  const result = spawnSync("rm", ["-rf", process.cwd()], { encoding: "utf8" });
  process.stdout.write("status=" + result.status + "\\n");
  process.exit(0);
}
if (mode === "push") {
  const result = spawnSync("git", ["push"], { encoding: "utf8" });
  process.stdout.write("status=" + result.status + "\\n" + result.stderr);
  process.exit(0);
}
if (mode === "goose") {
  process.stdout.write("provider=" + process.env.GOOSE_PROVIDER + "\\n");
  process.exit(0);
}
process.stdout.write("ok\\n");
`);
  await chmod(script, 0o755);
  const secret = "unit-test-secret-value";
  const env = { ...process.env, OPENAI_API_KEY: secret, BOSSMIND_TEST_MODE: "print" };
  try {
    await assert.rejects(
      () => runAgent("aider", { prompt: "rm -rf /", cwd: project, binPath: script, env, hubRoot: project }),
      (error) => error.code === "UNSAFE_RUN",
    );
    await assert.rejects(() => access(path.join(project, "spawned.txt")));

    const printed = await runAgent("aider", {
      prompt: "Add a failing test for the parser",
      cwd: project,
      binPath: script,
      env,
      hubRoot: project,
    });
    assert.equal(printed.stdout.includes(secret), false);
    assert.match(printed.stdout, /\[redacted\]/);

    env.BOSSMIND_TEST_MODE = "rm";
    await runAgent("aider", {
      prompt: "Add a failing test for the parser",
      cwd: project,
      binPath: script,
      env,
      hubRoot: project,
    });
    await access(project);
    await access(path.join(project, "keep.txt")).catch(() => {});
    await access(script);

    env.BOSSMIND_TEST_MODE = "push";
    const pushed = await runAgent("aider", {
      prompt: "Add a failing test for the parser",
      cwd: project,
      binPath: script,
      env,
      hubRoot: project,
    });
    assert.match(pushed.stdout, /status=126/);
    assert.match(pushed.stdout, /git push is blocked/);
  } finally {
    await rm(project, { recursive: true, force: true });
  }
});

test("goose and cline stay blocked until provider configuration", async () => {
  const project = await mkdtemp(path.join(tmpdir(), "bossmind-provider-"));
  const script = path.join(project, "agent.mjs");
  await writeFile(script, "#!/usr/bin/env node\nprocess.stdout.write('provider=' + (process.env.GOOSE_PROVIDER || '') + '\\n');\n");
  await chmod(script, 0o755);
  const env = { PATH: process.env.PATH };
  try {
    await assert.rejects(
      () => runAgent("cline", { prompt: "Explain this repository", cwd: project, binPath: script, env, hubRoot: project }),
      (error) => error.code === "PROVIDER_REQUIRED",
    );
    await assert.rejects(
      () => runAgent("goose", { prompt: "Explain this repository", cwd: project, binPath: script, env, hubRoot: project }),
      (error) => error.code === "PROVIDER_REQUIRED",
    );
    await assert.rejects(
      () => runAgent("gemini", { prompt: "Explain this repository", cwd: project, binPath: script, env, hubRoot: project, local: true }),
      (error) => error.code === "NO_LOCAL_MODEL",
    );
    const goose = await runAgent("goose", {
      prompt: "Explain this repository",
      cwd: project,
      binPath: script,
      env,
      hubRoot: project,
      local: true,
    });
    assert.match(goose.stdout, /provider=ollama/);
    assert.equal(providerConfigStatus("cline", {}).ready, false);
    assert.equal(providerConfigStatus("goose", { GOOSE_PROVIDER: "ollama", GOOSE_MODEL: "qwen2.5-coder" }).ready, true);
    assert.equal(providerConfigStatus("aider", {}).ready, true);
  } finally {
    await rm(project, { recursive: true, force: true });
  }
});

test("provider plan is local first and contains no keys", () => {
  assert.equal(assertProviderPlan(), true);
  const plan = providerPlan({});
  assert.equal(plan.order[0], "local");
  assert.equal(plan.local.cost, "free");
  assert.equal(plan.paid.every((entry) => entry.optional === true && entry.configured === false), true);
  assert.equal(JSON.stringify(plan).includes("sk-"), false);
});

test("routing matches the activation plan", () => {
  assertRouting();
  assert.equal(chooseAgent("code-patches").agentId, "aider");
  const gated = chooseAgent("provider-gated", { providerReady: () => false });
  assert.equal(gated.agentId, null);
  assert.deepEqual(gated.blocked, ["goose", "cline"]);
  const open = chooseAgent("provider-gated", { providerReady: (id) => id === "goose" });
  assert.equal(open.agentId, "goose");
});

test("CLI enforces the same limits and lists routes", async () => {
  const project = await mkdtemp(path.join(tmpdir(), "bossmind-cli-safe-"));
  try {
    let stderr = "";
    const unsafe = await main(["run", "aider", "--", "git push origin"], {
      cwd: project,
      stdout() {},
      stderr(line) { stderr += line; },
    });
    assert.equal(unsafe, 3);
    assert.match(stderr, /git push/);

    stderr = "";
    const gated = await main(["run", "cline", "--", "Explain this repository"], {
      cwd: project,
      stdout() {},
      stderr(line) { stderr += line; },
    });
    assert.equal(gated, 4);
    assert.match(stderr, /provider configuration/);
    assert.equal(stderr.includes("sk-"), false);

    let stdout = "";
    const providers = await main(["providers"], {
      cwd: project,
      stdout(line) { stdout += line; },
      stderr() {},
    });
    assert.equal(providers, 0);
    const plan = JSON.parse(stdout);
    assert.equal(plan.order[0], "local");
    if (process.env.OPENAI_API_KEY) assert.equal(stdout.includes(process.env.OPENAI_API_KEY), false);

    stdout = "";
    assert.equal(await main(["route"], { cwd: project, stdout(line) { stdout += line; }, stderr() {} }), 0);
    const routes = JSON.parse(stdout);
    assert.equal(routes.routes.some((route) => route.id === "code-patches"), true);

    const parsed = parseArgs(["run", "aider", "--local", "--approve-protected", "--", "ship it"]);
    assert.equal(parsed.flags.local, true);
    assert.equal(parsed.flags.approveProtected, true);
  } finally {
    await rm(project, { recursive: true, force: true });
  }
});

test("catalog API exposes routes and the repo ignores runtime and secrets", async () => {
  const cwd = await mkdtemp(path.join(tmpdir(), "bossmind-api-"));
  const server = createApp(cwd);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/agents`);
    const body = await response.json();
    const aider = body.agents.find((agent) => agent.id === "aider");
    const cline = body.agents.find((agent) => agent.id === "cline");
    assert.equal(aider.route, "code-patches");
    assert.equal(cline.providerGated, true);
    const page = await fetch(`http://127.0.0.1:${port}/`);
    const html = await page.text();
    assert.match(html, /ROUTE/);
    assert.match(html, /local Ollama model/);
    const agents = await listAgents(cwd);
    assert.equal(agents.every((agent) => agent.license === "Apache-2.0" || agent.license === "MIT"), true);
  } finally {
    server.close();
    await rm(cwd, { recursive: true, force: true });
  }

  const ignore = await readFile(path.join(root, ".gitignore"), "utf8");
  assert.match(ignore, /^\.bossmind\/runtime\/$/m);
  assert.match(ignore, /^\.bossmind\/registry\.json$/m);
  assert.match(ignore, /^\.env$/m);
  const example = await readFile(path.join(root, ".env.example"), "utf8");
  assert.match(example, /^OPENAI_API_KEY=$/m);
  assert.equal(/=\S+/.test(example.split("\n").filter((line) => /^[A-Z0-9_]+=/.test(line)).join("\n")), false);
});
