/**
 * Pinned free and open-source coding agents.
 * The client software is free; model calls still need a provider key or a local model.
 */
export const AGENTS = [
  {
    id: "aider",
    name: "Aider",
    license: "Apache-2.0",
    repo: "https://github.com/Aider-AI/aider",
    homepage: "https://aider.chat",
    summary: "Git-centric terminal pair programmer. One message, then exit.",
    bin: "aider",
    versionArgs: ["--version"],
    auth: "OPENAI_API_KEY, ANTHROPIC_API_KEY, or --model for another provider (including Ollama).",
    install: { kind: "pip", spec: "aider-chat==0.86.2" },
    invoke: {
      argsBefore: ["--yes-always", "--no-auto-commits", "--skip-sanity-check-repo"],
      promptFlag: "--message",
      modelFlag: "--model",
    },
  },
  {
    id: "opencode",
    name: "OpenCode",
    license: "MIT",
    repo: "https://github.com/anomalyco/opencode",
    homepage: "https://opencode.ai",
    summary: "Terminal coding agent with a non-interactive run command.",
    bin: "opencode",
    versionArgs: ["--version"],
    auth: "Run `opencode auth` or configure a provider. The CLI itself is MIT licensed.",
    install: { kind: "npm", spec: "opencode-ai@1.18.33" },
    invoke: {
      argsBefore: ["run"],
    },
  },
  {
    id: "cline",
    name: "Cline",
    license: "Apache-2.0",
    repo: "https://github.com/cline/cline",
    homepage: "https://cline.bot",
    summary: "Headless or interactive coding agent with the same core as the IDE extension.",
    bin: "cline",
    versionArgs: ["--version"],
    auth: "`cline auth`, or a provider API key (Anthropic, OpenAI, Gemini, OpenRouter, and others).",
    install: { kind: "npm", spec: "cline@3.0.65" },
    invoke: {
      argsBefore: ["--yolo", "--json"],
      modelFlag: "-m",
    },
  },
  {
    id: "gemini",
    name: "Gemini CLI",
    license: "Apache-2.0",
    repo: "https://github.com/google-gemini/gemini-cli",
    homepage: "https://github.com/google-gemini/gemini-cli",
    summary: "Google's open-source terminal agent. Headless prompt mode with auto-approval.",
    bin: "gemini",
    versionArgs: ["--version"],
    auth: "GEMINI_API_KEY, or a Google account login inside the CLI.",
    install: { kind: "npm", spec: "@google/gemini-cli@0.61.0" },
    invoke: {
      argsBefore: ["--yolo"],
      promptFlag: "-p",
      modelFlag: "--model",
    },
  },
  {
    id: "codex",
    name: "Codex CLI",
    license: "Apache-2.0",
    repo: "https://github.com/openai/codex",
    homepage: "https://github.com/openai/codex",
    summary: "OpenAI's open-source coding agent. `exec` runs one task and exits.",
    bin: "codex",
    versionArgs: ["--version"],
    auth: "ChatGPT sign-in, or OPENAI_API_KEY.",
    install: { kind: "npm", spec: "@openai/codex@0.159.0" },
    invoke: {
      argsBefore: ["exec", "--skip-git-repo-check"],
      modelFlag: "--model",
    },
  },
  {
    id: "continue",
    name: "Continue CLI",
    license: "Apache-2.0",
    repo: "https://github.com/continuedev/continue",
    homepage: "https://continue.dev",
    summary: "Customizable coding agent. `-p` is the headless mode.",
    bin: "cn",
    versionArgs: ["--version"],
    auth: "`cn login`, or a local Continue config with your own provider.",
    install: { kind: "npm", spec: "@continuedev/cli@1.5.47" },
    invoke: {
      argsBefore: ["-p"],
    },
  },
  {
    id: "qwen",
    name: "Qwen Code",
    license: "Apache-2.0",
    repo: "https://github.com/QwenLM/qwen-code",
    homepage: "https://github.com/QwenLM/qwen-code",
    summary: "Open-source terminal coding agent from the Qwen team.",
    bin: "qwen",
    versionArgs: ["--version"],
    auth: "DashScope or another configured provider key. The CLI is Apache-2.0.",
    install: { kind: "npm", spec: "@qwen-code/qwen-code@0.24.7" },
    invoke: {
      argsBefore: ["--yolo"],
      promptFlag: "-p",
      modelFlag: "--model",
    },
  },
  {
    id: "openhands",
    name: "OpenHands",
    license: "MIT",
    repo: "https://github.com/OpenHands/OpenHands",
    homepage: "https://openhands.dev",
    summary: "Autonomous coding agent. Headless mode streams JSON and exits.",
    bin: "openhands",
    versionArgs: ["--version"],
    auth: "OpenHands login, or the LLM settings the CLI asks for on first launch.",
    install: { kind: "pip", spec: "openhands==1.16.0" },
    invoke: {
      argsBefore: ["--headless", "--json", "--exit-without-confirmation"],
      promptFlag: "-t",
    },
  },
  {
    id: "mini-swe-agent",
    name: "mini-swe-agent",
    license: "MIT",
    repo: "https://github.com/SWE-agent/mini-swe-agent",
    homepage: "https://mini-swe-agent.com",
    summary: "Small software-engineering agent with a transparent tool loop.",
    bin: "mini",
    versionArgs: ["--version"],
    auth: "A model via --model (LiteLLM names) or a mini-swe-agent config file.",
    install: { kind: "pip", spec: "mini-swe-agent==2.4.6" },
    invoke: {
      argsBefore: ["--yolo", "--exit-immediately"],
      promptFlag: "--task",
      modelFlag: "--model",
    },
  },
  {
    id: "goose",
    name: "Goose",
    license: "Apache-2.0",
    repo: "https://github.com/aaif-goose/goose",
    homepage: "https://goose-docs.ai",
    summary: "Extensible local agent. `goose run` executes one task and exits.",
    bin: "goose",
    versionArgs: ["--version"],
    auth: "Provider configured with `goose configure`, or GOOSE_PROVIDER and GOOSE_MODEL.",
    install: {
      kind: "github-release",
      repo: "aaif-goose/goose",
      version: "1.52.0",
      asset: gooseAssetName,
    },
    invoke: {
      argsBefore: ["run", "--no-session", "--quiet"],
      promptFlag: "-t",
      modelFlag: "--model",
      env: { GOOSE_MODE: "auto" },
    },
  },
];

