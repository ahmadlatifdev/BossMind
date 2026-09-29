/**
 * Local and free models are the default. Paid API keys are optional and never stored here.
 */
export const LOCAL_PROVIDER = {
  id: "ollama",
  name: "Ollama",
  cost: "free",
  model: "qwen2.5-coder",
  setup: [
    "Install Ollama and start it on this machine.",
    "ollama pull qwen2.5-coder",
    "node bin/bossmind.mjs run aider --local -- \"Describe the change you want\"",
  ],
};

export const LOCAL_INVOCATIONS = {
  aider: { model: "ollama/qwen2.5-coder" },
  opencode: { model: "ollama/qwen2.5-coder" },
  "mini-swe-agent": { model: "ollama/qwen2.5-coder" },
  cline: { model: "ollama/qwen2.5-coder" },
  goose: {
    model: "qwen2.5-coder",
    env: { GOOSE_PROVIDER: "ollama", GOOSE_MODEL: "qwen2.5-coder" },
  },
};

export const OPTIONAL_PAID = [
  { env: "OPENAI_API_KEY", optional: true, agents: ["aider", "codex", "mini-swe-agent", "cline"] },
  { env: "ANTHROPIC_API_KEY", optional: true, agents: ["aider", "cline", "goose"] },
  { env: "GEMINI_API_KEY", optional: true, agents: ["gemini", "cline"] },
  { env: "OPENROUTER_API_KEY", optional: true, agents: ["cline"] },
  { env: "GOOSE_PROVIDER", optional: true, agents: ["goose"] },
  { env: "GOOSE_MODEL", optional: true, agents: ["goose"] },
];

const CLINE_KEYS = ["ANTHROPIC_API_KEY", "OPENAI_API_KEY", "GEMINI_API_KEY", "OPENROUTER_API_KEY"];

export function localInvocation(agentId) {
  return LOCAL_INVOCATIONS[agentId] || null;
}

export function providerPlan(env = process.env) {
  return {
    order: ["local", "paid-optional"],
    local: LOCAL_PROVIDER,
    paid: OPTIONAL_PAID.map((entry) => ({
      env: entry.env,
      optional: true,
      agents: entry.agents,
      configured: Boolean(env[entry.env] && String(env[entry.env]).trim()),
    })),
  };
}

export function assertProviderPlan() {
  if (LOCAL_PROVIDER.cost !== "free") throw new Error("The preferred provider must be free.");
  if (providerPlan({}).order[0] !== "local") throw new Error("Local provider must come first.");
  const blob = JSON.stringify({ LOCAL_PROVIDER, LOCAL_INVOCATIONS, OPTIONAL_PAID });
  if (/(sk-|ghp_|AKIA[0-9A-Z]|AIza|xox[baprs]-)/.test(blob)) {
    throw new Error("The provider plan contains secret-like material.");
  }
  for (const entry of OPTIONAL_PAID) {
    if (entry.optional !== true) throw new Error(`${entry.env} must stay optional.`);
    if (Object.hasOwn(entry, "value")) throw new Error("Paid provider entries cannot carry values.");
  }
  return true;
}

export function providerConfigStatus(agentId, env = {}, { model, local } = {}) {
  if (agentId === "goose") {
    if (local) return { ready: true, missing: [] };
    const provider = env.GOOSE_PROVIDER?.trim();
    const modelName = env.GOOSE_MODEL?.trim() || model?.trim();
    const missing = [];
    if (!provider) missing.push("GOOSE_PROVIDER");
    if (!modelName) missing.push("GOOSE_MODEL");
    return { ready: missing.length === 0, missing };
  }
  if (agentId === "cline") {
    if (local || model?.trim()) return { ready: true, missing: [] };
    const hasKey = CLINE_KEYS.some((key) => env[key]?.trim());
    return {
      ready: hasKey,
      missing: hasKey ? [] : ["ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY, OPENROUTER_API_KEY, or --model/--local"],
    };
  }
  return { ready: true, missing: [] };
}
