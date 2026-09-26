"use client";

import React, { useMemo } from "react";
import {
  Database,
  Plus,
  Search,
  X,
  FileText,
  Clock,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StoredDocument } from "@/lib/storage";

interface DocumentDatabaseProps {
  documents: StoredDocument[];
  activeDocId: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectDoc: (doc: StoredDocument) => void;
  onAddDoc: () => void;
  onDeleteDoc: (id: string, e: React.MouseEvent) => void;
  onRestoreSample: () => void;
}

export function DocumentDatabase({
  documents,
  activeDocId,
  searchQuery,
  onSearchChange,
  onSelectDoc,
  onAddDoc,
  onDeleteDoc,
  onRestoreSample,
}: DocumentDatabaseProps) {
  const filteredDocs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.text.toLowerCase().includes(q)
    );
  }, [documents, searchQuery]);

  return (
    <div className="doc-database-section">
      {/* Database Toolbar */}
      <div className="doc-database-toolbar">
        <div className="doc-search-box">
          <Search size={15} className="search-icon" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search saved documents by title or clause text…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
            aria-label="Search saved documents"
          />
          {searchQuery && (
            <button
              className="search-clear"
              onClick={() => onSearchChange("")}
              aria-label="Clear search input"
              type="button"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="doc-db-metrics">
          <span className="doc-count-tag" aria-live="polite">
            <Database size={13} aria-hidden="true" /> {documents.length}{" "}
            {documents.length === 1 ? "document" : "documents"} in database
          </span>
          <Button size="sm" onClick={onAddDoc} className="add-doc-btn">
            <Plus size={15} aria-hidden="true" /> Add document
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {documents.length === 0 ? (
        <div className="panel empty-db-panel" role="region" aria-label="Empty database state">
          <Database size={36} className="empty-db-icon" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-slate-800 mt-2">No saved documents in database</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            All documents have been permanently deleted, or none have been added yet. Add a new agreement or restore the illustrative sample.
          </p>
          <div className="empty-db-btns mt-4 flex gap-2 justify-center">
            <Button onClick={onAddDoc}>
              <Plus size={15} aria-hidden="true" /> Add document
            </Button>
            <Button variant="outline" onClick={onRestoreSample}>
              <Sparkles size={15} aria-hidden="true" /> Restore sample agreement
            </Button>
          </div>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="panel empty-db-panel py-8 text-center" role="status">
          <Search size={28} className="text-slate-400 mx-auto mb-2" aria-hidden="true" />
          <p className="text-slate-600 font-medium">No documents match &ldquo;{searchQuery}&rdquo;</p>
          <Button variant="outline" size="sm" onClick={() => onSearchChange("")} className="mt-3">
            Clear search filter
          </Button>
        </div>
      ) : (
        /* Grid of Stored Documents */
        <div className="doc-selector-grid" role="list" aria-label="Saved documents list">
          {filteredDocs.map((d) => {
            const isActive = d.id === activeDocId;
            return (
              <div
                key={d.id}
                role="listitem"
                className={`doc-select-card ${isActive ? "active" : ""}`}
                onClick={() => onSelectDoc(d)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectDoc(d);
                  }
                }}
                aria-selected={isActive}
              >
                <div className="doc-select-top">
                  <div className="doc-icon-wrap" aria-hidden="true">
                    <FileText size={18} />
                  </div>
                  <div className="doc-info-block">
                    <h4 title={d.name}>{d.name}</h4>
                    <span className="doc-meta-date">
                      <Clock size={11} aria-hidden="true" />{" "}
                      {new Date(d.updatedAt || d.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <button
                    className="doc-delete-btn"
                    title="Permanently delete from database"
                    aria-label={`Permanently delete ${d.name}`}
                    onClick={(e) => onDeleteDoc(d.id, e)}
                    type="button"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="doc-select-bottom">
                  <span className="doc-word-count">{d.wordCount.toLocaleString()} words</span>
                  {d.result ? (
                    <span className="doc-badge-analyzed">
                      <Sparkles size={11} aria-hidden="true" /> Analyzed
                    </span>
                  ) : (
                    <span className="doc-badge-draft">Source text</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
