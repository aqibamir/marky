// Answer-pattern analysis over the live catalog: how answers are structured
// (how many are correct per question), and which words in an answer option
// tend to mean "correct" or "wrong". Computed at runtime from whatever
// questions are in scope, so the numbers shown are always the real ones for
// the current license class and language - nothing here is hard-coded.

import type { DrivingQuestion, Language } from "./drivingQuestions";

export interface Marker {
  id: string;
  label: Record<Language, string>;
  // A language can leave a marker out when the word doesn't carry the same
  // signal there (e.g. English "may" is mostly permission - "you may pass" -
  // and only 64% correct, while German "kann" is 82%).
  re: Partial<Record<Language, RegExp>>;
}

// "Green" markers: hedged, cautious wording - usually a correct option.
// Each regex was tuned on that language's own wording of the catalog.
export const GREEN_MARKERS: Marker[] = [
  { id: "can", label: { de: "kann / können / könnte", en: "could / might" }, re: { de: /\b(kann|können|könnte|könnten)\b/i, en: /\b(could|might)\b/i } },
  { id: "possible", label: { de: "möglich", en: "possible / possibly" }, re: { de: /möglich/i, en: /possib/i } },
  { id: "ifNecessary", label: { de: "gegebenenfalls / notfalls", en: "if necessary" }, re: { de: /gegebenenfalls|notfalls|falls (nötig|erforderlich)|wenn (nötig|erforderlich)|erforderlichenfalls|ggf\./i, en: /if necessary|where necessary|if need be/i } },
  { id: "readyBrake", label: { de: "bremsbereit", en: "ready to brake" }, re: { de: /bremsbereit/i, en: /ready to brake|prepared to brake/i } },
  { id: "reduceSpeed", label: { de: "Geschwindigkeit verringern", en: "reduce speed / slow down" }, re: { de: /(geschwindigkeit|tempo).{0,30}(verringer|reduzier|vermindern|herabsetz)|(verringer|reduzier|vermindern|herabsetz).{0,30}(geschwindigkeit|tempo)/i, en: /reduce (my |the |your )?speed|slow down|lower (my )?speed/i } },
  { id: "expect", label: { de: "rechnen mit", en: "expect / anticipate" }, re: { de: /rechne/i, en: /expect|anticipat/i } },
  { id: "check", label: { de: "prüfen / kontrollieren", en: "check" }, re: { de: /prüfen|überprüf|kontrollier/i, en: /\bcheck/i } },
];

// "Red" markers: absolute or aggressive wording - usually a wrong option.
export const RED_MARKERS: Marker[] = [
  { id: "always", label: { de: "immer", en: "always" }, re: { de: /\bimmer\b/i, en: /\balways\b/i } },
  { id: "never", label: { de: "nie / niemals / stets", en: "never" }, re: { de: /\bnie(mals)?\b|\bstets\b/i, en: /\bnever\b/i } },
  { id: "accelerate", label: { de: "ich beschleunige / Gas geben", en: "I accelerate" }, re: { de: /\bich beschleunig|\bbeschleunige ich|gebe gas|gas geben/i, en: /\bi (will |must |should )?accelerat/i } },
  { id: "faster", label: { de: "schneller fahren", en: "drive faster / speed up" }, re: { de: /schneller fahren|fahre schneller|geschwindigkeit erhöhen|erhöhe.{0,20}geschwindigkeit/i, en: /drive faster|speed up|increase (my )?speed/i } },
  { id: "horn", label: { de: "hupen / Schallzeichen", en: "horn" }, re: { de: /hupe|schallzeichen/i, en: /\bhorn\b|honk/i } },
  { id: "flash", label: { de: "Lichthupe", en: "flash headlights" }, re: { de: /lichthupe/i, en: /flash (my |your )?(head)?lights/i } },
  { id: "brisk", label: { de: "zügig", en: "quickly / briskly" }, re: { de: /zügig/i, en: /\bquickly\b|\bbriskly\b/i } },
  { id: "carryOn", label: { de: "weiterfahren / wie bisher", en: "continue driving / as before" }, re: { de: /weiterfahr|fahre weiter|wie bisher/i, en: /continue (driving|my journey)|drive on\b|as before/i } },
  { id: "only", label: { de: "nur", en: "only" }, re: { de: /\bnur\b/i, en: /\bonly\b/i } },
];

export interface OptionHit {
  question: DrivingQuestion;
  optionText: string;
  correct: boolean;
}

export interface MarkerStat {
  marker: Marker;
  label: string; // the marker's label in the language it was measured in
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

function statFor(marker: Marker, re: RegExp, questions: DrivingQuestion[], lang: Language, red: boolean): MarkerStat {
  const stat: MarkerStat = { marker, label: marker.label[lang], options: 0, correct: 0, exceptions: [] };
  for (const q of questions) {
    const correctLetters = new Set(q.correct_answers.map((c) => c.letter));
    for (const o of q.options) {
      if (!re.test(o.text)) continue;
      const correct = correctLetters.has(o.letter);
      stat.options++;
      if (correct) stat.correct++;
      if (correct === red) stat.exceptions.push({ question: q, optionText: o.text, correct });
    }
  }
  return stat;
}

function statsFor(markers: Marker[], questions: DrivingQuestion[], lang: Language, red: boolean): MarkerStat[] {
  const out: MarkerStat[] = [];
  for (const m of markers) {
    const re = m.re[lang];
    if (re) out.push(statFor(m, re, questions, lang, red));
  }
  return out;
}

const matches = (markers: Marker[], text: string, lang: Language) => markers.some((m) => m.re[lang]?.test(text) ?? false);

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
    green: statsFor(GREEN_MARKERS, mc, lang, false),
    red: statsFor(RED_MARKERS, mc, lang, true),
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
      const tick = matches(GREEN_MARKERS, o.text, lang) ? true : matches(RED_MARKERS, o.text, lang) ? false : true;
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
