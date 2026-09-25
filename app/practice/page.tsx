"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookmarkIcon,
  CheckIcon,
  ChevronDownIcon,
  Cross2Icon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  MixerHorizontalIcon,
  PlayIcon,
  ReaderIcon,
  ReloadIcon,
  ShuffleIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Segmented } from "@/components/ui/segmented";
import QuestionMedia from "@/components/QuestionMedia";
import {
  appliesToLicenseClass,
  chapterLabel,
  getContentTags,
  TAG_INFO,
  isFreeEntryQuestion,
  isNumericAnswerQuestion,
  matchesExamPart,
  questionMediaType,
  tagLabel,
  themeLabel,
  type DrivingQuestion,
  type ExamPart,
  type Language,
  type LicenseClass,
  type MediaType,
} from "@/lib/drivingQuestions";
import {
  isDue,
  lastAttempt,
  loadSavedFilters,
  loadSelectedSessionIds,
  loadStats,
  recordAttempt,
  saveSavedFilters,
  saveStats,
  type SavedFilter,
  type StatsMap,
} from "@/lib/practiceStats";
import { appendRunAnswer, startRun } from "@/lib/practiceRuns";
import { getTheoryNotesForTags } from "@/lib/theoryNotes";
import { APP_SETTINGS_EVENT, loadAppSettings } from "@/lib/appSettings";

type SortBy = "points-desc" | "points-asc" | "theme" | "chapter" | "random";
type PointsFilter = "all" | "2" | "3" | "4" | "5";
type MediaFilter = "all" | MediaType;
// "selected" isn't user-toggled in the filter panel - it's how the History
// page hands off a specific set of questions to redo.
type Mode = "new" | "due" | "weak" | "all" | "selected";

