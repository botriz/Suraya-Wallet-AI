import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";

test("wallet server starts, exposes liveness, and blocks all unsafe writes", async () => {
  const child = spawn(process.execPath, ["server.js"], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: "0", CORS_ORIGINS: "" },
    stdio: ["ignore", "pipe", "pipe"]
  });
  let output = "";
  let port;
  try {
    port = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("server startup timed out")), 10000);
      child.stdout.setEncoding("utf8");
      child.stderr.setEncoding("utf8");
      child.stdout.on("data", chunk => {
        output += chunk;
        const match = output.match(/listening on port (\d+)/);
        if (match) {
          clearTimeout(timeout);
          resolve(Number(match[1]));
        }
      });
      child.stderr.on("data", chunk => { output += chunk; });
      child.once("error", error => {
        clearTimeout(timeout);
        reject(error);
      });
      child.once("exit", code => {
        clearTimeout(timeout);
        reject(new Error("server exited before startup: " + code + "\n" + output));
      });
    });

    const base = "http://127.0.0.1:" + port;
    const health = await fetch(base + "/health");
    assert.equal(health.status, 200);
    assert.equal((await health.json()).mode, "read-only-prototype");

    const status = await fetch(base + "/api/status");
    assert.equal(status.status, 200);

    const create = await fetch(base + "/api/wallet/create", { method: "POST" });
    assert.equal(create.status, 503);
    assert.equal((await create.json()).code, "SECURITY_HARDENING_REQUIRED");

    const policy = await fetch(base + "/api/policy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ exchangeEnabled: true })
    });
    assert.equal(policy.status, 503);
  } finally {
    child.kill("SIGTERM");
    await new Promise(resolve => {
      if (child.exitCode !== null) return resolve();
      child.once("exit", resolve);
    });
  }
});
