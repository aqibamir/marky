"use client";

// A complete answer-key study sheet: every question (scoped to the current
// license class, same as everywhere else in the app) with its correct
// answer(s) marked, grouped the way the official catalog itself is
// organized (theme -> chapter) so it doubles as a table of contents. The
// point is memorization, not practice - Practice already covers the "test
// yourself" side of things; this is the reference to study from.
//
// Data is fetched live from the same source as the rest of the app and
// never persisted - consistent with not vendoring the copyrighted catalog
// into the repo.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import QuestionMedia from "@/components/QuestionMedia";
import {
  appliesToLicenseClass,
  chapterEmoji,
  chapterLabel,
  themeEmoji,
  themeLabel,
  type DrivingQuestion,
  type Language,
  type LicenseClass,
} from "@/lib/drivingQuestions";
import { APP_SETTINGS_EVENT, loadAppSettings } from "@/lib/appSettings";

// Catalog numbers look like "1.1", "1.1.01", "2.6.04" - compare them
// segment-by-segment as numbers so chapters sort in the same order the
// official Fragenkatalog uses, not alphabetically (which would put "1.10"
// before "1.2").
function compareDotted(a: string, b: string): number {
  const as = a.split(".").map((n) => parseInt(n, 10) || 0);
  const bs = b.split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(as.length, bs.length); i++) {
    const diff = (as[i] ?? 0) - (bs[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
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

interface ChapterGroup {
  chapterName: string;
  chapterNumber: string;
  questions: DrivingQuestion[];
}
interface ThemeGroup {
  themeName: string;
  themeNumber: string;
  chapters: ChapterGroup[];
  count: number;
}

export default function CheatSheetPage() {
  const [lang, setLang] = useState<Language>("de");
  const [licenseClass, setLicenseClass] = useState<LicenseClass>("all");
  const [questions, setQuestions] = useState<DrivingQuestion[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [tocOpen, setTocOpen] = useState(false);

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

  useEffect(() => {
    let cancelled = false;
    setQuestions(null);
    setLoadError(null);
    fetch(`/api/driving-questions?lang=${lang}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setQuestions(data.questions as DrivingQuestion[]);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message ?? "Failed to load questions");
      });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const scoped = useMemo(() => {
    if (!questions) return [];
    return licenseClass === "all"
      ? questions
      : questions.filter((q) => appliesToLicenseClass(q, licenseClass));
  }, [questions, licenseClass]);

  const filtered = useMemo(() => {
    if (!keyword.trim()) return scoped;
    const kw = keyword.trim().toLowerCase();
    return scoped.filter((q) => q.question_text.toLowerCase().includes(kw));
  }, [scoped, keyword]);

  const grouped: ThemeGroup[] = useMemo(() => {
    const themeMap = new Map<string, ThemeGroup>();
    for (const q of filtered) {
      let theme = themeMap.get(q.theme_name);
      if (!theme) {
        theme = { themeName: q.theme_name, themeNumber: q.theme_number, chapters: [], count: 0 };
        themeMap.set(q.theme_name, theme);
      }
      theme.count += 1;
      let chapter = theme.chapters.find((c) => c.chapterName === q.chapter_name);
      if (!chapter) {
        chapter = { chapterName: q.chapter_name, chapterNumber: q.chapter_number, questions: [] };
        theme.chapters.push(chapter);
      }
      chapter.questions.push(q);
    }
    const themes = Array.from(themeMap.values());
    themes.sort((a, b) => compareDotted(a.themeNumber, b.themeNumber));
    for (const t of themes) {
      t.chapters.sort((a, b) => compareDotted(a.chapterNumber, b.chapterNumber));
      for (const c of t.chapters) {
        c.questions.sort((a, b) => compareDotted(a.question_number, b.question_number));
      }
    }
    return themes;
  }, [filtered]);

  if (loadError) {
    return (
      <main className="max-w-3xl mx-auto p-4">
        <p className="text-destructive">Failed to load questions: {loadError}</p>
      </main>
    );
  }

  if (!questions) {
    return (
      <main className="max-w-3xl mx-auto p-4 space-y-3 w-full">
        <div className="h-24 rounded-2xl bg-secondary animate-pulse" />
        <div className="h-64 rounded-2xl bg-secondary animate-pulse" />
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto w-full px-4 py-6 print:max-w-none print:px-0">
      <div className="flex items-start justify-between gap-2 mb-2 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold glow-text">Cheat Sheet</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} question{filtered.length === 1 ? "" : "s"}
            {licenseClass === "B" ? " · Class B (Grundstoff + Zusatzstoff)" : " · all classes"}
            {" "}— every correct answer, laid out to memorize.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="shrink-0">
          🖨️ Print
        </Button>
      </div>

      <div className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-muted-foreground mb-4 print:hidden">
        <p className="font-semibold text-warning mb-1">⚠️ Memorize the answer, not the letter</p>
        <p>
          On the real exam, options are shown in whatever order that particular
          screen uses - the letters here (A/B/C) are just how this dataset
          happens to list them, not a fixed position. Memorize which{" "}
          <em>answer text</em> is correct for each question, marked ✓ below,
          not &ldquo;always pick B&rdquo;.
          {licenseClass === "all" && (
            <>
              {" "}
              Only the Class B scope has been manually reviewed for
              class-appropriateness so far - switch to{" "}
              <span className="font-medium">Class B</span> in the header
              switcher for a verified set.
            </>
          )}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4 print:hidden">
        <input
          type="text"
          placeholder="Search question text..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-1 border border-border rounded-lg p-2 bg-background text-sm"
        />
        <button
          onClick={() => setTocOpen((o) => !o)}
          className="text-sm font-medium border border-primary/40 text-primary rounded-lg px-3 py-2 hover:bg-primary/10 whitespace-nowrap"
        >
          {tocOpen ? "Hide" : "Show"} table of contents
        </button>
      </div>

      {tocOpen && (
        <div className="rounded-xl border border-border bg-card p-3 mb-4 text-sm print:hidden">
          <ul className="space-y-1">
            {grouped.map((t) => (
              <li key={t.themeName}>
                <a href={`#theme-${t.themeName}`} className="font-medium text-primary hover:underline">
                  {themeEmoji(t.themeName)} {themeLabel(t.themeName)}
                </a>{" "}
                <span className="text-muted-foreground">({t.count})</span>
                <ul className="ml-4 mt-0.5 space-y-0.5">
                  {t.chapters.map((c) => (
                    <li key={c.chapterName}>
                      <a href={`#ch-${c.chapterName}`} className="text-xs text-muted-foreground hover:text-primary hover:underline">
                        {chapterEmoji(c.chapterName)} {chapterLabel(c.chapterName)} ({c.questions.length})
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">
          No questions match &ldquo;{keyword}&rdquo;.
        </p>
      )}

      {grouped.map((t) => (
        <section key={t.themeName} id={`theme-${t.themeName}`} className="mb-8 print:break-before-page">
          <h2 className="flex items-center gap-2 text-lg font-bold border-b-2 border-primary/40 pb-2 mb-4">
            <span>{themeEmoji(t.themeName)}</span>
            {themeLabel(t.themeName)}
            <span className="text-sm font-normal text-muted-foreground">({t.count})</span>
          </h2>

          {t.chapters.map((c) => (
            <div key={c.chapterName} id={`ch-${c.chapterName}`} className="mb-6 print:break-inside-avoid-page">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                {chapterEmoji(c.chapterName)} {chapterLabel(c.chapterName)}{" "}
                <span className="font-normal">({c.questions.length})</span>
              </h3>
              <ol className="space-y-3">
                {c.questions.map((q) => {
                  const isFreeEntry = q.options.length === 0;
                  return (
                    <li
                      key={q.question_id}
                      className="rounded-xl border border-border bg-card p-3 print:break-inside-avoid"
                    >
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                        <span>{q.question_number}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded-full font-medium ${pointsBadgeClass(
                            q.pointsValue
                          )}`}
                        >
                          {q.points}
                        </span>
                      </div>
                      {(q.image_urls?.length || q.video_urls?.length) ? (
                        <div className="mb-2 max-w-[220px] print:max-w-[160px]">
                          <QuestionMedia imageUrls={q.image_urls} videoUrls={undefined} />
                        </div>
                      ) : null}
                      <p className="font-medium text-sm mb-2">{q.question_text}</p>
                      {isFreeEntry ? (
                        <p className="text-sm">
                          ✓ Correct answer:{" "}
                          <span className="font-bold text-success print:underline">
                            {q.correct_answers.map((a) => a.letter).join(", ")}
                          </span>
                        </p>
                      ) : (
                        <ul className="text-sm space-y-0.5">
                          {q.options.map((opt) => {
                            const isCorrect = q.correct_answers.some(
                              (c2) => c2.letter === opt.letter
                            );
                            return (
                              <li
                                key={opt.letter}
                                className={
                                  isCorrect
                                    ? "font-bold text-success print:underline"
                                    : "text-muted-foreground"
                                }
                              >
                                {isCorrect ? "✓" : "·"} {opt.letter} {opt.text}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </section>
      ))}

      <p className="text-xs text-muted-foreground text-center mt-8 print:hidden">
        Sourced live from{" "}
        <a
          className="underline"
          href="https://github.com/yowmamasita/driving-theory"
          target="_blank"
          rel="noreferrer"
        >
          yowmamasita/driving-theory
        </a>{" "}
        (originally the official TÜV/DEKRA Fragenkatalog) — assembled for
        your own personal study, not redistributed anywhere else.{" "}
        <Link href="/practice" className="underline">
          Back to Practice →
        </Link>
      </p>
    </main>
  );
}
