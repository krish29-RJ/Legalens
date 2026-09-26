"use client";

import { LEGALENS_CONFIG } from "./config.ts";
import type { LegalensResult, ClauseAnalysis } from "./schema.ts";

export type Result = LegalensResult;
export type Clause = ClauseAnalysis;

export interface StoredDocument {
  id: string;
  name: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  charCount: number;
  wordCount: number;
  result?: Result | null;
  isSample?: boolean;
}

export type ActivityType =
  | "document_add"
  | "document_edit"
  | "document_delete"
  | "analysis"
  | "compare"
  | "question"
  | "export";

export interface UserActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  docId?: string;
  docName?: string;
}

const { DOCS_KEY, ACTIVITIES_KEY, INITIALIZED_KEY, MAX_ACTIVITIES } = LEGALENS_CONFIG.STORAGE;
const CHECKLIST_KEY_PREFIX = "legalens_checklist_";

export const initialSampleText = `FREELANCE SERVICES AGREEMENT
1. Scope: The Contractor will deliver a brand identity package consisting of a logo, color palette, and brand guidelines. Two revision rounds are included.
2. Payment: The Client will pay a total fee of INR 60,000. 50% is payable before work begins and 50% within 30 days of final delivery.
3. Ownership: All intellectual property rights in the final deliverables transfer to the Client upon full payment. The Contractor retains rights to unused concepts.
4. Termination: Either party may terminate with 14 days written notice. The Client will pay for all work completed up to the termination date.
5. Liability: The Contractor shall indemnify the Client against any and all claims, damages, and losses arising from the services, without limitation.
6. Confidentiality: Both parties agree to keep non-public business information confidential for two years after termination.`;

export const initialSampleResult: Result = {
  summary: "This agreement covers a ₹60,000 brand identity project with two revision rounds. You receive half the payment upfront and the balance within 30 days of delivery. Ownership transfers after full payment. The broad liability clause deserves a closer conversation before signing.",
  clauses: [
    {
      title: "Payment in two stages",
      explanation: "₹30,000 is due before work starts. The remaining ₹30,000 is due within 30 days of final delivery.",
      quote: "50% is payable before work begins and 50% within 30 days of final delivery.",
      attention: false,
      category: "payment",
      riskLevel: "standard"
    },
    {
      title: "Potentially unlimited liability",
      explanation: "The wording does not set a financial limit on your responsibility for claims. Ask a lawyer about the scope and whether a negotiated cap is appropriate.",
      quote: "The Contractor shall indemnify the Client against any and all claims, damages, and losses arising from the services, without limitation.",
      attention: true,
      category: "liability",
      riskLevel: "critical"
    },
    {
      title: "Ownership follows payment",
      explanation: "The client receives rights to final deliverables only after full payment. Unused concepts remain with the contractor.",
      quote: "All intellectual property rights in the final deliverables transfer to the Client upon full payment.",
      attention: false,
      category: "intellectual_property",
      riskLevel: "caution"
    }
  ],
  checklist: [
    "Confirm the deliverables and two included revision rounds.",
    "Agree how final delivery and acceptance will be recorded.",
    "Discuss the scope of indemnity and a possible liability cap.",
    "Keep a copy of the signed agreement and payment records."
  ],
  questions: [
    "Could the indemnity clause expose me to losses outside my control?",
    "How should payment for work in progress be calculated if the agreement ends?",
    "Should we clarify what happens when a payment is late?"
  ]
};

export function countWords(str: string): number {
  return str.trim() ? str.trim().split(/\s+/).length : 0;
}

function safeLocalStorageSet(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: unknown) {
    if (err instanceof DOMException && (err.name === "QuotaExceededError" || err.code === 22)) {
      console.warn("Storage quota exceeded. Pruning older activities to free space.");
      try {
        const activities = getStoredActivities().slice(0, 20);
        localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
        localStorage.setItem(key, value);
        return true;
      } catch {
        console.error("Critical storage quota failure.");
        return false;
      }
    }
    console.error("LocalStorage write error:", err);
    return false;
  }
}

export function getStoredDocuments(): StoredDocument[] {
  if (typeof window === "undefined") return [];
  try {
    const isInitialized = localStorage.getItem(INITIALIZED_KEY);
    const raw = localStorage.getItem(DOCS_KEY);

    // Seed sample on initial visit only
    if (!isInitialized) {
      safeLocalStorageSet(INITIALIZED_KEY, "true");
      const sampleDoc: StoredDocument = {
        id: "doc_sample_freelance",
        name: "Freelance services agreement",
        text: initialSampleText,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        charCount: initialSampleText.length,
        wordCount: countWords(initialSampleText),
        result: initialSampleResult,
        isSample: true
      };
      safeLocalStorageSet(DOCS_KEY, JSON.stringify([sampleDoc]));
      return [sampleDoc];
    }

    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading stored documents:", err);
    return [];
  }
}

