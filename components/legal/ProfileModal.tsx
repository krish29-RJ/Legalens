"use client";

import React, { useState, useMemo } from "react";
import {
  History,
  Sparkles,
  GitCompareArrows,
  Send,
  Download,
  Trash2,
  FileText,
  Clock,
  Database,
  User,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { StoredDocument, UserActivity } from "@/lib/storage";

interface ProfileModalProps {
  open: boolean;
  documents: StoredDocument[];
  activities: UserActivity[];
  onClose: () => void;
  onClearActivities: () => void;
  onSelectDoc: (doc: StoredDocument) => void;
  onDeleteDoc: (id: string) => void;
  onExportBackup: () => void;
}

export function ProfileModal({
  open,
  documents,
  activities,
  onClose,
  onClearActivities,
  onSelectDoc,
  onDeleteDoc,
  onExportBackup,
}: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState("activities");
  const [activityFilter, setActivityFilter] = useState("all");

  const filteredActivities = useMemo(() => {
    if (activityFilter === "all") return activities;
    if (activityFilter === "docs") {
      return activities.filter((a) =>
        ["document_add", "document_edit", "document_delete"].includes(a.type)
      );
    }
    if (activityFilter === "ai") {
      return activities.filter((a) => ["analysis", "compare"].includes(a.type));
    }
    if (activityFilter === "qna") {
      return activities.filter((a) => a.type === "question");
    }
    return activities;
  }, [activities, activityFilter]);

  const analysisCount = useMemo(
    () => activities.filter((a) => a.type === "analysis" || a.type === "compare").length,
    [activities]
  );
  const questionCount = useMemo(
    () => activities.filter((a) => a.type === "question").length,
    [activities]
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="app-dialog profile-dialog-box" aria-describedby="profile-desc">
        <DialogHeader>
          <DialogTitle>Workspace Profile &amp; Activities</DialogTitle>
          <DialogDescription id="profile-desc">
            Review your document metrics, local database storage, and audit history.
          </DialogDescription>
        </DialogHeader>

        <div className="profile-section-content space-y-4">
          {/* User Workspace Profile Card */}
          <div className="profile-user-card p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
              <User size={22} />
            </div>
            <div className="profile-details flex-1">
              <h3 className="font-semibold text-slate-900 text-base">Your Legal Workspace</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                <span>Private Client Session · Fully Local Database</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-lg text-center">
              <span className="text-xl font-bold text-slate-900">{documents.length}</span>
              <p className="text-xs text-slate-500 mt-0.5">Saved Documents</p>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg text-center">
              <span className="text-xl font-bold text-slate-900">{analysisCount}</span>
              <p className="text-xs text-slate-500 mt-0.5">Analyses Run</p>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg text-center">
              <span className="text-xl font-bold text-slate-900">{questionCount}</span>
              <p className="text-xs text-slate-500 mt-0.5">Questions Asked</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-3">
              <TabsTrigger value="activities">Recent Activities</TabsTrigger>
              <TabsTrigger value="database">Database Manager</TabsTrigger>
            </TabsList>

            {/* Activities Tab */}
            <TabsContent value="activities" className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="filter-chips flex gap-1.5">
                  {(
                    [
                      { id: "all", label: "All" },
                      { id: "docs", label: "Documents" },
                      { id: "ai", label: "AI Analysis" },
                      { id: "qna", label: "Q&A" },
                    ] as const
                  ).map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => setActivityFilter(chip.id)}
                      className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                        activityFilter === chip.id
                          ? "bg-slate-900 text-white font-medium"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
                {activities.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearActivities}
                    className="text-xs text-slate-400 hover:text-red-600 transition-colors"
                  >
                    Clear history
                  </button>
                )}
              </div>

              <div className="activities-timeline max-h-64 overflow-y-auto space-y-2 pr-1">
                {filteredActivities.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm">
                    <History size={24} className="mx-auto mb-2 opacity-50" />
                    No activity recorded in this category.
                  </div>
                ) : (
                  filteredActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 bg-white border border-slate-200 rounded-lg flex items-start gap-3"
                    >
                      <div className="mt-0.5 shrink-0">
                        {act.type === "analysis" ? (
                          <Sparkles size={16} className="text-emerald-600" />
                        ) : act.type === "compare" ? (
                          <GitCompareArrows size={16} className="text-blue-600" />
                        ) : act.type === "question" ? (
                          <Send size={16} className="text-purple-600" />
                        ) : act.type === "document_delete" ? (
                          <Trash2 size={16} className="text-red-500" />
                        ) : (
                          <FileText size={16} className="text-slate-500" />
                        )}
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-900 font-semibold">{act.title}</strong>
                          <span className="text-slate-400 text-[11px]">
                            {new Date(act.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-0.5">{act.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Database Manager Tab */}
            <TabsContent value="database" className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {documents.length} documents stored in local browser database
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExportBackup}
                  disabled={documents.length === 0}
                  className="text-xs"
                >
                  <Download size={13} className="mr-1" /> Export Backup (JSON)
                </Button>
              </div>

              <div className="db-doc-list max-h-64 overflow-y-auto space-y-2 pr-1">
                {documents.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm">
                    <Database size={24} className="mx-auto mb-2 opacity-50" />
                    Database is empty.
                  </div>
                ) : (
                  documents.map((d) => (
                    <div
                      key={d.id}
                      className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-slate-900 truncate">{d.name}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {d.wordCount.toLocaleString()} words · {new Date(d.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 px-2"
                          onClick={() => {
                            onSelectDoc(d);
                            onClose();
                          }}
                        >
                          Open
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => onDeleteDoc(d.id)}
                          aria-label={`Delete ${d.name}`}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
