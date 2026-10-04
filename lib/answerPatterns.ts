// Answer-pattern analysis over the live catalog: how answers are structured
// (how many are correct per question), and which words in an answer option
// tend to mean "correct" or "wrong". Computed at runtime from whatever
// questions are in scope, so the numbers shown are always the real ones for
// the current license class and language - nothing here is hard-coded.

import type { DrivingQuestion, Language } from "./drivingQuestions";

export interface Marker {
  id: string;
  label: string; // shown to the user, in the active language
  re: Record<Language, RegExp>;
}

// "Green" markers: hedged, cautious wording - usually a correct option.
export const GREEN_MARKERS: Marker[] = [
  { id: "can", label: "kann / können / könnte · can / could / may", re: { de: /\b(kann|können|könnte|könnten)\b/i, en: /\b(can|could|may|might)\b/i } },
  { id: "possible", label: "möglich · possible", re: { de: /möglich/i, en: /possib/i } },
  { id: "readyBrake", label: "bremsbereit · ready to brake", re: { de: /bremsbereit/i, en: /ready to brake|prepared to brake/i } },
  { id: "reduceSpeed", label: "Geschwindigkeit verringern · reduce speed", re: { de: /(geschwindigkeit|tempo).{0,30}(verringer|reduzier|vermindern|herabsetz)|(verringer|reduzier|vermindern|herabsetz).{0,30}(geschwindigkeit|tempo)/i, en: /reduce (my |the |your )?speed|slow down|lower (my )?speed/i } },
  { id: "expect", label: "rechnen mit · expect / anticipate", re: { de: /rechne/i, en: /expect|anticipat/i } },
];

// "Red" markers: absolute or aggressive wording - usually a wrong option.
export const RED_MARKERS: Marker[] = [
  { id: "always", label: "immer · always", re: { de: /\bimmer\b/i, en: /\balways\b/i } },
  { id: "never", label: "nie / niemals / stets · never", re: { de: /\bnie(mals)?\b|\bstets\b/i, en: /\bnever\b/i } },
  { id: "horn", label: "hupen / Schallzeichen · horn", re: { de: /hupe|schallzeichen/i, en: /\bhorn\b|honk/i } },
  { id: "flash", label: "Lichthupe · flash headlights", re: { de: /lichthupe/i, en: /flash (my |your )?(head)?lights/i } },
  { id: "brisk", label: "zügig · briskly / quickly", re: { de: /zügig/i, en: /\bquickly\b|\bbriskly\b/i } },
  { id: "carryOn", label: "weiterfahren · continue driving (as before)", re: { de: /weiterfahr|fahre weiter|wie bisher/i, en: /continue (driving|my journey)|drive on\b|as before/i } },
  { id: "only", label: "nur · only", re: { de: /\bnur\b/i, en: /\bonly\b/i } },
];

export interface OptionHit {
  question: DrivingQuestion;
  optionText: string;
  correct: boolean;
}

export interface MarkerStat {
  marker: Marker;
  options: number;
  correct: number;
  /** Options where this marker points the wrong way (correct red / wrong green). */
  exceptions: OptionHit[];
}

export interface PatternSummary {
  multipleChoice: number;
  typedNumber: number;
  moreThanOneCorrect: number;
  allCorrect: number;
  options: number;
  correctOptions: number;
  green: MarkerStat[];
  red: MarkerStat[];
}

function statFor(marker: Marker, questions: DrivingQuestion[], lang: Language, red: boolean): MarkerStat {
  const stat: MarkerStat = { marker, options: 0, correct: 0, exceptions: [] };
  for (const q of questions) {
    const correctLetters = new Set(q.correct_answers.map((c) => c.letter));
    for (const o of q.options) {
      if (!marker.re[lang].test(o.text)) continue;
      const correct = correctLetters.has(o.letter);
      stat.options++;
      if (correct) stat.correct++;
      if (correct === red) stat.exceptions.push({ question: q, optionText: o.text, correct });
    }
  }
  return stat;
}

export function summarizePatterns(questions: DrivingQuestion[], lang: Language): PatternSummary {
  const mc = questions.filter((q) => q.options.length > 0);
  let options = 0;
  let correctOptions = 0;
  for (const q of mc) {
    options += q.options.length;
    correctOptions += q.correct_answers.length;
  }
  return {
    multipleChoice: mc.length,
    typedNumber: questions.length - mc.length,
    moreThanOneCorrect: mc.filter((q) => q.correct_answers.length > 1).length,
    allCorrect: mc.filter((q) => q.correct_answers.length === q.options.length).length,
    options,
    correctOptions,
    green: GREEN_MARKERS.map((m) => statFor(m, mc, lang, false)),
    red: RED_MARKERS.map((m) => statFor(m, mc, lang, true)),
  };
}

export function pct(part: number, whole: number): number {
  return whole > 0 ? Math.round((100 * part) / whole) : 0;
}

/**
 * What a pure "marker word" strategy would score with the exam's
 * all-or-nothing marking: tick an option if it has a green marker, untick it
 * if it has a red one, otherwise tick it (since most options are correct).
 * Shown so the guide can be honest that markers are tie-breakers, not a way
 * to pass on their own.
 */
export function markerStrategyScore(questions: DrivingQuestion[], lang: Language): { right: number; total: number } {
  const mc = questions.filter((q) => q.options.length > 0);
  let right = 0;
  for (const q of mc) {
    const correct = new Set(q.correct_answers.map((c) => c.letter));
    const allRight = q.options.every((o) => {
      const tick = GREEN_MARKERS.some((m) => m.re[lang].test(o.text))
        ? true
        : RED_MARKERS.some((m) => m.re[lang].test(o.text))
        ? false
        : true;
      return tick === correct.has(o.letter);
    });
    if (allRight) right++;
  }
  return { right, total: mc.length };
}

/** Share of questions whose FIRST listed option is correct - a dataset artefact (correct answers are listed first). */
export function firstOptionCorrectShare(questions: DrivingQuestion[]): number {
  const mc = questions.filter((q) => q.options.length > 0);
  const first = mc.filter((q) => q.correct_answers.some((c) => c.letter === q.options[0].letter)).length;
  return pct(first, mc.length);
}
