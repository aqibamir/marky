"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  chapterEmoji,
  chapterLabel,
  themeEmoji,
  themeLabel,
  type DrivingQuestion,
  type Language,
} from "@/lib/drivingQuestions";
import {
  forgetQuestions,
  lastAttempt,
  loadStats,
  saveSelectedSessionIds,
  saveStats,
  type StatsMap,
} from "@/lib/practiceStats";
import { APP_SETTINGS_EVENT, loadAppSettings } from "@/lib/appSettings";

type StatusFilter = "all" | "correct" | "wrong";
type SortBy = "recent" | "chapter" | "points";

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(ms).toLocaleDateString();
}

export default function HistoryPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>("de");
  const [questions, setQuestions] = useState<DrivingQuestion[] | null>(null);
  const [stats, setStats] = useState<StatsMap>({});
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLang(loadAppSettings().lang);
    function onChange(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.lang) setLang(detail.lang);
    }
    window.addEventListener(APP_SETTINGS_EVENT, onChange);
    return () => window.removeEventListener(APP_SETTINGS_EVENT, onChange);
  }, []);

  useEffect(() => {
    fetch(`/api/driving-questions?lang=${lang}`)
      .then((r) => r.json())
      .then((d) => setQuestions(d.questions));
    setStats(loadStats(lang));
    setSelected(new Set());
  }, [lang]);

  const byId = useMemo(() => {
    const m = new Map<string, DrivingQuestion>();
    for (const q of questions ?? []) m.set(q.question_id, q);
    return m;
  }, [questions]);

  const rows = useMemo(() => {
    let list = Object.entries(stats)
      .map(([id, stat]) => ({ q: byId.get(id), stat, id }))
      .filter((r): r is { q: DrivingQuestion; stat: StatsMap[string]; id: string } =>
        Boolean(r.q)
      );

    if (statusFilter !== "all") {
      list = list.filter((r) => {
        const correct = lastAttempt(r.stat)?.correct;
        return statusFilter === "correct" ? correct : correct === false;
      });
    }
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      list = list.filter((r) => r.q.question_text.toLowerCase().includes(kw));
    }

    switch (sortBy) {
      case "recent":
        list.sort(
          (a, b) => (lastAttempt(b.stat)?.at ?? 0) - (lastAttempt(a.stat)?.at ?? 0)
        );
        break;
      case "chapter":
        list.sort((a, b) => a.q.chapter_number.localeCompare(b.q.chapter_number));
        break;
      case "points":
        list.sort((a, b) => b.q.pointsValue - a.q.pointsValue);
        break;
    }
    return list;
  }, [stats, byId, statusFilter, keyword, sortBy]);

  const totalAnswered = Object.keys(stats).length;
  const totalCorrect = Object.values(stats).filter((s) => lastAttempt(s)?.correct).length;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllVisible() {
    setSelected(new Set(rows.map((r) => r.id)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function practiceSelected() {
    if (selected.size === 0) return;
    saveSelectedSessionIds(Array.from(selected));
    router.push("/practice?mode=selected");
  }

  function forgetSelected() {
    if (selected.size === 0) return;
    if (
      !confirm(
        `Remove ${selected.size} question${
          selected.size === 1 ? "" : "s"
        } from your history? They'll show up as new again.`
      )
    )
      return;
    const next = forgetQuestions(stats, Array.from(selected));
    setStats(next);
    saveStats(lang, next);
    setSelected(new Set());
  }

  if (!questions) {
    return (
      <main className="max-w-2xl mx-auto p-4 space-y-3 w-full">
        <div className="h-24 rounded-2xl bg-secondary animate-pulse" />
        <div className="h-64 rounded-2xl bg-secondary animate-pulse" />
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto w-full px-4 pt-4 pb-28 flex-1">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold glow-text">History</h1>
        <Link href="/insights" className="text-xs underline text-muted-foreground">
          See patterns →
        </Link>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        {totalAnswered} answered · {totalCorrect} correct
      </p>

      {totalAnswered === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg font-medium mb-1">Nothing here yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Answer some questions in Practice and they&rsquo;ll show up here.
          </p>
          <Link href="/practice" className="text-primary underline text-sm">
            Start practicing →
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
            <select
              className="border border-border rounded-lg p-2 bg-background"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="all">All results</option>
              <option value="correct">✓ Correct only</option>
              <option value="wrong">✕ Wrong only</option>
            </select>
            <select
              className="border border-border rounded-lg p-2 bg-background"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
            >
              <option value="recent">Most recent</option>
              <option value="chapter">By chapter</option>
              <option value="points">By points</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Search your answered questions..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full border border-border rounded-lg p-2 bg-background text-sm mb-3"
          />

          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex gap-3">
              <button onClick={selectAllVisible} className="underline text-primary">
                Select all ({rows.length})
              </button>
              {selected.size > 0 && (
                <button onClick={clearSelection} className="underline text-muted-foreground">
                  Clear selection
                </button>
              )}
            </div>
            <span className="text-muted-foreground">{rows.length} shown</span>
          </div>

          <ul className="space-y-2">
            {rows.map(({ q, stat, id }) => {
              const last = lastAttempt(stat);
              const correct = last?.correct;
              return (
                <li
                  key={id}
                  className={`rounded-xl border p-3 flex gap-3 items-start cursor-pointer transition-colors ${
                    selected.has(id)
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card"
                  }`}
                  onClick={() => toggle(id)}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(id)}
                    onChange={() => toggle(id)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 flex-wrap">
                      <span className={correct ? "text-success" : "text-destructive"}>
                        {correct ? "✓" : "✕"}
                      </span>
                      <span>{q.points}</span>
                      <span>·</span>
                      <span>
                        {themeEmoji(q.theme_name)} {themeLabel(q.theme_name)}
                      </span>
                      <span>·</span>
                      <span>{last && timeAgo(last.at)}</span>
                      {stat.wrongCount > 1 && (
                        <span className="text-destructive">· missed {stat.wrongCount}×</span>
                      )}
                    </div>
                    <p className="text-sm truncate">{q.question_text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {chapterEmoji(q.chapter_name)} {chapterLabel(q.chapter_name)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {selected.size > 0 && (
        <div className="safe-bottom fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-2 px-4 py-3">
            <Button variant="outline" onClick={forgetSelected}>
              🗑 Forget ({selected.size})
            </Button>
            <Button onClick={practiceSelected} className="glow-primary">
              Practice selected ({selected.size}) →
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