const ALLOWED_LICENSES = new Set(["Apache-2.0", "MIT"]);
const ALLOWED_KINDS = new Set(["npm", "pip", "github-release"]);

export function gooseAssetName(platform = process.platform, arch = process.arch) {
  const cpu = arch === "arm64" ? "aarch64" : arch === "x64" ? "x86_64" : null;
  if (!cpu) {
    throw new Error(`Goose releases do not include a build for arch ${arch}.`);
  }
  if (platform === "linux") return `goose-${cpu}-unknown-linux-gnu.tar.gz`;
  if (platform === "darwin") return `goose-${cpu}-apple-darwin.tar.gz`;
  throw new Error("Goose release install in this hub supports Linux and macOS.");
}

export function getAgent(id) {
  const agent = AGENTS.find((entry) => entry.id === id);
  if (!agent) {
    const known = AGENTS.map((entry) => entry.id).join(", ");
    throw new Error(`Unknown agent "${id}". Known agents: ${known}`);
  }
  return agent;
}

export function assertCatalog() {
  const ids = new Set();
  for (const agent of AGENTS) {
    if (!/^[a-z0-9-]+$/.test(agent.id)) {
      throw new Error(`Invalid agent id: ${agent.id}`);
    }
    if (ids.has(agent.id)) throw new Error(`Duplicate agent id: ${agent.id}`);
    ids.add(agent.id);
    if (!ALLOWED_LICENSES.has(agent.license)) {
      throw new Error(`${agent.id} license ${agent.license} is not in the free open-source set`);
    }
    if (!agent.repo.startsWith("https://github.com/")) {
      throw new Error(`${agent.id} repo must be a GitHub URL`);
    }
    if (!agent.bin) throw new Error(`${agent.id} is missing a binary name`);
    if (!ALLOWED_KINDS.has(agent.install.kind)) {
      throw new Error(`${agent.id} has an unknown install kind`);
    }
    if (agent.install.kind === "pip" && !agent.install.spec.includes("==")) {
      throw new Error(`${agent.id} pip spec must be pinned`);
    }
    if (agent.install.kind === "npm" && !agent.install.spec.includes("@")) {
      throw new Error(`${agent.id} npm spec must be pinned`);
    }
    if (agent.install.kind === "github-release" && !/^\d+\.\d+\.\d+$/.test(agent.install.version)) {
      throw new Error(`${agent.id} GitHub release must be pinned`);
    }
  }
  return AGENTS;
}
