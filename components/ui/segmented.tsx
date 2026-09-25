import { cn } from "@/lib/utils";

interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
  title?: string;
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  size?: "sm" | "default";
  className?: string;
}

// Two to four mutually exclusive views or modes. The active segment is a
// raised pill in a sunken well - the one pattern for every tab/mode
// switch in the app (page tabs, practice mode, the header's DE/EN, etc).
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "default",
  className,
}: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("grid grid-flow-col auto-cols-fr gap-0.5 rounded-full bg-secondary p-[3px]", className)}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            title={o.title}
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-full font-semibold whitespace-nowrap transition-colors",
              size === "sm" ? "h-[26px] px-2.5 text-xs" : "h-8 px-3 text-[13px]",
              active
                ? "bg-raised text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
