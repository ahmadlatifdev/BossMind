# BossMind

BossMind installs free open-source coding agents into one local runtime and calls them through one command.

The clients are free software. A task still needs a model provider key or a local model such as Ollama. BossMind does not bundle API keys.

## Agents

| ID | Project | License | Pin |
| --- | --- | --- | --- |
| `aider` | [Aider](https://github.com/Aider-AI/aider) | Apache-2.0 | `aider-chat==0.86.2` |
| `opencode` | [OpenCode](https://github.com/anomalyco/opencode) | MIT | `opencode-ai@1.18.33` |
| `cline` | [Cline](https://github.com/cline/cline) | Apache-2.0 | `cline@3.0.65` |
| `gemini` | [Gemini CLI](https://github.com/google-gemini/gemini-cli) | Apache-2.0 | `@google/gemini-cli@0.61.0` |
| `codex` | [Codex CLI](https://github.com/openai/codex) | Apache-2.0 | `@openai/codex@0.159.0` |
| `continue` | [Continue](https://github.com/continuedev/continue) | Apache-2.0 | `@continuedev/cli@1.5.47` |
| `qwen` | [Qwen Code](https://github.com/QwenLM/qwen-code) | Apache-2.0 | `@qwen-code/qwen-code@0.24.7` |
| `openhands` | [OpenHands](https://github.com/OpenHands/OpenHands) | MIT | `openhands==1.16.0` |
| `mini-swe-agent` | [mini-swe-agent](https://github.com/SWE-agent/mini-swe-agent) | MIT | `mini-swe-agent==2.4.6` |
| `goose` | [Goose](https://github.com/aaif-goose/goose) | Apache-2.0 | `v1.52.0` release |

## Requirements

- Node.js 20 or newer
- Python 3 with the `venv` module, for Aider, OpenHands, and mini-swe-agent
- `tar`, for the Goose release archive

## Use

```bash
node bin/bossmind.mjs agents
node bin/bossmind.mjs install --all
node bin/bossmind.mjs status
node bin/bossmind.mjs run aider --model ollama/qwen2.5-coder -- "Add a failing test for the parser, then make it pass"
node bin/bossmind.mjs serve
```

`serve` opens http://127.0.0.1:8787 and lists the catalog, pin, license, route, and last probe.

## Safety

`bossmind run` refuses destructive deletion, secret printing, and `git push`. Firebase, DNS, Stripe, and Neon changes need `--approve-protected`. The working directory cannot be the filesystem root or `.bossmind/runtime`. Shell `rm`, `git`, and those service CLIs are intercepted for the run. See [docs/SAFETY.md](docs/SAFETY.md).

## Providers

Local Ollama is the default. Paid keys are optional and are never written into the repo.

```bash
ollama pull qwen2.5-coder
node bin/bossmind.mjs run aider --local -- "Add a failing test, then make it pass"
node bin/bossmind.mjs providers
```

See [docs/PROVIDERS.md](docs/PROVIDERS.md).

## Routing

| Task | Agents |
| --- | --- |
| Code patches | Aider, OpenCode |
| Review and explanation | Gemini CLI, Qwen Code |
| Code reasoning | Codex CLI, Continue CLI |
| Isolated repository tasks | OpenHands, mini-swe-agent |
| After provider configuration | Goose, Cline |

```bash
node bin/bossmind.mjs route
```

See [docs/ROUTING.md](docs/ROUTING.md). The readiness review is in [docs/READINESS.md](docs/READINESS.md).

Installs go to `.bossmind/runtime/`. That directory is gitignored. Status is stored in `.bossmind/registry.json`.

`run` starts the selected agent even when no model key is configured. The agent then exits with its own authentication or configuration error. Aider, if no key is set, may open a browser to connect one.

Each `run` uses that agent's own headless command:

- Aider: `--yes-always --no-auto-commits --message`
- OpenCode: `run --auto`
- Cline: `--json --auto-approve true`
- Gemini CLI: `--yolo -p`
- Qwen Code: `--yolo` plus the positional prompt
- Codex CLI: `exec --skip-git-repo-check`
- Continue: `-p`
- OpenHands: `--headless --json -t`
- mini-swe-agent: `--yolo --exit-immediately --task`
- Goose: `run --no-session -t` with `GOOSE_MODE=auto` when unset

## Library

Other BossMind code can import the same hub:

```js
import { installAgents, runAgent, listAgents } from "./src/index.mjs";

await installAgents(["opencode", "aider"], { cwd: process.cwd() });
await runAgent("aider", { prompt: "Explain the install path in README.md", cwd: process.cwd() });
console.log(await listAgents(process.cwd()));
```

## Tests

```bash
npm test
```

The tests do not download agents. `npm run agents:install` does.
