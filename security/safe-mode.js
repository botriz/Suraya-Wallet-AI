'use strict';

const express = require('express');

const router = express.Router();

function unavailable(reason) {
  return function (_req, res) {
    res.set('Cache-Control', 'no-store');
    return res.status(503).json({
      ok: false,
      code: 'SECURITY_HARDENING_REQUIRED',
      error: reason
    });
  };
}

// These write paths are deliberately fail-closed. The current prototype has
// no durable encrypted key custody, authenticated admin identity, or ledger.
router.post('/wallet/create', unavailable(
  'Wallet creation is paused until encrypted key custody, recovery, and audit controls are implemented.'
));
router.post('/wallet/:address/credit', unavailable(
  'Manual balance credit is disabled. Balances must only change through verified ledger transactions.'
));
router.post('/policy', unavailable(
  'Policy changes require authenticated, role-checked, audited administrator access.'
));
router.post('/agent/register', unavailable(
  'Agent registration is paused until identity verification and consent records are durable.'
));
router.post('/agent/sync', unavailable(
  'Agent synchronization is paused until authenticated device identity and scoped consent are implemented.'
));

module.exports = router;
