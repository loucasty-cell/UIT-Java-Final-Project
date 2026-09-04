// Exercise the produced Node artifact before CI uploads it.
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout as delay } from "node:timers/promises";

await access(".output/server/index.mjs");
await access(".output/public/assets");
const reservation = createServer();
await new Promise((resolve, reject) => {
  reservation.once("error", reject);
  reservation.listen(0, "127.0.0.1", resolve);
});
const port = reservation.address().port;
await new Promise((resolve) => reservation.close(resolve));
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, [".output/server/index.mjs"], {
  env: { ...process.env, HOST: "127.0.0.1", PORT: String(port) },
  windowsHide: true,
  stdio: ["ignore", "pipe", "pipe"],
});
let output = "";
server.stdout.on("data", (chunk) => {
  output += chunk;
});
server.stderr.on("data", (chunk) => {
  output += chunk;
});
let spawnError;
server.on("error", (error) => {
  spawnError = error;
});
try {
  let ready = false;
  for (let attempt = 0; attempt < 50; attempt++) {
    if (spawnError) throw spawnError;
    if (server.exitCode !== null) throw new Error(`Artifact exited early: ${output}`);
    try {
      ready = (await fetch(base + "/login", { signal: AbortSignal.timeout(1000) })).ok;
    } catch {
      /* Still starting. */
    }
    if (ready) break;
    await delay(200);
  }
  assert(ready, `Artifact did not become ready: ${output}`);
  const assets = new Set();
  for (const [path, expected] of [
    ["/login", "Welcome back"],
    ["/register", "Join SkillBridge"],
    ["/admin-login", "Administrator sign in"],
    ["/wallet", "Checking your session"],
    ["/settings", "Checking your session"],
    ["/", "Checking your session"],
  ]) {
    const response = await fetch(base + path, { signal: AbortSignal.timeout(5000) });
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert(html.includes(expected), `${path} must render its expected content`);
    for (const match of html.matchAll(/(?:src|href)="([^" ]+\.(?:js|css))"/g)) {
      if (match[1].startsWith("/")) assets.add(match[1]);
    }
  }
  assert(assets.size > 0, "No compiled frontend assets found");
  for (const asset of assets) {
    const response = await fetch(base + asset, { signal: AbortSignal.timeout(5000) });
    assert.equal(response.status, 200, asset);
    await response.arrayBuffer();
  }
  console.log(`PASS: compiled frontend serves 6 routes and ${assets.size} assets.`);
} finally {
  if (server.exitCode === null && !spawnError) {
    const stopped = new Promise((resolve) => server.once("exit", resolve));
    server.kill();
    await stopped;
  }
}
