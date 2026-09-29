# BossMind

This repo is the BossMind hub for free open-source coding agents.

- `npm test` runs the unit tests. They do not install agents and do not need network access.
- `node bin/bossmind.mjs install --all` installs the pinned agents into `.bossmind/runtime`.
- `node bin/bossmind.mjs status` checks that each installed binary responds.
- `node bin/bossmind.mjs serve` serves the dashboard on http://127.0.0.1:8787.

Node 20+ is required. Python 3 with `venv` is required for the pip-installed agents. Do not commit `.bossmind/runtime` or `.bossmind/registry.json`.
