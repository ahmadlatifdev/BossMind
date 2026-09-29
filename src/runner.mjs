import { access, readFile, readdir } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
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

  if (agent.install.kind === "npm") {
    const fromPackage = await findNpmPackageBin(npmPrefix(cwd, agent.id), agent.bin);
    if (fromPackage) return fromPackage;
  }

  if (agent.install.kind === "github-release") {
    const found = await findNamedBinary(releaseDir(cwd, agent.id), agent.bin);
    if (found) return found;
  }
  return null;
}

async function findNpmPackageBin(prefix, binName) {
  const modules = path.join(prefix, "node_modules");
  let entries;
  try {
    entries = await readdir(modules, { withFileTypes: true });
  } catch {
    return null;
  }
  const packages = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
    if (entry.name.startsWith("@")) {
      const scoped = path.join(modules, entry.name);
      let children;
      try {
        children = await readdir(scoped, { withFileTypes: true });
      } catch {
        continue;
      }
      for (const child of children) {
        if (child.isDirectory()) packages.push(path.join(scoped, child.name, "package.json"));
      }
    } else {
      packages.push(path.join(modules, entry.name, "package.json"));
    }
  }
  for (const file of packages) {
    let pkg;
    try {
      pkg = JSON.parse(await readFile(file, "utf8"));
    } catch {
      continue;
    }
    const bins = typeof pkg.bin === "string" ? { [pkg.name]: pkg.bin } : pkg.bin;
    if (!bins || !bins[binName]) continue;
    const target = path.resolve(path.dirname(file), bins[binName]);
    if (await fileExists(target)) return target;
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
