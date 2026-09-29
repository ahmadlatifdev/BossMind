import { AGENTS } from "./catalog.mjs";
import { installAgents } from "./installer.mjs";
import { listAgents, probeAll } from "./probe.mjs";
import { providerConfigStatus, providerPlan } from "./providers.mjs";
import { chooseAgent, ROUTES } from "./routing.mjs";
import { runAgent } from "./runner.mjs";
import { SAFETY_LIMITS } from "./safety.mjs";
import { listen } from "./server.mjs";

export function parseArgs(argv) {
  const args = [...argv];
  const cmd = args.shift() || "help";
  const flags = { all: false, json: false };
  const positionals = [];
  const splitAt = args.indexOf("--");
  let prompt = null;
  const tokens = splitAt === -1 ? args : args.slice(0, splitAt);
  if (splitAt !== -1) prompt = args.slice(splitAt + 1).join(" ").trim();

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token === "--all") flags.all = true;
    else if (token === "--json") flags.json = true;
    else if (token === "--port") flags.port = requiredValue(tokens, ++i, "--port");
    else if (token.startsWith("--port=")) flags.port = token.slice("--port=".length);
    else if (token === "--model") flags.model = requiredValue(tokens, ++i, "--model");
    else if (token === "--cwd") flags.cwd = requiredValue(tokens, ++i, "--cwd");
    else if (token === "--timeout") flags.timeout = requiredValue(tokens, ++i, "--timeout");
    else if (token === "--local") flags.local = true;
    else if (token === "--approve-protected") flags.approveProtected = true;
    else if (token.startsWith("-")) throw new Error(`Unknown flag ${token}`);
    else positionals.push(token);
  }

  if (!prompt && cmd === "run" && positionals.length > 1) {
    prompt = positionals.slice(1).join(" ");
    positionals.splice(1);
  }
  return { cmd, flags, positionals, prompt };
}

function requiredValue(tokens, index, flag) {
  const value = tokens[index];
  if (!value || value.startsWith("-")) throw new Error(`${flag} needs a value`);
  return value;
}

