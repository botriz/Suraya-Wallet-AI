'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { createServer } = require('node:http');
const safeModeRouter = require('../security/safe-mode');

test('unsafe wallet, policy, and agent mutations fail closed', async (t) => {
  const app = express();
  app.use(express.json());
  app.use('/api', safeModeRouter);
  const server = createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  t.after(() => new Promise((resolve, reject) =>
    server.close((error) => error ? reject(error) : resolve())
  ));

  const cases = [
    ['/api/wallet/create', '{}'],
    ['/api/wallet/SRY123/credit', '{"amount":100}'],
    ['/api/policy', '{"walletEnabled":true}'],
    ['/api/agent/register', '{"agentId":"test","consent":true}'],
    ['/api/agent/sync', '{"agentId":"test","insight":"test"}']
  ];
  for (const [path, body] of cases) {
    const response = await fetch(baseUrl + path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body
    });
    const result = await response.json();
    assert.equal(response.status, 503, path);
    assert.equal(result.code, 'SECURITY_HARDENING_REQUIRED', path);
    assert.equal(response.headers.get('cache-control'), 'no-store', path);
  }
});
