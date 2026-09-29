import assert from "node:assert/strict";
import { chmod, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { AGENTS, assertCatalog, getAgent, gooseAssetName } from "../src/catalog.mjs";
import { parseArgs } from "../src/cli.mjs";
import { planInstall } from "../src/installer.mjs";
import { parseVersion } from "../src/probe.mjs";
import { buildInvocation, resolveBin } from "../src/runner.mjs";
import { npmPrefix } from "../src/paths.mjs";
import { createApp } from "../src/server.mjs";

const bin = fileURLToPath(new URL("../bin/bossmind.mjs", import.meta.url));

test("catalog is a pinned set of free open-source agents", () => {
  assert.equal(assertCatalog().length, 10);
  const ids = AGENTS.map((agent) => agent.id);
  assert.deepEqual(new Set(ids).size, ids.length);
  for (const agent of AGENTS) {
    assert.match(agent.license, /^(Apache-2.0|MIT)$/);
    assert.match(agent.repo, /^https:\/\/github.com\/[^/]+\/[^/]+$/);
  }
});

test("goose asset names follow the upstream release layout", () => {
  assert.equal(gooseAssetName("linux", "x64"), "goose-x86_64-unknown-linux-gnu.tar.gz");
  assert.equal(gooseAssetName("linux", "arm64"), "goose-aarch64-unknown-linux-gnu.tar.gz");
  assert.equal(gooseAssetName("darwin", "arm64"), "goose-aarch64-apple-darwin.tar.gz");
  assert.throws(() => gooseAssetName("win32", "x64"), /Linux and macOS/);
});

test("install plans shell out with argv arrays and pinned specs", () => {
  const cwd = "/work/BossMind";
  for (const agent of AGENTS) {
    if (agent.install.kind === "github-release") continue;
    const plan = planInstall(agent, cwd);
    assert.ok(plan.steps.length >= 1);
    const args = plan.steps.flatMap((step) => {
      assert.equal(typeof step.cmd, "string");
      assert.ok(Array.isArray(step.args));
      return step.args;
    });
    assert.equal(args.includes(agent.install.spec), true);
  }
  const goose = planInstall(getAgent("goose"), cwd, "linux", "x64");
  assert.equal(
    goose.url,
    "https://github.com/aaif-goose/goose/releases/download/v1.52.0/goose-x86_64-unknown-linux-gnu.tar.gz",
  );
  const aider = planInstall(getAgent("aider"), cwd);
  assert.deepEqual(aider.steps[0].args.slice(0, 3), ["-m", "venv", path.join(cwd, ".bossmind", "runtime", "venv", "aider")]);
  assert.equal(aider.steps[1].args.at(-1), "aider-chat==0.86.2");
});

test("run invocations keep the prompt as one argument", () => {
  const prompt = "fix tests; rm -rf / --no-preserve-root";
  const expected = {
    aider: ["--yes-always", "--no-auto-commits", "--skip-sanity-check-repo", "--model", "ollama/qwen", "--message", prompt],
    opencode: ["run", "--auto", "-m", "opencode/model", prompt],
    cline: ["--json", "--auto-approve", "true", "-m", "openai/gpt", prompt],
    gemini: ["--yolo", "--model", "gemini-flash", "-p", prompt],
    codex: ["exec", "--skip-git-repo-check", prompt],
    continue: ["-p", prompt],
    qwen: ["--yolo", prompt],
    openhands: ["--headless", "--json", "--exit-without-confirmation", "-t", prompt],
    "mini-swe-agent": ["--yolo", "--exit-immediately", "--model", "openai/gpt", "--task", prompt],
    goose: ["run", "--no-session", "--quiet", "--model", "claude", "-t", prompt],
  };
  const models = {
    aider: "ollama/qwen",
    opencode: "opencode/model",
    cline: "openai/gpt",
    gemini: "gemini-flash",
    "mini-swe-agent": "openai/gpt",
    goose: "claude",
  };
  for (const agent of AGENTS) {
    const invocation = buildInvocation(agent, { prompt, model: models[agent.id] });
    assert.deepEqual(invocation.args, expected[agent.id], agent.id);
    assert.equal(invocation.args.filter((arg) => arg === prompt).length, 1);
  }
  assert.throws(() => buildInvocation(getAgent("aider"), { prompt: "   " }), /prompt/);
  assert.throws(() => buildInvocation(getAgent("continue"), { prompt: "hi", model: "x" }), /model override/);
});

test("npm agents resolve from package.json when the .bin shim is missing", async () => {
  const cwd = await mkdtemp(path.join(tmpdir(), "bossmind-bin-"));
  const script = path.join(npmPrefix(cwd, "cline"), "node_modules", "cline", "bin", "cline");
  await mkdir(path.dirname(script), { recursive: true });
  await writeFile(
    path.join(path.dirname(script), "..", "package.json"),
    JSON.stringify({ name: "cline", bin: { cline: "./bin/cline" } }),
  );
  await writeFile(script, "#!/bin/sh\necho ok\n");
  await chmod(script, 0o755);
  assert.equal(await resolveBin(getAgent("cline"), cwd), script);
  await rm(cwd, { recursive: true, force: true });
});

test("argument parser accepts a prompt after --", () => {
  const parsed = parseArgs(["run", "aider", "--model", "ollama/qwen", "--cwd", "/repo", "--", "ship", "the", "fix"]);
  assert.equal(parsed.cmd, "run");
  assert.equal(parsed.positionals[0], "aider");
  assert.equal(parsed.flags.model, "ollama/qwen");
  assert.equal(parsed.flags.cwd, "/repo");
  assert.equal(parsed.prompt, "ship the fix");
  assert.throws(() => parseArgs(["install", "--nope"]), /Unknown flag/);
});

test("version parser keeps the first non-empty line", () => {
  assert.equal(parseVersion("\nAider v0.86.2\nmore"), "Aider v0.86.2");
});

test("dashboard and agent API serve the catalog", async () => {
  const cwd = await mkdtemp(path.join(tmpdir(), "bossmind-"));
  const server = createApp(cwd);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  try {
    const health = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.equal((await health.json()).ok, true);
    const agents = await fetch(`http://127.0.0.1:${port}/api/agents`);
    const body = await agents.json();
    assert.equal(body.agents.length, AGENTS.length);
    assert.equal(body.agents.every((agent) => agent.status === "not-installed"), true);
    const page = await fetch(`http://127.0.0.1:${port}/`);
    const html = await page.text();
    assert.match(html, /BossMind/);
    assert.match(html, /Probe binaries/);
    const missing = await fetch(`http://127.0.0.1:${port}/nope`);
    assert.equal(missing.status, 404);
  } finally {
    server.close();
    await rm(cwd, { recursive: true, force: true });
  }
});

test("CLI lists agents as JSON", async () => {
  const cwd = await mkdtemp(path.join(tmpdir(), "bossmind-cli-"));
  const result = await runCli(["agents", "--json"], cwd);
  assert.equal(result.code, 0, result.stderr);
  const body = JSON.parse(result.stdout);
  assert.equal(body.agents.length, 10);
  assert.ok(body.agents.some((agent) => agent.id === "opencode" && agent.license === "MIT"));
  await rm(cwd, { recursive: true, force: true });
});

function runCli(args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [bin, ...args], { cwd });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}
