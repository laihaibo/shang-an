"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "确认",
  cancelLabel = "取消",
  danger = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-6"
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--foreground)_32%,transparent)]"
        onClick={onCancel}
        aria-hidden
      />
      <div className="glass-strong rise-in relative w-full max-w-[320px] rounded-[24px] p-5">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              danger
                ? "bg-[var(--danger-soft)]"
                : "bg-[var(--accent-soft)]"
            }`}
          >
            <AlertTriangle
              size={20}
              className={danger ? "text-[var(--danger)]" : "text-[var(--accent)]"}
            />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-[17px] font-semibold">{title}</h2>
            {description ? (
              <p className="mt-1 text-[14px] leading-relaxed text-[var(--ink-soft)]">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            size="sm"
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

