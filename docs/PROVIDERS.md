# Provider configuration

BossMind installs the agent clients. It does not install a model, and it does not contain an API key.

## 1. Local model, preferred

Use Ollama on this machine. There is no key to store.

```bash
ollama pull qwen2.5-coder
node bin/bossmind.mjs run aider --local -- "Add a failing test, then make it pass"
node bin/bossmind.mjs run opencode --local -- "Explain the install path"
node bin/bossmind.mjs run mini-swe-agent --local -- "Fix the failing test in this repo"
```

`--local` selects `ollama/qwen2.5-coder` for Aider, OpenCode, and mini-swe-agent. For Goose it sets `GOOSE_PROVIDER=ollama` and `GOOSE_MODEL=qwen2.5-coder` in that process only. For Cline it passes the same Ollama model. Those two stay blocked until this flag or a real provider configuration is present.

Gemini CLI, Qwen Code, Codex CLI, Continue CLI, and OpenHands have no free local mapping in this hub. `--local` refuses them instead of guessing a paid model.

## 2. Paid keys, optional

Leave these unset until you choose a hosted provider. Put them in an untracked `.env` or your shell, never in git. `.env.example` only lists the names.

| Variable | Used by |
| --- | --- |
| `OPENAI_API_KEY` | Aider, Codex CLI, mini-swe-agent, Cline |
| `ANTHROPIC_API_KEY` | Aider, Cline, Goose |
| `GEMINI_API_KEY` | Gemini CLI, Cline |
| `OPENROUTER_API_KEY` | Cline |
| `GOOSE_PROVIDER` and `GOOSE_MODEL` | Goose |

`node bin/bossmind.mjs providers` prints this plan. It reports whether a variable is set. It does not print the value.

```bash
node bin/bossmind.mjs providers
```
