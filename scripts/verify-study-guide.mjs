// Verifies every claim in lib/studyGuide.ts against the live catalog.
//
//   node scripts/verify-study-guide.mjs
//
// Each rule/trap cites evidence as "ID", "ID=text" or "ID~text" (see the
// header of lib/studyGuide.ts). This checks that every cited question exists,
// is in the Class B pool (using the app's own appliesToLicenseClass, not a
// copy of it), and that the quoted text really appears in that question's
// correct (=) or wrong (~) answers in German or English. Typed-number answers
// must match exactly. Exits non-zero on any failure.

import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import ts from "typescript";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "study-guide-"));

// Transpile the app's TS modules so this script runs the real logic.
for (const name of ["drivingQuestions", "classBExclusions", "questionTags.generated", "studyGuide"]) {
  const src = fs.readFileSync(path.join(root, "lib", `${name}.ts`), "utf8");
  const js = ts
    .transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } })
    .outputText.replace(/from\s+"\.\/([^"]+)"/g, 'from "./$1.mjs"');
  fs.writeFileSync(path.join(tmp, `${name}.mjs`), js);
}
const dq = await import(pathToFileURL(path.join(tmp, "drivingQuestions.mjs")).href);
const { STUDY_GUIDE, parseEvidence } = await import(pathToFileURL(path.join(tmp, "studyGuide.mjs")).href);

const [de, en] = await Promise.all([dq.getAllQuestions("de"), dq.getAllQuestions("en")]);
const byId = new Map();
for (const q of de) byId.set(q.question_id, { de: q });
for (const q of en) (byId.get(q.question_id) ?? byId.set(q.question_id, {}).get(q.question_id)).en = q;
const classB = new Set(de.filter((q) => dq.appliesToLicenseClass(q, "B")).map((q) => q.question_id));
const classBChapters = new Set(de.filter((q) => classB.has(q.question_id)).map((q) => q.chapter_name));

function answers(entry, which) {
  const out = [];
  for (const q of [entry.de, entry.en]) {
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
for (const ch of STUDY_GUIDE) {
  if (!classBChapters.has(ch.chapter)) failures.push(`[${ch.chapter}] chapter has no Class B questions`);
  for (const point of [...ch.rules, ...ch.traps]) {
    if (point.evidence.length === 0) failures.push(`[${ch.chapter}] no evidence: ${point.text.slice(0, 60)}`);
    for (const ev of point.evidence) {
      const { id, kind, text } = parseEvidence(ev);
      const entry = byId.get(id);
      if (!entry) { failures.push(`[${ch.chapter}] ${ev}: no such question`); continue; }
      if (!classB.has(id)) { failures.push(`[${ch.chapter}] ${ev}: not in the Class B pool`); continue; }
      cited.add(id);
      if (kind === "exists") { passed++; continue; }
      const pool = answers(entry, kind);
      const needle = text.toLowerCase();
      const freeEntry = (entry.de ?? entry.en).options.length === 0;
      const ok = freeEntry ? pool.some((t) => t.trim() === needle.trim()) : pool.some((t) => t.includes(needle));
      if (ok) passed++;
      else failures.push(`[${ch.chapter}] ${ev}: "${text}" not in its ${kind.toUpperCase()} answers ${JSON.stringify(pool)}`);
    }
  }
}
const uncovered = [...classBChapters].filter((c) => !STUDY_GUIDE.some((g) => g.chapter === c));

fs.rmSync(tmp, { recursive: true, force: true });
for (const f of failures) console.log("✗", f);
for (const c of uncovered) console.log("✗ chapter missing from the guide:", c);
console.log(
  `\n${passed} checks passed, ${failures.length} failed; ${STUDY_GUIDE.length}/${classBChapters.size} chapters; ` +
    `${cited.size} of ${classB.size} Class B questions cited as evidence (${Math.round((100 * cited.size) / classB.size)}%).`
);
process.exit(failures.length || uncovered.length ? 1 : 0);
