"use client";

import React, { useState, useRef } from "react";
import {
  Scale,
  LayoutDashboard,
  Files,
  GitCompareArrows,
  ListChecks,
  Sparkles,
  ArrowUpRight,
  ArrowRight,
  Upload,
  FileText,
  ShieldCheck,
  ChevronRight,
  Plus,
  Settings2,
  CircleHelp,
  LoaderCircle,
  BookOpen,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

// Custom domain hook & components
import { useLegalens } from "@/hooks/useLegalens";
import { DocumentDatabase } from "@/components/legal/DocumentDatabase";
import { DocumentViewer } from "@/components/legal/DocumentViewer";
import { AnalysisWorkspace } from "@/components/legal/AnalysisWorkspace";
import { DocumentCompare } from "@/components/legal/DocumentCompare";
import { ActionChecklist } from "@/components/legal/ActionChecklist";
import { ProfileModal } from "@/components/legal/ProfileModal";
import { SettingsDialog } from "@/components/legal/SettingsDialog";
import { DeleteConfirmDialog } from "@/components/legal/DeleteConfirmDialog";
import type { StoredDocument } from "@/lib/storage";
import { LEGALENS_CONFIG } from "@/lib/config";

export default function Page() {
  const {
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
    clearActivities,
  } = useLegalens();

  const [view, setView] = useState<string>("Workspace");
  const [modal, setModal] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<StoredDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active document object
  const activeDocument = storedDocs.find((d) => d.id === activeDocId) || (text ? {
    id: activeDocId || "active_temp",
    name: name || "Untitled document",
    text,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    charCount: text.length,
    wordCount: text.trim() ? text.trim().split(/\s+/).length : 0,
    result,
    isSample,
  } : null);

  const nav = [
    { label: "Workspace", icon: LayoutDashboard },
    { label: "My document", icon: Files, badge: storedDocs.length > 0 ? storedDocs.length : undefined },
    { label: "Compare documents", icon: GitCompareArrows },
    { label: "Action checklist", icon: ListChecks },
  ];

  const navigate = (v: string) => {
    setView(v);
    setError("");
  };

  const handleCreateNewDocument = () => {
    setName("Untitled document");
    setText("");
    setModal("document");
  };

  const handleSaveDocumentModal = () => {
    if (!text.trim()) {
      setError("Please enter or paste agreement text.");
      return;
    }
    const saved = saveDocument(name, text);
    if (saved) {
      setModal("");
    }
  };

  const handleDeleteTrigger = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = storedDocs.find((d) => d.id === id);
    if (!target) return;
    setDeleteTarget(target);
    setModal("delete_confirm");
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteDocument(deleteTarget.id);
    setDeleteTarget(null);
    setModal("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > LEGALENS_CONFIG.DOCUMENTS.MAX_FILE_SIZE_BYTES) {
      setError("Please choose a text file under 150 KB, or paste an excerpt.");
      return;
    }
    if (!/\.(txt|md)$/i.test(f.name)) {
      setError("Please select a .txt or .md file. For a PDF or Word document, copy and paste its text.");
      return;
    }

    try {
      const content = await f.text();
      setName(f.name);
      setText(content);
      setError("");
      saveDocument(f.name, content);
      setModal("");
    } catch {
      setError("Failed to read file.");
    }
  };

  return (
    <SidebarProvider>
      {/* Skip to Content for Keyboard Accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-3 focus:bg-slate-900 focus:text-white focus:rounded-md">
        Skip to main content
      </a>

      <Sidebar className="side">
        <SidebarHeader>
          <a href="/" className="brand">
            <span className="brand-icon" aria-hidden="true"><Scale size={23} /></span>
            legalens<span className="brand-dot">.</span>
          </a>
          <div className="workspace-label">YOUR LEGAL WORKSPACE</div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {nav.map((n) => (
              <SidebarMenuItem key={n.label}>
                <SidebarMenuButton
                  className="nav-button"
                  isActive={view === n.label}
                  onClick={() => navigate(n.label)}
                >
                  <n.icon aria-hidden="true" />
                  <span>{n.label}</span>
                  {n.label === "Workspace" && <span className="nav-pill">HOME</span>}
                  {n.badge && <span className="nav-count">{n.badge}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>

          <div className="sidebar-note">
            <div className="note-mark" aria-hidden="true"><BookOpen size={21} /></div>
            <h3>A little clarity goes a long way.</h3>
            <p>Understand the fine print before your next big step.</p>
            <button onClick={() => setModal("about")} type="button">
              How Legalens helps <ArrowUpRight size={15} aria-hidden="true" />
            </button>
          </div>
        </SidebarContent>

        <SidebarFooter>
          <button className="side-link" onClick={() => setModal("settings")} type="button">
            <Settings2 size={18} aria-hidden="true" /> AI Settings
          </button>
          <button className="side-link" onClick={() => setModal("about")} type="button">
            <CircleHelp size={18} aria-hidden="true" /> Help &amp; legal boundaries
          </button>

          {/* Profile & Activities Section */}
          <div
            className="profile profile-clickable"
            role="button"
            tabIndex={0}
            onClick={() => setModal("profile")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setModal("profile");
              }
            }}
            title="Open profile and activity log"
            aria-label="Workspace profile and activities"
          >
            <span className="profile-avatar">Y</span>
            <div className="profile-info">
              <div className="profile-title">
                Your workspace
                <span className="status-dot online" aria-hidden="true" />
              </div>
              <small>Activities &amp; Database</small>
            </div>
            <Activity size={16} className="profile-action-icon" aria-hidden="true" />
          </div>
        </SidebarFooter>
      </Sidebar>

      <main className="main" id="main-content">
        <header className="topbar">
          <div className="crumb">
            <SidebarTrigger />
            <span>Workspace</span>
            <ChevronRight size={14} aria-hidden="true" />
            <strong>{view === "Workspace" ? "Overview" : view}</strong>
          </div>
          <div className="topbar-actions">
            <button
              className="profile-quick-btn"
              onClick={() => setModal("profile")}
              type="button"
              aria-label="Open activities modal"
            >
              <Activity size={15} aria-hidden="true" />
              <span>Activities</span>
            </button>
            <button
              className="connection"
              onClick={() => setModal("settings")}
              type="button"
              aria-label="Configure Gemini connection"
            >
              <Sparkles size={15} className="text-emerald-600" aria-hidden="true" />
              <span className="font-medium text-slate-800">Gemini 3.5 Flash Lite · Active</span>
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="page">
          <header className="page-heading">
            <div>
              <div className="eyebrow">LESS LEGAL JARGON. MORE CONFIDENCE.</div>
              <h1>
                {view === "Workspace"
                  ? "Make sense of the fine print."
                  : view === "My document"
                  ? "Your document database."
                  : view === "Compare documents"
                  ? "See what changed."
                  : "Prepare before you sign."}
              </h1>
              <p>
                {view === "Workspace"
                  ? "Plain-language summaries, key clauses, and discussion questions grounded strictly in your agreement."
                  : view === "My document"
                  ? "Access and manage all previous agreements, reviews, and text saved in your private local database."
                  : view === "Compare documents"
                  ? "Side-by-side comparison of original and revised contract drafts to identify altered terms and added liabilities."
                  : "Turn your document review into a clear, practical negotiation plan."}
              </p>
            </div>
            <div className="heading-actions">
              <Button onClick={handleCreateNewDocument}>
                <Plus size={16} aria-hidden="true" /> New document
              </Button>
            </div>
          </header>

          {/* Error Banner */}
          {error && (
            <div className="error-banner p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between" role="alert">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError("")}
                className="text-red-500 hover:text-red-800 text-xs font-semibold underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* VIEW: Workspace (Review & Q&A) */}
          {view === "Workspace" && (
            <div className="space-y-6">
              {!result && !text ? (
                <div className="panel empty-workspace-panel text-center py-16">
                  <Scale size={42} className="text-slate-400 mx-auto mb-3" aria-hidden="true" />
                  <h3 className="text-xl font-bold text-slate-800">Welcome to Legalens</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
                    Add a contract, lease, freelance agreement, or terms of service to extract key clauses, plain-English summaries, and discussion points.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={handleCreateNewDocument}>
                      <Plus size={16} aria-hidden="true" /> Add Document
                    </Button>
                    <Button variant="outline" onClick={restoreSample}>
                      <Sparkles size={16} aria-hidden="true" /> Load Illustrative Sample
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <AnalysisWorkspace
                    result={result}
                    busy={busy}
                    onAskQuestion={(q) => runAnalysis("question", q)}
                    answer={answer}
                    isSample={isSample}
                    onTranslate={translateContent}
                  />

                  {activeDocument && (
                    <DocumentViewer
                      document={activeDocument}
                      busy={busy}
                      isWorkspaceView={true}
                      onEdit={() => setModal("document")}
                      onDelete={(id) => handleDeleteTrigger(id)}
                      onAnalyze={() => runAnalysis("analyze")}
                      onTranslate={translateContent}
                    />
                  )}
                </>
              )}
            </div>
          )}

          {/* VIEW: My document (Database & Viewer) */}
          {view === "My document" && (
            <div className="space-y-6">
              <DocumentDatabase
                documents={storedDocs}
                activeDocId={activeDocId}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSelectDoc={selectDocument}
                onAddDoc={handleCreateNewDocument}
                onDeleteDoc={(id, e) => handleDeleteTrigger(id, e)}
                onRestoreSample={restoreSample}
              />

              {activeDocument && (
                <DocumentViewer
                  document={activeDocument}
                  busy={busy}
                  onEdit={() => setModal("document")}
                  onDelete={(id) => handleDeleteTrigger(id)}
                  onAnalyze={() => {
                    if (activeDocument) selectDocument(activeDocument);
                    setView("Workspace");
                    runAnalysis("analyze", undefined, activeDocument.text);
                  }}
                  onViewReview={() => {
                    if (activeDocument) selectDocument(activeDocument);
                    setView("Workspace");
                  }}
                  onTranslate={translateContent}
                />
              )}
            </div>
          )}

          {/* VIEW: Compare documents */}
          {view === "Compare documents" && (
            <DocumentCompare
              originalText={text}
              originalName={name}
              secondText={secondText}
              onSecondTextChange={setSecondText}
              onCompare={() => runAnalysis("compare")}
              busy={busy}
              result={result}
              onTranslate={translateContent}
            />
          )}

          {/* VIEW: Action checklist */}
          {view === "Action checklist" && (
            <ActionChecklist
              checklist={result?.checklist || []}
              questions={result?.questions || []}
              checkedItems={checkedItems}
              onToggleCheck={toggleChecklistItem}
              onRunAnalysis={() => runAnalysis("analyze")}
              hasResult={!!result}
            />
          )}

          {/* Footer Disclaimer */}
          <footer className="footer-note" role="contentinfo">
            <ShieldCheck size={18} className="text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              <strong>A little guidance, with clear boundaries.</strong> Legalens provides legal information, not formal legal advice. Verify AI outputs and consult a qualified lawyer for decisions about your situation.
            </p>
          </footer>
        </div>
      </main>

      {/* MODAL: Add or Edit Document */}
      <Dialog open={modal === "document"} onOpenChange={(open) => !open && setModal("")}>
        <DialogContent className="app-dialog" aria-describedby="doc-modal-desc">
          <DialogHeader>
            <DialogTitle>{activeDocId ? "Edit document" : "Add new document"}</DialogTitle>
            <DialogDescription id="doc-modal-desc">
              Save your agreement text. It will be stored securely in your private browser database.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label htmlFor="modal-doc-name" className="block text-xs font-semibold text-slate-700 mb-1">
                Document title
              </label>
              <Input
                id="modal-doc-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Master Services Agreement, Lease, NDA"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="modal-doc-text" className="block text-xs font-semibold text-slate-700">
                  Document text
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Upload size={12} /> Upload .txt or .md
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md"
                  className="hidden"
                  onChange={handleFileUpload}
                  aria-label="Upload document file"
                />
              </div>
              <Textarea
                id="modal-doc-text"
                className="document-input min-h-[220px] font-mono text-xs"
                maxLength={LEGALENS_CONFIG.DOCUMENTS.MAX_LENGTH}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the contract text or terms here…"
              />
              <div className="text-right text-[11px] text-slate-400 mt-1">
                {text.length.toLocaleString()} / {LEGALENS_CONFIG.DOCUMENTS.MAX_LENGTH.toLocaleString()} chars
              </div>
            </div>

            <div className="modal-button-row flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModal("")} type="button">
                Cancel
              </Button>
              <Button onClick={handleSaveDocumentModal} type="button">
                Save to Database
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: Gemini Connection Settings */}
      <SettingsDialog
        open={modal === "settings"}
        apiKey={key}
        model={model}
        onSaveKey={setKey}
        onSaveModel={setModel}
        onClose={() => setModal("")}
      />

      {/* MODAL: Profile & Activities */}
      <ProfileModal
        open={modal === "profile"}
        documents={storedDocs}
        activities={activities}
        onClose={() => setModal("")}
        onClearActivities={clearActivities}
        onSelectDoc={(d) => {
          selectDocument(d);
          setView("My document");
        }}
        onDeleteDoc={(id) => handleDeleteTrigger(id)}
        onExportBackup={exportBackup}
      />

      {/* MODAL: Permanent Delete Confirmation */}
      <DeleteConfirmDialog
        open={modal === "delete_confirm"}
        doc={deleteTarget}
        onCancel={() => {
          setModal("");
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />

      {/* MODAL: About & Educational Legal Boundaries */}
      <Dialog open={modal === "about"} onOpenChange={(open) => !open && setModal("")}>
        <DialogContent className="app-dialog" aria-describedby="about-desc">
          <DialogHeader>
            <DialogTitle>Legal clarity, with clear boundaries</DialogTitle>
            <DialogDescription id="about-desc">
              Legalens helps you understand the agreement in front of you and prepare for a meaningful discussion with a professional.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="help-item p-3 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Grounded in your document</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gemini extracts explanations, source excerpts, comparisons, and action checklists solely from the text you provide. Verbatim quotes verify each claim.
              </p>
            </div>
            <div className="help-item p-3 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Information, not a legal opinion</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Legalens does not determine whether a clause is enforceable in your jurisdiction, recommend signing, or replace advice from a licensed attorney.
              </p>
            </div>
            <div className="help-item p-3 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">100% Client-Side Local Database</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your agreements and activity history are stored in your browser&apos;s local storage. Documents you delete are permanently erased.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={() => setModal("")} size="sm">
                Understood
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
