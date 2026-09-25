"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { isDue, loadStats } from "@/lib/practiceStats";

export default function DueReviewBanner() {
  const [dueCount, setDueCount] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const stats = loadStats("de");
    setDueCount(Object.values(stats).filter((s) => isDue(s)).length);
    import("@/lib/practiceStats").then(({ activityByDay, currentStreak }) => {
      setStreak(currentStreak(activityByDay(stats)));
    });
  }, []);

  if (dueCount === null || (dueCount === 0 && streak === 0)) return null;

  const streakText = streak > 0 ? `${streak}-day streak` : null;

  if (dueCount === 0) {
    return (
      <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium">
        <span className="h-2 w-2 rounded-full bg-signal" aria-hidden="true" />
        {streakText} · nothing due
      </p>
    );
  }

  return (
    <Link
      href="/practice?mode=due"
      className="mt-6 flex items-center justify-between gap-3 rounded-[10px] bg-signal-soft px-4 py-3 hover:bg-signal-soft/80 transition-colors"
    >
      <span>
        <span className="block font-semibold">{dueCount} due for review</span>
        <span className="block text-sm text-muted-foreground">
          {streakText ?? "Spaced repetition keeps them fresh"}
        </span>
      </span>
      <ChevronRightIcon className="h-5 w-5 shrink-0" />
    </Link>
  );
}
