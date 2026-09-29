import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { registryPath } from "./paths.mjs";

export function emptyRegistry() {
  return { updatedAt: null, agents: {} };
}

export async function readRegistry(cwd) {
  try {
    const raw = await readFile(registryPath(cwd), "utf8");
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object" || !data.agents) return emptyRegistry();
    return data;
  } catch (error) {
    if (error.code === "ENOENT") return emptyRegistry();
    throw error;
  }
}

export async function writeRegistry(cwd, registry) {
  const file = registryPath(cwd);
  await mkdir(path.dirname(file), { recursive: true });
  const next = { ...registry, updatedAt: new Date().toISOString() };
  const tmp = `${file}.${process.pid}.tmp`;
  await writeFile(tmp, `${JSON.stringify(next, null, 2)}\n`);
  await rename(tmp, file);
  return next;
}

export async function updateAgentRecord(cwd, id, patch) {
  const registry = await readRegistry(cwd);
  registry.agents[id] = { ...registry.agents[id], id, ...patch };
  return writeRegistry(cwd, registry);
}
