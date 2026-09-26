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
}

export function DocumentViewer({
  document,
  busy,
  onEdit,
  onDelete,
  onAnalyze,
  onViewReview,
}: DocumentViewerProps) {
  const [copied, setCopied] = useState(false);

  if (!document || !document.text) {
    return null;
  }

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(document.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <section className="panel doc-viewer-panel" aria-label="Active document source viewer">
      <div className="row-title">
        <div className="doc-active-header">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-slate-500" aria-hidden="true" />
            <h2 className="text-lg font-bold text-slate-900">{document.name}</h2>
          </div>
          <span className="doc-active-meta">
            {document.charCount.toLocaleString()} characters · {document.wordCount.toLocaleString()} words
          </span>
        </div>

        <div className="doc-active-actions">
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
        {document.text}
      </pre>
    </section>
  );
}
