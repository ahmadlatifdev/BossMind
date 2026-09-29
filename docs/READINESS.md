# BossMind PR #3 readiness

Reviewed on 2026-09-29. PR #3 is https://github.com/ahmadlatifdev/BossMind/pull/3 (`cursor/oss-coding-agents-6094`). This branch adds the safety gate, provider plan, and routing that PR #3 did not have. Do not merge PR #3 until this branch is on it.

## PR safety status

PR #3 as opened installs and dispatches the ten clients. It passes a prompt through as one argument, binds the dashboard to 127.0.0.1, and gitignores the runtime. It does not enforce the run limits: every headless command is auto-approved (`--yes-always`, `--yolo`, `--auto-approve`, `GOOSE_MODE=auto`), and nothing blocks project deletion, secret printing, `git push`, or Firebase, DNS, Stripe, or Neon changes.

This branch keeps those install commands and adds the limits in `bossmind run`. `npm test` is 20 passing tests.

## Files changed

PR #3 added the hub:

- `.env.example`, `.gitignore`, `AGENTS.md`, `README.md`, `package.json`
- `bin/bossmind.mjs`
- `src/catalog.mjs`, `src/cli.mjs`, `src/index.mjs`, `src/installer.mjs`, `src/paths.mjs`, `src/probe.mjs`, `src/proc.mjs`, `src/registry.mjs`, `src/runner.mjs`, `src/server.mjs`
- `test/hub.test.mjs`
- `web/dashboard.html`

This activation adds:

- `src/safety.mjs`, `src/sandbox.mjs`, `src/sandbox-shim.mjs`, `src/providers.mjs`, `src/routing.mjs`
- `test/safety.test.mjs`
- `docs/SAFETY.md`, `docs/PROVIDERS.md`, `docs/ROUTING.md`, `docs/LICENSES.md`, `docs/READINESS.md`

It also updates the runner, CLI, probe output, dashboard route column, README, and `AGENTS.md`.

## Secrets check result

Clean. `git ls-files` contains source, docs, and an empty `.env.example` only.

- No `.env`, private key, token, or credential file is tracked. `.env` is gitignored.
- `.env.example` lists variable names with empty values. Paid keys are described as optional.
- A content search found no API key, `AKIA`, `ghp_`, `sk-` assignment, or private-key block.
- `bossmind providers` reports whether a variable is set. It does not print the value.
- Run output is redacted for known key shapes and for environment values whose names contain KEY, TOKEN, SECRET, PASSWORD, or CREDENTIAL.

## Runtime folder status

Ignored and not committed.

- `.gitignore` contains `.bossmind/runtime/` and `.bossmind/registry.json`.
- No tracked path is under `.bossmind/` or `node_modules/`.
- Installs are planned as argv arrays into that runtime (npm prefix, Python venv, or the Goose release directory). The Goose binary is copied only inside the runtime during install.
- `bossmind run` refuses a working directory inside `.bossmind/runtime` or at the filesystem root.
- The `rm` shim refuses to delete the project root, the hub root, or anything under `.bossmind`.

## License check result

Correct. The catalog allows only Apache-2.0 and MIT. On 2026-09-29 the GitHub license API returned the same SPDX id as the catalog for every pin:

| Agent | SPDX | Repository |
| --- | --- | --- |
| Aider | Apache-2.0 | Aider-AI/aider |
| OpenCode | MIT | anomalyco/opencode |
| Cline | Apache-2.0 | cline/cline |
| Gemini CLI | Apache-2.0 | google-gemini/gemini-cli |
| Codex CLI | Apache-2.0 | openai/codex |
| Continue CLI | Apache-2.0 | continuedev/continue |
| Qwen Code | Apache-2.0 | QwenLM/qwen-code |
| OpenHands | MIT | OpenHands/OpenHands |
| mini-swe-agent | MIT | SWE-agent/mini-swe-agent |
| Goose | Apache-2.0 | aaif-goose/goose |

BossMind's own `package.json` license is MIT. The record is also in `docs/LICENSES.md`.

## Which agents are usable now

Usable means the client can be dispatched by `bossmind run` without a paid key. A finished model task still needs Ollama or a provider the user configures. Nothing in the repo supplies that provider.

| Agent | Dispatch now | Local flag |
| --- | --- | --- |
| Aider | Yes | `--local` uses `ollama/qwen2.5-coder` |
| OpenCode | Yes | `--local` uses `ollama/qwen2.5-coder` |
| mini-swe-agent | Yes | `--local` uses `ollama/qwen2.5-coder` |
| Gemini CLI | Yes | No free local mapping. `--local` is refused. |
| Qwen Code | Yes | No free local mapping. `--local` is refused. |
| Codex CLI | Yes | No free local mapping. `--local` is refused. |
| Continue CLI | Yes | No free local mapping. `--local` is refused. |
| OpenHands | Yes | No free local mapping. `--local` is refused. |
| Cline | No | Blocked until `--local` or a provider key / `--model` |
| Goose | No | Blocked until `--local` or `GOOSE_PROVIDER` and `GOOSE_MODEL` |

The binaries are not in git. `node bin/bossmind.mjs install --all` still installs them into `.bossmind/runtime` on a machine with Node 20+, Python 3 venv, and `tar`.

## Which agents need keys

No agent has a key in the repo. Paid keys are optional.

- Cline and Goose need provider configuration before `bossmind run` will start them. `--local` is the free configuration. A user-supplied key is the paid one.
- Aider, OpenCode, and mini-swe-agent complete a task with local Ollama. Hosted keys are optional.
- Gemini CLI, Qwen Code, Codex CLI, Continue CLI, and OpenHands start without a key and then stop inside the client until that user configures a model. This hub will not invent one.

## Recommended local/free provider setup

1. Install Ollama and start it on this machine.
2. `ollama pull qwen2.5-coder`
3. `node bin/bossmind.mjs run aider --local -- "Add a failing test, then make it pass"`
4. Use OpenCode the same way for a second patch agent, and mini-swe-agent for an isolated repository task.
5. Leave `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, and `OPENROUTER_API_KEY` unset until you explicitly want a hosted model.

`node bin/bossmind.mjs providers` prints this order: local first, paid optional.

## Routing

| Task | Agents |
| --- | --- |
| Code patches | Aider, OpenCode |
| Review and explanation | Gemini CLI, Qwen Code |
| Code reasoning | Codex CLI, Continue CLI |
| Isolated repository tasks | OpenHands, mini-swe-agent |
| After provider configuration | Goose, Cline |

## Whether PR #3 is safe to merge

No. Not by itself.

Merge this activation into `cursor/oss-coding-agents-6094` first. After that, PR #3 is safe to merge. The combined tree has a clean secret scan, an ignored runtime, matching licenses, no committed agent binaries, and `bossmind run` limits for deletion, secret printing, git push, and unapproved Firebase, DNS, Stripe, and Neon changes.

Residual limit, also written in `docs/SAFETY.md`: the shell shim is first on `PATH`. A coding agent can still edit files inside the selected project, which is its job. A direct `/usr/bin/git push` or an in-process delete can bypass the shim. The prompt gate refuses those requests before the agent starts.
