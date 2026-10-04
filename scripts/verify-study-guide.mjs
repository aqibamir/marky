// Verifies every claim in lib/studyGuide.ts and lib/numberFacts.ts against
// the live catalog.
//
//   node scripts/verify-study-guide.mjs
//
// Each rule/trap cites evidence as "ID", "ID=text" or "ID~text" (see the
// header of lib/studyGuide.ts). This checks that every cited question exists,
// is in the Class B pool (using the app's own appliesToLicenseClass, not a
// copy of it), and that the quoted text really appears in that question's
// correct (=) or wrong (~) answers in the English catalog (the guide quotes
// English wording). It also checks that the German and English catalogs
// agree on every cited question's correct answers, so the guide holds in
// both languages. Typed-number answers must match exactly. Exits non-zero
// on any failure.
//
// For the numbers cheat sheet it additionally checks that every number
// question in the Class B pool is cited by some topic, and that each formula
// in FORMULA_CHECKS reproduces the catalog's answer.

import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import ts from "typescript";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "study-guide-"));

// Transpile the app's TS modules so this script runs the real logic.
for (const name of ["drivingQuestions", "catalogNames.generated", "classBExclusions", "questionTags.generated", "studyGuide", "numberFacts"]) {
  const src = fs.readFileSync(path.join(root, "lib", `${name}.ts`), "utf8");
  const js = ts
    .transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } })
    .outputText.replace(/from\s+"\.\/([^"]+)"/g, 'from "./$1.mjs"');
  fs.writeFileSync(path.join(tmp, `${name}.mjs`), js);
}
const dq = await import(pathToFileURL(path.join(tmp, "drivingQuestions.mjs")).href);
const { STUDY_GUIDE, parseEvidence } = await import(pathToFileURL(path.join(tmp, "studyGuide.mjs")).href);
const { NUMBER_TOPICS, FORMULA_CHECKS, isNumberQuestion, TYPED_ANSWER_UNITS, factsFor } = await import(pathToFileURL(path.join(tmp, "numberFacts.mjs")).href);

const [de, en] = await Promise.all([dq.getAllQuestions("de"), dq.getAllQuestions("en")]);
const byId = new Map();
for (const q of de) byId.set(q.question_id, { de: q });
for (const q of en) (byId.get(q.question_id) ?? byId.set(q.question_id, {}).get(q.question_id)).en = q;
const classB = new Set(de.filter((q) => dq.appliesToLicenseClass(q, "B")).map((q) => q.question_id));
const classBChapters = new Set(de.filter((q) => classB.has(q.question_id)).map((q) => q.chapter_name));
// The guide is keyed by chapter name, so English mode must produce the same names.
const enClassB = en.filter((q) => dq.appliesToLicenseClass(q, "B"));
const enChapters = new Set(enClassB.map((q) => q.chapter_name));

function answers(entry, which) {
  const out = [];
  for (const q of [entry.en]) {
    if (!q) continue;
    const correct = new Set(q.correct_answers.map((c) => c.letter));
    if (q.options.length === 0) {
      if (which === "correct") out.push(...q.correct_answers.map((c) => c.letter));
      continue;
    }
    for (const o of q.options) if (correct.has(o.letter) === (which === "correct")) out.push(o.text);
  }
  return out.map((s) => s.toLowerCase());
}

let passed = 0;
const failures = [];
const cited = new Set();
const key = (q) => (q ? `${q.options.length}:${q.correct_answers.map((c) => c.letter).sort().join(",")}` : "missing");

function checkPoint(where, point, citedSet) {
  if (point.evidence.length === 0) failures.push(`[${where}] no evidence: ${point.text.slice(0, 60)}`);
  for (const ev of point.evidence) {
    const { id, kind, text } = parseEvidence(ev);
    const entry = byId.get(id);
    if (!entry) { failures.push(`[${where}] ${ev}: no such question`); continue; }
    if (!classB.has(id)) { failures.push(`[${where}] ${ev}: not in the Class B pool`); continue; }
    citedSet.add(id);
    if (key(entry.de) !== key(entry.en)) { failures.push(`[${where}] ${ev}: German and English answers differ (${key(entry.de)} vs ${key(entry.en)})`); continue; }
    if (kind === "exists") { passed++; continue; }
    const pool = answers(entry, kind);
    const needle = text.toLowerCase();
    const freeEntry = entry.en.options.length === 0;
    const ok = freeEntry ? pool.some((t) => t.trim() === needle.trim()) : pool.some((t) => t.includes(needle));
    if (ok) passed++;
    else failures.push(`[${where}] ${ev}: "${text}" not in its ${kind.toUpperCase()} answers ${JSON.stringify(pool)}`);
  }
}

