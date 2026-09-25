import * as React from "react";
import { cn } from "@/lib/utils";

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  count?: number;
}

// A toggle filter people flip often (category, topic, points). Pressed =
// ink fill; an optional count trails the label.
export function Chip({ active = false, count, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 h-[34px] px-3 rounded-full border text-[13px] font-semibold whitespace-nowrap transition-colors",
        active
          ? "bg-primary border-primary text-primary-foreground"
          : "bg-card border-input text-foreground hover:bg-secondary",
        className
      )}
      {...props}
    >
      {children}
      {count !== undefined && <span className="font-medium opacity-65 tabular">{count}</span>}
    </button>
  );
}
