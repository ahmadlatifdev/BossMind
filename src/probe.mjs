import { getAgent, AGENTS } from "./catalog.mjs";
import { runCommand } from "./proc.mjs";
import { updateAgentRecord, readRegistry } from "./registry.mjs";
import { resolveBin } from "./runner.mjs";

export function parseVersion(text) {
  const line = text
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .find(Boolean);
  return line || "";
}

export async function probeAgent(id, cwd) {
  const agent = getAgent(id);
  const binPath = await resolveBin(agent, cwd);
  if (!binPath) {
    await updateAgentRecord(cwd, id, { status: "not-installed", binPath: null, version: null });
    return { id, name: agent.name, status: "not-installed", binPath: null, version: null };
  }

  try {
    const result = await runCommand(binPath, agent.versionArgs || ["--version"], {
      cwd,
      timeoutMs: 30000,
    });
    const combined = `${result.stdout}\n${result.stderr}`;
    const version = parseVersion(combined);
    const status = result.code === 0 ? "installed" : "broken";
    await updateAgentRecord(cwd, id, {
      status,
      binPath,
      version: version || null,
      probedAt: new Date().toISOString(),
      exitCode: result.code,
    });
    return { id, name: agent.name, status, binPath, version, exitCode: result.code };
  } catch (error) {
    await updateAgentRecord(cwd, id, {
      status: "broken",
      binPath,
      error: error.message,
      probedAt: new Date().toISOString(),
    });
    return { id, name: agent.name, status: "broken", binPath, error: error.message };
  }
}

export async function probeAll(cwd) {
  const results = [];
  for (const agent of AGENTS) {
    results.push(await probeAgent(agent.id, cwd));
  }
  return results;
}

export async function listAgents(cwd) {
  const registry = await readRegistry(cwd);
  return AGENTS.map((agent) => {
    const record = registry.agents[agent.id] || {};
    return {
      id: agent.id,
      name: agent.name,
      license: agent.license,
      repo: agent.repo,
      homepage: agent.homepage,
      summary: agent.summary,
      bin: agent.bin,
      auth: agent.auth,
      install: publicInstall(agent),
      status: record.status || "not-installed",
      version: record.version || null,
      binPath: record.binPath || null,
      error: record.error || null,
    };
  });
}

function publicInstall(agent) {
  if (agent.install.kind === "github-release") {
    return {
      kind: agent.install.kind,
      repo: agent.install.repo,
      version: agent.install.version,
    };
  }
  return { kind: agent.install.kind, spec: agent.install.spec };
}