for (const ch of STUDY_GUIDE) {
  if (!classBChapters.has(ch.chapter)) failures.push(`[${ch.chapter}] chapter has no Class B questions`);
  for (const point of [...ch.rules, ...ch.traps]) checkPoint(ch.chapter, point, cited);
}

// --- Numbers cheat sheet ---
const numberCited = new Set();
for (const t of NUMBER_TOPICS) for (const point of [...t.facts, ...t.traps]) checkPoint(`numbers/${t.id}`, point, numberCited);
// A number question in EITHER language (some spell the number out in one of them).
const numberIds = new Set([...en, ...de].filter((q) => classB.has(q.question_id) && isNumberQuestion(q)).map((q) => q.question_id));
const numberQuestions = en.filter((q) => numberIds.has(q.question_id));
const notCovered = numberQuestions.filter((q) => !numberCited.has(q.question_id));
for (const q of notCovered) failures.push(`[numbers] ${q.question_id} is a number question but no topic cites it: ${q.question_text.slice(0, 70)}`);

// Type-in test: a unit for every Class B type-in question (and nothing else),
// and at least one explaining fact for each.
const typedIds = new Set(en.filter((q) => classB.has(q.question_id) && q.options.length === 0).map((q) => q.question_id));
for (const id of typedIds) {
  if (!(id in TYPED_ANSWER_UNITS)) failures.push(`[units] ${id} is a type-in question without a unit entry`);
  if (factsFor(id).length === 0) failures.push(`[test] ${id} has no explaining fact`);
}
for (const id of Object.keys(TYPED_ANSWER_UNITS)) if (!typedIds.has(id)) failures.push(`[units] ${id} is not a Class B type-in question`);

const numbersIn = (t) => (t.match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => parseFloat(n.replace(",", ".")));
let formulasOk = 0;
for (const c of FORMULA_CHECKS) {
  const q = byId.get(c.id)?.en;
  if (!q) { failures.push(`[formula] ${c.id}: no such question`); continue; }
  const correct = new Set(q.correct_answers.map((a) => a.letter));
  const correctTexts = q.options.length === 0 ? q.correct_answers.map((a) => a.letter) : q.options.filter((o) => correct.has(o.letter)).map((o) => o.text);
  let ok;
  if (c.correctIf) {
    ok = q.options.every((o) => c.correctIf(numbersIn(o.text)[0]) === correct.has(o.letter));
  } else if (typeof c.expect === "number") {
    ok = correctTexts.some((t) => numbersIn(t).some((n) => Math.abs(n - c.expect) < 1e-9));
  } else {
    ok = correctTexts.some((t) => t.toLowerCase().includes(String(c.expect).toLowerCase()));
  }
  if (ok) formulasOk++;
  else failures.push(`[formula] ${c.id} (${c.what}): computed ${c.correctIf ? "a different set of options" : JSON.stringify(c.expect)}, catalog says ${JSON.stringify(correctTexts)}`);
}

const uncovered = [...classBChapters].filter((c) => !STUDY_GUIDE.some((g) => g.chapter === c));
if (enClassB.length !== classB.size) failures.push(`English Class B pool has ${enClassB.length} questions, German ${classB.size}`);
for (const g of STUDY_GUIDE) if (!enChapters.has(g.chapter)) failures.push(`[${g.chapter}] not found in English mode`);
for (const c of enChapters) if (!classBChapters.has(c)) failures.push(`English chapter "${c}" has no German counterpart`);

fs.rmSync(tmp, { recursive: true, force: true });
for (const f of failures) console.log("✗", f);
for (const c of uncovered) console.log("✗ chapter missing from the guide:", c);
console.log(
  `\n${passed} checks passed, ${failures.length} failed; ${STUDY_GUIDE.length}/${classBChapters.size} chapters ` +
    `(same ${enChapters.size} in English mode); ` +
    `${cited.size} of ${classB.size} Class B questions cited as evidence (${Math.round((100 * cited.size) / classB.size)}%).\n` +
    `Numbers sheet: ${numberQuestions.length - notCovered.length}/${numberQuestions.length} number questions covered, ` +
    `${formulasOk}/${FORMULA_CHECKS.length} formula checks reproduce the catalog's answer; ` +
    `${typedIds.size} type-in questions, each with a unit and an explanation.`
);
process.exit(failures.length || uncovered.length ? 1 : 0);
