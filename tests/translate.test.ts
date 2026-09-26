import { test } from "node:test";
import assert from "node:assert/strict";
import { analysisRequestSchema, translationResultSchema } from "../lib/schema";

test("Translate: validates translation request with target language", () => {
  const req = {
    document: "Independent contractor agrees to non-disclosure obligations for 2 years.",
    mode: "translate",
    targetLanguage: "Hindi (हिंदी)",
  };

  const parsed = analysisRequestSchema.safeParse(req);
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.targetLanguage, "Hindi (हिंदी)");
  }
});

test("Translate: validates structured translation payload", () => {
  const payload = {
    translatedText: "स्वतंत्र ठेकेदार 2 वर्षों के लिए गैर-प्रकटीकरण दायित्वों से सहमत है।",
    language: "Hindi",
  };

  const res = translationResultSchema.safeParse(payload);
  assert.equal(res.success, true);
  if (res.success) {
    assert.equal(res.data.language, "Hindi");
  }
});
