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
  mode: z.enum(["analyze", "compare", "question"]),
  key: z.string().max(250).optional(),
  model: z
    .string()
    .regex(/^gemini-[a-z0-9.-]+$/, { message: "Invalid Gemini model identifier format." })
    .max(80)
    .default(LEGALENS_CONFIG.MODELS.DEFAULT),
});

export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;

export const clauseAnalysisSchema = z.object({
  title: z.string().min(1),
  explanation: z.string().min(1),
  quote: z.string().min(1),
  attention: z.boolean().default(false),
  category: z
    .enum(["liability", "payment", "termination", "confidentiality", "intellectual_property", "general"])
    .optional()
    .default("general"),
  riskLevel: z.enum(["critical", "caution", "standard"]).optional().default("standard"),
});

export type ClauseAnalysis = z.infer<typeof clauseAnalysisSchema>;

export const legalensResultSchema = z.object({
  summary: z.string().min(1),
  clauses: z.array(clauseAnalysisSchema).max(12),
  checklist: z.array(z.string().min(1)).max(15),
  questions: z.array(z.string().min(1)).max(10),
});

export type LegalensResult = z.infer<typeof legalensResultSchema>;

export const questionAnswerSchema = z.object({
  answer: z.string().min(1),
});

export type QuestionAnswer = z.infer<typeof questionAnswerSchema>;
