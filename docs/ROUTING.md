# Routing

One task shape maps to one pair of agents. Goose and Cline are not in the default pairs.

| Route | Use it for | Agents | Starts without a provider? |
| --- | --- | --- | --- |
| `code-patches` | Edit the working tree | Aider, then OpenCode | Yes. Prefer `--local`. |
| `review-explanation` | Review or explain code | Gemini CLI, Qwen Code | The client starts. A task needs the provider you configure. |
| `code-reasoning` | Reason about code | Codex CLI, Continue CLI | The client starts. A task needs the provider you configure. |
| `isolated-repo` | A task bounded to one repository | OpenHands, mini-swe-agent | OpenHands needs its own model settings. mini-swe-agent accepts `--local`. |
| `provider-gated` | Only after a provider and model are set | Goose, Cline | No. `--local` or the variables in the provider plan open this route. |

```bash
node bin/bossmind.mjs route
node bin/bossmind.mjs route code-patches
```

`route code-patches` selects Aider. `route provider-gated` selects Goose or Cline only when that agent's provider is configured, and otherwise reports both as blocked.
