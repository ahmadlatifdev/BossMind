import { chmod, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { AGENTS, getAgent } from "./catalog.mjs";
import { npmPrefix, releaseDir, venvBin, venvPath } from "./paths.mjs";
import { runCommand } from "./proc.mjs";
import { updateAgentRecord } from "./registry.mjs";
import { probeAgent } from "./probe.mjs";

const INSTALL_TIMEOUT_MS = 20 * 60 * 1000;

export function planInstall(agent, cwd, platform = process.platform, arch = process.arch) {
  if (agent.install.kind === "npm") {
    const prefix = npmPrefix(cwd, agent.id);
    return {
      kind: "npm",
      steps: [
        {
          cmd: "npm",
          args: ["install", "--prefix", prefix, "--no-fund", "--no-audit", agent.install.spec],
        },
      ],
    };
  }
  if (agent.install.kind === "pip") {
    const venv = venvPath(cwd, agent.id);
    const python = process.env.PYTHON || "python3";
    const pip = venvBin(venv, "pip");
    return {
      kind: "pip",
      steps: [
        { cmd: python, args: ["-m", "venv", venv] },
        { cmd: pip, args: ["install", "--disable-pip-version-check", agent.install.spec] },
      ],
    };
  }
  if (agent.install.kind === "github-release") {
    const asset = agent.install.asset(platform, arch);
    const version = agent.install.version;
    const url = `https://github.com/${agent.install.repo}/releases/download/v${version}/${asset}`;
    return {
      kind: "github-release",
      url,
      asset,
      dir: releaseDir(cwd, agent.id),
    };
  }
  throw new Error(`Cannot plan install for ${agent.id}`);
}

export async function installAgents(ids, options = {}) {
  const cwd = options.cwd || process.cwd();
  const selected = ids?.length ? ids.map((id) => getAgent(id)) : AGENTS;
  const results = [];
  for (const agent of selected) {
    options.onLog?.(`\n→ Installing ${agent.name} (${describeSpec(agent)})`);
    try {
      await installOne(agent, cwd, options);
      const probe = await probeAgent(agent.id, cwd);
      if (probe.status !== "installed") {
        throw new Error(probe.error || `${agent.name} installed but did not respond to --version`);
      }
      options.onLog?.(`✓ ${agent.id} ${probe.version}`);
      results.push({ id: agent.id, status: "installed", version: probe.version });
    } catch (error) {
      const message = error.message || String(error);
      await updateAgentRecord(cwd, agent.id, {
        status: "failed",
        error: message,
        failedAt: new Date().toISOString(),
      });
      options.onLog?.(`✗ ${agent.id}: ${message}`);
      results.push({ id: agent.id, status: "failed", error: message });
    }
  }
  return results;
}

async function installOne(agent, cwd, options) {
  const plan = planInstall(agent, cwd);
  if (plan.kind === "github-release") {
    await installRelease(agent, plan, options);
    return;
  }
  for (const step of plan.steps) {
    if (step.cmd.endsWith(`${path.sep}pip`) || step.cmd.endsWith(`${path.sep}pip.exe`)) {
      await mkdir(path.dirname(step.cmd), { recursive: true });
    }
    const result = await runCommand(step.cmd, step.args, {
      cwd,
      timeoutMs: INSTALL_TIMEOUT_MS,
      onStdout: options.onLog,
      onStderr: options.onLog,
    });
    if (result.code !== 0) {
      const tail = `${result.stdout}\n${result.stderr}`.trim().split(/\r?\n/).slice(-20).join("\n");
      throw new Error(`${step.cmd} exited ${result.code}\n${tail}`);
    }
  }
}

async function installRelease(agent, plan, options) {
  await mkdir(plan.dir, { recursive: true });
  const archive = path.join(plan.dir, plan.asset);
  options.onLog?.(`Downloading ${plan.url}`);
  await downloadFile(plan.url, archive);
  const extractDir = path.join(plan.dir, "extract");
  await mkdir(extractDir, { recursive: true });
  const extracted = await runCommand("tar", ["-xzf", archive, "-C", extractDir], {
    timeoutMs: INSTALL_TIMEOUT_MS,
  });
  if (extracted.code !== 0) {
    throw new Error(`tar exited ${extracted.code}: ${extracted.stderr}`);
  }
  const found = await findBinary(extractDir, agent.bin);
  if (!found) {
    const listing = await readdir(extractDir, { recursive: true });
    throw new Error(`Release archive did not contain ${agent.bin}. Entries: ${listing.join(", ")}`);
  }
  const dest = path.join(plan.dir, agent.bin);
  if (found !== dest) {
    const { copyFile, rm } = await import("node:fs/promises");
    await rm(dest, { force: true });
    await copyFile(found, dest);
  }
  await chmod(dest, 0o755);
}

async function findBinary(dir, name) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await findBinary(full, name);
      if (nested) return nested;
    } else if (entry.name === name) {
      return full;
    }
  }
  return null;
}

async function downloadFile(url, dest) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok || !response.body) {
    throw new Error(`Download failed (${response.status}) ${url}`);
  }
  const nodeStream = Readable.fromWeb(response.body);
  await pipeline(nodeStream, createWriteStream(dest));
}

function describeSpec(agent) {
  if (agent.install.kind === "github-release") {
    return `${agent.install.repo}@${agent.install.version}`;
  }
  return agent.install.spec;
}
