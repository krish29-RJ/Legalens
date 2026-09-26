"use client";

import React, { useState } from "react";
import {
  GitCompareArrows,
  Sparkles,
  LoaderCircle,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Result } from "@/lib/storage";

interface DocumentCompareProps {
  originalText: string;
  originalName: string;
  secondText: string;
  onSecondTextChange: (text: string) => void;
  onCompare: () => void;
  busy: boolean;
  result: Result | null;
  onTranslate?: (text: string, language: string) => Promise<string | null>;
}

export function DocumentCompare({
  originalText,
  originalName,
  secondText,
  onSecondTextChange,
  onCompare,
  busy,
  result,
  onTranslate,
}: DocumentCompareProps) {
  const [secondName, setSecondName] = useState("Revised draft");
  const [selectedLanguage, setSelectedLanguage] = useState("Hindi (हिंदी)");
  const [translatedSummary, setTranslatedSummary] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslated, setShowTranslated] = useState(false);

  const handleTranslate = async () => {
    if (!onTranslate || !result?.summary) return;
    setIsTranslating(true);
    const res = await onTranslate(result.summary, selectedLanguage);
    if (res) {
      setTranslatedSummary(res);
      setShowTranslated(true);
    }
    setIsTranslating(false);
  };

  return (
    <div className="compare-stack space-y-6" role="region" aria-label="Contract comparison tool">
      <div className="panel compare-input-panel">
        <div className="flex items-center gap-2 mb-2">
          <GitCompareArrows className="text-blue-600" size={18} aria-hidden="true" />
          <h3 className="text-base font-semibold text-slate-900">Compare Two Contract Drafts</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Paste a counter-proposal or revised draft below to identify altered obligations, added liabilities, and removed clauses.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <FileText size={13} /> Original: {originalName || "Active document"}
              </label>
              <span className="text-xs text-slate-400">
                {originalText.length.toLocaleString()} chars
              </span>
            </div>
            <pre className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono h-48 overflow-y-auto whitespace-pre-wrap text-slate-700">
              {originalText || "No original document loaded. Select or add a document first."}
            </pre>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="revised-draft-input" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <FileText size={13} /> Revised Draft / Counterparty Version
              </label>
              <span className="text-xs text-slate-400">
                {secondText.length.toLocaleString()} chars
              </span>
            </div>
            <Textarea
              id="revised-draft-input"
              value={secondText}
              onChange={(e) => onSecondTextChange(e.target.value)}
              placeholder="Paste the revised counter-offer, amendment, or client draft here…"
              className="h-48 text-xs font-mono resize-none"
              aria-label="Revised draft text"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={onCompare}
            disabled={busy || !originalText.trim() || secondText.trim().length < 40}
          >
            {busy ? <LoaderCircle className="spin mr-1" size={15} /> : <Sparkles className="mr-1" size={15} />}
            Compare Drafts with Gemini
          </Button>
        </div>
      </div>

      {/* Comparison Results */}
      {result && (
        <div className="space-y-4">
          <section className="panel summary-panel">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="text-blue-600" size={18} aria-hidden="true" />
                <h3 className="text-base font-semibold text-slate-900">Comparative Summary of Changes</h3>
              </div>

              {onTranslate && (
                <div className="flex items-center gap-1.5 bg-slate-50 p-1 border border-slate-200 rounded-lg">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => {
                      setSelectedLanguage(e.target.value);
                      setTranslatedSummary(null);
                      setShowTranslated(false);
                    }}
                    className="text-xs bg-white border border-slate-200 rounded px-2 py-1 text-slate-700 outline-none"
                    aria-label="Select translation language"
                  >
                    <option value="Hindi (हिंदी)">Hindi (हिंदी)</option>
                    <option value="Spanish (Español)">Spanish (Español)</option>
                    <option value="French (Français)">French (Français)</option>
                    <option value="German (Deutsch)">German (Deutsch)</option>
                    <option value="Bengali (বাংলা)">Bengali (বাংলা)</option>
                    <option value="Marathi (मराठी)">Marathi (मराठी)</option>
                    <option value="Tamil (தமிழ்)">Tamil (தமிழ்)</option>
                    <option value="Telugu (తెలుగు)">Telugu (తెలుగు)</option>
                    <option value="Gujarati (ગુજરાતી)">Gujarati (ગુજરાતી)</option>
                    <option value="Kannada (ಕನ್ನಡ)">Kannada (ಕನ್ನಡ)</option>
                    <option value="Japanese (日本語)">Japanese (日本語)</option>
                  </select>

                  {translatedSummary ? (
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
                      {isTranslating ? <LoaderCircle className="spin" size={12} /> : <Sparkles size={12} />}
                      {isTranslating ? "Translating…" : "Translate"}
                    </Button>
                  )}
                </div>
              )}
            </div>

            <p className="summary-text text-slate-700 leading-relaxed text-sm">
              {showTranslated && translatedSummary ? translatedSummary : result.summary}
            </p>
          </section>

          <section className="panel clauses-panel">
            <h3 className="text-base font-semibold text-slate-900 mb-3">
              Substantive Differences Identified ({result.clauses.length})
            </h3>
            <div className="space-y-3">
              {result.clauses.map((clause, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border ${
                    clause.attention
                      ? "border-amber-200 bg-amber-50/40"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {clause.attention ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700 border border-red-200">
                        <AlertTriangle size={12} /> Changed Risk
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        Modified Term
                      </span>
                    )}
                    <h4 className="font-semibold text-slate-900 text-sm">{clause.title}</h4>
                  </div>
                  <p className="text-sm text-slate-700 mb-2 leading-relaxed">{clause.explanation}</p>
                  {clause.quote && (
                    <blockquote className="bg-slate-50 border-l-2 border-slate-400 pl-3 py-1 text-xs text-slate-600 font-mono italic">
                      &ldquo;{clause.quote}&rdquo;
                    </blockquote>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
