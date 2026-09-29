#!/usr/bin/env node
import { spawn } from "node:child_process";
import { constants } from "node:fs";
import { accessSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const GIT_OPTIONS_WITH_VALUE = new Set([
  "-C",
  "-c",
  "--git-dir",
  "--work-tree",
  "--namespace",
  "--config-env",
  "--super-prefix",
  "-S",
  "-G",
]);

export function decide(command, args, ctx) {
  const name = command;
  if (name === "git") return decideGit(args);
  if (name === "rm") return decideRm(args, ctx);
  if (name === "find") return decideFind(args);
  if (name === "shred") return deny("shred is blocked.");
  if (name === "firebase" || name === "stripe" || name === "neon" || name === "neonctl") {
    if (!ctx.approveProtected) return deny(`${name} changes require --approve-protected.`);
  }
  if (name === "gcloud" && args.includes("dns") && !ctx.approveProtected) {
    return deny("DNS changes require --approve-protected.");
  }
  if (name === "aws" && args.includes("route53") && !ctx.approveProtected) {
    return deny("DNS changes require --approve-protected.");
  }
  return { allow: true };
}

function decideGit(args) {
  const sub = gitSubcommand(args);
  if (sub === "push") return deny("git push is blocked.");
  if (sub === "clean") return deny("git clean is blocked.");
  if (sub === "reset" && args.includes("--hard")) return deny("git reset --hard is blocked.");
  return { allow: true };
}

function decideRm(args, ctx) {
  if (args.some((arg) => arg === "--recursive" || /^-[A-Za-z]*[rR][A-Za-z]*$/.test(arg))) {
    return deny("recursive file deletion is blocked.");
  }
  const cwd = ctx.cwd || process.cwd();
  for (const target of rmTargets(args)) {
    const abs = path.resolve(cwd, target);
    if (isProtectedPath(abs, ctx)) return deny("refusing to delete a BossMind project.");
  }
  return { allow: true };
}

function decideFind(args) {
  if (args.includes("-delete")) return deny("find -delete is blocked.");
  for (let i = 0; i < args.length; i += 1) {
    if ((args[i] === "-exec" || args[i] === "-execdir" || args[i] === "-ok") && isRmExecutable(args[i + 1])) {
      return deny("find -exec rm is blocked.");
    }
  }
  return { allow: true };
}

export function isProtectedPath(abs, ctx) {
  const roots = [ctx.projectRoot, ctx.hubRoot].filter(Boolean).map((root) => path.resolve(root));
  for (const root of roots) {
    if (abs === root) return true;
    const boss = path.join(root, ".bossmind");
    if (abs === boss || abs.startsWith(`${boss}${path.sep}`)) return true;
  }
  return false;
}

function gitSubcommand(args) {
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--") return args[i + 1] || "";
    if (GIT_OPTIONS_WITH_VALUE.has(arg)) {
      i += 1;
      continue;
    }
    if (arg.startsWith("-")) continue;
    return arg;
  }
  return "";
}

function rmTargets(args) {
  const targets = [];
  let literal = false;
  for (const arg of args) {
    if (!literal && arg === "--") {
      literal = true;
      continue;
    }
    if (!literal && arg.startsWith("-")) continue;
    targets.push(arg);
  }
  return targets;
}

function deny(message) {
  return { allow: false, message: `BossMind safety: ${message}` };
}

function isRmExecutable(token) {
  if (!token) return false;
  return path.basename(token) === "rm";
}

function loadPolicy() {
  const file = path.join(path.dirname(fileURLToPath(import.meta.url)), "policy.json");
  const policy = JSON.parse(readFileSync(file, "utf8"));
  return {
    cwd: process.cwd(),
    projectRoot: policy.projectRoot,
    hubRoot: policy.hubRoot,
    approveProtected: policy.approveProtected === true,
  };
}

function realBinary(name, sandboxBin) {
  const dirs = (process.env.PATH || "")
    .split(path.delimiter)
    .filter((dir) => dir && path.resolve(dir) !== path.resolve(sandboxBin || ""));
  for (const dir of dirs) {
    const candidate = path.join(dir, name);
    try {
      accessSync(candidate, constants.X_OK);
      return candidate;
    } catch {
      // Keep looking past the sandbox directory.
    }
  }
  return null;
}

function main() {
  const command = path.basename(process.argv[1] || "");
  const args = process.argv.slice(2);
  const decision = decide(command, args, loadPolicy());
  if (!decision.allow) {
    process.stderr.write(`${decision.message}\n`);
    process.exit(126);
  }
  const sandboxBin = path.dirname(process.argv[1] || "");
  const real = realBinary(command, sandboxBin);
  if (!real) {
    process.stderr.write(`BossMind safety: ${command} is not available outside the sandbox.\n`);
    process.exit(127);
  }
  const env = { ...process.env };
  if (sandboxBin) {
    env.PATH = (env.PATH || "")
      .split(path.delimiter)
      .filter((dir) => path.resolve(dir) !== path.resolve(sandboxBin))
      .join(path.delimiter);
  }
  const child = spawn(real, args, { stdio: "inherit", env });
  child.on("error", (error) => {
    process.stderr.write(`${error.message}\n`);
    process.exit(127);
  });
  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 1);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
