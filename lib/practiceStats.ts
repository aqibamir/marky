"use client";

// Per-question practice history, stored client-side (localStorage) per
// language. Tracks every attempt (not just the latest), which is what lets
// the Insights page find patterns in what you keep getting wrong, and
// drives a light spaced-repetition schedule (a simplified SM-2): a wrong
// answer makes a question due again immediately, a correct answer pushes
// it further out each time you get it right in a row.

export interface AttemptRecord {
  selected: string[];
  correct: boolean;
  at: number; // epoch ms
}

export interface QuestionStat {
  attempts: AttemptRecord[]; // most recent last, capped
  correctCount: number;
  wrongCount: number;
  correctStreak: number;
  ease: number; // 1.3 - 2.6
  interval: number; // days until next due
  dueAt: number; // epoch ms
}

export type StatsMap = Record<string, QuestionStat>;

const MAX_ATTEMPTS_KEPT = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

function statsKey(lang: string) {
  return `marky:driving-stats:v2:${lang}`;
}

// v1 only stored the latest answer per question - migrate it once so
// existing progress isn't lost when this schema shipped.
function legacyKey(lang: string) {
  return `marky:driving-practice:${lang}`;
}

export function loadStats(lang: string): StatsMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(statsKey(lang));
    if (raw) return JSON.parse(raw) as StatsMap;

    const legacyRaw = window.localStorage.getItem(legacyKey(lang));
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw) as Record<
        string,
        { selected: string[]; correct: boolean }
      >;
      const now = Date.now();
      const migrated: StatsMap = {};
      for (const [id, rec] of Object.entries(legacy)) {
        migrated[id] = {
          attempts: [{ selected: rec.selected, correct: rec.correct, at: now }],
          correctCount: rec.correct ? 1 : 0,
          wrongCount: rec.correct ? 0 : 1,
          correctStreak: rec.correct ? 1 : 0,
          ease: 2.5,
          interval: rec.correct ? 1 : 0,
          dueAt: rec.correct ? now + DAY_MS : now,
        };
      }
      saveStats(lang, migrated);
      return migrated;
    }
  } catch {
    // ignore - private mode / storage disabled
  }
  return {};
}

export function saveStats(lang: string, stats: StatsMap) {
  try {
    window.localStorage.setItem(statsKey(lang), JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function recordAttempt(
  stats: StatsMap,
  questionId: string,
  selected: string[],
  correct: boolean
): StatsMap {
  const now = Date.now();
  const prev = stats[questionId];
  const attempts = [...(prev?.attempts ?? []), { selected, correct, at: now }].slice(
    -MAX_ATTEMPTS_KEPT
  );

  let ease = prev?.ease ?? 2.5;
  let interval = prev?.interval ?? 0;
  let correctStreak = prev?.correctStreak ?? 0;

  if (correct) {
    correctStreak += 1;
    ease = Math.min(2.6, ease + 0.1);
    interval = correctStreak === 1 ? 1 : correctStreak === 2 ? 3 : Math.round((interval || 3) * ease);
  } else {
    correctStreak = 0;
    ease = Math.max(1.3, ease - 0.25);
    interval = 0; // due again right away
  }

  return {
    ...stats,
    [questionId]: {
      attempts,
      correctCount: (prev?.correctCount ?? 0) + (correct ? 1 : 0),
      wrongCount: (prev?.wrongCount ?? 0) + (correct ? 0 : 1),
      correctStreak,
      ease,
      interval,
      dueAt: now + interval * DAY_MS,
    },
  };
}

export function isDue(stat: QuestionStat | undefined, now = Date.now()): boolean {
  return Boolean(stat) && stat!.dueAt <= now;
}

export function lastAttempt(stat: QuestionStat | undefined): AttemptRecord | undefined {
  if (!stat || stat.attempts.length === 0) return undefined;
  return stat.attempts[stat.attempts.length - 1];
}

export function lastCorrect(stat: QuestionStat | undefined): boolean | undefined {
  return lastAttempt(stat)?.correct;
}

// --- activity / streak (for the Insights overview) ---

function dayKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

/** Attempt counts per calendar day, across every question. */
export function activityByDay(stats: StatsMap): Record<string, number> {
  const days: Record<string, number> = {};
  for (const stat of Object.values(stats)) {
    for (const a of stat.attempts) {
      const k = dayKey(a.at);
      days[k] = (days[k] ?? 0) + 1;
    }
  }
  return days;
}

/** Consecutive days practiced, counting back from today (or yesterday, so a
 * streak doesn't reset to 0 just because you haven't practiced yet today). */
export function currentStreak(days: Record<string, number>): number {
  const now = Date.now();
  let streak = 0;
  let cursor = now;
  if (!days[dayKey(now)]) {
    cursor = now - DAY_MS; // haven't practiced today yet - check yesterday
  }
  while (days[dayKey(cursor)]) {
    streak += 1;
    cursor -= DAY_MS;
  }
  return streak;
}

/** Last N days as { key, count } oldest-first, for a calendar-strip view. */
export function lastNDays(days: Record<string, number>, n: number) {
  const now = Date.now();
  const out: { key: string; count: number }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const k = dayKey(now - i * DAY_MS);
    out.push({ key: k, count: days[k] ?? 0 });
  }
  return out;
}

// --- user-defined saved filter presets ---

export interface SavedFilter {
  id: string;
  name: string;
  mode: string;
  theme: string;
  chapter: string;
  media: string;
  points: string;
  numericOnly?: boolean;
  examPart?: string;
  tags?: string[];
  keyword: string;
  sortBy: string;
}

const SAVED_FILTERS_KEY = "marky:driving-saved-filters";

export function loadSavedFilters(): SavedFilter[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVED_FILTERS_KEY);
    return raw ? (JSON.parse(raw) as SavedFilter[]) : [];
  } catch {
    return [];
  }
}

export function saveSavedFilters(filters: SavedFilter[]) {
  try {
    window.localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(filters));
  } catch {
    // ignore
  }
}

// --- "forget" (remove tracking so a question returns to the New pool) ---

export function forgetQuestions(stats: StatsMap, questionIds: string[]): StatsMap {
  const next = { ...stats };
  for (const id of questionIds) delete next[id];
  return next;
}

// --- hand-off from the History page to Practice: "redo just these" ---

const SELECTED_SESSION_KEY = "marky:custom-session-ids";

export function saveSelectedSessionIds(ids: string[]) {
  try {
    window.localStorage.setItem(SELECTED_SESSION_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export function loadSelectedSessionIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SELECTED_SESSION_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}
