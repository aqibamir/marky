"use client";

// The Numbers tab of the Cheat Sheet: a stopping-distance calculator built on
// the exam's rules of thumb, every number fact grouped by topic (each with
// proof), and the complete list of number questions with their answers,
// fetched live.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { DrivingQuestion, Language } from "@/lib/drivingQuestions";
import { parseEvidence } from "@/lib/studyGuide";
import {
  NUMBER_TOPICS,
  brakingDistance,
  emergencyBrakingDistance,
  emergencyStoppingDistance,
  followingDistance,
  inNumbersSheet,
  reactionDistance,
  stoppingDistance,
} from "@/lib/numberFacts";
import { Point, Section } from "@/components/StudyGuide";

function compareDotted(a: string, b: string): number {
  const as = a.split(".").map((n) => parseInt(n, 10) || 0);
  const bs = b.split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(as.length, bs.length); i++) {
    const diff = (as[i] ?? 0) - (bs[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

// Question ID -> the first topic that cites it.
const TOPIC_OF = new Map<string, string>();
for (const t of NUMBER_TOPICS)
  for (const p of [...t.facts, ...t.traps])
    for (const ev of p.evidence) {
      const id = parseEvidence(ev).id;
      if (!TOPIC_OF.has(id)) TOPIC_OF.set(id, t.id);
    }

function Calculator({ lang }: { lang: Language }) {
  const [speed, setSpeed] = useState(50);
  const fmt = (n: number) => n.toLocaleString(lang === "de" ? "de-DE" : "en-GB", { maximumFractionDigits: 1 });
  const s = speed / 10;
  const rows: { label: string; formula: string; value: number; strong?: boolean }[] = [
    { label: "Reaction distance", formula: `${fmt(s)} × 3`, value: reactionDistance(speed) },
    { label: "Braking distance (normal)", formula: `${fmt(s)} × ${fmt(s)}`, value: brakingDistance(speed) },
    { label: "Stopping distance", formula: "reaction + braking", value: stoppingDistance(speed), strong: true },
    { label: "Braking distance (emergency)", formula: `${fmt(s)} × ${fmt(s)} ÷ 2`, value: emergencyBrakingDistance(speed) },
    { label: "Stopping distance (emergency)", formula: "reaction + emergency braking", value: emergencyStoppingDistance(speed), strong: true },
    { label: "Following distance (outside towns)", formula: `${speed} ÷ 2`, value: followingDistance(speed) },
  ];
  return (
    <div className="rounded-xl border border-primary/40 bg-primary/5 p-3 mb-3 print:hidden">
      <p className="font-semibold mb-2">🧮 Try the formulas</p>
      <div className="flex items-center gap-3 mb-3">
        <input
          type="range"
          min={10}
          max={200}
          step={10}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="flex-1 accent-primary"
          aria-label="Speed in km/h"
        />
        <span className="w-20 text-right font-bold tabular-nums">{speed} km/h</span>
      </div>
      <ul className="text-sm divide-y divide-border">
        {rows.map((r) => (
          <li key={r.label} className="flex items-baseline justify-between gap-2 py-1.5">
            <span className="min-w-0">
              {r.label} <span className="text-xs text-muted-foreground">= {r.formula}</span>
            </span>
            <span className={`shrink-0 tabular-nums ${r.strong ? "font-bold text-primary" : "font-semibold"}`}>{fmt(r.value)} m</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground mt-2">
        Drop the last zero of the speed, then multiply. These are the exam&rsquo;s rules of thumb, not real-world physics.
      </p>
    </div>
  );
}

function AnswerText({ q }: { q: DrivingQuestion }) {
  if (q.options.length === 0) {
    return <span className="font-bold text-success">{q.correct_answers.map((c) => c.letter).join(", ")}</span>;
  }
  const correct = new Set(q.correct_answers.map((c) => c.letter));
  return (
    <span className="text-success font-semibold">
      {q.options
        .filter((o) => correct.has(o.letter))
        .map((o) => o.text)
        .join(" · ")}
    </span>
  );
}

export default function NumbersSheet({ questions, lang }: { questions: DrivingQuestion[]; lang: Language }) {
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
  const numberQuestions = useMemo(
    () =>
      questions
        .filter(inNumbersSheet)
        .sort((a, b) => compareDotted(a.question_number, b.question_number)),
    [questions]
  );

  // File each number question under the first topic that cites it.
  const listByTopic = useMemo(() => {
    const topicOf = TOPIC_OF;
    const kw = keyword.trim().toLowerCase();
    const groups = new Map<string, DrivingQuestion[]>();
    for (const q of numberQuestions) {
      if (kw) {
        const answer = q.options.length === 0 ? q.correct_answers.map((c) => c.letter).join(" ") : q.options.map((o) => o.text).join(" ");
        if (!`${q.question_text} ${answer}`.toLowerCase().includes(kw)) continue;
      }
      const t = topicOf.get(q.question_id) ?? "other";
      groups.set(t, [...(groups.get(t) ?? []), q]);
    }
    return groups;
  }, [numberQuestions, keyword]);

  const shown = Array.from(listByTopic.values()).reduce((n, l) => n + l.length, 0);
  const topicTitle = (id: string) => {
    const t = NUMBER_TOPICS.find((x) => x.id === id);
    return t ? `${t.emoji} ${t.title}` : "📘 Other";
  };

  return (
    <div>
      <Link
        href="/numbers-test"
        className="flex items-center justify-between gap-3 rounded-xl border-2 border-primary bg-primary/10 p-3 mb-3 hover:bg-primary/15 transition-colors print:hidden"
      >
        <span>
          <span className="font-semibold">✍️ Test yourself</span>
          <span className="block text-xs text-muted-foreground">Type-in and multiple-choice number questions, scored, with your mistakes explained.</span>
        </span>
        <span className="text-primary font-semibold shrink-0">Start →</span>
      </Link>
      <Calculator lang={lang} />

      {NUMBER_TOPICS.map((t) => (
        <Section key={t.id} title={`${t.emoji} ${t.title}`} defaultOpen={t.id === "formulas"}>
          {t.intro && <p className="text-muted-foreground">{t.intro}</p>}
          <ul className="space-y-2">
            {t.facts.map((p, i) => (
              <Point key={i} point={p} byId={byId} tone="rule" />
            ))}
            {t.traps.map((p, i) => (
              <Point key={`t${i}`} point={p} byId={byId} tone="trap" />
            ))}
          </ul>
        </Section>
      ))}

      <div className="flex items-baseline justify-between gap-2 mt-5 mb-2">
        <h2 className="font-bold">Every number question - with its answer</h2>
        <span className="text-xs text-muted-foreground">
          {shown === numberQuestions.length ? numberQuestions.length : `${shown} of ${numberQuestions.length}`}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        Type-in answers use the German decimal comma (1,5 = 1.5) - Practice accepts either. 🖼️ = the answer depends on the picture.
      </p>
      <input
        type="text"
        placeholder="Search questions or answers (e.g. 50, trailer, fog)..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="w-full border border-border rounded-lg p-2 bg-background text-sm mb-3 print:hidden"
      />
      {shown === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No number questions match &ldquo;{keyword}&rdquo;.</p>
      ) : (
        [...NUMBER_TOPICS.map((t) => t.id), "other"]
          .filter((id) => listByTopic.has(id))
          .map((id) => (
            <Section key={id} title={`${topicTitle(id)} (${listByTopic.get(id)!.length})`} defaultOpen={keyword.trim() !== ""}>
              <ol className="space-y-2">
                {listByTopic.get(id)!.map((q) => (
                  <li key={q.question_id} className="border-b border-border pb-2 last:border-0 print:break-inside-avoid">
                    <p className="text-sm">
                      {q.image_urls?.length || q.video_urls?.length ? "🖼️ " : ""}
                      {q.question_text}
                    </p>
                    <p className="text-sm mt-0.5">
                      → <AnswerText q={q} />
                    </p>
                  </li>
                ))}
              </ol>
            </Section>
          ))
      )}
    </div>
  );
}