// Typed answers should match regardless of decimal separator or padding:
// the catalog stores "1,5" but "1.5" (or " 1,50 ") is the same answer.
function normalizeAnswer(value: string): string {
  const trimmed = value.trim();
  if (!/^[+-]?[\d.,\s]+$/.test(trimmed)) return trimmed;
  const n = parseFloat(trimmed.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? String(n) : trimmed;
}

// The catalog's option letters carry a trailing dot ("A."); show them bare.
function plainLetter(letter: string): string {
  return letter.replace(/\.$/, "");
}

function sameAnswer(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const sortedA = a.map(normalizeAnswer).sort();
  const sortedB = b.map(normalizeAnswer).sort();
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

const MODE_INFO: Record<Mode, { label: string; hint: string }> = {
  new: { label: "New", hint: "Questions you haven't seen yet" },
  due: { label: "Due", hint: "Spaced-repetition review queue" },
  weak: { label: "Weak spots", hint: "Your most recent answer was wrong" },
  all: { label: "All", hint: "Everything, regardless of history" },
  selected: { label: "Selected", hint: "A custom set picked from History" },
};
// Modes a person can pick directly in the filter panel. "selected" only
// happens via the History page's "Practice selected" action.
const VISIBLE_MODES: Mode[] = ["new", "due", "weak", "all"];

// Hazard-clip questions play the video first; the question and answer
// options only appear once the person chooses to move on, at which point
// the clip is replaced by its still frame.
function QuestionVideoGate({
  src,
  poster,
  onContinue,
}: {
  src: string;
  poster?: string;
  onContinue: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ended, setEnded] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  function replay() {
    const el = videoRef.current;
    if (el) {
      el.currentTime = 0;
      el.play();
    }
    setEnded(false);
  }

  return (
    <div className="space-y-3">
      {videoFailed ? (
        <div className="flex items-start gap-2 rounded-[10px] bg-warning/10 px-4 py-3 text-sm">
          <ExclamationTriangleIcon className="h-4 w-4 mt-0.5 shrink-0 text-warning" />
          <span>
            <span className="font-semibold text-warning">This clip couldn&rsquo;t load.</span> You can
            still answer the question without it.
          </span>
        </div>
      ) : (
        <video
          ref={videoRef}
          controls
          playsInline
          preload="metadata"
          poster={poster}
          onEnded={() => setEnded(true)}
          onError={() => setVideoFailed(true)}
          className="w-full rounded-[10px] bg-black aspect-video"
        >
          <source src={src} />
        </video>
      )}
      {/* Always available, not just after the clip ends - a slow network, a
          dead link, or someone who just wants to skip should never be stuck
          on this screen with no way forward. */}
      <div className="flex gap-2">
        {ended && !videoFailed && (
          <Button variant="outline" onClick={replay}>
            <ReloadIcon /> Watch again
          </Button>
        )}
        <Button className="flex-1" onClick={onContinue}>
          {ended || videoFailed ? "Go to question" : "Skip to question"} <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>
      {!ended && !videoFailed && (
        <p className="text-[13px] text-center text-muted-foreground">
          Watch the clip, then answer — or skip straight to the question.
        </p>
      )}
    </div>
  );
}

// Shared between the filter summary shown in the UI and the description
// saved onto a practice run record, so a run's history entry reads the same
// as what was on screen when it was taken.
function buildFilterSummary(opts: {
  mode: Mode;
  filterTheme: string;
  filterChapter: string;
  filterPoints: PointsFilter;
  filterMedia: MediaFilter;
  examPart: ExamPart;
  licenseClass: LicenseClass;
  numericOnly: boolean;
  filterTags: string[];
  keyword: string;
}): string {
  const {
    mode,
    filterTheme,
    filterChapter,
    filterPoints,
    filterMedia,
    examPart,
    licenseClass,
    numericOnly,
    filterTags,
    keyword,
  } = opts;
  return [
    MODE_INFO[mode].label,
    filterTheme === "all" ? "All categories" : themeLabel(filterTheme),
    filterChapter !== "all" ? filterChapter : null,
    filterPoints === "all" ? null : `${filterPoints} Punkte`,
    filterMedia === "all" ? null : filterMedia,
    examPart === "all"
      ? null
      : examPart === "grundstoff"
      ? "Basic knowledge"
      : licenseClass === "B"
      ? "Class B specific"
      : "Class-specific",
    numericOnly ? "numbers only" : null,
    filterTags.length > 0 ? filterTags.map(tagLabel).join(" + ") : null,
    keyword ? `"${keyword}"` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function PracticeInner() {
  const searchParams = useSearchParams();

  const [lang, setLang] = useState<Language>("de");
  const [licenseClass, setLicenseClass] = useState<LicenseClass>("all");
  const [allQuestions, setAllQuestions] = useState<DrivingQuestion[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<SortBy>("points-desc");
  const [filterPoints, setFilterPoints] = useState<PointsFilter>("all");
  const [filterTheme, setFilterTheme] = useState<string>("all");
  const [filterChapter, setFilterChapter] = useState<string>("all");
  const [filterMedia, setFilterMedia] = useState<MediaFilter>("all");
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [examPart, setExamPart] = useState<ExamPart>("all");
  const [numericOnly, setNumericOnly] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [mode, setMode] = useState<Mode>("new");
  const [shuffleSeed, setShuffleSeed] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  const [sessionQueue, setSessionQueue] = useState<DrivingQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [stats, setStats] = useState<StatsMap>({});
  const [videoStage, setVideoStage] = useState<"gate" | "revealed">("revealed");
  // Snapshot of this question's history from BEFORE the current attempt, so
  // "you've missed this before" reflects prior visits, not the answer you
  // just gave.
  const [priorHistory, setPriorHistory] = useState<{
    wrongCount: number;
    lastWrongSelected: string[] | null;
  }>({ wrongCount: 0, lastWrongSelected: null });
  // Questions answered so far in THIS page visit. Revisiting one via
  // Previous/Next should show what you just answered; landing on it fresh
  // (a new session, or a "weak"/"due" review) should let you actually try
  // again instead of re-displaying a stale locked-in answer from before -
  // the whole point of a review mode is retrying, not just re-reading it.
  const [sessionAnsweredIds, setSessionAnsweredIds] = useState<Set<string>>(new Set());
  // The practice "run" (see lib/practiceRuns.ts) backing the current queue,
  // so every answer given can be recorded against it and reviewed later
  // from History → Runs.
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);

  // Apply ?points=/?theme=/?media=/?mode= from links (homepage tiles, insights) once.
  useEffect(() => {
    const p = searchParams.get("points");
    const t = searchParams.get("theme");
    const c = searchParams.get("chapter");
    const m = searchParams.get("media");
    const mo = searchParams.get("mode");
    const num = searchParams.get("numeric");
    const part = searchParams.get("part");
    const tagsParam = searchParams.get("tags");
    if (p && ["2", "3", "4", "5"].includes(p)) setFilterPoints(p as PointsFilter);
    if (t) setFilterTheme(t);
    if (c) setFilterChapter(c);
    if (m && ["video", "image", "none"].includes(m)) setFilterMedia(m as MediaFilter);
    if (mo && ["new", "due", "weak", "all", "selected"].includes(mo)) setMode(mo as Mode);
    if (num === "1") setNumericOnly(true);
    if (part === "grundstoff" || part === "zusatzstoff") setExamPart(part);
    if (tagsParam) setFilterTags(tagsParam.split(","));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSavedFilters(loadSavedFilters());
  }, []);

  // Language and license class are app-wide "modes" set from the header
  // switcher, not per-session filters - pick up the current value on mount
  // and stay in sync if it's changed while this page is open.
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
    setSessionAnsweredIds(new Set());
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const themes = useMemo(() => {
    if (!allQuestions) return [];
    return Array.from(new Set(allQuestions.map((q) => q.theme_name))).sort();
  }, [allQuestions]);

  const allTags = useMemo(
    () => Object.keys(TAG_INFO).sort((a, b) => tagLabel(a).localeCompare(tagLabel(b))),
    []
  );

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
    if (filterTags.length > 0) {
      list = list.filter((q) => getContentTags(q).some((t) => filterTags.includes(t)));
    }
    if (licenseClass !== "all") {
      list = list.filter((q) => appliesToLicenseClass(q, licenseClass));
    }
    if (examPart !== "all") {
      list = list.filter((q) => matchesExamPart(q, examPart));
    }
    if (numericOnly) {
      list = list.filter(isNumericAnswerQuestion);
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
    } else if (mode === "selected") {
      const ids = new Set(loadSelectedSessionIds());
      list = list.filter((q) => ids.has(q.question_id));
    }
    setSessionQueue(sortList(list, sortBy, shuffleSeed));
    setIndex(0);

    // A fresh queue is a fresh practice run - start (and persist) a new run
    // record right away so even one abandoned mid-way still has its partial
    // progress saved, rather than only recording a run once it's finished.
    if (list.length > 0) {
      const { runId } = startRun(lang, {
        mode,
        filterSummary: buildFilterSummary({
          mode,
          filterTheme,
          filterChapter,
          filterPoints,
          filterMedia,
          examPart,
          licenseClass,
          numericOnly,
          filterTags,
          keyword,
        }),
        queueLength: list.length,
      });
      setCurrentRunId(runId);
    } else {
      setCurrentRunId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    allQuestions,
    filterPoints,
    filterTheme,
    filterChapter,
    filterMedia,
    filterTags,
    licenseClass,
    examPart,
    numericOnly,
    keyword,
    mode,
    sortBy,
    shuffleSeed,
    lang,
  ]);

  const current = sessionQueue[index];

  // Restore an answer only if you gave it earlier in THIS visit (so
  // Previous/Next shows what you just picked). A question you're seeing via
  // "weak"/"due"/"all" from an earlier session always starts fresh - that's
  // the point of revisiting it. A hazard-clip question with no in-session
  // answer starts gated on the video; anything else goes straight to the
  // question (with a still frame in place of the video, if it has one).
  useEffect(() => {
    if (!current) return;
    const stat = stats[current.question_id];
    const answeredThisVisit = sessionAnsweredIds.has(current.question_id);
    const prior = answeredThisVisit ? lastAttempt(stat) : undefined;
    setSelected(prior?.selected ?? []);
    setChecked(Boolean(prior));
    const hasVideo = (current.video_urls?.length ?? 0) > 0;
    setVideoStage(hasVideo && !prior ? "gate" : "revealed");

    // Snapshot mistake history from before today's attempt, for the
    // "you've missed this before" teaching prompt after checking.
    const priorWrongAttempts = (stat?.attempts ?? []).filter(
      (a) => !answeredThisVisit || a !== lastAttempt(stat)
    );
    const lastWrong = [...priorWrongAttempts].reverse().find((a) => !a.correct);
    setPriorHistory({
      wrongCount: priorWrongAttempts.filter((a) => !a.correct).length,
      lastWrongSelected: lastWrong?.selected ?? null,
    });
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
    setSessionAnsweredIds((prev) => new Set(prev).add(current.question_id));
    if (currentRunId) {
      appendRunAnswer(lang, currentRunId, {
        questionId: current.question_id,
        selected,
        correct: isCorrect,
        at: Date.now(),
      });
    }
  }

  function goTo(delta: number) {
    setIndex((i) => Math.min(Math.max(i + delta, 0), Math.max(total - 1, 0)));
  }

  function applySavedFilter(f: SavedFilter) {
    setMode(f.mode as Mode);
    setFilterTheme(f.theme);
    setFilterChapter(f.chapter);
    setFilterMedia(f.media as MediaFilter);
    setFilterPoints(f.points as PointsFilter);
    setNumericOnly(f.numericOnly ?? false);
    setExamPart((f.examPart as ExamPart) ?? "all");
    setFilterTags(f.tags ?? []);
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
      numericOnly,
      examPart,
      tags: filterTags,
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

  // Keyboard: 1-9 or A-Z pick an answer, Enter checks and then moves on.
  // Ignored while typing in a field or with the filter panel open.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!current || filtersOpen || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) && (target as HTMLInputElement).type !== "radio" && (target as HTMLInputElement).type !== "checkbox") return;
      if ((current.video_urls?.length ?? 0) > 0 && videoStage === "gate") return;
      if (e.key === "Enter") {
        if (target?.tagName === "BUTTON" || target?.tagName === "A") return;
        e.preventDefault();
        if (!checked) checkAnswer();
        else if (index < total - 1) goTo(1);
        return;
      }
      if (checked || isFreeEntryQuestion(current)) return;
      const k = e.key.toUpperCase();
      const byNumber = /^[1-9]$/.test(k) ? current.options[Number(k) - 1] : undefined;
      const byLetter = current.options.find((o) => plainLetter(o.letter).toUpperCase() === k);
      const opt = byNumber ?? byLetter;
      if (opt) {
        e.preventDefault();
        toggleOption(opt.letter);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (loadError) {
    return (
      <main className="max-w-2xl mx-auto w-full p-4">
        <div role="alert" className="rounded-[10px] bg-destructive/10 px-4 py-3">
          <p className="font-semibold text-destructive">Couldn&rsquo;t load the questions</p>
          <p className="text-sm mt-0.5">{loadError}. Check your connection and reload the page.</p>
        </div>
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

  const filterSummary = buildFilterSummary({
    mode,
    filterTheme,
    filterChapter,
    filterPoints,
    filterMedia,
    examPart,
    licenseClass,
    numericOnly,
    filterTags,
    keyword,
  });

  const progressPct = total > 0 ? ((index + 1) / total) * 100 : 0;
  const multiAnswer = current ? current.correct_answers.length > 1 : false;
  const currentHasVideo = (current?.video_urls?.length ?? 0) > 0;
  const gated = Boolean(current && currentHasVideo && videoStage === "gate");
  const correctLetters = current ? current.correct_answers.map((c) => c.letter) : [];
  const missedLetters = correctLetters.filter((l) => !selected.includes(l)).map(plainLetter);
  const wrongPicks = selected.filter((l) => !correctLetters.includes(l));
  const correctShown = correctLetters.map(plainLetter);

  let verdictTitle = "Correct";
  if (checked && !isCorrectAnswer && current) {
    if (isFreeEntryQuestion(current)) verdictTitle = `Not quite — the answer is ${correctShown.join(", ")}`;
    else if (wrongPicks.length === 0 && missedLetters.length > 0)
      verdictTitle = `Not quite — you missed ${missedLetters.join(" and ")}`;
    else
      verdictTitle = `Not quite — the answer is ${correctShown.join(" and ")}`;
  }

  return (
    <main className="max-w-2xl mx-auto w-full px-4 pt-4 pb-28 flex-1">
      <div className="flex items-end justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h1 className="font-display font-bold text-[28px] leading-8">Practice</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            <span className="tabular">{attemptedIds.length}</span> answered ·{" "}
            <span className="tabular">{correctNowCount}</span> correct
            {dueCount > 0 && (
              <>
                {" · "}
                <button className="font-semibold text-foreground underline underline-offset-2" onClick={() => setMode("due")}>
                  {dueCount} due
                </button>
              </>
            )}
          </p>
        </div>
        {total > 0 && (
          <span className="text-sm text-muted-foreground tabular shrink-0">
            {index + 1} / {total}
          </span>
        )}
      </div>

      <button
        onClick={() => setFiltersOpen(true)}
        className="w-full flex items-center gap-2 h-10 px-3 mb-3 rounded-full border border-input bg-card text-left text-[13px] font-semibold hover:bg-secondary transition-colors"
      >
        <MixerHorizontalIcon className="h-4 w-4 shrink-0" />
        <span className="truncate flex-1">{filterSummary}</span>
        <span className="text-muted-foreground font-medium shrink-0">Filters</span>
      </button>

      {filtersOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 md:flex md:items-center md:justify-center md:p-6" onClick={() => setFiltersOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 md:static md:w-full md:max-w-lg md:max-h-[85vh] md:rounded-2xl md:border md:border-border md:shadow-xl bg-background flex flex-col overflow-hidden"
          >
            <div className="safe-top flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
              <h2 className="font-semibold text-[17px]">Filters</h2>
              <Button variant="ghost" size="sm" onClick={() => setFiltersOpen(false)}>
                Done
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
              <FilterGroup label="Mode" hint={MODE_INFO[mode].hint}>
                <Segmented
                  label="Mode"
                  options={VISIBLE_MODES.map((m) => ({ value: m, label: MODE_INFO[m].label, title: MODE_INFO[m].hint }))}
                  value={mode}
                  onChange={setMode}
                />
              </FilterGroup>

              <FilterGroup label="Category">
                <div className="flex flex-wrap gap-2">
                  <Chip active={filterTheme === "all"} onClick={() => setFilterTheme("all")}>
                    All
                  </Chip>
                  {themes.map((t) => (
                    <Chip key={t} active={filterTheme === t} onClick={() => setFilterTheme(t)}>
                      {themeLabel(t)}
                    </Chip>
                  ))}
                </div>
              </FilterGroup>

              <FilterGroup label="Points">
                <Segmented
                  label="Points"
                  options={[
                    { value: "all" as PointsFilter, label: "Any" },
                    { value: "2" as PointsFilter, label: "2" },
                    { value: "3" as PointsFilter, label: "3" },
                    { value: "4" as PointsFilter, label: "4" },
                    { value: "5" as PointsFilter, label: "5" },
                  ]}
                  value={filterPoints}
                  onChange={setFilterPoints}
                />
              </FilterGroup>

              <FilterGroup label="Order">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select
                      aria-label="Order"
                      className="w-full h-11 appearance-none rounded-[10px] border border-input bg-card pl-3 pr-9 text-base"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortBy)}
                    >
                      <option value="points-desc">Points, high to low</option>
                      <option value="points-asc">Points, low to high</option>
                      <option value="theme">Category A–Z</option>
                      <option value="chapter">Chapter</option>
                      <option value="random">Shuffled</option>
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  {sortBy === "random" && (
                    <Button variant="outline" onClick={() => setShuffleSeed((s) => s + 1)}>
                      <ShuffleIcon /> Reshuffle
                    </Button>
                  )}
                </div>
              </FilterGroup>

              <button
                onClick={() => setAdvancedOpen((o) => !o)}
                aria-expanded={advancedOpen}
                className="w-full flex items-center justify-between gap-3 rounded-[10px] border border-input bg-card px-4 py-3 text-left hover:bg-secondary transition-colors"
              >
                <span>
                  <span className="block font-semibold text-[15px]">More filters</span>
                  <span className="block text-[13px] text-muted-foreground">
                    Exam part, chapter, media, topics, keyword
                  </span>
                </span>
                <ChevronDownIcon className={`h-4 w-4 shrink-0 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
              </button>

              {advancedOpen && (
                <div className="space-y-6">
                  <FilterGroup label="Exam part">
                    <Segmented
                      label="Exam part"
                      options={(["all", "grundstoff", "zusatzstoff"] as ExamPart[]).map((p) => ({
                        value: p,
                        title:
                          p === "grundstoff"
                            ? "Grundstoff - basic knowledge, asked in every license class"
                            : p === "zusatzstoff"
                            ? "Zusatzstoff - the class-specific half of the exam"
                            : "Both parts",
                        label:
                          p === "all"
                            ? "Both"
                            : p === "grundstoff"
                            ? "Basic"
                            : licenseClass === "B"
                            ? "Class B"
                            : "Class-specific",
                      }))}
                      value={examPart}
                      onChange={setExamPart}
                    />
                  </FilterGroup>

                  <FilterGroup label={`Chapter${filterTheme !== "all" ? ` in ${themeLabel(filterTheme)}` : ""}`}>
                    <div className="relative">
                      <select
                        aria-label="Chapter"
                        className="w-full h-11 appearance-none rounded-[10px] border border-input bg-card pl-3 pr-9 text-base"
                        value={filterChapter}
                        onChange={(e) => setFilterChapter(e.target.value)}
                      >
                        <option value="all">All chapters</option>
                        {chapters.map((c) => (
                          <option key={c} value={c}>
                            {chapterLabel(c)}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FilterGroup>

                  <FilterGroup label="Media">
                    <div className="flex flex-wrap gap-2">
                      {([
                        ["all", "Any"],
                        ["video", "Video"],
                        ["image", "Picture"],
                        ["none", "Text only"],
                      ] as [MediaFilter, string][]).map(([value, label]) => (
                        <Chip key={value} active={filterMedia === value} onClick={() => setFilterMedia(value)}>
                          {label}
                        </Chip>
                      ))}
                      <Chip active={numericOnly} onClick={() => setNumericOnly(!numericOnly)}>
                        Numbers only
                      </Chip>
                    </div>
                  </FilterGroup>

                  <FilterGroup label={`Topics${filterTags.length > 0 ? ` · ${filterTags.length} selected` : ""}`}>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map((t) => (
                        <Chip
                          key={t}
                          active={filterTags.includes(t)}
                          onClick={() =>
                            setFilterTags((prev) =>
                              prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
                            )
                          }
                        >
                          {tagLabel(t)}
                        </Chip>
                      ))}
                    </div>
                  </FilterGroup>

                  <FilterGroup label="Keyword in question text">
                    <div className="relative">
                      <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="e.g. Anhänger, Einbahn, Vorfahrt"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="w-full h-11 rounded-[10px] border border-input bg-card pl-9 pr-3 text-base placeholder:text-muted-foreground"
                      />
                    </div>
                  </FilterGroup>

                  <FilterGroup label="Saved filters">
                    {savedFilters.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {savedFilters.map((f) => (
                          <span
                            key={f.id}
                            className="inline-flex items-center h-[34px] rounded-full border border-input bg-card text-[13px] font-semibold overflow-hidden"
                          >
                            <button className="pl-3 pr-2 h-full hover:bg-secondary" onClick={() => applySavedFilter(f)}>
                              {f.name}
                            </button>
                            <button
                              onClick={() => deleteSavedFilter(f.id)}
                              className="pr-2.5 pl-1 h-full text-muted-foreground hover:text-destructive hover:bg-secondary"
                              aria-label={`Delete ${f.name}`}
                            >
                              <Cross2Icon className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <Button variant="outline" size="sm" className="w-full" onClick={saveCurrentFilter}>
                      <BookmarkIcon /> Save this combination
                    </Button>
                  </FilterGroup>

                  <p className="text-[13px] text-muted-foreground">
                    Language and licence class are set at the top of the page and apply everywhere.
                  </p>
                </div>
              )}
            </div>

            <div className="safe-bottom border-t border-border p-4 shrink-0">
              <Button className="w-full" onClick={() => setFiltersOpen(false)}>
                Show {total} question{total === 1 ? "" : "s"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {total > 0 && (
        <div className="h-1.5 rounded-full bg-secondary mb-4 overflow-hidden" aria-hidden="true">
          <div className="h-full rounded-full bg-signal transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      )}

      {total === 0 && (
        <div className="flex flex-col items-center gap-1.5 text-center rounded-2xl border-[1.5px] border-dashed border-input px-4 py-10 mt-4">
          <p className="text-[17px] font-semibold">
            {mode === "new" ? "Nothing new in this set" : "No questions match"}
          </p>
          <p className="text-sm text-muted-foreground mb-3 max-w-sm">
            {mode === "new"
              ? "You've answered every question in this set already."
              : mode === "due"
              ? "Nothing is due for review right now — come back later."
              : mode === "selected"
              ? "Nothing was selected — pick some questions on the History page first."
              : "Try a different category, points or media filter."}
          </p>
          {mode === "new" ? (
            <Button size="sm" onClick={() => setMode("all")}>Practise this set again</Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setFiltersOpen(true)}>Change filters</Button>
          )}
        </div>
      )}

      {current && (
        <section className="rounded-2xl border border-border bg-card shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
              {themeLabel(current.theme_name)}
            </span>
            <span
              className={`inline-flex items-center h-[22px] px-2 rounded-full text-xs font-semibold shrink-0 ${
                current.pointsValue === 5 ? "bg-signal text-signal-foreground" : "bg-secondary text-foreground"
              }`}
            >
              {current.points}
            </span>
          </div>

          {gated ? (
            <QuestionVideoGate
              src={current.video_urls![0]}
              poster={current.image_urls?.[0]}
              onContinue={() => setVideoStage("revealed")}
            />
          ) : (
            <>
              {/* Once revealed, show the clip's still frame as a plain image
                  rather than the video itself. */}
              <QuestionMedia imageUrls={current.image_urls} videoUrls={undefined} />
              {currentHasVideo && (
                <button
                  onClick={() => setVideoStage("gate")}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-2 mb-4 -mt-2"
                >
                  <PlayIcon /> Watch clip again
                </button>
              )}

              <p className="text-[19px] leading-7 font-medium mb-4">{current.question_text}</p>

              {isFreeEntryQuestion(current) ? (
                <div className="mb-1">
                  <label htmlFor="free-entry" className="block text-[13px] font-semibold mb-1.5">
                    Type the number
                  </label>
                  <input
                    id="free-entry"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={selected[0] ?? ""}
                    onChange={(e) =>
                      setSelected(e.target.value === "" ? [] : [e.target.value])
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !checked && selected.length > 0) checkAnswer();
                    }}
                    disabled={checked}
                    placeholder="e.g. 50"
                    className={`w-full h-14 rounded-[10px] border-[1.5px] px-4 font-display font-semibold text-[22px] tabular bg-card transition-colors placeholder:font-sans placeholder:font-normal placeholder:text-base placeholder:text-muted-foreground ${
                      checked
                        ? isCorrectAnswer
                          ? "border-success bg-success/10"
                          : "border-destructive bg-destructive/10"
                        : "border-input"
                    }`}
                  />
                </div>
              ) : (
                <>
                  {multiAnswer && !checked && (
                    <p className="text-[13px] font-medium text-muted-foreground -mt-2 mb-3">
                      Select all that apply
                    </p>
                  )}
                  <div className="space-y-2" role={multiAnswer ? "group" : "radiogroup"} aria-label="Answers">
                    {current.options.map((opt) => (
                      <AnswerOption
                        key={opt.letter}
                        letter={opt.letter}
                        text={opt.text}
                        multi={multiAnswer}
                        selected={selected.includes(opt.letter)}
                        isCorrect={correctLetters.includes(opt.letter)}
                        checked={checked}
                        onToggle={() => toggleOption(opt.letter)}
                      />
                    ))}
                  </div>
                </>
              )}

              {checked && (
                <div className="mt-4">
                  <div
                    role="status"
                    className={`flex items-center gap-3 rounded-[10px] px-4 py-3 ${
                      isCorrectAnswer ? "bg-success/10" : "bg-destructive/10"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        isCorrectAnswer
                          ? "bg-success text-success-foreground"
                          : "bg-destructive text-destructive-foreground"
                      }`}
                    >
                      {isCorrectAnswer ? <CheckIcon className="h-4 w-4" /> : <Cross2Icon className="h-4 w-4" />}
                    </span>
                    <p className={`font-bold text-[17px] leading-6 ${isCorrectAnswer ? "text-success" : "text-destructive"}`}>
                      {verdictTitle}
                    </p>
                  </div>

                  {priorHistory.wrongCount > 0 &&
                    (isCorrectAnswer ? (
                      <p className="mt-3 text-sm text-muted-foreground">
                        You&rsquo;d missed this one before — this time you got it.
                      </p>
                    ) : (
                      <div className="mt-3 rounded-[10px] bg-warning/10 px-4 py-3 text-sm">
                        <p className="flex items-center gap-1.5 font-semibold text-warning">
                          <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
                          You&rsquo;ve missed this {priorHistory.wrongCount + 1} times
                        </p>
                        {priorHistory.lastWrongSelected?.length ? (
                          <p className="mt-0.5">Last time you picked {priorHistory.lastWrongSelected.map(plainLetter).join(", ")}.</p>
                        ) : null}
                      </div>
                    ))}

                  {current.comment && (
                    <p className="mt-3 text-[15px] leading-[23px] whitespace-pre-wrap">{current.comment}</p>
                  )}

                  {!isCorrectAnswer &&
                    appliesToLicenseClass(current, "B") &&
                    getTheoryNotesForTags(getContentTags(current)).map((note, i) => (
                      <div key={i} className="mt-3 rounded-[10px] border border-border bg-background px-4 py-3">
                        <p className="flex items-center gap-1.5 text-sm font-semibold mb-1">
                          <ReaderIcon className="h-4 w-4 shrink-0" /> Rule to remember: {note.title}
                        </p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.body}</p>
                      </div>
                    ))}

                  {current.url && (
                    <a
                      href={current.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-3 text-[13px] text-muted-foreground underline underline-offset-2"
                    >
                      Source
                    </a>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {total > 0 && isLastQuestion && checked && (
        <div className="mt-4 rounded-[10px] bg-secondary px-4 py-3 text-sm">
          <p className="font-semibold mb-0.5">That&rsquo;s the last question in this set.</p>
          <p className="text-muted-foreground">
            This run is saved in{" "}
            <Link href="/history" className="text-foreground underline underline-offset-2">
              History
            </Link>
            , where you can redo anything you got wrong. Change the filters to keep going, or check{" "}
            <Link href="/insights" className="text-foreground underline underline-offset-2">
              Insights
            </Link>{" "}
            for your patterns.
          </p>
        </div>
      )}

      {/* Fixed action bar: the one primary action always sits under the
          thumb - Check answer, then Next question. */}
      {current && !gated && (
        <div className="fixed inset-x-0 bottom-tabbar z-10 bg-background shadow-bar">
          <div className="max-w-2xl mx-auto flex items-center gap-2 px-4 py-3">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous question"
              onClick={() => goTo(-1)}
              disabled={index === 0}
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
            {!checked ? (
              <Button className="flex-1" onClick={checkAnswer} disabled={selected.length === 0}>
                Check answer
              </Button>
            ) : isLastQuestion ? (
              <Button asChild className="flex-1">
                <Link href="/history">See this run in History</Link>
              </Button>
            ) : (
              <Button className="flex-1" onClick={() => goTo(1)}>
                Next question <ArrowRightIcon className="h-4 w-4" />
              </Button>
            )}
            {!checked && !isLastQuestion && (
              <Button variant="ghost" onClick={() => goTo(1)} className="text-muted-foreground">
                Skip
              </Button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function FilterGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{label}</div>
      {children}
      {hint && <p className="text-[13px] text-muted-foreground mt-1.5">{hint}</p>}
    </div>
  );
}

// One answer. The whole row is the hit target; a letter key on the left is
// round for single-answer questions, square for "select all that apply".
// After checking, each row says what happened in words as well as colour.
function AnswerOption({
  letter,
  text,
  multi,
  selected,
  isCorrect,
  checked,
  onToggle,
}: {
  letter: string;
  text: string;
  multi: boolean;
  selected: boolean;
  isCorrect: boolean;
  checked: boolean;
  onToggle: () => void;
}) {
  let state: "idle" | "selected" | "correct" | "incorrect" | "missed" = selected ? "selected" : "idle";
  if (checked) {
    if (isCorrect && selected) state = "correct";
    else if (isCorrect) state = "missed";
    else if (selected) state = "incorrect";
    else state = "idle";
  }
  const row = {
    idle: "border-input bg-card",
    selected: "border-foreground bg-card ring-1 ring-inset ring-foreground",
    correct: "border-success bg-success/10 ring-1 ring-inset ring-success",
    incorrect: "border-destructive bg-destructive/10 ring-1 ring-inset ring-destructive",
    missed: "border-success border-dashed border-[1.5px] bg-card",
  }[state];
  const key = {
    idle: "border-input text-muted-foreground",
    selected: "bg-foreground border-foreground text-background",
    correct: "bg-success border-success text-success-foreground",
    incorrect: "bg-destructive border-destructive text-destructive-foreground",
    missed: "border-success text-success",
  }[state];
  return (
    <label
      className={`flex items-start gap-3 rounded-[10px] border py-3.5 pl-3.5 pr-3 transition-colors ${row} ${
        checked ? "cursor-default" : "cursor-pointer hover:bg-secondary/60"
      }`}
    >
      <input
        type={multi ? "checkbox" : "radio"}
        name="answer"
        checked={selected}
        onChange={onToggle}
        disabled={checked}
        className="peer sr-only"
      />
      <span
        className={`mt-px flex h-6 w-6 shrink-0 items-center justify-center border-[1.5px] text-[13px] font-semibold peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring ${
          multi ? "rounded-md" : "rounded-full"
        } ${key}`}
      >
        {plainLetter(letter)}
      </span>
      <span className="flex-1 text-base leading-6">{text}</span>
      {state === "correct" && (
        <span className="flex items-center gap-1 text-[13px] font-semibold leading-6 text-success shrink-0">
          <CheckIcon /> Correct
        </span>
      )}
      {state === "incorrect" && (
        <span className="flex items-center gap-1 text-[13px] font-semibold leading-6 text-destructive shrink-0">
          <Cross2Icon /> Your answer
        </span>
      )}
      {state === "missed" && (
        <span className="flex items-center gap-1 text-[13px] font-semibold leading-6 text-success shrink-0">
          <CheckIcon /> Missed
        </span>
      )}
    </label>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<main className="max-w-2xl mx-auto p-4 text-muted-foreground">Loading…</main>}>
      <PracticeInner />
    </Suspense>
  );
}
