"use client";

// The Study Guide tab of the Cheat Sheet: how to read the exam (answer
// patterns computed live from the questions in scope), a glossary of German
// exam terms, and a chapter-by-chapter guide - rules, traps and terms - where
// every point can show the real question(s) that prove it.

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  chapterEmoji,
  chapterLabel,
  themeEmoji,
  themeLabel,
  type DrivingQuestion,
  type Language,
} from "@/lib/drivingQuestions";
import { STUDY_GUIDE, parseEvidence, type StudyChapter, type StudyPoint } from "@/lib/studyGuide";
import {
  firstOptionCorrectShare,
  markerStrategyScore,
  pct,
  summarizePatterns,
  type MarkerStat,
} from "@/lib/answerPatterns";

function compareDotted(a: string, b: string): number {
  const as = a.split(".").map((n) => parseInt(n, 10) || 0);
  const bs = b.split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(as.length, bs.length); i++) {
    const diff = (as[i] ?? 0) - (bs[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

const GUIDE_BY_CHAPTER = new Map(STUDY_GUIDE.map((g) => [g.chapter, g]));

/** The real question behind a piece of evidence, with every option marked. */
function Proof({ ev, byId }: { ev: string; byId: Map<string, DrivingQuestion> }) {
  const { id, kind, text } = parseEvidence(ev);
  const q = byId.get(id);
  if (!q) return null;
  const correct = new Set(q.correct_answers.map((c) => c.letter));
  const needle = text.toLowerCase();
  return (
    <div className="rounded-lg border border-border bg-background/60 p-2.5 text-xs">
      <p className="text-muted-foreground mb-1">
        {q.question_number}
        {q.image_urls?.length || q.video_urls?.length ? " · 🖼️ picture/video question" : ""}
      </p>
      <p className="font-medium mb-1.5">{q.question_text}</p>
      {q.options.length === 0 ? (
        <p className="text-success font-semibold">✓ {q.correct_answers.map((c) => c.letter).join(", ")}</p>
      ) : (
        <ul className="space-y-0.5">
          {q.options.map((o) => {
            const isCorrect = correct.has(o.letter);
            const quoted = needle && kind !== "exists" && o.text.toLowerCase().includes(needle);
            return (
              <li
                key={o.letter}
                className={`${isCorrect ? "text-success font-semibold" : "text-muted-foreground line-through decoration-destructive/60"} ${
                  quoted ? "underline decoration-2 underline-offset-2" : ""
                }`}
              >
                {isCorrect ? "✓" : "✕"} {o.text}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function Point({ point, byId, tone }: { point: StudyPoint; byId: Map<string, DrivingQuestion>; tone: "rule" | "trap" }) {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const available = point.evidence.filter((ev) => byId.has(parseEvidence(ev).id));
  const ids = Array.from(new Set(available.map((ev) => parseEvidence(ev).id)));
  const shown = showAll ? available : available.filter((ev, i, arr) => arr.findIndex((e) => parseEvidence(e).id === parseEvidence(ev).id) === i).slice(0, 2);
  return (
    <li className={`rounded-xl border p-3 print:break-inside-avoid ${tone === "trap" ? "border-warning/40 bg-warning/5" : "border-border bg-card"}`}>
      <p className="text-sm">
        {tone === "trap" ? "⚠️ " : ""}
        {point.text}
      </p>
      {ids.length > 0 && (
        <button
          onClick={() => setOpen((o) => !o)}
          className="mt-1.5 text-xs font-medium text-primary hover:underline print:hidden"
        >
          {open ? "Hide proof" : `Show proof (${ids.length} question${ids.length === 1 ? "" : "s"})`}
        </button>
      )}
      {open && (
        <div className="mt-2 space-y-2 print:hidden">
          {shown.map((ev) => (
            <Proof key={ev} ev={ev} byId={byId} />
          ))}
          {!showAll && ids.length > 2 && (
            <button onClick={() => setShowAll(true)} className="text-xs text-primary hover:underline">
              Show all {ids.length}
            </button>
          )}
        </div>
      )}
    </li>
  );
}

function MarkerRow({ stat, red }: { stat: MarkerStat; red: boolean }) {
  const [open, setOpen] = useState(false);
  if (stat.options === 0) return null;
  const reliability = red ? pct(stat.options - stat.correct, stat.options) : pct(stat.correct, stat.options);
  const weak = reliability < 70;
  return (
    <li className="py-1.5 border-b border-border last:border-0">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="min-w-0">{stat.label}</span>
        <span className={`shrink-0 text-xs font-semibold ${weak ? "text-muted-foreground" : red ? "text-destructive" : "text-success"}`}>
          {reliability}% {red ? "wrong" : "correct"} · {stat.options}
          {weak && " (weak hint)"}
        </span>
      </div>
      {stat.exceptions.length > 0 && (
        <button onClick={() => setOpen((o) => !o)} className="text-xs text-primary hover:underline print:hidden">
          {open ? "Hide" : "Show"} the {stat.exceptions.length} exception{stat.exceptions.length === 1 ? "" : "s"} (where it {red ? "IS correct" : "is WRONG"})
        </button>
      )}
      {open && (
        <ul className="mt-1.5 space-y-1.5">
          {stat.exceptions.slice(0, 40).map((x) => (
            <li key={x.question.question_id + x.optionText} className="text-xs rounded-lg bg-background/60 border border-border p-2">
              <p className="text-muted-foreground">
                {x.question.question_number} · {chapterLabel(x.question.chapter_name)}
              </p>
              <p className="font-medium">{x.question.question_text}</p>
              <p className={x.correct ? "text-success" : "text-destructive"}>
                {x.correct ? "✓ correct:" : "✕ wrong:"} {x.optionText}
              </p>
            </li>
          ))}
          {stat.exceptions.length > 40 && (
            <li className="text-xs text-muted-foreground">…and {stat.exceptions.length - 40} more (filter by chapter to see them all).</li>
          )}
        </ul>
      )}
    </li>
  );
}

/** The term in the exam's language first, the other language alongside. */
function TermName({ term, lang }: { term: { de: string; en: string }; lang: Language }) {
  const [main, other] = lang === "en" ? [term.en, term.de] : [term.de, term.en];
  return (
    <>
      {main} <span className="font-normal text-muted-foreground">- {other}</span>
    </>
  );
}

export function Section({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} data-study-section className="rounded-xl border border-border bg-card p-3 mb-3 print:border-0 print:p-0">
      <summary className="font-semibold cursor-pointer select-none">{title}</summary>
      <div className="mt-3 space-y-2 text-sm">{children}</div>
    </details>
  );
}

function ChapterBody({ guide, questions, byId, lang }: { guide: StudyChapter; questions: DrivingQuestion[]; byId: Map<string, DrivingQuestion>; lang: Language }) {
  const stats = useMemo(() => summarizePatterns(questions, lang), [questions, lang]);
  const exceptions = [...stats.red, ...stats.green].reduce((n, s) => n + s.exceptions.length, 0);
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
        <p className="text-sm text-foreground mb-1">{guide.gist}</p>
        {questions.length} questions in scope
        {stats.multipleChoice > 0 && (
          <>
            {" "}· {pct(stats.moreThanOneCorrect, stats.multipleChoice)}% have more than one correct answer
            {" "}· {pct(stats.allCorrect, stats.multipleChoice)}% have every option correct
          </>
        )}
        {stats.typedNumber > 0 && <> · {stats.typedNumber} ask you to type a number</>}
      </div>

      {guide.rules.length > 0 && (
        <div>
          <h3 className="text-sm font-bold mb-2">✅ The rules that answer these questions</h3>
          <ul className="space-y-2">
            {guide.rules.map((r, i) => (
              <Point key={i} point={r} byId={byId} tone="rule" />
            ))}
          </ul>
        </div>
      )}

      {guide.traps.length > 0 && (
        <div>
          <h3 className="text-sm font-bold mb-2">⚠️ Traps and anomalies - where the obvious answer is wrong</h3>
          <ul className="space-y-2">
            {guide.traps.map((r, i) => (
              <Point key={i} point={r} byId={byId} tone="trap" />
            ))}
          </ul>
        </div>
      )}

      {guide.terms.length > 0 && (
        <div>
          <h3 className="text-sm font-bold mb-2">📖 Terms</h3>
          <dl className="space-y-2">
            {guide.terms.map((t) => (
              <div key={t.de} className="rounded-xl border border-border bg-card p-3 text-sm print:break-inside-avoid">
                <dt className="font-semibold">
                  <TermName term={t} lang={lang} />
                </dt>
                <dd className="text-muted-foreground mt-0.5">{t.explain}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {exceptions > 0 && (
        <div className="print:hidden">
          <h3 className="text-sm font-bold mb-2">🔎 Word-pattern exceptions in this chapter</h3>
          <p className="text-xs text-muted-foreground mb-2">
            Options where a usually-reliable word points the wrong way - the ones to learn by heart.
          </p>
          <ul className="rounded-xl border border-border bg-card px-3">
            {stats.red.map((s) => (s.exceptions.length ? <MarkerRow key={s.marker.id} stat={s} red /> : null))}
            {stats.green.map((s) => (s.exceptions.length ? <MarkerRow key={s.marker.id} stat={s} red={false} /> : null))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function StudyGuide({ questions, lang }: { questions: DrivingQuestion[]; lang: Language }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");

  // Closed <details> don't print - open every section when printing.
  useEffect(() => {
    function onBeforePrint() {
      document.querySelectorAll<HTMLDetailsElement>("details[data-study-section]").forEach((d) => (d.open = true));
    }
    window.addEventListener("beforeprint", onBeforePrint);
    return () => window.removeEventListener("beforeprint", onBeforePrint);
  }, []);

  const byId = useMemo(() => new Map(questions.map((q) => [q.question_id, q])), [questions]);
  const summary = useMemo(() => summarizePatterns(questions, lang), [questions, lang]);
  const strategy = useMemo(() => markerStrategyScore(questions, lang), [questions, lang]);
  const firstShare = useMemo(() => firstOptionCorrectShare(questions), [questions]);
  const typed = useMemo(
    () => questions.filter((q) => q.options.length === 0).sort((a, b) => compareDotted(a.question_number, b.question_number)),
    [questions]
  );

  // Theme -> chapters, for the chapters that actually have questions in scope.
  const groups = useMemo(() => {
    const themes = new Map<string, { theme: string; number: string; chapters: Map<string, DrivingQuestion[]> }>();
    for (const q of questions) {
      let t = themes.get(q.theme_name);
      if (!t) themes.set(q.theme_name, (t = { theme: q.theme_name, number: q.theme_number, chapters: new Map() }));
      const list = t.chapters.get(q.chapter_name) ?? [];
      list.push(q);
      t.chapters.set(q.chapter_name, list);
    }
    return Array.from(themes.values()).sort((a, b) => compareDotted(a.number, b.number));
  }, [questions]);

  // A few chapters (e.g. "Geschwindigkeit") sit under two themes - print each once.
  const printChapters = useMemo(
    () => Array.from(new Set(groups.flatMap((t) => Array.from(t.chapters.keys())))),
    [groups]
  );

  const chapterQuestions = useMemo(() => {
    const m = new Map<string, DrivingQuestion[]>();
    for (const q of questions) m.set(q.chapter_name, [...(m.get(q.chapter_name) ?? []), q]);
    return m;
  }, [questions]);

  const glossary = useMemo(() => {
    const seen = new Map<string, { de: string; en: string; explain: string; chapter: string }>();
    for (const g of STUDY_GUIDE) {
      if (!chapterQuestions.has(g.chapter)) continue;
      for (const t of g.terms) if (!seen.has(t.de)) seen.set(t.de, { ...t, chapter: g.chapter });
    }
    const key = (t: { de: string; en: string }) => (lang === "en" ? t.en : t.de).replace(/^[^\p{L}\d]+/u, "");
    return Array.from(seen.values()).sort((a, b) => key(a).localeCompare(key(b), lang));
  }, [chapterQuestions, lang]);

  const kw = keyword.trim().toLowerCase();
  const matches = (g: StudyChapter) =>
    !kw ||
    chapterLabel(g.chapter).toLowerCase().includes(kw) ||
    g.gist.toLowerCase().includes(kw) ||
    [...g.rules, ...g.traps].some((p) => p.text.toLowerCase().includes(kw)) ||
    g.terms.some((t) => `${t.de} ${t.en} ${t.explain}`.toLowerCase().includes(kw));

  const selectedGuide = selected ? GUIDE_BY_CHAPTER.get(selected) : undefined;

  if (selectedGuide) {
    return (
      <div>
        <button onClick={() => setSelected(null)} className="text-sm font-medium text-primary hover:underline mb-3 print:hidden">
          ← Study guide overview
        </button>
        <h2 className="flex items-center gap-2 text-lg font-bold border-b-2 border-primary/40 pb-2 mb-4">
          <span>{chapterEmoji(selectedGuide.chapter)}</span>
          {chapterLabel(selectedGuide.chapter)}
        </h2>
        <ChapterBody guide={selectedGuide} questions={chapterQuestions.get(selectedGuide.chapter) ?? []} byId={byId} lang={lang} />
      </div>
    );
  }

  const totalRules = STUDY_GUIDE.reduce((n, g) => n + (chapterQuestions.has(g.chapter) ? g.rules.length + g.traps.length : 0), 0);

  return (
    <div>
      <Section title="🎯 How to read the exam - the answer patterns" defaultOpen>
        <p>
          <strong>Scoring is all-or-nothing:</strong> you must tick every correct option and no wrong one. Of the{" "}
          {summary.multipleChoice} multiple-choice questions here,{" "}
          <strong>{pct(summary.moreThanOneCorrect, summary.multipleChoice)}% have more than one correct answer</strong> and{" "}
          <strong>{pct(summary.allCorrect, summary.multipleChoice)}% have every option correct</strong>. Across all options,{" "}
          {pct(summary.correctOptions, summary.options)}% are correct - so an option is right more often than wrong. Never
          stop at the first good answer.
        </p>
        <p>
          <strong>Letters mean nothing.</strong> In this dataset the correct answers are always listed first - option A is
          correct in {firstShare}% of questions. Practice now shuffles the options so you can&rsquo;t learn that by accident;
          on the real exam, learn the <em>content</em>, never the position.
        </p>
        <p>
          <strong>Words that tip you off</strong> in the {lang === "en" ? "English" : "German"} wording (measured on these
          questions - percentages are live; switch DE/EN in the header to see the other language&rsquo;s list):
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-semibold text-success mb-1">Usually CORRECT - cautious wording</p>
            <ul className="rounded-xl border border-border px-3">
              {summary.green.map((s) => (
                <MarkerRow key={s.marker.id} stat={s} red={false} />
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-destructive mb-1">Usually WRONG - absolute or aggressive wording</p>
            <ul className="rounded-xl border border-border px-3">
              {summary.red.map((s) => (
                <MarkerRow key={s.marker.id} stat={s} red />
              ))}
            </ul>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Honest limit: ticking by these words alone gets only{" "}
          <strong>
            {strategy.right} of {strategy.total} questions ({pct(strategy.right, strategy.total)}%)
          </strong>{" "}
          completely right. They break ties - the chapter rules below are what actually pass the exam.
        </p>
        <p>
          <strong>Other patterns:</strong> in &ldquo;what can cause / what can happen&rdquo; questions almost every realistic
          option is correct; in &ldquo;why must you brake?&rdquo; videos the answer is the vulnerable person (child, pedestrian,
          cyclist), not the vehicle next to them; in &ldquo;why can&rsquo;t you overtake?&rdquo; the answer is the real hazard,
          not &ldquo;because of the sign/line&rdquo;. Some answers are sentence fragments - read the question stem, it may say
          &ldquo;avoid&rdquo; or &ldquo;don&rsquo;t&rdquo;.
        </p>
      </Section>

      {typed.length > 0 && (
        <Section title={`🔢 The ${typed.length} type-the-number questions`}>
          <ul className="space-y-1.5">
            {typed.map((q) => (
              <li key={q.question_id} className="flex justify-between gap-3 border-b border-border pb-1.5 last:border-0 print:break-inside-avoid">
                <span className="text-sm">{q.question_text}</span>
                <span className="shrink-0 font-bold text-success">{q.correct_answers.map((c) => c.letter).join(", ")}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title={`📖 Glossary - ${glossary.length} German exam terms explained`}>
        <dl className="space-y-2">
          {glossary.map((t) => (
            <div key={t.de} className="print:break-inside-avoid">
              <dt className="font-semibold">
                <TermName term={t} lang={lang} />
              </dt>
              <dd className="text-muted-foreground">{t.explain}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <div className="flex items-baseline justify-between gap-2 mt-5 mb-2">
        <h2 className="font-bold">Chapters</h2>
        <span className="text-xs text-muted-foreground">{totalRules} rules &amp; traps, each with proof</span>
      </div>
      <input
        type="text"
        placeholder="Search rules, traps and terms..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="w-full border border-border rounded-lg p-2 bg-background text-sm mb-3 print:hidden"
      />

      <div className="print:hidden">
        {groups.map((t) => {
          const chapters = Array.from(t.chapters.keys())
            .map((c) => GUIDE_BY_CHAPTER.get(c))
            .filter((g): g is StudyChapter => Boolean(g) && matches(g!));
          if (chapters.length === 0) return null;
          return (
            <div key={t.theme} className="mb-5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-muted-foreground border-b border-border pb-1.5 mb-1.5">
                <span>{themeEmoji(t.theme)}</span>
                {themeLabel(t.theme)}
              </h3>
              <div className="space-y-1">
                {chapters.map((g) => (
                  <button
                    key={g.chapter}
                    onClick={() => {
                      setSelected(g.chapter);
                      window.scrollTo(0, 0);
                    }}
                    className="w-full flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-left text-sm hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span>{chapterEmoji(g.chapter)}</span>
                      <span className="truncate">{chapterLabel(g.chapter)}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                      {g.rules.length + g.traps.length} points
                      <span className="text-primary">→</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Print version: every chapter's rules, traps and terms (no proofs). */}
      <div className="hidden print:block">
        {printChapters.map((c) => {
            const g = GUIDE_BY_CHAPTER.get(c);
            if (!g) return null;
            return (
              <section key={c} className="mb-6 print:break-inside-avoid-page">
                <h3 className="font-bold border-b border-border mb-2">
                  {chapterEmoji(c)} {chapterLabel(c)}
                </h3>
                <p className="text-sm italic mb-1">{g.gist}</p>
                <ul className="list-disc pl-5 text-sm space-y-0.5">
                  {g.rules.map((r, i) => (
                    <li key={`r${i}`}>{r.text}</li>
                  ))}
                  {g.traps.map((r, i) => (
                    <li key={`t${i}`}>⚠️ {r.text}</li>
                  ))}
                </ul>
              </section>
            );
          })}
      </div>
    </div>
  );
}
