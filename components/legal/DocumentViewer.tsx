"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  Edit3,
  Trash2,
  Sparkles,
  LoaderCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StoredDocument } from "@/lib/storage";

interface DocumentViewerProps {
  document: StoredDocument | null;
  busy: boolean;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onAnalyze: () => void;
  onViewReview: () => void;
  onTranslate?: (text: string, language: string) => Promise<string | null>;
}

export const SUPPORTED_LANGUAGES = [
  { code: "hi", name: "Hindi (हिंदी)" },
  { code: "es", name: "Spanish (Español)" },
  { code: "fr", name: "French (Français)" },
  { code: "de", name: "German (Deutsch)" },
  { code: "bn", name: "Bengali (বাংলা)" },
  { code: "mr", name: "Marathi (मराठी)" },
  { code: "ta", name: "Tamil (தமிழ்)" },
  { code: "te", name: "Telugu (తెలుగు)" },
  { code: "gu", name: "Gujarati (ગુજરાતી)" },
  { code: "kn", name: "Kannada (ಕನ್ನಡ)" },
  { code: "ja", name: "Japanese (日本語)" },
  { code: "zh", name: "Chinese (中文)" },
  { code: "ar", name: "Arabic (العربية)" },
];

export function DocumentViewer({
  document,
  busy,
  onEdit,
  onDelete,
  onAnalyze,
  onViewReview,
  onTranslate,
}: DocumentViewerProps) {
  const [copied, setCopied] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("Hindi (हिंदी)");
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslated, setShowTranslated] = useState(false);

  if (!document || !document.text) {
    return null;
  }

  const currentDisplayText = showTranslated && translatedText ? translatedText : document.text;

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(currentDisplayText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleTranslate = async () => {
    if (!onTranslate || !document.text) return;
    setIsTranslating(true);
    const res = await onTranslate(document.text, selectedLanguage);
    if (res) {
      setTranslatedText(res);
      setShowTranslated(true);
    }
    setIsTranslating(false);
  };

  return (
    <section className="panel doc-viewer-panel" aria-label="Active document source viewer">
      <div className="row-title">
        <div className="doc-active-header">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-slate-500" aria-hidden="true" />
            <h2 className="text-lg font-bold text-slate-900">{document.name}</h2>
            {showTranslated && translatedText && (
              <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-medium">
                Translated: {selectedLanguage}
              </span>
            )}
          </div>
          <span className="doc-active-meta">
            {document.charCount.toLocaleString()} characters · {document.wordCount.toLocaleString()} words
          </span>
        </div>

        <div className="doc-active-actions">
          {/* Translation controls */}
          {onTranslate && (
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 border border-slate-200 rounded-lg">
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value);
                  setTranslatedText(null);
                  setShowTranslated(false);
                }}
                className="text-xs bg-white border border-slate-200 rounded px-2 py-1 text-slate-700 outline-none"
                aria-label="Select translation language"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.name}>
                    {lang.name}
                  </option>
                ))}
              </select>

              {translatedText ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTranslated(!showTranslated)}
                  className="text-xs h-7"
                >
                  {showTranslated ? "View Original" : "View Translated"}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTranslate}
                  disabled={isTranslating || busy}
                  className="text-xs h-7"
                >
                  {isTranslating ? (
                    <LoaderCircle className="spin" size={12} />
                  ) : (
                    <Sparkles size={12} />
                  )}
                  {isTranslating ? "Translating…" : "Translate"}
                </Button>
              )}
            </div>
          )}

          <Button variant="outline" size="sm" onClick={copyText} aria-label="Copy document text">
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy text"}
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit} aria-label="Edit document title and content">
            <Edit3 size={14} /> Edit document
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="delete-perm-btn"
            onClick={() => onDelete(document.id)}
            aria-label="Permanently delete document"
          >
            <Trash2 size={14} /> Delete permanently
          </Button>
          {document.result ? (
            <Button size="sm" onClick={onViewReview}>
              <Sparkles size={14} /> View AI Review
            </Button>
          ) : (
            <Button size="sm" onClick={onAnalyze} disabled={busy}>
              {busy ? <LoaderCircle className="spin" size={14} /> : <Sparkles size={14} />}
              Analyze with Gemini
            </Button>
          )}
        </div>
      </div>

      <pre className="source" tabIndex={0} aria-label="Document source text content">
        {currentDisplayText}
      </pre>
    </section>
  );
}
