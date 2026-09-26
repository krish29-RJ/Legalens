export const LEGALENS_CONFIG = {
  DOCUMENTS: {
    MIN_LENGTH: 40,
    MAX_LENGTH: 45000,
    MAX_PAYLOAD_BYTES: 200000,
    MAX_FILE_SIZE_BYTES: 150000,
    ALLOWED_EXTENSIONS: ['.txt', '.md'] as const,
  },
  QUESTION: {
    MAX_LENGTH: 1500,
  },
  MODELS: {
    DEFAULT: 'gemini-3.5-flash-lite',
    FALLBACK: 'gemini-2.5-flash',
    SUPPORTED: [
      { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite', description: 'Recommended: High-speed, powerful legal analysis' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Fast, high accuracy legal reasoning' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Deep reasoning for complex multi-party agreements' },
    ] as const,
    TIMEOUT_MS: 45000,
    TEMPERATURE: 0.2,
    MAX_OUTPUT_TOKENS: 6000,
  },
  RATE_LIMIT: {
    MAX_REQUESTS_PER_WINDOW: 30,
    WINDOW_MS: 60 * 1000, // 1 minute
  },
  STORAGE: {
    DOCS_KEY: 'legalens_saved_documents',
    ACTIVITIES_KEY: 'legalens_user_activities',
    INITIALIZED_KEY: 'legalens_storage_initialized',
    MAX_ACTIVITIES: 100,
  },
  SEARCH: {
    DEBOUNCE_MS: 300,
  },
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  },
} as const;

export type SupportedModelId = typeof LEGALENS_CONFIG.MODELS.SUPPORTED[number]['id'];
