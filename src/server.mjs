import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listAgents, probeAll } from "./probe.mjs";

const dashboardPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "web",
  "dashboard.html",
);

export function createApp(cwd) {
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url || "/", "http://127.0.0.1");
      if (req.method === "GET" && url.pathname === "/api/health") {
        return sendJson(res, 200, { ok: true });
      }
      if (req.method === "GET" && url.pathname === "/api/agents") {
        return sendJson(res, 200, { agents: await listAgents(cwd) });
      }
      if (req.method === "POST" && url.pathname === "/api/probe") {
        const probed = await probeAll(cwd);
        return sendJson(res, 200, { agents: await listAgents(cwd), probed });
      }
      if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
        const html = await readFile(dashboardPath, "utf8");
        res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
        res.end(html);
        return;
      }
      sendJson(res, 404, { error: "Not found" });
    } catch (error) {
      sendJson(res, 500, { error: error.message || "Server error" });
    }
  });
}

function sendJson(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
}

export function listen(cwd, port) {
  const server = createApp(cwd);
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => {
      const address = server.address();
      resolve({ server, port: address.port });
    });
  });
}
