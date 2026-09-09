"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import QuestionMedia from "@/components/QuestionMedia";
import {
  questionMediaType,
  themeEmoji,
  themeLabel,
  type DrivingQuestion,
  type Language,
  type MediaType,
} from "@/lib/drivingQuestions";
import {
  isDue,
  lastAttempt,
  loadSavedFilters,
  loadStats,
  recordAttempt,
  saveSavedFilters,
  saveStats,
  type SavedFilter,
  type StatsMap,
} from "@/lib/practiceStats";

type SortBy = "points-desc" | "points-asc" | "theme" | "chapter" | "random";
type PointsFilter = "all" | "2" | "3" | "4" | "5";
type MediaFilter = "all" | MediaType;
type Mode = "new" | "due" | "weak" | "all";

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

function sortList(list: DrivingQuestion[], sortBy: SortBy, shuffleSeed: number) {
  switch (sortBy) {
    case "points-desc":
      return [...list].sort((a, b) => b.pointsValue - a.pointsValue);
    case "points-asc":
      return [...list].sort((a, b) => a.pointsValue - b.pointsValue);
    case "theme":
      return [...list].sort(
        (a, b) =>
          a.theme_name.localeCompare(b.theme_name) ||
          a.question_number.localeCompare(b.question_number)
      );
    case "chapter":
      return [...list].sort(
        (a, b) =>
          a.chapter_number.localeCompare(b.chapter_number) ||
          a.question_number.localeCompare(b.question_number)
      );
    case "random":
      return seededShuffle(list, shuffleSeed);
    default:
      return list;
  }
}

function pointsBadgeClass(points: number) {
  switch (points) {
    case 5:
      return "bg-destructive/15 text-destructive";
    case 4:
      return "bg-warning/15 text-warning";
    case 3:
      return "bg-accent/15 text-accent";
    default:
      return "bg-secondary text-secondary-foreground";
  }
}

const MODE_INFO: Record<Mode, { label: string; hint: string }> = {
  new: { label: "New", hint: "Questions you haven't seen yet" },
  due: { label: "Due", hint: "Spaced-repetition review queue" },
  weak: { label: "Weak spots", hint: "Your most recent answer was wrong" },
  all: { label: "All", hint: "Everything, regardless of history" },
};

