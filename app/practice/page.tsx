"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import QuestionMedia from "@/components/QuestionMedia";
import type { DrivingQuestion, Language } from "@/lib/drivingQuestions";

type SortBy = "points-desc" | "points-asc" | "theme" | "chapter" | "random";
type PointsFilter = "all" | "2" | "3" | "4" | "5";

interface AnswerRecord {
  selected: string[];
  correct: boolean;
}

type ProgressMap = Record<string, AnswerRecord>;

function progressKey(lang: Language) {
  return `marky:driving-practice:${lang}`;
}

function loadProgress(lang: Language): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(progressKey(lang));
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function saveProgress(lang: Language, progress: ProgressMap) {
  try {
    window.localStorage.setItem(progressKey(lang), JSON.stringify(progress));
  } catch {
    // localStorage unavailable (private mode, etc.) - practice still works, just not persisted
  }
}

function sameAnswer(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}

// Small seeded shuffle so a "random" sort stays stable across re-renders and
// only reshuffles when the user asks it to (via shuffleSeed).
function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = seed || 1;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pointsBadgeClass(points: number) {
  switch (points) {
    case 2:
      return "bg-secondary text-secondary-foreground";
    case 3:
      return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
    case 4:
      return "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300";
    case 5:
      return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
    default:
      return "bg-secondary text-secondary-foreground";
  }
}

