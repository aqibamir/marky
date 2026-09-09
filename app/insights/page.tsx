"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  themeEmoji,
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
          stroke="hsl(var(--primary))"
          strokeWidth="10"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.7))" }}
        />
      </svg>
      <div className="-mt-16 text-xl font-bold">{label}</div>
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
      <main className="max-w-2xl mx-auto p-4">
        <div className="h-48 rounded-2xl bg-secondary animate-pulse" />
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto w-full px-4 py-4 flex-1">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold glow-text">Insights</h1>
        <select
          className="text-xs border border-border rounded-full px-2 py-1 bg-background"
          value={lang}
          onChange={(e) => setLang(e.target.value as Language)}
        >
          <option value="de">German</option>
          <option value="en">English</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-1 bg-secondary rounded-full p-1 mb-6 text-sm">
        <button
          onClick={() => setTab("overview")}
          className={`rounded-full py-1.5 font-medium transition-colors ${
            tab === "overview" ? "bg-primary text-primary-foreground glow-primary" : ""
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setTab("weak")}
          className={`rounded-full py-1.5 font-medium transition-colors ${
            tab === "weak" ? "bg-primary text-primary-foreground glow-primary" : ""
          }`}
        >
          Weak Points
        </button>
      </div>

      {attempted.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg font-medium mb-1">No practice history yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Answer a few questions and your patterns will show up here.
          </p>
          <Link href="/practice" className="text-primary underline text-sm">
            Start practicing →
          </Link>
        </div>
      ) : tab === "overview" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-2xl">🔥</div>
              <div className="text-2xl font-bold mt-1">{streak}</div>
              <div className="text-xs text-muted-foreground">day streak</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-2xl">💎</div>
              <div className="text-2xl font-bold mt-1">{points}</div>
              <div className="text-xs text-muted-foreground">points mastered</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 flex items-center justify-around">
            <Ring pct={accuracy} label={`${accuracy}%`} sub="accuracy" />
            <div className="text-sm text-muted-foreground text-center">
              <div className="text-lg font-semibold text-foreground">{attempted.length}</div>
              answered
              <div className="text-lg font-semibold text-foreground mt-2">{totalCorrectNow}</div>
              currently correct
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="text-xs font-semibold text-muted-foreground mb-3">Last 7 days</div>
            <div className="flex justify-between">
              {week.map((d) => {
                const date = new Date(d.key);
                const dayLetter = "SMTWTFS"[date.getUTCDay()];
                const active = d.count > 0;
                return (
                  <div key={d.key} className="flex flex-col items-center gap-1">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        active
                          ? "bg-primary text-primary-foreground glow-primary"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {d.count > 0 ? d.count : ""}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{dayLetter}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-semibold mb-2">Categories you struggle with</h2>
            {weakThemes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No repeated mistakes yet - nice.</p>
            ) : (
              <div className="space-y-2">
                {weakThemes.map((t) => (
                  <Link
                    key={t.theme}
                    href={`/practice?theme=${encodeURIComponent(t.theme)}&mode=weak`}
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-3 hover:border-primary/50"
                  >
                    <span>
                      {themeEmoji(t.theme)} {themeLabel(t.theme)}
                    </span>
                    <span className="text-xs text-destructive font-medium">
                      {t.wrong}/{t.total} wrong ({Math.round(t.rate * 100)}%)
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold mb-2">Toughest chapters</h2>
            {weakChapters.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing stands out yet.</p>
            ) : (
              <div className="space-y-2">
                {weakChapters.map((c) => (
                  <Link
                    key={c.chapter}
                    href={`/practice?chapter=${encodeURIComponent(c.chapter)}&mode=weak`}
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-3 hover:border-primary/50"
                  >
                    <span className="truncate pr-2">{c.chapter}</span>
                    <span className="text-xs text-destructive font-medium shrink-0">
                      {c.wrong}/{c.total} wrong
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold mb-2">Questions you keep missing</h2>
            {repeatOffenders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing you&rsquo;ve missed more than once - keep going.
              </p>
            ) : (
              <div className="space-y-2">
                {repeatOffenders.map(({ q, wrongCount }) => (
                  <div key={q.question_id} className="rounded-xl border border-border bg-card p-3">
                    <div className="text-sm">{q.question_text}</div>
                    <div className="text-xs text-destructive mt-1">
                      Missed {wrongCount}× · {themeEmoji(q.theme_name)} {themeLabel(q.theme_name)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="text-center">
            <Link href="/practice?mode=weak" className="text-primary underline text-sm">
              Practice all weak spots →
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
