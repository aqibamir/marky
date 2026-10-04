"use client";

// Type-in test: every question where you have to type a number (no answer
// options), in random order. "Practice" checks each answer straight away and
// explains it from the Numbers sheet; "Exam" only scores at the end. Answers
// count towards the same per-question stats and run history as Practice.

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import QuestionMedia from "@/components/QuestionMedia";
import {
  appliesToLicenseClass,
  isFreeEntryQuestion,
  type DrivingQuestion,
  type Language,
  type LicenseClass,
} from "@/lib/drivingQuestions";
import { APP_SETTINGS_EVENT, loadAppSettings } from "@/lib/appSettings";
import { sameAnswer } from "@/lib/answers";
import { TYPED_ANSWER_UNITS, factsFor } from "@/lib/numberFacts";
import { loadStats, recordAttempt, saveStats } from "@/lib/practiceStats";
import { appendRunAnswer, startRun } from "@/lib/practiceRuns";

type Phase = "start" | "question" | "results";
type TestMode = "practice" | "exam";

interface Given {
  value: string; // "" = "I don't know"
  correct: boolean;
}

const UNIT_DE: Record<string, string> = { times: "-fach", minutes: "Minuten", months: "Monate" };

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// The catalog writes decimals the German way ("1,5"); show "1.5" in English.
const correctText = (q: DrivingQuestion, lang: Language) =>
  q.correct_answers.map((c) => (lang === "en" ? c.letter.replace(",", ".") : c.letter)).join(", ");

function Explanation({ q }: { q: DrivingQuestion }) {
  const facts = factsFor(q.question_id).slice(0, 2);
  if (facts.length === 0) return null;
  return (
    <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc pl-4">
      {facts.map((f, i) => (
        <li key={i}>{f.text}</li>
      ))}
    </ul>
  );
}

