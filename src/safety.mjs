import path from "node:path";

/**
 * Limits enforced before and during `bossmind run`.
 * Destructive deletion, secret printing, and git push are always refused.
 * Firebase, DNS, Stripe, and Neon changes need --approve-protected.
 */
export const SAFETY_LIMITS = [
  {
    id: "destructive-delete",
    summary: "No recursive deletion, and no deletion of a BossMind project, the hub, or .bossmind.",
  },
  {
    id: "secret-printing",
    summary: "Prompts that print secrets are refused, and run output is redacted.",
  },
  {
    id: "git-push",
    summary: "BossMind never pushes, and a requested git push is refused.",
  },
  {
    id: "protected-services",
    summary: "Firebase, DNS, Stripe, and Neon changes need --approve-protected.",
  },
];

const CHANGE = /\b(?:change|update|modify|create|delete|remove|set|add|deploy|configure|migrate|alter|switch|point|write|enable|disable|destroy|provision|rotate)\b/i;

const HARD_RULES = [
  {
    id: "recursive-rm",
    kind: "destructive-delete",
    test: (text) => /\brm\b[^\n]*\s(?:-[A-Za-z]*[rR][A-Za-z]*|--recursive)\b/.test(text),
  },
  {
    id: "git-clean",
    kind: "destructive-delete",
    test: (text) => /\bgit\s+clean\b/i.test(text),
  },
  {
    id: "git-reset-hard",
    kind: "destructive-delete",
    test: (text) => /\bgit\s+reset\s+--hard\b/i.test(text),
  },
  {
    id: "find-delete",
    kind: "destructive-delete",
    test: (text) => /\bfind\b[^\n]*\s-delete\b/.test(text),
  },
  {
    id: "shred",
    kind: "destructive-delete",
    test: (text) => /\bshred\b/.test(text),
  },
  {
    id: "rmtree",
    kind: "destructive-delete",
    test: (text) => /\b(?:rmtree|rimraf)\b/i.test(text),
  },
  {
    id: "delete-project",
    kind: "destructive-delete",
    test: (text) => /\b(?:delete|remove|wipe|destroy|erase)\b[^\n]{0,80}\b(?:the\s+)?(?:project|repository|repo|bossmind)\b/i.test(text),
  },
  {
    id: "printenv",
    kind: "secret-printing",
    test: (text) => /\bprintenv\b/.test(text),
  },
  {
    id: "cat-dotenv",
    kind: "secret-printing",
    test: (text) => /\b(?:cat|head|tail|less|more|bat)\s+\S*\.env\b/i.test(text),
  },
  {
    id: "echo-secret",
    kind: "secret-printing",
    test: (text) => /\b(?:echo|print|printf)\s+\$\{?[A-Z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD)/.test(text),
  },
  {
    id: "dump-secret",
    kind: "secret-printing",
    test: (text) => /\b(?:print|dump|reveal|expose)\s+(?:the\s+|my\s+|our\s+)?(?:api[_ -]?keys?|secrets?|tokens?|passwords?|credentials)\b/i.test(text),
  },
  {
    id: "process-env",
    kind: "secret-printing",
    test: (text) => /\bprocess\.env(?:\.|\[)[^\n]{0,48}(?:KEY|TOKEN|SECRET|PASSWORD)/i.test(text),
  },
  {
    id: "git-push",
    kind: "git-push",
    test: (text) => /\bgit\s+push\b/i.test(text),
  },
];

const PROTECTED = [
  { id: "firebase", mention: /\bfirebase\b/i, cli: /\bfirebase\s+(?:deploy|use|init|hosting|functions|projects)\b/i },
  { id: "dns", mention: /\bdns\b/i, cli: /\b(?:gcloud\s+dns|aws\s+route53|nsupdate)\b/i },
  { id: "stripe", mention: /\bstripe\b/i, cli: /\bstripe\s+(?:listen|trigger|customers|prices|products|login)\b/i },
  { id: "neon", mention: /\bneon(?:ctl)?\b/i, cli: /\bneonctl\b|\bneon\s+(?:projects|branches|databases|connection-string)\b/i },
];

function near(text, match, pattern) {
  const start = Math.max(0, match.index - 80);
  const end = Math.min(text.length, match.index + match[0].length + 80);
  return pattern.test(text.slice(start, end));
}

export function inspectPrompt(prompt, { approveProtected = false } = {}) {
  const text = String(prompt || "");
  const violations = [];
  for (const rule of HARD_RULES) {
    if (rule.test(text)) violations.push({ id: rule.id, kind: rule.kind });
  }
  if (!approveProtected) {
    for (const service of PROTECTED) {
      const cli = service.cli.exec(text);
      service.cli.lastIndex = 0;
      if (cli) {
        violations.push({ id: service.id, kind: "protected-service" });
        continue;
      }
      const mention = service.mention.exec(text);
      service.mention.lastIndex = 0;
      if (mention && near(text, mention, CHANGE)) {
        violations.push({ id: service.id, kind: "protected-service" });
      }
    }
  }
  if (!violations.length) return { ok: true, violations };
  const ids = violations.map((item) => item.id).join(", ");
  return {
    ok: false,
    violations,
    message: `BossMind blocked this run (${ids}). Destructive deletion, secret printing, and git push are always blocked. Firebase, DNS, Stripe, and Neon changes need --approve-protected.`,
  };
}

export function assertSafeCwd(cwd) {
  const resolved = path.resolve(cwd);
  if (resolved === path.parse(resolved).root) {
    const error = new Error("Refusing to run an agent at the filesystem root.");
    error.code = "UNSAFE_RUN";
    throw error;
  }
  if (isInsideRuntime(resolved)) {
    const error = new Error("Refusing to run an agent inside .bossmind/runtime.");
    error.code = "UNSAFE_RUN";
    throw error;
  }
  return resolved;
}

function isInsideRuntime(resolved) {
  const parts = resolved.split(path.sep);
  const marker = parts.indexOf(".bossmind");
  return marker !== -1 && parts[marker + 1] === "runtime";
}

const SECRET_OUTPUT = [
  "sk-(?:live|proj|test|ant)-[A-Za-z0-9_-]{8,}",
  "\\bsk-[A-Za-z0-9_-]{20,}\\b",
  "\\bghp_[A-Za-z0-9]{20,}\\b",
  "\\bgithub_pat_[A-Za-z0-9_]{20,}\\b",
  "\\bAKIA[0-9A-Z]{16}\\b",
  "\\bAIza[0-9A-Za-z_-]{20,}\\b",
  "\\bxox[baprs]-[A-Za-z0-9-]{10,}\\b",
];

export function redactSecrets(text, env = {}) {
  let out = String(text);
  const replacements = [];
  for (const [key, value] of Object.entries(env)) {
    if (typeof value !== "string") continue;
    const secret = value.trim();
    if (secret.length < 12) continue;
    if (!/(KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL)/i.test(key)) continue;
    replacements.push(secret);
  }
  replacements.sort((a, b) => b.length - a.length);
  for (const secret of replacements) out = out.split(secret).join("[redacted]");
  for (const source of SECRET_OUTPUT) out = out.replace(new RegExp(source, "g"), "[redacted]");
  return out;
}

export function createStreamRedactor(env, emit) {
  let held = "";
  return {
    push(chunk) {
      held += String(chunk);
      const lines = held.split("\n");
      held = lines.pop() ?? "";
      for (const line of lines) emit(redactSecrets(`${line}\n`, env));
    },
    flush() {
      if (!held) return;
      emit(redactSecrets(held, env));
      held = "";
    },
  };
}
