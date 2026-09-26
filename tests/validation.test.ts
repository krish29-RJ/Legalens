import { test } from "node:test";
import assert from "node:assert/strict";
import { 
  analysisRequestSchema, 
  clauseAnalysisSchema, 
  legalensResultSchema 
} from "../lib/schema";
import { LEGALENS_CONFIG } from "../lib/config";

test("Validation: rejects document shorter than minimum length", () => {
  const shortDoc = "Too short";
  const result = analysisRequestSchema.safeParse({
    document: shortDoc,
    mode: "analyze",
  });
  assert.equal(result.success, false);
  if (!result.success) {
    assert.match(result.error.issues[0].message, /at least 40 characters/i);
  }
});

test("Validation: accepts valid legal document parameters", () => {
  const validDoc = "This is an illustrative contract clause that is definitely longer than forty characters in length.";
  const result = analysisRequestSchema.safeParse({
    document: validDoc,
    mode: "analyze",
    model: "gemini-2.5-flash",
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.mode, "analyze");
    assert.equal(result.data.model, "gemini-2.5-flash");
  }
});

test("Validation: enforces valid Gemini model format", () => {
  const validDoc = "This is an illustrative contract clause that is definitely longer than forty characters in length.";
  const invalidModel = analysisRequestSchema.safeParse({
    document: validDoc,
    mode: "analyze",
    model: "invalid_model_with_spaces_or_bad_chars!",
  });
  assert.equal(invalidModel.success, false);

  const validModel = analysisRequestSchema.safeParse({
    document: validDoc,
    mode: "analyze",
    model: "gemini-3.5-flash-lite",
  });
  assert.equal(validModel.success, true);
});

test("Validation: validates clause schema with risk levels and categories", () => {
  const clause = {
    title: "Unlimited Liability",
    explanation: "You are exposed to unlimited claims.",
    quote: "The Contractor shall indemnify the Client without limitation.",
    attention: true,
    category: "liability",
    riskLevel: "critical",
  };
  const parsed = clauseAnalysisSchema.safeParse(clause);
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.riskLevel, "critical");
    assert.equal(parsed.data.attention, true);
  }
});

test("Validation: validates complete structured legalensResultSchema", () => {
  const mockResult = {
    summary: "Clear plain language summary of the contract.",
    clauses: [
      {
        title: "Standard confidentiality",
        explanation: "Two year non-disclosure requirement.",
        quote: "Both parties agree to keep information confidential.",
        attention: false,
        category: "confidentiality",
        riskLevel: "standard",
      },
    ],
    checklist: ["Check invoice submission date.", "Confirm deliverables."],
    questions: ["Is the NDA mutual?"],
  };
  const parsed = legalensResultSchema.safeParse(mockResult);
  assert.equal(parsed.success, true);
});
