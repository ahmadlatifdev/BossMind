import path from "node:path";
import { fileURLToPath } from "node:url";

export function hubRoot() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
}

export function runtimeRoot(cwd) {
  return path.join(cwd, ".bossmind", "runtime");
}

export function registryPath(cwd) {
  return path.join(cwd, ".bossmind", "registry.json");
}

export function npmPrefix(cwd, id) {
  return path.join(runtimeRoot(cwd), "npm", id);
}

export function venvPath(cwd, id) {
  return path.join(runtimeRoot(cwd), "venv", id);
}

export function releaseDir(cwd, id) {
  return path.join(runtimeRoot(cwd), "releases", id);
}

export function npmBin(prefix, binName) {
  const dir = process.platform === "win32" ? path.join(prefix, "node_modules", ".bin") : path.join(prefix, "node_modules", ".bin");
  const file = process.platform === "win32" ? `${binName}.cmd` : binName;
  return path.join(dir, file);
}

export function venvBin(venv, binName) {
  const dir = process.platform === "win32" ? path.join(venv, "Scripts") : path.join(venv, "bin");
  const file = process.platform === "win32" ? `${binName}.exe` : binName;
  return path.join(dir, file);
}
