"use client";

// A "practice run" is one sitting in Practice: everything answered from the
// moment a session queue is built until you leave/change filters, kept as
// its own record (separate from the per-question stats in practiceStats.ts,
// which only remember the latest/aggregate picture per question). This is
// what lets someone look back at "the run I did on Tuesday" specifically,
// re-drill exactly the questions they got wrong in it, and see whether
// they're doing better run over run - none of which a per-question view can
// show on its own.

export interface RunAnswer {
  questionId: string;
  selected: string[];
  correct: boolean;
  at: number; // epoch ms
}

export interface PracticeRun {
  id: string;
  lang: string;
  mode: string; // Mode from the practice page, at the time the run started
  filterSummary: string; // human-readable description, e.g. "New · Right of Way"
  startedAt: number;
  updatedAt: number; // bumped on every answer; doubles as "finished at" for a completed run
  queueLength: number; // how many questions were queued when the run started
  answers: RunAnswer[]; // one per question answered so far, in order
}

const MAX_RUNS_KEPT = 200;

function runsKey(lang: string) {
  return `marky:practice-runs:v1:${lang}`;
}

export function loadRuns(lang: string): PracticeRun[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(runsKey(lang));
    return raw ? (JSON.parse(raw) as PracticeRun[]) : [];
  } catch {
    return [];
  }
}

export function saveRuns(lang: string, runs: PracticeRun[]) {
  try {
    window.localStorage.setItem(runsKey(lang), JSON.stringify(runs));
  } catch {
    // ignore - private mode / storage disabled
  }
}

/** Start a new run and persist it immediately (so an abandoned run with zero
 * answers still shows up rather than silently vanishing). Returns the full
 * updated list plus the new run's id. */
export function startRun(
  lang: string,
  meta: { mode: string; filterSummary: string; queueLength: number }
): { runs: PracticeRun[]; runId: string } {
  const now = Date.now();
  const run: PracticeRun = {
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    lang,
    mode: meta.mode,
    filterSummary: meta.filterSummary,
    startedAt: now,
    updatedAt: now,
    queueLength: meta.queueLength,
    answers: [],
  };
  const runs = [run, ...loadRuns(lang)].slice(0, MAX_RUNS_KEPT);
  saveRuns(lang, runs);
  return { runs, runId: run.id };
}

/** Append (or, if the same question is re-answered within this run,
 * overwrite) an answer on the given run. */
export function appendRunAnswer(
  lang: string,
  runId: string,
  answer: RunAnswer
): PracticeRun[] {
  const runs = loadRuns(lang);
  const idx = runs.findIndex((r) => r.id === runId);
  if (idx === -1) return runs;
  const run = runs[idx];
  const answers = run.answers.filter((a) => a.questionId !== answer.questionId);
  answers.push(answer);
  const updated: PracticeRun = { ...run, answers, updatedAt: Date.now() };
  const next = [...runs];
  next[idx] = updated;
  saveRuns(lang, next);
  return next;
}

export function getRun(lang: string, runId: string): PracticeRun | undefined {
  return loadRuns(lang).find((r) => r.id === runId);
}

export function deleteRun(lang: string, runId: string): PracticeRun[] {
  const next = loadRuns(lang).filter((r) => r.id !== runId);
  saveRuns(lang, next);
  return next;
}

export function runWrongIds(run: PracticeRun): string[] {
  return run.answers.filter((a) => !a.correct).map((a) => a.questionId);
}

export function runScore(run: PracticeRun): { answered: number; correct: number; accuracy: number } {
  const answered = run.answers.length;
  const correct = run.answers.filter((a) => a.correct).length;
  return { answered, correct, accuracy: answered > 0 ? correct / answered : 0 };
}

/** Only runs with at least one answer - a run started and immediately
 * abandoned (filters changed before answering anything) isn't worth
 * surfacing in history. */
export function completedRuns(runs: PracticeRun[]): PracticeRun[] {
  return runs.filter((r) => r.answers.length > 0);
}

/** Accuracy per run, oldest first, for a simple "am I improving" trend line. */
export function accuracyTrend(runs: PracticeRun[]): { run: PracticeRun; accuracy: number }[] {
  return completedRuns(runs)
    .slice()
    .sort((a, b) => a.startedAt - b.startedAt)
    .map((run) => ({ run, accuracy: runScore(run).accuracy }));
}
