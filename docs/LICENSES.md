# Agent licenses

The clients pinned by BossMind are Apache-2.0 or MIT. BossMind itself is MIT. Model providers are separate and are not part of these licenses.

These SPDX identifiers were checked against the GitHub repository license API on 2026-09-29. The catalog in `src/catalog.mjs` is what `bossmind agents` prints.

| ID | Repository | SPDX |
| --- | --- | --- |
| `aider` | https://github.com/Aider-AI/aider | Apache-2.0 |
| `opencode` | https://github.com/anomalyco/opencode | MIT |
| `cline` | https://github.com/cline/cline | Apache-2.0 |
| `gemini` | https://github.com/google-gemini/gemini-cli | Apache-2.0 |
| `codex` | https://github.com/openai/codex | Apache-2.0 |
| `continue` | https://github.com/continuedev/continue | Apache-2.0 |
| `qwen` | https://github.com/QwenLM/qwen-code | Apache-2.0 |
| `openhands` | https://github.com/OpenHands/OpenHands | MIT |
| `mini-swe-agent` | https://github.com/SWE-agent/mini-swe-agent | MIT |
| `goose` | https://github.com/aaif-goose/goose | Apache-2.0 |

`assertCatalog()` rejects any pin outside that license set. Installed packages stay in `.bossmind/runtime` and are not committed, so their license files are not copied into git either. The pin and SPDX id above are the record.
