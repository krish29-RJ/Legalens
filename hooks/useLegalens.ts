"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getStoredDocuments,
  saveStoredDocument,
  deleteStoredDocument,
  getStoredActivities,
  recordActivity,
  clearStoredActivities,
  getStoredChecklistProgress,
  saveStoredChecklistProgress,
  type StoredDocument,
  type UserActivity,
  type Result,
  initialSampleText,
  initialSampleResult,
} from "@/lib/storage";
import { LEGALENS_CONFIG } from "@/lib/config";

export function useLegalens() {
  const [storedDocs, setStoredDocs] = useState<StoredDocument[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [activeDocId, setActiveDocId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [result, setResult] = useState<Result | null>(null);
  const [isSample, setIsSample] = useState<boolean>(false);
  const [secondText, setSecondText] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [key, setKey] = useState<string>("");
  const [model, setModel] = useState<string>(LEGALENS_CONFIG.MODELS.DEFAULT);

  // Initialize from persistent storage on mount
  useEffect(() => {
    const docs = getStoredDocuments();
    const acts = getStoredActivities();
    setStoredDocs(docs);
    setActivities(acts);

    if (docs.length > 0) {
      const first = docs[0];
      setActiveDocId(first.id);
      setName(first.name);
      setText(first.text);
      if (first.result) {
        setResult(first.result);
        setIsSample(!!first.isSample);
      }
      setCheckedItems(getStoredChecklistProgress(first.id));
    }
  }, []);

  const selectDocument = useCallback((doc: StoredDocument) => {
    setActiveDocId(doc.id);
    setName(doc.name);
    setText(doc.text);
    setResult(doc.result || null);
    setIsSample(!!doc.isSample);
    setAnswer("");
    setError("");
    setCheckedItems(getStoredChecklistProgress(doc.id));

    recordActivity("document_edit", "Switched document", `Opened "${doc.name}" in editor`, doc.id, doc.name);
    setActivities(getStoredActivities());
  }, []);

  const restoreSample = useCallback(() => {
    const saved = saveStoredDocument({
      name: "Freelance services agreement",
      text: initialSampleText,
      result: initialSampleResult,
      isSample: true,
    });
    setActiveDocId(saved.id);
    setName(saved.name);
    setText(saved.text);
    setResult(initialSampleResult);
    setIsSample(true);
    setCheckedItems([]);
    setAnswer("");
    setError("");

    const docs = getStoredDocuments();
    setStoredDocs(docs);
    recordActivity("analysis", "Sample review loaded", "Restored illustrative Freelance agreement sample", saved.id, saved.name);
    setActivities(getStoredActivities());
  }, []);

  const saveDocument = useCallback(
    (docName: string, docText: string) => {
      if (!docText.trim()) {
        setError("Please enter document text.");
        return null;
      }
      const isExisting = !!activeDocId;
      const saved = saveStoredDocument({
        id: activeDocId || undefined,
        name: docName.trim() || "Untitled document",
        text: docText,
        result: isExisting ? result : null,
        isSample: false,
      });

      setActiveDocId(saved.id);
      setName(saved.name);
      setText(saved.text);
      setError("");

      const docs = getStoredDocuments();
      setStoredDocs(docs);
      recordActivity(
        isExisting ? "document_edit" : "document_add",
        isExisting ? "Document updated" : "New document saved",
        `Saved "${saved.name}" (${saved.wordCount} words)`,
        saved.id,
        saved.name
      );
      setActivities(getStoredActivities());
      return saved;
    },
    [activeDocId, result]
  );

  const deleteDocument = useCallback(
    (id: string) => {
      deleteStoredDocument(id);
      const remaining = getStoredDocuments();
      setStoredDocs(remaining);
      setActivities(getStoredActivities());

      if (activeDocId === id) {
        if (remaining.length > 0) {
          selectDocument(remaining[0]);
        } else {
          setActiveDocId("");
          setName("");
          setText("");
          setResult(null);
          setIsSample(false);
          setAnswer("");
          setCheckedItems([]);
        }
      }
    },
    [activeDocId, selectDocument]
  );

  const toggleChecklistItem = useCallback(
    (item: string) => {
      if (!activeDocId) return;
      setCheckedItems((prev) => {
        const next = prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item];
        saveStoredChecklistProgress(activeDocId, next);
        return next;
      });
    },
    [activeDocId]
  );

  const runAnalysis = useCallback(
    async (mode: "analyze" | "compare" | "question", customQuestion?: string) => {
      setBusy(true);
      setError("");
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            document: text,
            second: mode === "compare" ? secondText : undefined,
            question: mode === "question" ? customQuestion : undefined,
            mode,
            key: key.trim() || undefined,
            model,
          }),
        });

        const data = (await response.json()) as any;
        if (!response.ok) {
          throw new Error(data.error || "Analysis failed.");
        }

        if (mode === "question") {
          setAnswer(data.answer);
          recordActivity("question", "Asked document question", `Q: "${customQuestion}"`, activeDocId, name);
        } else {
          setResult(data);
          setIsSample(false);
          // Persist result to active document
          if (activeDocId) {
            saveStoredDocument({
              id: activeDocId,
              name,
              text,
              result: data,
              isSample: false,
            });
            setStoredDocs(getStoredDocuments());
          }
          recordActivity(
            mode === "compare" ? "compare" : "analysis",
            mode === "compare" ? "Draft comparison completed" : "Document analysis completed",
            `Analyzed "${name}" (${data.clauses.length} key clauses extracted)`,
            activeDocId,
            name
          );
        }
        setActivities(getStoredActivities());
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(msg);
      } finally {
        setBusy(false);
      }
    },
    [text, secondText, key, model, activeDocId, name]
  );

  const translateContent = useCallback(
    async (contentToTranslate: string, targetLanguage = "Hindi") => {
      setBusy(true);
      setError("");
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            document: contentToTranslate,
            mode: "translate",
            targetLanguage,
            key: key.trim() || undefined,
            model,
          }),
        });

        const data = (await response.json()) as any;
        if (!response.ok) {
          throw new Error(data.error || "Translation failed.");
        }

        recordActivity("analysis", "Translated text", `Translated to ${targetLanguage}`, activeDocId, name);
        setActivities(getStoredActivities());
        return data.translatedText as string;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Translation failed.";
        setError(msg);
        return null;
      } finally {
        setBusy(false);
      }
    },
    [key, model, activeDocId, name]
  );

  const exportBackup = useCallback(() => {
    const backupData = {
      app: "Legalens",
      exportedAt: new Date().toISOString(),
      documents: storedDocs,
      activities,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `legalens-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [storedDocs, activities]);

  return {
    storedDocs,
    activities,
    activeDocId,
    name,
    setName,
    text,
    setText,
    result,
    isSample,
    secondText,
    setSecondText,
    answer,
    checkedItems,
    busy,
    error,
    setError,
    key,
    setKey,
    model,
    setModel,
    selectDocument,
    restoreSample,
    saveDocument,
    deleteDocument,
    toggleChecklistItem,
    runAnalysis,
    translateContent,
    exportBackup,
    clearActivities: clearStoredActivities,
  };
}
