import { test } from "node:test";
import assert from "node:assert/strict";
import { analysisCache } from "../lib/cache";

test("Cache: generates deterministic SHA-256 keys", () => {
  const key1 = analysisCache.generateKey({
    mode: "analyze",
    document: "Test Agreement 1",
    model: "gemini-3.5-flash-lite",
  });
  const key2 = analysisCache.generateKey({
    mode: "analyze",
    document: "Test Agreement 1",
    model: "gemini-3.5-flash-lite",
  });
  const key3 = analysisCache.generateKey({
    mode: "analyze",
    document: "Test Agreement 2",
    model: "gemini-3.5-flash-lite",
  });

  assert.equal(key1, key2);
  assert.notEqual(key1, key3);
  assert.equal(key1.length, 64); // Valid SHA-256 hex length
});

test("Cache: stores, retrieves, and tracks hits/misses", () => {
  const testKey = "test_sha_key_" + Date.now();
  const testData = { summary: "Cached summary result", clauses: [] };

  analysisCache.set(testKey, testData, 5000);
  const retrieved = analysisCache.get<typeof testData>(testKey);

  assert.deepEqual(retrieved, testData);

  const missing = analysisCache.get("non_existent_key");
  assert.equal(missing, null);
});

test("Cache: respects TTL expiration", async () => {
  const shortKey = "expiring_key_" + Date.now();
  analysisCache.set(shortKey, { data: 123 }, 20); // 20ms TTL

  assert.notEqual(analysisCache.get(shortKey), null);

  await new Promise((resolve) => setTimeout(resolve, 35));
  assert.equal(analysisCache.get(shortKey), null);
});
