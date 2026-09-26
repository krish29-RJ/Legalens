"use client";

import React, { useState } from "react";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Quote,
  Send,
  LoaderCircle,
  Copy,
  Check,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Result } from "@/lib/storage";

interface AnalysisWorkspaceProps {
  result: Result | null;
  busy: boolean;
  onAskQuestion: (q: string) => Promise<void>;
  answer: string;
  isSample?: boolean;
  onTranslate?: (text: string, language: string) => Promise<string | null>;
}

export function AnalysisWorkspace({
  result,
  busy,
  onAskQuestion,
  answer,
  isSample,
  onTranslate,
}: AnalysisWorkspaceProps) {
  const [questionInput, setQuestionInput] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("Hindi (हिंदी)");
  const [translatedSummary, setTranslatedSummary] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslated, setShowTranslated] = useState(false);

  if (!result) {
    return null;
  }

  const handleCopyQuote = (quote: string, index: number) => {
    navigator.clipboard.writeText(quote);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim() || busy) return;
    await onAskQuestion(questionInput.trim());
    setQuestionInput("");
  };

  const handleTranslateSummary = async () => {
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
    <div className="analysis-workspace-stack space-y-6" role="region" aria-label="AI Document Review">
      {/* Sample Banner if viewing illustrative sample */}
      {isSample && (
        <div className="bg-amber-50/80 border border-amber-200 text-amber-900 rounded-lg p-3 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles size={14} className="text-amber-600 shrink-0" />
            Showing illustrative sample review. You can analyze any contract instantly with Gemini AI.
          </span>
        </div>
      )}

      {/* Plain-English Overview / Summary */}
      <section className="panel summary-panel" aria-label="Executive summary">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="text-emerald-600" size={18} aria-hidden="true" />
            <h3 className="text-base font-semibold text-slate-900">Plain-English Overview</h3>
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
                aria-label="Select summary translation language"
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
                  onClick={handleTranslateSummary}
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

      {/* Key Clauses Breakdown with Risk Badges */}
      <section className="panel clauses-panel" aria-label="Key clauses breakdown">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900">
            Key Clauses &amp; What They Mean ({result.clauses.length})
          </h3>
          <span className="text-xs text-slate-500">Grounded strictly in agreement text</span>
        </div>

        <div className="clauses-list space-y-4">
          {result.clauses.map((clause, idx) => {
            const isAttention = clause.attention || clause.riskLevel === "critical";
            const riskLevel = clause.riskLevel || (clause.attention ? "critical" : "standard");

            return (
              <article
                key={idx}
                className={`clause-card p-4 rounded-xl border transition-all ${
                  isAttention
                    ? "border-amber-200 bg-amber-50/40"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {riskLevel === "critical" ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700 border border-red-200">
                        <ShieldAlert size={12} /> Discussion point
                      </span>
                    ) : riskLevel === "caution" ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700 border border-amber-200">
                        <AlertTriangle size={12} /> Review carefully
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        <CheckCircle2 size={12} /> Standard term
                      </span>
                    )}
                    <h4 className="font-semibold text-slate-900 text-sm">{clause.title}</h4>
                  </div>
                </div>

                <p className="text-sm text-slate-700 mb-3 leading-relaxed">
                  {clause.explanation}
                </p>

                {clause.quote && (
                  <div className="quote-box bg-slate-50/80 border border-slate-200/80 rounded-lg p-3 text-xs text-slate-600 font-mono relative group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-1.5 flex-1">
                        <Quote size={13} className="text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
                        <span className="italic leading-normal">&ldquo;{clause.quote}&rdquo;</span>
                      </div>
                      <button
                        onClick={() => handleCopyQuote(clause.quote, idx)}
                        className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                        title="Copy verbatim excerpt"
                        aria-label="Copy verbatim clause quote"
                        type="button"
                      >
                        {copiedIndex === idx ? (
                          <Check size={13} className="text-emerald-600" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* Ask a Question Section */}
      <section className="panel qna-panel" aria-label="Ask questions about this agreement">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle size={17} className="text-blue-600" aria-hidden="true" />
          <h3 className="text-base font-semibold text-slate-900">Ask a Question About This Agreement</h3>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Gemini will search this document and answer using only verified facts from the text.
        </p>

        <form onSubmit={handleQuestionSubmit} className="flex gap-2">
          <Input
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            placeholder="e.g. Can either party terminate without penalty? What are the payment terms?"
            disabled={busy}
            className="flex-1"
            aria-label="Enter question about document"
          />
          <Button type="submit" disabled={busy || !questionInput.trim()} size="sm">
            {busy ? <LoaderCircle className="spin" size={14} /> : <Send size={14} />}
            Ask
          </Button>
        </form>

        {answer && (
          <div className="mt-4 p-4 rounded-xl bg-blue-50/60 border border-blue-100" role="status" aria-live="polite">
            <h4 className="text-xs font-semibold text-blue-900 uppercase tracking-wider mb-1">Answer from document:</h4>
            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{answer}</p>
          </div>
        )}
      </section>
    </div>
  );
}
