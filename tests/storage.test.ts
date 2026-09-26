import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { 
  countWords, 
  initialSampleText, 
  initialSampleResult,
  getStoredDocuments,
  saveStoredDocument,
  deleteStoredDocument,
  getStoredActivities,
  recordActivity,
  getStoredChecklistProgress,
  saveStoredChecklistProgress,
} from "../lib/storage.ts";

// Setup browser-like localStorage mock in Node for tests
class MemoryStorage {
  private store: Map<string, string> = new Map();
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

// @ts-expect-error Mocking window for node test environment
globalThis.window = globalThis;
// @ts-expect-error Mocking localStorage
globalThis.localStorage = new MemoryStorage();

beforeEach(() => {
  globalThis.localStorage.clear();
});

test("Storage: countWords correctly computes word count", () => {
  assert.equal(countWords(""), 0);
  assert.equal(countWords("   "), 0);
  assert.equal(countWords("Freelance services agreement"), 3);
  assert.equal(countWords("  Clause 1: Scope of work   "), 5);
});

test("Storage: seeds sample document on initial visit", () => {
  const docs = getStoredDocuments();
  assert.equal(docs.length, 1);
  assert.equal(docs[0].name, "Freelance services agreement");
  assert.equal(docs[0].isSample, true);
  assert.ok(docs[0].result);
});

test("Storage: saves and updates document correctly", () => {
  const saved = saveStoredDocument({
    name: "Non-Disclosure Agreement",
    text: "Parties agree to confidential terms for mutual commercial interest.",
  });
  assert.ok(saved.id.startsWith("doc_"));
  assert.equal(saved.name, "Non-Disclosure Agreement");
  assert.equal(saved.charCount, "Parties agree to confidential terms for mutual commercial interest.".length);

  const allDocs = getStoredDocuments();
  assert.ok(allDocs.some((d) => d.id === saved.id));
});

test("Storage: permanently deletes document from database", () => {
  const saved = saveStoredDocument({
    name: "Temporary Agreement to Delete",
    text: "Sample text to be permanently removed.",
  });

  // Verify it exists
  let docs = getStoredDocuments();
  assert.ok(docs.some((d) => d.id === saved.id));

  // Permanently delete
  deleteStoredDocument(saved.id);

  // Verify it is completely gone
  docs = getStoredDocuments();
  assert.equal(docs.some((d) => d.id === saved.id), false);

  // Check that deletion event was recorded in activities
  const activities = getStoredActivities();
  const deleteAct = activities.find((a) => a.type === "document_delete");
  assert.ok(deleteAct);
  assert.equal(deleteAct.docName, "Temporary Agreement to Delete");
});

test("Storage: persists and retrieves checklist progress per document", () => {
  const docId = "doc_test_123";
  assert.deepEqual(getStoredChecklistProgress(docId), []);

  saveStoredChecklistProgress(docId, ["Confirm invoice schedule", "Review indemnity"]);
  assert.deepEqual(getStoredChecklistProgress(docId), ["Confirm invoice schedule", "Review indemnity"]);
});
