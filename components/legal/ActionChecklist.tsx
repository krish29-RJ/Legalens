"use client";

import React, { useState } from "react";
import {
  ListChecks,
  CheckCircle2,
  Copy,
  Check,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionChecklistProps {
  checklist: string[];
  questions: string[];
  checkedItems: string[];
  onToggleCheck: (item: string) => void;
  onRunAnalysis?: () => void;
  hasResult: boolean;
}

export function ActionChecklist({
  checklist,
  questions,
  checkedItems,
  onToggleCheck,
  onRunAnalysis,
  hasResult,
}: ActionChecklistProps) {
  const [copiedQuestionIndex, setCopiedQuestionIndex] = useState<number | null>(null);

  const handleCopyQuestion = (q: string, idx: number) => {
    navigator.clipboard.writeText(q);
    setCopiedQuestionIndex(idx);
    setTimeout(() => setCopiedQuestionIndex(null), 2000);
  };

  if (!hasResult || checklist.length === 0) {
    return (
      <div className="panel text-center py-12" role="region" aria-label="Action checklist">
        <ListChecks size={36} className="text-slate-400 mx-auto mb-3" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-slate-800">No Action Checklist Available</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
          Run an analysis on your document to generate practical preparatory steps and negotiation questions.
        </p>
        {onRunAnalysis && (
          <Button onClick={onRunAnalysis}>
            <Sparkles size={15} /> Analyze Document
          </Button>
        )}
      </div>
    );
  }

  const completedCount = checkedItems.length;
  const totalCount = checklist.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="checklist-stack space-y-6" role="region" aria-label="Action checklist and lawyer questions">
      {/* Progress Header */}
      <section className="panel checklist-header-panel">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ListChecks className="text-emerald-600" size={18} aria-hidden="true" />
            <h3 className="text-base font-semibold text-slate-900">Before-You-Sign Checklist</h3>
          </div>
          <span className="text-xs font-semibold text-slate-700">
            {completedCount} of {totalCount} completed ({progressPercent}%)
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </section>

      {/* Checklist Items */}
      <section className="panel checklist-items-panel">
        <ul className="space-y-3" aria-label="Checklist items">
          {checklist.map((item, idx) => {
            const isChecked = checkedItems.includes(item);
            return (
              <li
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                  isChecked
                    ? "bg-emerald-50/50 border-emerald-200 text-slate-600 line-through"
                    : "bg-white border-slate-200 text-slate-800 hover:border-slate-300"
                }`}
                onClick={() => onToggleCheck(item)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onToggleCheck(item);
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}} // handled by li onClick
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  aria-label={item}
                />
                <span className="text-sm leading-relaxed flex-1">{item}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Suggested Questions for Lawyer / Counterparty */}
      {questions.length > 0 && (
        <section className="panel questions-panel" aria-label="Questions for lawyer">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle size={18} className="text-blue-600" aria-hidden="true" />
            <h3 className="text-base font-semibold text-slate-900">
              Questions for a Qualified Lawyer or Counterparty
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Take these questions into your consultation or negotiation discussion to protect your rights.
          </p>

          <div className="space-y-2.5">
            {questions.map((q, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-800"
              >
                <div className="flex items-start gap-2 flex-1">
                  <span className="text-xs font-bold text-slate-400 mt-0.5">{idx + 1}.</span>
                  <p className="leading-relaxed">{q}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyQuestion(q, idx)}
                  className="shrink-0 text-xs"
                  aria-label={`Copy question: ${q}`}
                >
                  {copiedQuestionIndex === idx ? (
                    <>
                      <Check size={12} className="text-emerald-600 mr-1" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={12} className="mr-1" /> Copy
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
