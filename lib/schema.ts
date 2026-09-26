import { z } from "zod";
import { LEGALENS_CONFIG } from "./config.ts";

export const analysisRequestSchema = z.object({
  document: z
    .string({ required_error: "Document text is required." })
    .min(LEGALENS_CONFIG.DOCUMENTS.MIN_LENGTH, {
      message: `Document must be at least ${LEGALENS_CONFIG.DOCUMENTS.MIN_LENGTH} characters.`,
    })
    .max(LEGALENS_CONFIG.DOCUMENTS.MAX_LENGTH, {
      message: `Document exceeds maximum length of ${LEGALENS_CONFIG.DOCUMENTS.MAX_LENGTH.toLocaleString()} characters.`,
    }),
  second: z
    .string()
    .max(LEGALENS_CONFIG.DOCUMENTS.MAX_LENGTH, {
      message: `Second document exceeds maximum length of ${LEGALENS_CONFIG.DOCUMENTS.MAX_LENGTH.toLocaleString()} characters.`,
    })
    .default(""),
  question: z
    .string()
    .max(LEGALENS_CONFIG.QUESTION.MAX_LENGTH, {
      message: `Question exceeds maximum length of ${LEGALENS_CONFIG.QUESTION.MAX_LENGTH} characters.`,
    })
    .default(""),
  mode: z.enum(["analyze", "compare", "question", "translate"]).default("analyze"),
  targetLanguage: z.string().max(50).optional().default("Hindi"),
  key: z.string().max(250).optional(),
  model: z
    .string()
    .regex(/^gemini-[a-z0-9.-]+$/, { message: "Invalid Gemini model identifier format." })
    .max(80)
    .default(LEGALENS_CONFIG.MODELS.DEFAULT),
});

export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;

export const translationResultSchema = z.object({
  translatedText: z.string().min(1),
  language: z.string().optional(),
});

export type TranslationResult = z.infer<typeof translationResultSchema>;

export const clauseAnalysisSchema = z.object({
  title: z.preprocess((v) => (typeof v === "string" ? v : "Key Clause"), z.string().default("Key Clause")),
  explanation: z.preprocess((v) => (typeof v === "string" ? v : "Explanation not provided"), z.string().default("")),
  quote: z.preprocess((v) => (typeof v === "string" ? v : ""), z.string().default("")),
  attention: z.preprocess((v) => v === true || v === "true" || v === 1, z.boolean()).default(false),
  category: z
    .preprocess((val) => {
      if (typeof val !== "string") return "general";
      const s = val.toLowerCase().replace(/[\s-]/g, "_");
      if (["liability", "payment", "termination", "confidentiality", "intellectual_property"].includes(s)) {
        return s;
      }
      return "general";
    }, z.enum(["liability", "payment", "termination", "confidentiality", "intellectual_property", "general"]))
    .default("general"),
  riskLevel: z
    .preprocess((val) => {
      if (typeof val !== "string") return "standard";
      const s = val.toLowerCase();
      if (s.includes("critical") || s.includes("high") || s.includes("danger") || s.includes("red")) return "critical";
      if (s.includes("caution") || s.includes("medium") || s.includes("warn") || s.includes("yellow") || s.includes("moderate")) return "caution";
      return "standard";
    }, z.enum(["critical", "caution", "standard"]))
    .default("standard"),
});

export type ClauseAnalysis = z.infer<typeof clauseAnalysisSchema>;

export const legalensResultSchema = z.object({
  summary: z.preprocess((v) => (typeof v === "string" ? v : "Analysis summary generated."), z.string().default("")),
  clauses: z
    .preprocess((v) => (Array.isArray(v) ? v : []), z.array(clauseAnalysisSchema))
    .default([]),
  checklist: z
    .preprocess(
      (v) => (Array.isArray(v) ? v.map((i) => (typeof i === "string" ? i : String(i?.item || i?.text || i))).filter(Boolean) : []),
      z.array(z.string())
    )
    .default([]),
  questions: z
    .preprocess(
      (v) => (Array.isArray(v) ? v.map((i) => (typeof i === "string" ? i : String(i?.question || i?.text || i))).filter(Boolean) : []),
      z.array(z.string())
    )
    .default([]),
});

export type LegalensResult = z.infer<typeof legalensResultSchema>;

export const questionAnswerSchema = z.object({
  answer: z.string().min(1),
});

export type QuestionAnswer = z.infer<typeof questionAnswerSchema>;
