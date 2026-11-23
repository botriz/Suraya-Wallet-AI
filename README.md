# Suraya Wallet-AI — prototype status

This repository contains an early wallet, policy, agent, and exchange prototype. It is **not a production wallet or payment processor**.

## Security status

The following public write endpoints are intentionally disabled with HTTP 503 until the required controls are implemented:

- `POST /api/wallet/create`
- `POST /api/wallet/:address/credit`
- `POST /api/policy`
- `POST /api/agent/register`
- `POST /api/agent/sync`

The prototype does not yet provide durable encrypted private-key custody, account authentication, administrator role enforcement, a persistent double-entry ledger, or verifiable chain settlement. The in-memory wallet map is not durable and must not be used to store real funds or customer balances.

Cross-origin access is disabled by default. If a separate trusted frontend is required, set `CORS_ORIGINS` to a comma-separated allowlist of exact origins.

## Deployment preparation

A non-root Node 20 container is provided for isolated staging checks:

```bash
docker build -t suraya-wallet-ai .
docker run --rm -p 3000:3000 -e PORT=3000 suraya-wallet-ai
```

The liveness endpoint is `GET /health`. The container is deliberately a read-only prototype: wallet creation, manual credits, policy changes, and agent mutations remain HTTP 503. Do not enable these routes or connect real funds during deployment preparation.

## Local checks

```bash
npm install
npm test
npm start
```

The automated tests verify that the unsafe mutation endpoints fail closed. CI also builds the container. Passing these checks does not make the wallet production-ready or authorize custody, payments, exchange trading, or public user accounts.

## Required work before real funds

1. Use a reviewed cryptographic key-management design and encrypted, durable custody or a non-custodial signing model.
2. Add authenticated users, MFA for administrators, role-based authorization, and audited policy changes.
3. Implement a persistent, append-only, double-entry ledger with idempotent transaction processing.
4. Verify every deposit and withdrawal against the actual chain; never create balances through manual API credits.
5. Add recovery, backup, rate limiting, abuse monitoring, and independent security review.
6. Perform integration and recovery tests before enabling any real-money route.

No real-money operation is enabled by this repository.
