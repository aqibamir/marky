"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  Cross2Icon,
  MagnifyingGlassIcon,
  ReloadIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Segmented } from "@/components/ui/segmented";
import {
  chapterLabel,
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
import {
  accuracyTrend,
  completedRuns,
  loadRuns,
  runScore,
  runWrongIds,
  type PracticeRun,
} from "@/lib/practiceRuns";
import { APP_SETTINGS_EVENT, loadAppSettings } from "@/lib/appSettings";

type StatusFilter = "all" | "correct" | "wrong";
type SortBy = "recent" | "chapter" | "points";
type Tab = "questions" | "runs";

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

// Ink normally; only a poor run is called out, and the number is always
// shown, so colour never carries the meaning on its own.
function accuracyColor(pct: number): string {
  return pct < 50 ? "text-destructive" : "text-foreground";
}

function HistoryInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<Language>("de");
  const [questions, setQuestions] = useState<DrivingQuestion[] | null>(null);
  const [stats, setStats] = useState<StatsMap>({});
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [tab, setTab] = useState<Tab>("questions");
  const [runs, setRuns] = useState<PracticeRun[]>([]);
  const [openRunId, setOpenRunId] = useState<string | null>(null);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "runs") setTab("runs");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    setRuns(loadRuns(lang));
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

  const runsList = useMemo(
    () => completedRuns(runs).sort((a, b) => b.startedAt - a.startedAt),
    [runs]
  );
  const trend = useMemo(() => accuracyTrend(runs), [runs]);
  const trendMessage = useMemo(() => {
    if (trend.length < 2) return null;
    const half = Math.max(1, Math.floor(trend.length / 2));
    const earlier = trend.slice(0, half);
    const recent = trend.slice(-half);
    const avg = (xs: typeof trend) => xs.reduce((s, x) => s + x.accuracy, 0) / xs.length;
    const earlierAvg = avg(earlier);
    const recentAvg = avg(recent);
    const diff = Math.round((recentAvg - earlierAvg) * 100);
    if (Math.abs(diff) < 3) return "Your accuracy has stayed about the same across your recent runs.";
    return diff > 0
      ? `You're improving — accuracy is up ${diff} points on your earlier runs.`
      : `Accuracy is down ${Math.abs(diff)} points on your earlier runs — worth revisiting your weak topics.`;
  }, [trend]);

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

  function practiceRunWrong(run: PracticeRun) {
    const ids = runWrongIds(run);
    if (ids.length === 0) return;
    saveSelectedSessionIds(ids);
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
        <div className="h-8 w-40 rounded-[10px] bg-secondary animate-pulse" />
        <div className="h-24 rounded-2xl bg-secondary animate-pulse" />
        <div className="h-64 rounded-2xl bg-secondary animate-pulse" />
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto w-full px-4 pt-4 pb-28 flex-1">
      <div className="flex items-end justify-between gap-3 mb-4">
        <div>
          <h1 className="font-display font-bold text-[28px] leading-8">History</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            <span className="tabular">{totalAnswered}</span> answered ·{" "}
            <span className="tabular">{totalCorrect}</span> correct
          </p>
        </div>
        <Link href="/insights" className="text-sm font-semibold underline underline-offset-2">
          See patterns
        </Link>
      </div>

      <Segmented
        label="History view"
        className="mb-4"
        options={[
          { value: "questions" as const, label: "Questions" },
          { value: "runs" as const, label: `Runs${runsList.length > 0 ? ` · ${runsList.length}` : ""}` },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "questions" ? (
        totalAnswered === 0 ? (
          <EmptyState
            title="Nothing here yet"
            body="Answer some questions in Practice and they'll show up here."
            actionHref="/practice"
            actionLabel="Start practising"
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <SelectBox label="Result" value={statusFilter} onChange={(v) => setStatusFilter(v as StatusFilter)}>
                <option value="all">All results</option>
                <option value="correct">Correct only</option>
                <option value="wrong">Wrong only</option>
              </SelectBox>
              <SelectBox label="Sort" value={sortBy} onChange={(v) => setSortBy(v as SortBy)}>
                <option value="recent">Most recent</option>
                <option value="chapter">By chapter</option>
                <option value="points">By points</option>
              </SelectBox>
            </div>
            <div className="relative mb-3">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search your answered questions"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full h-11 rounded-[10px] border border-input bg-card pl-9 pr-3 text-base placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex items-center justify-between mb-2 text-sm">
              <div className="flex gap-4">
                <button onClick={selectAllVisible} className="font-semibold underline underline-offset-2">
                  Select all
                </button>
                {selected.size > 0 && (
                  <button onClick={clearSelection} className="text-muted-foreground underline underline-offset-2">
                    Clear
                  </button>
                )}
              </div>
              <span className="text-muted-foreground tabular">{rows.length} shown</span>
            </div>

            <ul className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
              {rows.map(({ q, stat, id }) => {
                const last = lastAttempt(stat);
                const correct = last?.correct;
                const isSelected = selected.has(id);
                return (
                  <li key={id}>
                    <label
                      className={`flex gap-3 items-start px-4 py-3 cursor-pointer transition-colors ${
                        isSelected ? "bg-secondary" : "hover:bg-secondary/60"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggle(id)}
                        className="mt-1 h-4 w-4 shrink-0 accent-foreground"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] leading-[22px] line-clamp-2">{q.question_text}</p>
                        <p className="mt-1 flex items-center gap-1.5 flex-wrap text-[13px] text-muted-foreground">
                          {correct ? (
                            <span className="inline-flex items-center gap-0.5 font-semibold text-success">
                              <CheckIcon /> Correct
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 font-semibold text-destructive">
                              <Cross2Icon /> Wrong
                            </span>
                          )}
                          <span>·</span>
                          <span>{q.points}</span>
                          <span>·</span>
                          <span>{chapterLabel(q.chapter_name)}</span>
                          <span>·</span>
                          <span>{last && timeAgo(last.at)}</span>
                          {stat.wrongCount > 1 && (
                            <span className="font-semibold text-destructive">· missed {stat.wrongCount} times</span>
                          )}
                        </p>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          </>
        )
      ) : runsList.length === 0 ? (
        <EmptyState
          title="No runs yet"
          body="Every practice session is saved here as its own run, so you can see what you got wrong and drill just those."
          actionHref="/practice"
          actionLabel="Start a run"
        />
      ) : (
        <>
          {trendMessage && (
            <div className="rounded-2xl border border-border bg-card shadow-sm px-4 py-3 mb-3">
              <p className="text-sm">{trendMessage}</p>
              <div className="flex items-end gap-1 mt-2 h-10" aria-hidden="true">
                {trend.slice(-20).map(({ run, accuracy }) => (
                  <div
                    key={run.id}
                    title={`${Math.round(accuracy * 100)}% on ${new Date(run.startedAt).toLocaleDateString()}`}
                    className={`flex-1 rounded-t-[3px] ${accuracy >= 0.5 ? "bg-signal" : "bg-destructive"}`}
                    style={{ height: `${Math.max(8, accuracy * 100)}%` }}
                  />
                ))}
              </div>
            </div>
          )}

          <ul className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
            {runsList.map((run) => {
              const { answered, correct, accuracy } = runScore(run);
              const wrongIds = runWrongIds(run);
              const pct = Math.round(accuracy * 100);
              const isOpen = openRunId === run.id;
              return (
                <li key={run.id}>
                  <button
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-secondary/60 transition-colors"
                    aria-expanded={isOpen}
                    onClick={() => setOpenRunId(isOpen ? null : run.id)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-medium truncate">{run.filterSummary || "Practice run"}</p>
                      <p className="text-[13px] text-muted-foreground">
                        {timeAgo(run.startedAt)} · {answered} answered
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-display font-semibold text-xl leading-6 tabular ${accuracyColor(pct)}`}>
                        {pct}%
                      </p>
                      <p className="text-[13px] text-muted-foreground tabular">
                        {correct}/{answered}
                      </p>
                    </div>
                    <ChevronDownIcon
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-border bg-background px-4 py-3 space-y-3">
                      {wrongIds.length === 0 ? (
                        <p className="text-sm font-medium">Perfect run — nothing to review.</p>
                      ) : (
                        <>
                          <Button size="sm" className="w-full" onClick={() => practiceRunWrong(run)}>
                            <ReloadIcon /> Practise these {wrongIds.length} again
                          </Button>
                          <ul className="space-y-2">
                            {run.answers
                              .filter((a) => !a.correct)
                              .map((a) => {
                                const q = byId.get(a.questionId);
                                if (!q) return null;
                                const selectedText = a.selected
                                  .map(
                                    (l) => q.options.find((o) => o.letter === l)?.text ?? l
                                  )
                                  .join(", ");
                                const correctText = q.correct_answers
                                  .map((c) => c.text || c.letter)
                                  .join(", ");
                                return (
                                  <li
                                    key={a.questionId}
                                    className="rounded-[10px] border border-border bg-card px-3 py-2.5 text-sm"
                                  >
                                    <p className="font-medium mb-1.5">{q.question_text}</p>
                                    <p className="flex gap-1 text-[13px] mb-0.5">
                                      <Cross2Icon className="mt-0.5 shrink-0 text-destructive" />
                                      <span>
                                        <span className="font-semibold text-destructive">You answered:</span>{" "}
                                        {selectedText || "—"}
                                      </span>
                                    </p>
                                    <p className="flex gap-1 text-[13px] mb-1">
                                      <CheckIcon className="mt-0.5 shrink-0 text-success" />
                                      <span>
                                        <span className="font-semibold text-success">Correct:</span> {correctText}
                                      </span>
                                    </p>
                                    {q.comment && (
                                      <p className="text-[13px] text-muted-foreground whitespace-pre-wrap">
                                        {q.comment}
                                      </p>
                                    )}
                                  </li>
                                );
                              })}
                          </ul>
                        </>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}

      {tab === "questions" && selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-tabbar z-10 bg-background shadow-bar">
          <div className="max-w-2xl mx-auto flex items-center gap-2 px-4 py-3">
            <Button variant="outline" onClick={forgetSelected}>
              <TrashIcon /> Forget {selected.size}
            </Button>
            <Button className="flex-1" onClick={practiceSelected}>
              Practise {selected.size} selected <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}

function SelectBox({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        className="h-11 w-full appearance-none rounded-[10px] border border-input bg-card pl-3 pr-9 text-base"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<main className="max-w-2xl mx-auto p-4 text-muted-foreground">Loading…</main>}>
      <HistoryInner />
    </Suspense>
  );
}
