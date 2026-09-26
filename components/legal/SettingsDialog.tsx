"use client";

import React, { useState } from "react";
import { Check, ArrowUpRight, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LEGALENS_CONFIG } from "@/lib/config";

interface SettingsDialogProps {
  open: boolean;
  apiKey: string;
  model: string;
  onSaveKey: (key: string) => void;
  onSaveModel: (model: string) => void;
  onClose: () => void;
}

export function SettingsDialog({
  open,
  apiKey,
  model,
  onSaveKey,
  onSaveModel,
  onClose,
}: SettingsDialogProps) {
  const [showKey, setShowKey] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="app-dialog settings-dialog" aria-describedby="settings-desc">
        <DialogHeader>
          <DialogTitle>AI Engine &amp; Model Settings</DialogTitle>
          <DialogDescription id="settings-desc">
            Legalens is powered by Google Gemini 3.5 Flash Lite for real-time clause extraction, plain-English translation, and comparative review.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2.5 text-xs text-emerald-800">
            <Check size={16} className="text-emerald-600 shrink-0" />
            <span>
              <strong>Gemini AI Active:</strong> Pre-configured server API key is loaded and running with Gemini 3.5 Flash Lite.
            </span>
          </div>

          <div>
            <label htmlFor="gemini-model-select" className="block text-xs font-semibold text-slate-700 mb-1">
              AI Analysis Model
            </label>
            <select
              id="gemini-model-select"
              value={model}
              onChange={(e) => onSaveModel(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              {LEGALENS_CONFIG.MODELS.SUPPORTED.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="gemini-api-key-input" className="block text-xs font-semibold text-slate-700 mb-1">
              Custom Gemini API Key <span className="text-slate-400 font-normal">(Optional Override)</span>
            </label>
            <div className="relative">
              <Input
                id="gemini-api-key-input"
                type={showKey ? "text" : "password"}
                autoComplete="off"
                value={apiKey}
                onChange={(e) => onSaveKey(e.target.value)}
                placeholder="Leave blank to use pre-configured server key"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label={showKey ? "Hide API key" : "Show API key"}
              >
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
              <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
              <span>Custom keys are stored only in your browser memory for session isolation.</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end">
            <Button onClick={onClose} size="sm">
              <Check size={14} className="mr-1" /> Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