function PracticeInner() {
  const searchParams = useSearchParams();

  const [lang, setLang] = useState<Language>("de");
  const [allQuestions, setAllQuestions] = useState<DrivingQuestion[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<SortBy>("points-desc");
  const [filterPoints, setFilterPoints] = useState<PointsFilter>("all");
  const [filterTheme, setFilterTheme] = useState<string>("all");
  const [filterChapter, setFilterChapter] = useState<string>("all");
  const [filterMedia, setFilterMedia] = useState<MediaFilter>("all");
  const [keyword, setKeyword] = useState("");
  const [mode, setMode] = useState<Mode>("new");
  const [shuffleSeed, setShuffleSeed] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  const [sessionQueue, setSessionQueue] = useState<DrivingQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [stats, setStats] = useState<StatsMap>({});

  // Apply ?points=/?theme=/?media=/?mode= from links (homepage tiles, insights) once.
  useEffect(() => {
    const p = searchParams.get("points");
    const t = searchParams.get("theme");
    const c = searchParams.get("chapter");
    const m = searchParams.get("media");
    const mo = searchParams.get("mode");
    if (p && ["2", "3", "4", "5"].includes(p)) setFilterPoints(p as PointsFilter);
    if (t) setFilterTheme(t);
    if (c) setFilterChapter(c);
    if (m && ["video", "image", "none"].includes(m)) setFilterMedia(m as MediaFilter);
    if (mo && ["new", "due", "weak", "all"].includes(mo)) setMode(mo as Mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSavedFilters(loadSavedFilters());
  }, []);

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
    setStats(loadStats(lang));
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const themes = useMemo(() => {
    if (!allQuestions) return [];
    return Array.from(new Set(allQuestions.map((q) => q.theme_name))).sort();
  }, [allQuestions]);

  const chapters = useMemo(() => {
    if (!allQuestions) return [];
    const pool =
      filterTheme === "all"
        ? allQuestions
        : allQuestions.filter((q) => q.theme_name === filterTheme);
    return Array.from(new Set(pool.map((q) => q.chapter_name))).sort();
  }, [allQuestions, filterTheme]);

  // Reset chapter choice if it no longer applies to the selected theme.
  useEffect(() => {
    if (filterChapter !== "all" && !chapters.includes(filterChapter)) {
      setFilterChapter("all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters]);

  // Build the session queue once per filter/sort/mode change. Deliberately
  // does NOT re-run on every `stats` update mid-session (only when the
  // filters/lang themselves change) so answering a question never yanks it
  // out from under the one currently on screen. A fresh queue (reload, new
  // filters) is what actually excludes already-answered questions.
  useEffect(() => {
    if (!allQuestions) return;
    let list = allQuestions;
    if (filterPoints !== "all") {
      list = list.filter((q) => q.pointsValue === Number(filterPoints));
    }
    if (filterTheme !== "all") {
      list = list.filter((q) => q.theme_name === filterTheme);
    }
    if (filterChapter !== "all") {
      list = list.filter((q) => q.chapter_name === filterChapter);
    }
    if (filterMedia !== "all") {
      list = list.filter((q) => questionMediaType(q) === filterMedia);
    }
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      list = list.filter((q) => q.question_text.toLowerCase().includes(kw));
    }
    if (mode === "new") {
      list = list.filter((q) => !stats[q.question_id]);
    } else if (mode === "due") {
      list = list.filter((q) => isDue(stats[q.question_id]));
    } else if (mode === "weak") {
      list = list.filter((q) => lastAttempt(stats[q.question_id])?.correct === false);
    }
    setSessionQueue(sortList(list, sortBy, shuffleSeed));
    setIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    allQuestions,
    filterPoints,
    filterTheme,
    filterChapter,
    filterMedia,
    keyword,
    mode,
    sortBy,
    shuffleSeed,
    lang,
  ]);

  const current = sessionQueue[index];

  // Restore any previous answer for the question now in view (relevant in
  // "weak"/"due"/"all" modes, where a question can already have history).
  useEffect(() => {
    if (!current) return;
    const prior = lastAttempt(stats[current.question_id]);
    setSelected(prior?.selected ?? []);
    setChecked(Boolean(prior));
  }, [current?.question_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = sessionQueue.length;
  const attemptedIds = Object.keys(stats);
  const correctNowCount = attemptedIds.filter((id) => lastAttempt(stats[id])?.correct).length;
  const dueCount = attemptedIds.filter((id) => isDue(stats[id])).length;
  const isLastQuestion = index >= total - 1;
  const isCorrectAnswer =
    current && sameAnswer(selected, current.correct_answers.map((c) => c.letter));

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
    const next = recordAttempt(stats, current.question_id, selected, isCorrect);
    setStats(next);
    saveStats(lang, next);
    setChecked(true);
  }

  function goTo(delta: number) {
    setIndex((i) => Math.min(Math.max(i + delta, 0), Math.max(total - 1, 0)));
  }

  function resetProgress() {
    if (!confirm(`Clear all saved answers for ${lang.toUpperCase()}?`)) return;
    setStats({});
    saveStats(lang, {});
  }

  function applySavedFilter(f: SavedFilter) {
    setMode(f.mode as Mode);
    setFilterTheme(f.theme);
    setFilterChapter(f.chapter);
    setFilterMedia(f.media as MediaFilter);
    setFilterPoints(f.points as PointsFilter);
    setKeyword(f.keyword);
    setSortBy(f.sortBy as SortBy);
    setFiltersOpen(true);
  }

  function saveCurrentFilter() {
    const name = window.prompt("Name this filter (e.g. \"Trailer questions\")");
    if (!name) return;
    const next: SavedFilter = {
      id: `${Date.now()}`,
      name,
      mode,
      theme: filterTheme,
      chapter: filterChapter,
      media: filterMedia,
      points: filterPoints,
      keyword,
      sortBy,
    };
    const updated = [...savedFilters, next];
    setSavedFilters(updated);
    saveSavedFilters(updated);
  }

  function deleteSavedFilter(id: string) {
    const updated = savedFilters.filter((f) => f.id !== id);
    setSavedFilters(updated);
    saveSavedFilters(updated);
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
      <main className="max-w-2xl mx-auto p-4 space-y-3 w-full">
        <div className="h-24 rounded-2xl bg-secondary animate-pulse" />
        <div className="h-64 rounded-2xl bg-secondary animate-pulse" />
      </main>
    );
  }

  const filterSummary = [
    MODE_INFO[mode].label,
    filterTheme === "all" ? "All categories" : `${themeEmoji(filterTheme)} ${themeLabel(filterTheme)}`,
    filterChapter !== "all" ? filterChapter : null,
    filterPoints === "all" ? null : `${filterPoints} Punkte`,
    filterMedia === "all" ? null : filterMedia,
    keyword ? `"${keyword}"` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const progressPct = total > 0 ? ((index + 1) / total) * 100 : 0;

  return (
    <main className="max-w-2xl mx-auto w-full px-4 pt-4 pb-28 flex-1">
      <div className="flex items-center justify-between mb-3 gap-2">
        <div>
          <h1 className="text-xl font-bold glow-text">Practice</h1>
          <p className="text-xs text-muted-foreground">
            {attemptedIds.length} answered · {correctNowCount} correct
            {dueCount > 0 && (
              <>
                {" · "}
                <button className="text-warning underline" onClick={() => setMode("due")}>
                  {dueCount} due for review
                </button>
              </>
            )}
          </p>
        </div>
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="text-sm font-medium border border-primary/40 text-primary rounded-full px-3 py-1.5 hover:bg-primary/10 shrink-0"
        >
          {filtersOpen ? "Done" : "Filters"}
        </button>
      </div>

      {!filtersOpen && (
        <button
          onClick={() => setFiltersOpen(true)}
          className="w-full text-left text-xs text-muted-foreground bg-secondary/60 border border-border rounded-full px-3 py-2 mb-4 truncate"
        >
          {filterSummary}
        </button>
      )}

      {filtersOpen && (
        <div className="mb-4 bg-card border border-border rounded-2xl p-3 space-y-3 text-sm">
          {savedFilters.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-1.5">My filters</div>
              <div className="flex flex-wrap gap-1.5">
                {savedFilters.map((f) => (
                  <span
                    key={f.id}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs"
                  >
                    <button onClick={() => applySavedFilter(f)}>{f.name}</button>
                    <button
                      onClick={() => deleteSavedFilter(f.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Delete ${f.name}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-1.5">Mode</div>
            <div className="grid grid-cols-4 gap-1 bg-secondary rounded-full p-1">
              {(Object.keys(MODE_INFO) as Mode[]).map((m) => (
                <button
                  key={m}
                  title={MODE_INFO[m].hint}
                  onClick={() => setMode(m)}
                  className={`rounded-full py-1.5 text-xs font-medium transition-colors ${
                    mode === m
                      ? "bg-primary text-primary-foreground glow-primary"
                      : "hover:bg-background/60"
                  }`}
                >
                  {MODE_INFO[m].label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-1.5">Category</div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setFilterTheme("all")}
                className={`rounded-full px-3 py-1 text-xs border ${
                  filterTheme === "all"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border"
                }`}
              >
                All
              </button>
              {themes.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterTheme(t)}
                  className={`rounded-full px-3 py-1 text-xs border ${
                    filterTheme === t
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border"
                  }`}
                >
                  {themeEmoji(t)} {themeLabel(t)}
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted-foreground">
              Chapter {filterTheme !== "all" && `(within ${themeLabel(filterTheme)})`}
            </span>
            <select
              className="border border-border rounded-lg p-2 bg-background"
              value={filterChapter}
              onChange={(e) => setFilterChapter(e.target.value)}
            >
              <option value="all">All chapters</option>
              {chapters.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted-foreground">
              Keyword search (question text)
            </span>
            <input
              type="text"
              placeholder='e.g. "Anhänger", "Einbahn", "Vorfahrt"'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="border border-border rounded-lg p-2 bg-background"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              Media
              <select
                className="border border-border rounded-lg p-2 bg-background"
                value={filterMedia}
                onChange={(e) => setFilterMedia(e.target.value as MediaFilter)}
              >
                <option value="all">Any media</option>
                <option value="video">🎬 Video only</option>
                <option value="image">🖼️ Picture only</option>
                <option value="none">Text only</option>
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
          </div>

          <div className="flex gap-2">
            {sortBy === "random" && (
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setShuffleSeed((s) => s + 1)}>
                Reshuffle
              </Button>
            )}
            <Button variant="outline" size="sm" className="flex-1" onClick={saveCurrentFilter}>
              ★ Save this filter
            </Button>
          </div>
        </div>
      )}

      {/* progress bar */}
      {total > 0 && (
        <div className="h-1.5 rounded-full bg-secondary mb-4 overflow-hidden">
          <div
            className="h-full bg-primary glow-primary transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      {total === 0 && (
        <div className="text-center py-16">
          <p className="text-lg font-medium mb-1">
            {mode === "new" ? "🎉 Nothing new here!" : "No questions match"}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {mode === "new"
              ? "You've answered every question in this set already."
              : mode === "due"
              ? "Nothing is due for review right now - come back later."
              : "Try a different category, points, or media filter."}
          </p>
          {mode === "new" && (
            <Button onClick={() => setMode("all")}>Practice this set again</Button>
          )}
        </div>
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
                if (isCorrectOpt) style = "border-success bg-success/10 glow-border";
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

      {total > 0 && isLastQuestion && checked && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          That&rsquo;s the last question in this set — nice work! Adjust filters above to keep going, or check{" "}
          <Link href="/insights" className="underline text-primary">
            Insights
          </Link>{" "}
          for your patterns.
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
            <Button onClick={() => goTo(1)} disabled={isLastQuestion}>
              Next →
            </Button>
          </div>
        </div>
      )}

      <div className="mt-3 text-center flex justify-center gap-3">
        <Link href="/insights" className="text-xs underline text-muted-foreground">
          Your weak points →
        </Link>
        <Link href="/driving-questions" className="text-xs underline text-muted-foreground">
          Browse full list
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