function PracticeInner() {
  const searchParams = useSearchParams();
  const initialPoints = searchParams.get("points");

  const [lang, setLang] = useState<Language>("de");
  const [allQuestions, setAllQuestions] = useState<DrivingQuestion[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<SortBy>("points-desc");
  const [filterPoints, setFilterPoints] = useState<PointsFilter>(
    initialPoints && ["2", "3", "4", "5"].includes(initialPoints)
      ? (initialPoints as PointsFilter)
      : "all"
  );
  const [filterTheme, setFilterTheme] = useState<string>("all");
  const [onlyUnanswered, setOnlyUnanswered] = useState(false);
  const [onlyIncorrect, setOnlyIncorrect] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [progress, setProgress] = useState<ProgressMap>({});

  // Load questions whenever the language changes.
  useEffect(() => {
    let cancelled = false;
    setAllQuestions(null);
    setLoadError(null);
    fetch(`/api/driving-questions?lang=${lang}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setAllQuestions(data.questions as DrivingQuestion[]);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message ?? "Failed to load questions");
      });
    setProgress(loadProgress(lang));
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const themes = useMemo(() => {
    if (!allQuestions) return [];
    return Array.from(new Set(allQuestions.map((q) => q.theme_name))).sort();
  }, [allQuestions]);

  const filtered = useMemo(() => {
    let list = allQuestions ?? [];
    if (filterPoints !== "all") {
      list = list.filter((q) => q.pointsValue === Number(filterPoints));
    }
    if (filterTheme !== "all") {
      list = list.filter((q) => q.theme_name === filterTheme);
    }
    if (onlyUnanswered) {
      list = list.filter((q) => !progress[q.question_id]);
    }
    if (onlyIncorrect) {
      list = list.filter((q) => progress[q.question_id]?.correct === false);
    }
    return list;
  }, [allQuestions, filterPoints, filterTheme, onlyUnanswered, onlyIncorrect, progress]);

  const questions = useMemo(() => {
    const list = [...filtered];
    switch (sortBy) {
      case "points-desc":
        return list.sort((a, b) => b.pointsValue - a.pointsValue);
      case "points-asc":
        return list.sort((a, b) => a.pointsValue - b.pointsValue);
      case "theme":
        return list.sort(
          (a, b) =>
            a.theme_name.localeCompare(b.theme_name) ||
            a.question_number.localeCompare(b.question_number)
        );
      case "chapter":
        return list.sort(
          (a, b) =>
            a.chapter_number.localeCompare(b.chapter_number) ||
            a.question_number.localeCompare(b.question_number)
        );
      case "random":
        return seededShuffle(list, shuffleSeed);
      default:
        return list;
    }
  }, [filtered, sortBy, shuffleSeed]);

  // Jump back to the start whenever the active question set changes shape.
  useEffect(() => {
    setIndex(0);
  }, [sortBy, filterPoints, filterTheme, onlyUnanswered, onlyIncorrect, lang, shuffleSeed]);

  const current = questions[index];

  // Restore any previous answer for the question now in view.
  useEffect(() => {
    if (!current) return;
    const prior = progress[current.question_id];
    setSelected(prior?.selected ?? []);
    setChecked(Boolean(prior));
  }, [current?.question_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = questions.length;
  const answeredCount = Object.keys(progress).length;
  const correctCount = Object.values(progress).filter((p) => p.correct).length;

  function toggleOption(letter: string) {
    if (!current || checked) return;
    const multi = current.correct_answers.length > 1;
    if (multi) {
      setSelected((prev) =>
        prev.includes(letter) ? prev.filter((l) => l !== letter) : [...prev, letter]
      );
    } else {
      setSelected([letter]);
    }
  }

  function checkAnswer() {
    if (!current || selected.length === 0) return;
    const correctLetters = current.correct_answers.map((c) => c.letter);
    const isCorrect = sameAnswer(selected, correctLetters);
    const next = {
      ...progress,
      [current.question_id]: { selected, correct: isCorrect },
    };
    setProgress(next);
    saveProgress(lang, next);
    setChecked(true);
  }

  function goTo(delta: number) {
    setIndex((i) => Math.min(Math.max(i + delta, 0), Math.max(total - 1, 0)));
  }

  function jumpToFirstUnanswered() {
    const i = questions.findIndex((q) => !progress[q.question_id]);
    if (i >= 0) setIndex(i);
  }

  function resetProgress() {
    if (!confirm(`Clear all saved answers for ${lang.toUpperCase()}?`)) return;
    setProgress({});
    saveProgress(lang, {});
  }

  if (loadError) {
    return (
      <main className="max-w-2xl mx-auto p-4">
        <p className="text-destructive">Failed to load questions: {loadError}</p>
      </main>
    );
  }

  if (!allQuestions) {
    return (
      <main className="max-w-2xl mx-auto p-4">
        <p className="text-muted-foreground animate-pulse">Loading questions…</p>
      </main>
    );
  }

  const isCorrectAnswer =
    current && sameAnswer(selected, current.correct_answers.map((c) => c.letter));
  const progressPct = total > 0 ? ((index + 1) / total) * 100 : 0;

  return (
    <main className="max-w-2xl mx-auto w-full px-4 pt-4 pb-28 flex-1">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold">Practice</h1>
          <p className="text-xs text-muted-foreground">
            {answeredCount} answered · {correctCount} correct
            {answeredCount > 0 && ` · ${Math.round((correctCount / answeredCount) * 100)}%`}
          </p>
        </div>
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="text-sm font-medium border border-border rounded-full px-3 py-1.5 hover:bg-secondary"
        >
          {filtersOpen ? "Hide filters" : "Filters"}
        </button>
      </div>

      {filtersOpen && (
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm bg-secondary/60 rounded-2xl p-3">
          <label className="flex flex-col gap-1">
            Language
            <select
              className="border border-border rounded-lg p-2 bg-background"
              value={lang}
              onChange={(e) => setLang(e.target.value as Language)}
            >
              <option value="de">German</option>
              <option value="en">English</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            Sort by
            <select
              className="border border-border rounded-lg p-2 bg-background"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
            >
              <option value="points-desc">Points (high → low)</option>
              <option value="points-asc">Points (low → high)</option>
              <option value="theme">Theme (A → Z)</option>
              <option value="chapter">Chapter</option>
              <option value="random">Random</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            Points
            <select
              className="border border-border rounded-lg p-2 bg-background"
              value={filterPoints}
              onChange={(e) => setFilterPoints(e.target.value as PointsFilter)}
            >
              <option value="all">All</option>
              <option value="2">2 Punkte</option>
              <option value="3">3 Punkte</option>
              <option value="4">4 Punkte</option>
              <option value="5">5 Punkte</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            Theme
            <select
              className="border border-border rounded-lg p-2 bg-background"
              value={filterTheme}
              onChange={(e) => setFilterTheme(e.target.value)}
            >
              <option value="all">All themes</option>
              {themes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={onlyUnanswered}
              onChange={(e) => setOnlyUnanswered(e.target.checked)}
            />
            Unanswered only
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={onlyIncorrect}
              onChange={(e) => setOnlyIncorrect(e.target.checked)}
            />
            Missed only
          </label>

          {sortBy === "random" && (
            <Button
              variant="outline"
              size="sm"
              className="col-span-2"
              onClick={() => setShuffleSeed((s) => s + 1)}
            >
              Reshuffle
            </Button>
          )}
        </div>
      )}

      {/* progress bar */}
      {total > 0 && (
        <div className="h-1.5 rounded-full bg-secondary mb-4 overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      {total === 0 && (
        <p className="text-muted-foreground">No questions match the current filters.</p>
      )}

      {current && (
        <div className="rounded-2xl border border-border bg-card shadow-sm p-4">
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-3">
            <span>
              Question {index + 1} of {total}
            </span>
            <span className={`px-2 py-0.5 rounded-full font-medium ${pointsBadgeClass(current.pointsValue)}`}>
              {current.points}
            </span>
          </div>

          <QuestionMedia imageUrls={current.image_urls} videoUrls={current.video_urls} />

          <div className="font-medium mb-3">{current.question_text}</div>

          <div className="space-y-2 mb-4">
            {current.options.map((opt) => {
              const isSelected = selected.includes(opt.letter);
              const isCorrectOpt = current.correct_answers.some(
                (c) => c.letter === opt.letter
              );
              let style = "border-border";
              if (checked) {
                if (isCorrectOpt) style = "border-success bg-success/10";
                else if (isSelected) style = "border-destructive bg-destructive/10";
              } else if (isSelected) {
                style = "border-primary bg-primary/5";
              }
              return (
                <label
                  key={opt.letter}
                  className={`flex items-start gap-2 border-2 rounded-xl p-3 cursor-pointer transition-colors ${style}`}
                >
                  <input
                    type={current.correct_answers.length > 1 ? "checkbox" : "radio"}
                    checked={isSelected}
                    onChange={() => toggleOption(opt.letter)}
                    disabled={checked}
                    className="mt-1"
                  />
                  <span>
                    {opt.letter} {opt.text}
                  </span>
                </label>
              );
            })}
          </div>

          {!checked ? (
            <Button className="w-full" onClick={checkAnswer} disabled={selected.length === 0}>
              Check answer
            </Button>
          ) : (
            <div className="mb-1">
              <p className={isCorrectAnswer ? "text-success font-semibold" : "text-destructive font-semibold"}>
                {isCorrectAnswer ? "✓ Correct!" : "✕ Not quite."}
              </p>
              {current.comment && (
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                  {current.comment}
                </p>
              )}
              {current.url && (
                <a
                  href={current.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs underline text-muted-foreground"
                >
                  source
                </a>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-center">
        <button onClick={resetProgress} className="text-xs text-muted-foreground underline">
          Reset saved progress ({lang.toUpperCase()})
        </button>
      </div>

      {/* sticky bottom nav, mobile-friendly */}
      {current && (
        <div className="safe-bottom fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-2 px-4 py-3">
            <Button variant="outline" onClick={() => goTo(-1)} disabled={index === 0}>
              ← Previous
            </Button>
            <button
              onClick={jumpToFirstUnanswered}
              className="text-xs text-muted-foreground underline hidden sm:block"
            >
              First unanswered
            </button>
            <Button onClick={() => goTo(1)} disabled={index >= total - 1}>
              Next →
            </Button>
          </div>
        </div>
      )}

      <div className="mt-3 text-center">
        <Link href="/driving-questions" className="text-xs underline text-muted-foreground">
          Browse full list instead
        </Link>
      </div>
    </main>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<main className="max-w-2xl mx-auto p-4 text-muted-foreground">Loading…</main>}>
      <PracticeInner />
    </Suspense>
  );
}
