import { test } from "node:test";
import assert from "node:assert/strict";
import { analysisRequestSchema, legalensResultSchema } from "../lib/schema";

test("Compare: validates comparison request schema", () => {
  const validCompare = {
    document: "Original Agreement: Payment is Net 30 days. No non-compete clause.",
    second: "Revised Draft: Payment is Net 90 days with a 24 month non-compete.",
    mode: "compare",
  };

  const parsed = analysisRequestSchema.safeParse(validCompare);
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.mode, "compare");
    assert.equal(parsed.data.second.length > 0, true);
  }
});

test("Compare: parses diff output with critical risk levels", () => {
  const sampleDiffResult = {
    summary: "Revised agreement extends payment terms and introduces a non-compete.",
    clauses: [
      {
        title: "Extended Payment Window",
        explanation: "Changed from Net 30 to Net 90 days.",
        quote: "Payment is Net 90 days",
        attention: false,
        category: "payment",
        riskLevel: "caution",
      },
      {
        title: "Added Non-Compete",
        explanation: "New 24-month restrictive covenant introduced.",
        quote: "24 month non-compete",
        attention: true,
        category: "general",
        riskLevel: "critical",
      },
    ],
    checklist: ["Negotiate payment window back to Net 30", "Request removal of non-compete"],
    questions: ["Why was a 24-month non-compete added to this amendment?"],
  };

  const validated = legalensResultSchema.safeParse(sampleDiffResult);
  assert.equal(validated.success, true);
});
