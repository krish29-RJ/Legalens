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
          <DialogTitle>Connect Google Gemini</DialogTitle>
          <DialogDescription id="settings-desc">
            Connect your Gemini API key for live clause extraction, plain-English summaries, contract comparison, and question answering.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <label htmlFor="gemini-api-key-input" className="block text-xs font-semibold text-slate-700 mb-1">
              Google Gemini API Key
            </label>
            <div className="relative">
              <Input
                id="gemini-api-key-input"
                type={showKey ? "text" : "password"}
                autoComplete="off"
                value={apiKey}
                onChange={(e) => onSaveKey(e.target.value)}
                placeholder="AIzaSy..."
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
              <span>Your key is kept only in browser memory and transmitted directly to Google.</span>
            </div>
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

          <div className="pt-2 flex items-center justify-between">
            <a
              className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noreferrer"
            >
              Get a free API key from Google AI Studio <ArrowUpRight size={13} />
            </a>
            <Button onClick={onClose} size="sm">
              <Check size={14} className="mr-1" /> Use connection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
