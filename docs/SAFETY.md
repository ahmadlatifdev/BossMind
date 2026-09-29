# Run safety

`bossmind run` applies these limits before an agent starts, and again to the commands that agent launches through `PATH`.

| Limit | What BossMind does |
| --- | --- |
| Destructive deletion | Refuses prompts that recursively delete files, wipe a repository, or shred data. The `rm` shim blocks `-r` / `--recursive` and refuses to remove the project root, the hub root, or anything under `.bossmind`. |
| Secret printing | Refuses prompts that print `.env`, API keys, tokens, or credentials. Streamed output is redacted. Keys are never written into the repo. |
| Git push | BossMind does not push. A prompt that asks for `git push` is refused. The `git` shim exits 126 on `push`, `clean`, and `reset --hard`. Aider is still started with `--no-auto-commits`. |
| Firebase, DNS, Stripe, Neon | A change to those services is refused unless the run passes `--approve-protected`. The matching CLIs are shimmed the same way. |

The working directory cannot be the filesystem root or a directory inside `.bossmind/runtime`.

```bash
node bin/bossmind.mjs safety
node bin/bossmind.mjs run aider --local -- "Add a failing test for the parser"
```

Exit code 3 means the prompt was blocked. Exit code 4 means Goose or Cline has no provider yet, or `--local` was used on an agent with no free local model.

## What this does not do

The shim is first on `PATH` for that run. An agent that executes `/usr/bin/git` or deletes a file through its own editor still reaches that tool. The prompt gate runs first, so a request to push or wipe the project never starts the agent. Editing files inside the selected project is the job of these coding agents. Deleting the project directory is not.
