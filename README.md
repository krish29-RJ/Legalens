# Legalens

Legalens makes legal documents easier to understand. Paste or upload text, receive plain-language explanations with source excerpts, compare two versions, ask document-grounded questions, and export an actionable review for a conversation with a lawyer.

## GenAI architecture

Browser → same-origin `POST /api/analyze` → Google Gemini `generateContent` REST API → validated JSON → review interface.

Google Gemini (default `gemini-3.6-flash`, configurable in the connection panel) powers summaries, clause explanations, comparison, checklists, questions for a lawyer, and document Q&A. No other AI provider is used. Zod validates requests and output shape. Source excerpts are checked against supplied text. Document content is treated as untrusted input in the system instruction. The model cannot determine enforceability or provide a legal opinion; generated output must be reviewed.

A session-only API key is entered in the connection dialog, or a server-owned `GEMINI_API_KEY` can be configured. User keys, documents and results are never placed in browser storage. A refresh clears the workspace. Text is sent to Google for live generation. Google's processing terms apply. The server does not persist documents or log request bodies. API keys should never be committed.

The sample agreement has explicitly labeled, handcrafted illustrative output. It is not represented as a live generation. A working Google API key and available quota are required to test real AI output.

## Run locally

Use Node 22.13+ and `npm run install:ci`, followed by `npm run dev`. Copy `.env.example` to `.env` only if using a server-wide key. Build with `npm run build`.

## Scope

TXT / Markdown and pasted text are supported, up to 45,000 characters per document. PDF and Word users can copy their document text. No OCR, legal database lookup, account system, or permanent storage is included. The workspace is informational assistance, not professional legal advice.

## Submission checklist

- Publish a public deployment accessible to evaluators.
- Create a public GitHub repository under 10 MB. Exclude node_modules, dist, credentials, and local runtime directories (covered by .gitignore).
- Describe the Gemini integration using the explicit mapping above.
- Record a walkthrough strictly under 4 minutes. Enter fresh document text live, generate a real Gemini response, show source quotes, ask a fresh question, compare a revision, and export the checklist. Do not use sample output as evidence of live AI.

Suggested video: 0:00 problem / 0:20 enter text / 0:50 live summary and clauses / 1:40 question / 2:15 comparison / 3:00 checklist and export / 3:30 legal boundaries and architecture.