export function saveStoredDocument(doc: {
  id?: string;
  name: string;
  text: string;
  result?: Result | null;
  isSample?: boolean;
}): StoredDocument {
  if (typeof window !== "undefined") {
    safeLocalStorageSet(INITIALIZED_KEY, "true");
  }
  const docs = getStoredDocuments();
  const now = new Date().toISOString();
  const docId = doc.id || "doc_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);

  const existingIndex = docs.findIndex(d => d.id === docId);
  const updatedDoc: StoredDocument = {
    id: docId,
    name: doc.name.trim() || "Untitled document",
    text: doc.text,
    createdAt: existingIndex >= 0 ? docs[existingIndex].createdAt : now,
    updatedAt: now,
    charCount: doc.text.length,
    wordCount: countWords(doc.text),
    result: doc.result !== undefined ? doc.result : (existingIndex >= 0 ? docs[existingIndex].result : null),
    isSample: doc.isSample ?? false
  };

  let newDocs: StoredDocument[];
  if (existingIndex >= 0) {
    newDocs = [...docs];
    newDocs[existingIndex] = updatedDoc;
  } else {
    newDocs = [updatedDoc, ...docs];
  }

  safeLocalStorageSet(DOCS_KEY, JSON.stringify(newDocs));
  return updatedDoc;
}

export function deleteStoredDocument(id: string): void {
  if (typeof window === "undefined") return;
  try {
    safeLocalStorageSet(INITIALIZED_KEY, "true");
    const currentDocs = getStoredDocuments();
    const docToDelete = currentDocs.find(d => d.id === id);
    const remaining = currentDocs.filter(d => d.id !== id);
    safeLocalStorageSet(DOCS_KEY, JSON.stringify(remaining));

    // Remove any checklist state for this document
    localStorage.removeItem(CHECKLIST_KEY_PREFIX + id);

    // Clean up activities linked to this document and record deletion event
    const currentActivities = getStoredActivities();
    const updatedActivities = currentActivities.filter(a => a.docId !== id);
    if (docToDelete) {
      const deleteAct: UserActivity = {
        id: "act_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
        type: "document_delete",
        title: "Document permanently deleted",
        description: `Permanently removed "${docToDelete.name}" (${docToDelete.wordCount} words) from local database.`,
        timestamp: new Date().toISOString(),
        docName: docToDelete.name
      };
      updatedActivities.unshift(deleteAct);
    }
    safeLocalStorageSet(ACTIVITIES_KEY, JSON.stringify(updatedActivities.slice(0, MAX_ACTIVITIES)));
  } catch (err) {
    console.error("Failed to delete stored document:", err);
  }
}

export function clearAllStoredDocuments(): void {
  if (typeof window === "undefined") return;
  try {
    safeLocalStorageSet(DOCS_KEY, JSON.stringify([]));
    safeLocalStorageSet(INITIALIZED_KEY, "true");
  } catch (err) {
    console.error("Failed to clear all stored documents:", err);
  }
}

export function getStoredActivities(): UserActivity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACTIVITIES_KEY);
    if (!raw) {
      const initial: UserActivity[] = [
        {
          id: "act_init_1",
          type: "document_add",
          title: "Sample document ready",
          description: "Freelance services agreement added to your workspace",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          docId: "doc_sample_freelance",
          docName: "Freelance services agreement"
        },
        {
          id: "act_init_2",
          type: "analysis",
          title: "AI Analysis loaded",
          description: "Generated plain language overview, 3 key clauses & checklist",
          timestamp: new Date(Date.now() - 3500000).toISOString(),
          docId: "doc_sample_freelance",
          docName: "Freelance services agreement"
        }
      ];
      safeLocalStorageSet(ACTIVITIES_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading stored activities:", err);
    return [];
  }
}

export function recordActivity(
  type: ActivityType,
  title: string,
  description: string,
  docId?: string,
  docName?: string
): UserActivity {
  const current = getStoredActivities();
  const newActivity: UserActivity = {
    id: "act_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    type,
    title,
    description,
    timestamp: new Date().toISOString(),
    docId,
    docName
  };

  const updated = [newActivity, ...current].slice(0, MAX_ACTIVITIES);
  safeLocalStorageSet(ACTIVITIES_KEY, JSON.stringify(updated));
  return newActivity;
}

export function clearStoredActivities(): void {
  if (typeof window === "undefined") return;
  try {
    safeLocalStorageSet(ACTIVITIES_KEY, JSON.stringify([]));
  } catch (err) {
    console.error("Failed to clear activities:", err);
  }
}

export function getStoredChecklistProgress(docId: string): string[] {
  if (typeof window === "undefined" || !docId) return [];
  try {
    const raw = localStorage.getItem(CHECKLIST_KEY_PREFIX + docId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredChecklistProgress(docId: string, checkedItems: string[]): void {
  if (typeof window === "undefined" || !docId) return;
  safeLocalStorageSet(CHECKLIST_KEY_PREFIX + docId, JSON.stringify(checkedItems));
}
