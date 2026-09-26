"use client";

import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { StoredDocument } from "@/lib/storage";

interface DeleteConfirmDialogProps {
  open: boolean;
  doc: StoredDocument | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({
  open,
  doc,
  onCancel,
  onConfirm,
}: DeleteConfirmDialogProps) {
  if (!doc) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="app-dialog delete-dialog" aria-describedby="delete-dialog-desc">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 size={20} aria-hidden="true" />
            Permanently delete document
          </DialogTitle>
          <DialogDescription id="delete-dialog-desc">
            This action cannot be reversed. This document and its analysis will be permanently erased from your browser database.
          </DialogDescription>
        </DialogHeader>

        <div className="delete-confirm-box">
          <div className="delete-warning-banner" role="alert">
            <AlertTriangle className="delete-warn-icon" size={24} aria-hidden="true" />
            <div>
              <h4 className="font-semibold text-red-900">Are you sure?</h4>
              <p className="text-sm text-red-800">
                <strong>&ldquo;{doc.name}&rdquo;</strong> ({doc.wordCount.toLocaleString()} words) will be completely removed from your local database.
              </p>
            </div>
          </div>

          <div className="modal-button-row">
            <Button variant="outline" onClick={onCancel} type="button">
              Cancel
            </Button>
            <Button
              className="delete-confirm-action-btn"
              onClick={onConfirm}
              type="button"
              autoFocus
            >
              <Trash2 size={15} aria-hidden="true" /> Yes, delete permanently
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