export default function NumbersTestPage() {
  const [lang, setLang] = useState<Language>("de");
  const [licenseClass, setLicenseClass] = useState<LicenseClass>("all");
  const [questions, setQuestions] = useState<DrivingQuestion[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [phase, setPhase] = useState<Phase>("start");
  const [mode, setMode] = useState<TestMode>("practice");
  const [queue, setQueue] = useState<DrivingQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState(false);
  const [given, setGiven] = useState<Record<string, Given>>({});
  const [runId, setRunId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const settings = loadAppSettings();
    setLang(settings.lang);
    setLicenseClass(settings.licenseClass);
    function onChange(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.lang) setLang(detail.lang);
      if (detail?.licenseClass) setLicenseClass(detail.licenseClass);
    }
    window.addEventListener(APP_SETTINGS_EVENT, onChange);
    return () => window.removeEventListener(APP_SETTINGS_EVENT, onChange);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setQuestions(null);
    setLoadError(null);
    setPhase("start");
    fetch(`/api/driving-questions?lang=${lang}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json();
      })
      .then((data) => !cancelled && setQuestions(data.questions as DrivingQuestion[]))
      .catch((err) => !cancelled && setLoadError(err.message ?? "Failed to load questions"));
    return () => {
      cancelled = true;
    };
  }, [lang]);

  useEffect(() => {
    setPhase("start");
  }, [licenseClass]);

  const pool = useMemo(
    () => (questions ?? []).filter((q) => isFreeEntryQuestion(q) && (licenseClass === "all" || appliesToLicenseClass(q, licenseClass))),
    [questions, licenseClass]
  );

  const current = queue[index];
  const isLast = index >= queue.length - 1;

  // Keyboard flow: type, Enter to check, Enter again for the next question.
  useEffect(() => {
    if (phase === "question") inputRef.current?.focus();
  }, [phase, index]);
  useEffect(() => {
    if (checked) nextRef.current?.focus();
  }, [checked]);

  function start(list: DrivingQuestion[], m: TestMode) {
    const q = shuffle(list);
    setMode(m);
    setQueue(q);
    setIndex(0);
    setInput("");
    setChecked(false);
    setGiven({});
    const { runId: id } = startRun(lang, {
      mode: "all",
      filterSummary: `🔢 Type-in test (${m === "exam" ? "exam" : "practice"})${licenseClass === "B" ? " · Class B" : ""}`,
      queueLength: q.length,
    });
    setRunId(id);
    setPhase("question");
    window.scrollTo(0, 0);
  }

  function record(value: string): Given {
    const correct = value.trim() !== "" && sameAnswer([value], current.correct_answers.map((c) => c.letter));
    const g = { value: value.trim(), correct };
    setGiven((prev) => ({ ...prev, [current.question_id]: g }));
    saveStats(lang, recordAttempt(loadStats(lang), current.question_id, [g.value], correct));
    if (runId) appendRunAnswer(lang, runId, { questionId: current.question_id, selected: [g.value], correct, at: Date.now() });
    return g;
  }

  function next() {
    if (isLast) {
      setPhase("results");
      window.scrollTo(0, 0);
      return;
    }
    setIndex((i) => i + 1);
    setInput("");
    setChecked(false);
  }

  function submit(value: string) {
    if (!current) return;
    if (mode === "practice") {
      if (checked) return next();
      record(value);
      setChecked(true);
    } else {
      record(value);
      next();
    }
  }

  const answeredIds = Object.keys(given);
  const answered = queue.filter((q) => given[q.question_id]);
  const right = answered.filter((q) => given[q.question_id].correct);
  const wrong = answered.filter((q) => !given[q.question_id].correct);
  const unitFor = (q: DrivingQuestion) => {
    const u = TYPED_ANSWER_UNITS[q.question_id] ?? "";
    return lang === "de" ? UNIT_DE[u] ?? u : u;
  };

  if (loadError) {
    return (
      <main className="max-w-2xl mx-auto p-4">
        <p className="text-destructive">Failed to load questions: {loadError}</p>
      </main>
    );
  }
  if (!questions) {
    return (
      <main className="max-w-2xl mx-auto p-4 space-y-3 w-full">
        <div className="h-24 rounded-2xl bg-secondary animate-pulse" />
        <div className="h-48 rounded-2xl bg-secondary animate-pulse" />
      </main>
    );
  }

  // ---------------- Start ----------------
  if (phase === "start") {
    return (
      <main className="max-w-2xl mx-auto w-full px-4 py-6">
        <h1 className="text-xl sm:text-2xl font-bold glow-text">🔢 Type-in test</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          All {pool.length} questions where you type a number instead of picking an option
          {licenseClass === "B" ? " · Class B" : " · all classes"}, in random order.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => start(pool, "practice")}
            disabled={pool.length === 0}
            className="text-left rounded-xl border-2 border-primary bg-primary/5 p-4 hover:bg-primary/10 transition-colors"
          >
            <p className="font-semibold">✍️ Practice</p>
            <p className="text-sm text-muted-foreground mt-1">See right or wrong after each answer, with the rule behind it.</p>
          </button>
          <button
            onClick={() => start(pool, "exam")}
            disabled={pool.length === 0}
            className="text-left rounded-xl border-2 border-border p-4 hover:border-primary/60 transition-colors"
          >
            <p className="font-semibold">📝 Exam</p>
            <p className="text-sm text-muted-foreground mt-1">No feedback until the end - then your score and every mistake explained.</p>
          </button>
        </div>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
          <li>Type just the number - the unit is shown next to the box. 1,5 and 1.5 both count.</li>
          <li>Stuck? &ldquo;I don&rsquo;t know&rdquo; counts as wrong, so it comes back in &ldquo;retry mistakes&rdquo;.</li>
          <li>
            Revise first on the{" "}
            <Link href="/cheatsheet?tab=numbers" className="text-primary underline">
              Numbers cheat sheet
            </Link>
            .
          </li>
        </ul>
      </main>
    );
  }

  // ---------------- Results ----------------
  if (phase === "results") {
    const pointsTotal = answered.reduce((n, q) => n + q.pointsValue, 0);
    const pointsLost = wrong.reduce((n, q) => n + q.pointsValue, 0);
    const pct = answered.length ? Math.round((100 * right.length) / answered.length) : 0;
    return (
      <main className="max-w-2xl mx-auto w-full px-4 py-6">
        <h1 className="text-xl sm:text-2xl font-bold glow-text">Results</h1>
        <div className="rounded-2xl border border-border bg-card p-4 my-4 text-center">
          <p className={`text-4xl font-bold ${pct === 100 ? "text-success" : pct >= 80 ? "text-primary" : "text-warning"}`}>
            {right.length} / {answered.length}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {pct}% right · {pointsLost} of {pointsTotal} error points lost
            {answered.length < queue.length && ` · stopped after ${answered.length} of ${queue.length}`}
          </p>
          {pct === 100 && answered.length === queue.length && <p className="mt-2 font-semibold text-success">Perfect - every number right. 🎉</p>}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          {wrong.length > 0 && (
            <Button className="flex-1" onClick={() => start(wrong, mode)}>
              Retry the {wrong.length} I got wrong
            </Button>
          )}
          <Button variant="outline" className="flex-1" onClick={() => start(pool, mode)}>
            Start again (all {pool.length})
          </Button>
        </div>

        {wrong.length > 0 && (
          <>
            <h2 className="font-bold mb-2">Your mistakes</h2>
            <ol className="space-y-3 mb-6">
              {wrong.map((q) => (
                <li key={q.question_id} className="rounded-xl border border-destructive/40 bg-destructive/5 p-3">
                  <p className="text-sm font-medium">{q.question_text}</p>
                  <p className="text-sm mt-1">
                    <span className="text-destructive line-through">
                      {given[q.question_id].value || "no answer"}
                    </span>{" "}
                    →{" "}
                    <span className="font-bold text-success">
                      {correctText(q, lang)} {unitFor(q)}
                    </span>
                  </p>
                  <Explanation q={q} />
                </li>
              ))}
            </ol>
          </>
        )}

        {right.length > 0 && (
          <details className="rounded-xl border border-border bg-card p-3">
            <summary className="font-semibold cursor-pointer">✓ The {right.length} you got right</summary>
            <ul className="mt-2 space-y-1.5 text-sm">
              {right.map((q) => (
                <li key={q.question_id}>
                  {q.question_text}{" "}
                  <span className="font-bold text-success">
                    {correctText(q, lang)} {unitFor(q)}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        )}
        <p className="text-xs text-muted-foreground text-center mt-6">
          Saved to your{" "}
          <Link href="/history?tab=runs" className="underline">
            History
          </Link>{" "}
          ·{" "}
          <Link href="/cheatsheet?tab=numbers" className="underline">
            Numbers cheat sheet
          </Link>
        </p>
      </main>
    );
  }

  // ---------------- Question ----------------
  const g = current ? given[current.question_id] : undefined;
  const unit = current ? unitFor(current) : "";
  return (
    <main className="max-w-2xl mx-auto w-full px-4 py-6">
      <div className="flex items-center justify-between gap-2 mb-2 text-sm">
        <span className="text-muted-foreground">
          {mode === "exam" ? "📝 Exam" : "✍️ Practice"} · {index + 1} / {queue.length}
        </span>
        {mode === "practice" && answeredIds.length > 0 && (
          <span className="font-medium">
            <span className="text-success">{right.length} ✓</span> · <span className="text-destructive">{wrong.length} ✕</span>
          </span>
        )}
      </div>
      <div className="h-1.5 rounded-full bg-secondary mb-4 overflow-hidden">
        <div className="h-full bg-primary transition-all" style={{ width: `${(100 * index) / Math.max(queue.length, 1)}%` }} />
      </div>

      {current && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-2">{current.pointsValue} points</p>
          <QuestionMedia imageUrls={current.image_urls} videoUrls={undefined} />
          <p className="font-medium mb-4">{current.question_text}</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (checked || input.trim() !== "") submit(input);
            }}
          >
            <label className="block text-xs text-muted-foreground mb-1.5" htmlFor="answer">
              Type the number
            </label>
            <div className="flex items-center gap-2">
              <input
                id="answer"
                ref={inputRef}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={checked}
                placeholder="?"
                className={`w-full border-2 rounded-xl p-3 bg-background text-lg font-semibold tracking-wide outline-none transition-colors ${
                  checked && g ? (g.correct ? "border-success bg-success/10" : "border-destructive bg-destructive/10") : "border-border focus:border-primary"
                }`}
              />
              {unit && <span className="shrink-0 text-lg font-semibold text-muted-foreground">{unit}</span>}
            </div>

            {checked && g && (
              <div className={`mt-3 rounded-xl p-3 ${g.correct ? "bg-success/10" : "bg-destructive/10"}`}>
                <p className={`font-semibold ${g.correct ? "text-success" : "text-destructive"}`}>
                  {g.correct ? "✓ Correct" : `✕ The answer is ${correctText(current, lang)} ${unit}`}
                </p>
                <Explanation q={current} />
              </div>
            )}

            <div className="flex gap-2 mt-4">
              {!checked && (
                <Button type="button" variant="outline" onClick={() => submit("")}>
                  I don&rsquo;t know
                </Button>
              )}
              <Button ref={nextRef} type="submit" className="flex-1" disabled={!checked && input.trim() === ""}>
                {mode === "practice" && !checked ? "Check" : isLast ? "See results" : "Next →"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="text-center mt-4">
        <button
          onClick={() => {
            setPhase("results");
            window.scrollTo(0, 0);
          }}
          className="text-xs text-muted-foreground underline"
          disabled={answeredIds.length === 0}
        >
          Finish now and see results
        </button>
      </div>
    </main>
  );
}
