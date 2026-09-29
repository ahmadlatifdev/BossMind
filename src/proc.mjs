import { spawn } from "node:child_process";

export function runCommand(cmd, args, options = {}) {
  const {
    cwd,
    env,
    timeoutMs = 0,
    stdin = "ignore",
    onStdout,
    onStderr,
  } = options;

  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd,
      env,
      stdio: [stdin, "pipe", "pipe"],
      windowsHide: true,
      detached: process.platform !== "win32",
    });

    let settled = false;
    let stdout = "";
    let stderr = "";
    let timer;

    const finish = (handler) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      handler();
    };

    const stopChild = () => {
      if (process.platform !== "win32") {
        try {
          process.kill(-child.pid, "SIGTERM");
          return;
        } catch {
          // The process group is already gone.
        }
      }
      child.kill("SIGTERM");
    };

    if (timeoutMs > 0) {
      timer = setTimeout(() => {
        stopChild();
        finish(() => {
          reject(new Error(`Timed out after ${timeoutMs}ms: ${cmd} ${args.join(" ")}`));
        });
      }, timeoutMs);
    }

    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      stdout += text;
      onStdout?.(text);
    });
    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      stderr += text;
      onStderr?.(text);
    });
    child.on("error", (error) => {
      finish(() => reject(error));
    });
    child.on("close", (code) => {
      finish(() => resolve({ code: code ?? 1, stdout, stderr }));
    });
  });
}

export function mergeEnv(defaults = {}, base = process.env) {
  const env = { ...base };
  for (const [key, value] of Object.entries(defaults)) {
    if (!env[key]) env[key] = value;
  }
  return env;
}
