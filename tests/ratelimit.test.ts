import { test } from "node:test";
import assert from "node:assert/strict";
import { checkRateLimit } from "../lib/ratelimit";
import { LEGALENS_CONFIG } from "../lib/config";

test("Rate Limit: allows requests within threshold", () => {
  const testClient = "test_client_allowed_" + Date.now();
  const res = checkRateLimit(testClient);
  assert.equal(res.allowed, true);
  assert.equal(res.remaining, LEGALENS_CONFIG.RATE_LIMIT.MAX_REQUESTS_PER_WINDOW - 1);
});

test("Rate Limit: blocks requests when limit is exceeded", () => {
  const testClient = "test_client_blocked_" + Date.now();
  const max = LEGALENS_CONFIG.RATE_LIMIT.MAX_REQUESTS_PER_WINDOW;

  for (let i = 0; i < max; i++) {
    const res = checkRateLimit(testClient);
    assert.equal(res.allowed, true);
  }

  // Next request should be blocked
  const blockedRes = checkRateLimit(testClient);
  assert.equal(blockedRes.allowed, false);
  assert.equal(blockedRes.remaining, 0);
  assert.ok(blockedRes.resetMs > 0);
});
