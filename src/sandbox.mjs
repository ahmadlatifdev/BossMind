import { chmod, copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SHIM_NAMES = ["git", "rm", "find", "shred", "firebase", "stripe", "neon", "neonctl", "gcloud", "aws"];
const shimSource = fileURLToPath(new URL("./sandbox-shim.mjs", import.meta.url));

export async function createSandbox({ projectRoot, hubRoot, approveProtected = false } = {}) {
  const binDir = path.join(tmpdir(), `bossmind-sandbox-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  await mkdir(binDir, { recursive: true });
  try {
    const policy = {
      projectRoot: path.resolve(projectRoot),
      hubRoot: path.resolve(hubRoot),
      approveProtected: Boolean(approveProtected),
    };
    await writeFile(path.join(binDir, "package.json"), "{\"type\":\"module\"}\n");
    await writeFile(path.join(binDir, "policy.json"), `${JSON.stringify(policy)}\n`);
    for (const name of SHIM_NAMES) {
      const dest = path.join(binDir, name);
      await copyFile(shimSource, dest);
      await chmod(dest, 0o755);
    }
  } catch (error) {
    await rm(binDir, { recursive: true, force: true });
    throw error;
  }
  return {
    binDir,
    projectRoot: path.resolve(projectRoot),
    hubRoot: path.resolve(hubRoot),
    approveProtected: Boolean(approveProtected),
    async cleanup() {
      await rm(binDir, { recursive: true, force: true });
    },
  };
}

export function applySandboxEnv(env, sandbox) {
  const next = { ...env };
  delete next.BOSSMIND_APPROVE_PROTECTED;
  delete next.BOSSMIND_PROJECT_ROOT;
  delete next.BOSSMIND_HUB_ROOT;
  delete next.BOSSMIND_SANDBOX_BIN;
  next.PATH = `${sandbox.binDir}${path.delimiter}${next.PATH || ""}`;
  return next;
}
