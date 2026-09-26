import { test } from "node:test";
import assert from "node:assert/strict";
import { LEGALENS_CONFIG } from "../lib/config";
import { analysisRequestSchema } from "../lib/schema";
import { checkRateLimit } from "../lib/ratelimit";

test("Security: enforces strict document size boundaries", () => {
  const giantDoc = "A".repeat(LEGALENS_CONFIG.DOCUMENTS.MAX_LENGTH + 500);
  const res = analysisRequestSchema.safeParse({
    document: giantDoc,
    mode: "analyze",
  });

  assert.equal(res.success, false);
});

test("Security: blocks invalid or unauthorized model identifiers", () => {
  const invalidModel = {
    document: "Standard mutual non-disclosure agreement text for test purpose.",
    mode: "analyze",
    model: "invalid-hacked-model-eval",
  };

  const res = analysisRequestSchema.safeParse(invalidModel);
  // Must fail regex or model validation
  assert.equal(res.success, false);
});

test("Security: rate limits rapid-fire requests from single client IP", () => {
  const clientIp = "sec_test_client_" + Date.now();
  for (let i = 0; i < LEGALENS_CONFIG.RATE_LIMIT.MAX_REQUESTS_PER_WINDOW; i++) {
    checkRateLimit(clientIp);
  }
  const blocked = checkRateLimit(clientIp);
  assert.equal(blocked.allowed, false);
});