export async function main(argv = process.argv.slice(2), io = {}) {
  const stdout = io.stdout || ((line) => process.stdout.write(line));
  const stderr = io.stderr || ((line) => process.stderr.write(line));
  const cwd = io.cwd || process.cwd();
  let parsed;
  try {
    parsed = parseArgs(argv);
  } catch (error) {
    stderr(`${error.message}\n`);
    stderr(`${helpText()}\n`);
    return 1;
  }

  try {
    switch (parsed.cmd) {
      case "help":
      case "--help":
      case "-h":
        stdout(`${helpText()}\n`);
        return 0;
      case "agents":
      case "list":
        return await printAgents(cwd, parsed.flags.json, stdout);
      case "status": {
        const probed = await probeAll(cwd);
        if (parsed.flags.json) stdout(`${JSON.stringify({ agents: probed }, null, 2)}\n`);
        else stdout(`${formatTable(await listAgents(cwd))}\n`);
        return probed.some((agent) => agent.status === "broken") ? 1 : 0;
      }
      case "install": {
        const ids = parsed.flags.all ? AGENTS.map((agent) => agent.id) : parsed.positionals;
        if (!ids.length) {
          stderr("Name at least one agent, or pass --all.\n");
          stderr(`${helpText()}\n`);
          return 1;
        }
        const results = await installAgents(ids, {
          cwd,
          onLog: (line) => stdout(line.endsWith("\n") ? line : `${line}\n`),
        });
        const failed = results.filter((result) => result.status !== "installed");
        stdout(`${JSON.stringify({ results }, null, 2)}\n`);
        return failed.length ? 1 : 0;
      }
      case "run": {
        const id = parsed.positionals[0];
        if (!id || !parsed.prompt) {
          stderr("Usage: bossmind run <agent> -- <prompt>\n");
          return 1;
        }
        const timeoutMs = parsed.flags.timeout ? Number(parsed.flags.timeout) * 1000 : 0;
        if (parsed.flags.timeout && !Number.isFinite(timeoutMs)) {
          stderr("--timeout must be a number of seconds\n");
          return 1;
        }
        const result = await runAgent(id, {
          prompt: parsed.prompt,
          model: parsed.flags.model,
          local: parsed.flags.local,
          approveProtected: parsed.flags.approveProtected,
          cwd: parsed.flags.cwd || cwd,
          projectRoot: cwd,
          timeoutMs,
          onStdout: (chunk) => stdout(chunk),
          onStderr: (chunk) => stderr(chunk),
        });
        return result.code;
      }
      case "providers":
        stdout(`${JSON.stringify(providerPlan(), null, 2)}\n`);
        return 0;
      case "route": {
        const routeId = parsed.positionals[0];
        if (!routeId) {
          stdout(`${JSON.stringify({ routes: ROUTES }, null, 2)}\n`);
          return 0;
        }
        const choice = chooseAgent(routeId, {
          providerReady: (id) => providerConfigStatus(id, process.env).ready,
        });
        stdout(`${JSON.stringify(choice, null, 2)}\n`);
        return 0;
      }
      case "safety":
        stdout(`${JSON.stringify({ limits: SAFETY_LIMITS }, null, 2)}\n`);
        return 0;
      case "serve": {
        const port = parsed.flags.port ? Number(parsed.flags.port) : 8787;
        if (!Number.isInteger(port) || port < 0 || port > 65535) {
          stderr("--port must be an integer from 0 to 65535\n");
          return 1;
        }
        const listening = await listen(cwd, port);
        stdout(`BossMind agent hub at http://127.0.0.1:${listening.port}\n`);
        io.server = listening.server;
        if (!io.detach) await new Promise(() => {});
        return 0;
      }
      default:
        stderr(`Unknown command "${parsed.cmd}".\n${helpText()}\n`);
        return 1;
    }
  } catch (error) {
    if (error.code === "NOT_INSTALLED") {
      stderr(`${error.message}\n`);
      return 2;
    }
    if (error.code === "UNSAFE_RUN") {
      stderr(`${error.message}\n`);
      return 3;
    }
    if (error.code === "PROVIDER_REQUIRED" || error.code === "NO_LOCAL_MODEL") {
      stderr(`${error.message}\n`);
      return 4;
    }
    stderr(`${error.message}\n`);
    return 1;
  }
}

async function printAgents(cwd, asJson, stdout) {
  const agents = await listAgents(cwd);
  if (asJson) {
    stdout(`${JSON.stringify({ agents }, null, 2)}\n`);
    return 0;
  }
  stdout(`${formatTable(agents)}\n`);
  return 0;
}

export function formatTable(agents) {
  const header = ["ID", "STATUS", "LICENSE", "ROUTE", "VERSION", "INSTALL"];
  const rows = agents.map((agent) => [
    agent.id,
    agent.status,
    agent.license,
    agent.route || "—",
    agent.version || "—",
    agent.install.spec || `${agent.install.repo}@${agent.install.version}`,
  ]);
  const widths = header.map((cell, index) =>
    Math.max(cell.length, ...rows.map((row) => String(row[index]).length)),
  );
  const render = (row) => row.map((cell, index) => String(cell).padEnd(widths[index])).join("  ");
  return [render(header), render(widths.map((width) => "-".repeat(width))), ...rows.map(render)].join("\n");
}

export function helpText() {
  return `BossMind — install and integrate free open-source coding agents

Usage:
  bossmind agents [--json]              List the catalog and install status
  bossmind install --all                Install every pinned agent
  bossmind install <id> [id...]         Install selected agents
  bossmind status [--json]              Probe installed binaries
  bossmind run <id> [--model <name>] [--local] [--cwd <dir>] -- <prompt>
  bossmind providers                    Show the local-first provider plan
  bossmind route [id]                   Show which agent handles a kind of task
  bossmind safety                       Show the run limits
  bossmind serve [--port 8787]          Open the local agent dashboard

Agents:
${AGENTS.map((agent) => `  ${agent.id.padEnd(16)} ${agent.name} (${agent.license})`).join("\n")}

Runtimes land in .bossmind/runtime and are not committed.
Prefer a local Ollama model (--local). Paid API keys are optional and are never written by BossMind.
Runs refuse project deletion, secret printing, git push, and Firebase, DNS, Stripe, or Neon changes unless --approve-protected is set.`;
}
