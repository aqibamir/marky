"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

  return (
    <div className="flex flex-wrap gap-3 mt-6">
      {streak > 0 && (
        <div className="rounded-full bg-secondary px-4 py-2 text-sm">
          🔥 {streak} day streak
        </div>
      )}
      {dueCount > 0 && (
        <Link
          href="/practice?mode=due"
          className="rounded-full bg-primary text-primary-foreground glow-primary px-4 py-2 text-sm font-medium"
        >
          {dueCount} due for review →
        </Link>
      )}
    </div>
  );
}
