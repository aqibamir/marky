import Link from "next/link";
import { Button } from "@/components/ui/button";

// What a view shows when there's nothing to show: what's going on, why,
// and the one action that fixes it.
export function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center rounded-2xl border-[1.5px] border-dashed border-input px-4 py-10">
      <p className="text-[17px] font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground max-w-sm">{body}</p>
      {actionHref && actionLabel && (
        <Button asChild size="sm" className="mt-3">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
