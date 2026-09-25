"use client";

import Link from "next/link";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Segmented } from "@/components/ui/segmented";
import { useEffect, useMemo, useState } from "react";
import {
  themeLabel,
  type DrivingQuestion,
  type Language,
} from "@/lib/drivingQuestions";
import {
  activityByDay,
  currentStreak,
  lastAttempt,
  lastNDays,
  loadStats,
  type StatsMap,
} from "@/lib/practiceStats";
import { APP_SETTINGS_EVENT, loadAppSettings } from "@/lib/appSettings";

type Tab = "overview" | "weak";

function Ring({ pct, label, sub }: { pct: number; label: string; sub: string }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} stroke="hsl(var(--secondary))" strokeWidth="10" fill="none" />
        <circle
          cx="50"
          cy="50"
          r={r}
          stroke="hsl(var(--signal))"
          strokeWidth="10"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="-mt-16 font-display font-semibold text-2xl tabular">{label}</div>
      <div className="mt-16 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

export default function InsightsPage() {
  const [lang, setLang] = useState<Language>("de");
  const [questions, setQuestions] = useState<DrivingQuestion[] | null>(null);
  const [stats, setStats] = useState<StatsMap>({});
  const [tab, setTab] = useState<Tab>("overview");

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
  }, [lang]);

  const byId = useMemo(() => {
    const m = new Map<string, DrivingQuestion>();
    for (const q of questions ?? []) m.set(q.question_id, q);
    return m;
  }, [questions]);

  const attempted = Object.entries(stats);
  const totalCorrectNow = attempted.filter(([, s]) => lastAttempt(s)?.correct).length;
  const accuracy = attempted.length > 0 ? Math.round((totalCorrectNow / attempted.length) * 100) : 0;
  const points = attempted.reduce((sum, [id, s]) => {
    const q = byId.get(id);
    return sum + (q && lastAttempt(s)?.correct ? q.pointsValue : 0);
  }, 0);

  const days = useMemo(() => activityByDay(stats), [stats]);
  const streak = useMemo(() => currentStreak(days), [days]);
  const week = useMemo(() => lastNDays(days, 7), [days]);

  const { weakThemes, weakChapters, repeatOffenders } = useMemo(() => {
    const themeAgg = new Map<string, { wrong: number; total: number }>();
    const chapterAgg = new Map<string, { wrong: number; total: number }>();
    for (const [id, s] of attempted) {
      const q = byId.get(id);
      if (!q) continue;
      const wrong = lastAttempt(s)?.correct === false ? 1 : 0;
      const t = themeAgg.get(q.theme_name) ?? { wrong: 0, total: 0 };
      t.wrong += wrong;
      t.total += 1;
      themeAgg.set(q.theme_name, t);
      const c = chapterAgg.get(q.chapter_name) ?? { wrong: 0, total: 0 };
      c.wrong += wrong;
      c.total += 1;
      chapterAgg.set(q.chapter_name, c);
    }
    const weakThemes = Array.from(themeAgg.entries())
      .filter(([, v]) => v.total >= 2 && v.wrong > 0)
      .map(([theme, v]) => ({ theme, ...v, rate: v.wrong / v.total }))
      .sort((a, b) => b.rate - a.rate || b.wrong - a.wrong)
      .slice(0, 8);
    const weakChapters = Array.from(chapterAgg.entries())
      .filter(([, v]) => v.total >= 2 && v.wrong > 0)
      .map(([chapter, v]) => ({ chapter, ...v, rate: v.wrong / v.total }))
      .sort((a, b) => b.rate - a.rate || b.wrong - a.wrong)
      .slice(0, 8);
    const repeatOffenders = attempted
      .filter(([, s]) => s.wrongCount >= 2)
      .map(([id, s]) => ({ q: byId.get(id), wrongCount: s.wrongCount }))
      .filter((x): x is { q: DrivingQuestion; wrongCount: number } => Boolean(x.q))
      .sort((a, b) => b.wrongCount - a.wrongCount)
      .slice(0, 15);
    return { weakThemes, weakChapters, repeatOffenders };
  }, [attempted, byId]);

  if (!questions) {
    return (
      <main className="max-w-2xl mx-auto w-full p-4 space-y-3">
        <div className="h-8 w-40 rounded-[10px] bg-secondary animate-pulse" />
        <div className="h-24 rounded-2xl bg-secondary animate-pulse" />
        <div className="h-48 rounded-2xl bg-secondary animate-pulse" />
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto w-full px-4 py-4 flex-1">
      <h1 className="font-display font-bold text-[28px] leading-8 mb-4">Insights</h1>

      <Segmented
        label="Insights view"
        className="mb-6"
        options={[
          { value: "overview" as const, label: "Overview" },
          { value: "weak" as const, label: "Weak points" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {attempted.length === 0 ? (
        <EmptyState
          title="No practice history yet"
          body="Answer a few questions and your patterns will show up here."
          actionHref="/practice"
          actionLabel="Start practising"
        />
      ) : tab === "overview" ? (
        <div className="space-y-4">
          <dl className="grid grid-cols-3 gap-2">
            <StatTile value={streak} label="day streak" />
            <StatTile value={`${accuracy}%`} label="accuracy" />
            <StatTile value={points} label="points mastered" />
          </dl>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex items-center justify-around">
            <Ring pct={accuracy} label={`${accuracy}%`} sub="currently correct" />
            <dl className="text-center space-y-3">
              <div>
                <dd className="font-display font-semibold text-2xl tabular">{attempted.length}</dd>
                <dt className="text-[13px] text-muted-foreground">answered</dt>
              </div>
              <div>
                <dd className="font-display font-semibold text-2xl tabular">{totalCorrectNow}</dd>
                <dt className="text-[13px] text-muted-foreground">right on last try</dt>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Last 7 days
            </div>
            <div className="flex justify-between">
              {week.map((d) => {
                const date = new Date(d.key);
                const dayLetter = "SMTWTFS"[date.getUTCDay()];
                const active = d.count > 0;
                return (
                  <div key={d.key} className="flex flex-col items-center gap-1">
                    <div
                      title={`${d.count} answered`}
                      className={`h-9 w-9 rounded-full flex items-center justify-center text-[13px] font-semibold tabular ${
                        active ? "bg-signal text-signal-foreground" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {d.count > 0 ? d.count : ""}
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground">{dayLetter}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <section>
            <h2 className="font-semibold text-[17px] mb-2">Categories you struggle with</h2>
            {weakThemes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No repeated mistakes yet.</p>
            ) : (
              <ul className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
                {weakThemes.map((t) => (
                  <li key={t.theme}>
                    <Link
                      href={`/practice?theme=${encodeURIComponent(t.theme)}&mode=weak`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors"
                    >
                      <span className="flex-1 min-w-0">
                        <span className="block font-medium truncate">{themeLabel(t.theme)}</span>
                        <span className="block text-[13px] text-muted-foreground">
                          {t.wrong} of {t.total} wrong
                        </span>
                      </span>
                      <RateBadge rate={t.rate} />
                      <ChevronRightIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="font-semibold text-[17px] mb-2">Toughest chapters</h2>
            {weakChapters.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing stands out yet.</p>
            ) : (
              <ul className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
                {weakChapters.map((c) => (
                  <li key={c.chapter}>
                    <Link
                      href={`/practice?chapter=${encodeURIComponent(c.chapter)}&mode=weak`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors"
                    >
                      <span className="flex-1 min-w-0">
                        <span className="block font-medium truncate">{c.chapter}</span>
                        <span className="block text-[13px] text-muted-foreground">
                          {c.wrong} of {c.total} wrong
                        </span>
                      </span>
                      <RateBadge rate={c.rate} />
                      <ChevronRightIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="font-semibold text-[17px] mb-2">Questions you keep missing</h2>
            {repeatOffenders.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing you&rsquo;ve missed more than once.</p>
            ) : (
              <ul className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
                {repeatOffenders.map(({ q, wrongCount }) => (
                  <li key={q.question_id} className="px-4 py-3">
                    <p className="text-[15px] leading-[22px]">{q.question_text}</p>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                      <span className="font-semibold text-destructive">Missed {wrongCount} times</span> ·{" "}
                      {themeLabel(q.theme_name)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <Button asChild className="w-full">
            <Link href="/practice?mode=weak">Practise all weak spots</Link>
          </Button>
        </div>
      )}
    </main>
  );
}

function StatTile({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-[10px] border border-border bg-card px-3 py-3">
      <dd className="font-display font-semibold text-[28px] leading-8 tabular">{value}</dd>
      <dt className="text-[13px] text-muted-foreground leading-tight">{label}</dt>
    </div>
  );
}

function RateBadge({ rate }: { rate: number }) {
  return (
    <span className="inline-flex items-center h-[22px] px-2 rounded-full bg-destructive/10 text-destructive text-xs font-semibold tabular shrink-0">
      {Math.round(rate * 100)}% wrong
    </span>
  );
}
