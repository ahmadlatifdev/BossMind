import { AGENTS } from "./catalog.mjs";

export const ROUTES = [
  {
    id: "code-patches",
    summary: "Edit code in the working tree.",
    agents: ["aider", "opencode"],
  },
  {
    id: "review-explanation",
    summary: "Review code and explain it.",
    agents: ["gemini", "qwen"],
  },
  {
    id: "code-reasoning",
    summary: "Reason about code.",
    agents: ["codex", "continue"],
  },
  {
    id: "isolated-repo",
    summary: "Work on an isolated repository task.",
    agents: ["openhands", "mini-swe-agent"],
  },
  {
    id: "provider-gated",
    summary: "Run only after provider and model configuration.",
    agents: ["goose", "cline"],
    requiresProviderConfig: true,
  },
];

export function routeForAgent(id) {
  return ROUTES.find((route) => route.agents.includes(id)) || null;
}

export function assertRouting() {
  const seen = new Map();
  for (const route of ROUTES) {
    for (const id of route.agents) {
      if (seen.has(id)) throw new Error(`${id} is assigned to more than one route`);
      if (!AGENTS.some((agent) => agent.id === id)) throw new Error(`Route lists unknown agent ${id}`);
      seen.set(id, route.id);
    }
  }
  for (const agent of AGENTS) {
    if (!seen.has(agent.id)) throw new Error(`${agent.id} has no route`);
  }
  const expected = {
    "code-patches": ["aider", "opencode"],
    "review-explanation": ["gemini", "qwen"],
    "code-reasoning": ["codex", "continue"],
    "isolated-repo": ["openhands", "mini-swe-agent"],
    "provider-gated": ["goose", "cline"],
  };
  for (const [id, agents] of Object.entries(expected)) {
    const route = ROUTES.find((entry) => entry.id === id);
    if (!route || route.agents.join(",") !== agents.join(",")) {
      throw new Error(`Route ${id} does not match the activation plan`);
    }
  }
  if (!ROUTES.find((route) => route.id === "provider-gated")?.requiresProviderConfig) {
    throw new Error("Goose and Cline must stay behind provider configuration");
  }
  return seen;
}

export function chooseAgent(routeId, { providerReady } = {}) {
  const route = ROUTES.find((entry) => entry.id === routeId);
  if (!route) {
    const known = ROUTES.map((entry) => entry.id).join(", ");
    throw new Error(`Unknown route "${routeId}". Known routes: ${known}`);
  }
  if (route.requiresProviderConfig) {
    const ready = route.agents.find((id) => providerReady?.(id));
    return { route, agentId: ready || null, blocked: ready ? [] : [...route.agents] };
  }
  return { route, agentId: route.agents[0], blocked: [] };
}
