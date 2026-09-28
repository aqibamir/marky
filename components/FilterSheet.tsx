"use client";

import { useEffect } from "react";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

// The pill above a list that summarises the active filters and opens the
// filter sheet. Shared by Practice and the Cheat sheet.
export function FilterSummaryButton({
  summary,
  activeCount,
  onClick,
  className = "",
}: {
  summary: string;
  activeCount?: number;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2 h-10 px-3 rounded-full border border-input bg-card text-left text-[13px] font-semibold hover:bg-secondary transition-colors ${className}`}
    >
      <MixerHorizontalIcon className="h-4 w-4 shrink-0" />
      <span className="truncate flex-1">{summary}</span>
      <span className="text-muted-foreground font-medium shrink-0">
        Filters{activeCount ? ` · ${activeCount}` : ""}
      </span>
    </button>
  );
}

// Full-screen sheet on phones, a centred panel on desktop. The footer
// button shows how many results the current filters leave.
export function FilterSheet({
  open,
  onClose,
  onReset,
  resultLabel,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onReset?: () => void;
  resultLabel: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-40 bg-black/30 md:flex md:items-center md:justify-center md:p-6 print:hidden"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        onClick={(e) => e.stopPropagation()}
        className="absolute inset-0 md:static md:w-full md:max-w-lg md:max-h-[85vh] md:rounded-2xl md:border md:border-border md:shadow-xl bg-background flex flex-col overflow-hidden"
      >
        <div className="safe-top flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
          <h2 className="font-semibold text-[17px]">Filters</h2>
          <div className="flex gap-1">
            {onReset && (
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onReset}>
                Reset
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">{children}</div>

        <div className="safe-bottom border-t border-border p-4 shrink-0">
          <Button className="w-full" onClick={onClose}>
            {resultLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function FilterGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{label}</div>
      {children}
      {hint && <p className="text-[13px] text-muted-foreground mt-1.5">{hint}</p>}
    </div>
  );
}
