import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { getAgent } from "./catalog.mjs";
import { npmBin, npmPrefix, releaseDir, venvBin, venvPath } from "./paths.mjs";
import { mergeEnv, runCommand } from "./proc.mjs";
import { readRegistry } from "./registry.mjs";

export function buildInvocation(agent, { prompt, model } = {}) {
  const text = typeof prompt === "string" ? prompt.trim() : "";
  if (!text) throw new Error("A prompt is required.");
  const spec = agent.invoke || {};
  const args = [...(spec.argsBefore || [])];
  if (model) {
    if (!spec.modelFlag) {
      throw new Error(`${agent.name} does not accept a model override in this hub.`);
    }
    args.push(spec.modelFlag, model);
  }
  if (spec.promptFlag) args.push(spec.promptFlag, text);
  args.push(...(spec.argsAfter || []));
  if (!spec.promptFlag) args.push(text);
  return {
    bin: agent.bin,
    args,
    env: spec.env || {},
  };
}

async function fileExists(file) {
  try {
    await access(file, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

export function expectedBin(agent, cwd) {
  if (agent.install.kind === "npm") return npmBin(npmPrefix(cwd, agent.id), agent.bin);
  if (agent.install.kind === "pip") return venvBin(venvPath(cwd, agent.id), agent.bin);
  return null;
}

export async function resolveBin(agent, cwd) {
  const registry = await readRegistry(cwd);
  const recorded = registry.agents[agent.id]?.binPath;
  if (recorded && (await fileExists(recorded))) return recorded;

  const local = expectedBin(agent, cwd);
  if (local && (await fileExists(local))) return local;

  if (agent.install.kind === "github-release") {
    const found = await findNamedBinary(releaseDir(cwd, agent.id), agent.bin);
    if (found) return found;
  }
  return null;
}

async function findNamedBinary(dir, name) {
  const { readdir } = await import("node:fs/promises");
  const { join } = await import("node:path");
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return null;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await findNamedBinary(full, name);
      if (nested) return nested;
    } else if (entry.name === name && (await fileExists(full))) {
      return full;
    }
  }
  return null;
}

export async function runAgent(id, options) {
  const agent = getAgent(id);
  const cwd = options.cwd || process.cwd();
  const invocation = buildInvocation(agent, options);
  const binPath = options.binPath || (await resolveBin(agent, options.projectRoot || cwd));
  if (!binPath) {
    const error = new Error(
      `${agent.name} is not installed. Run: bossmind install ${agent.id}`,
    );
    error.code = "NOT_INSTALLED";
    throw error;
  }
  const result = await runCommand(binPath, invocation.args, {
    cwd,
    env: mergeEnv(invocation.env),
    timeoutMs: options.timeoutMs || 0,
    onStdout: options.onStdout,
    onStderr: options.onStderr,
  });
  return { agent, binPath, ...invocation, ...result };
}
