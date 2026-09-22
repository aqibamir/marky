"use client";

// Two complementary study views, scoped to the current license class the
// same as everywhere else in the app:
//
// - "Answer Key": every question with its correct answer(s) marked, for
//   direct memorization - organized theme -> chapter (collapsible, with a
//   table of contents and a points filter) so it's actually navigable at
//   thousands of questions, not just one long scroll.
// - "Concepts": the compressed rule of thumb for each chapter, with no
//   question text at all - what you'd actually need to *understand* to get
//   any question on that topic right, including ones reworded or using
//   different numbers than anything in the Answer Key.
//
// Data is fetched live from the same source as the rest of the app and
// never persisted - consistent with not vendoring the copyrighted catalog
// into the repo. The concept bullets are original writing, not extracted
// from the catalog.

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { CHAPTER_CONCEPTS } from "@/lib/chapterConcepts";
import { APP_SETTINGS_EVENT, loadAppSettings } from "@/lib/appSettings";

type Tab = "answers" | "concepts";
type PointsFilter = "all" | "2" | "3" | "4" | "5";

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

function CheatSheetInner() {
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<Language>("de");
  const [licenseClass, setLicenseClass] = useState<LicenseClass>("all");
  const [questions, setQuestions] = useState<DrivingQuestion[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [pointsFilter, setPointsFilter] = useState<PointsFilter>("all");
  const [tocOpen, setTocOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("answers");
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "concepts") setTab("concepts");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // --- Answer Key tab: filter by keyword (question text) + points ---
  const filtered = useMemo(() => {
    let list = scoped;
    if (pointsFilter !== "all") {
      list = list.filter((q) => q.pointsValue === Number(pointsFilter));
    }
    if (keyword.trim() && tab === "answers") {
      const kw = keyword.trim().toLowerCase();
      list = list.filter((q) => q.question_text.toLowerCase().includes(kw));
    }
    return list;
  }, [scoped, pointsFilter, keyword, tab]);

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

  // --- Concepts tab: same theme/chapter shape, but membership only cares
  // about which chapters actually have questions in scope (not the points
  // filter, which is meaningless for a chapter-level summary), and keyword
  // matches against the chapter's label/bullets rather than question text.
  const conceptGroups: ThemeGroup[] = useMemo(() => {
    const themeMap = new Map<string, ThemeGroup>();
    for (const q of scoped) {
      let theme = themeMap.get(q.theme_name);
      if (!theme) {
        theme = { themeName: q.theme_name, themeNumber: q.theme_number, chapters: [], count: 0 };
        themeMap.set(q.theme_name, theme);
      }
      let chapter = theme.chapters.find((c) => c.chapterName === q.chapter_name);
      if (!chapter) {
        chapter = { chapterName: q.chapter_name, chapterNumber: q.chapter_number, questions: [] };
        theme.chapters.push(chapter);
      }
    }
    const themes = Array.from(themeMap.values());
    themes.sort((a, b) => compareDotted(a.themeNumber, b.themeNumber));
    const kw = tab === "concepts" ? keyword.trim().toLowerCase() : "";
    for (const t of themes) {
      if (kw) {
        t.chapters = t.chapters.filter((c) => {
          const label = chapterLabel(c.chapterName).toLowerCase();
          const bullets = CHAPTER_CONCEPTS[c.chapterName] ?? [];
          return label.includes(kw) || bullets.some((b) => b.toLowerCase().includes(kw));
        });
      }
      t.chapters.sort((a, b) => compareDotted(a.chapterNumber, b.chapterNumber));
      t.count = t.chapters.length;
    }
    return themes.filter((t) => t.chapters.length > 0);
  }, [scoped, keyword, tab]);

  // A couple of chapters (e.g. "Geschwindigkeit", "Ueberholen") legitimately
  // appear under two different themes in the catalog - count distinct
  // chapters for the headline number, not (theme, chapter) groups, so it
  // doesn't overcount what's actually two sections showing the same content.
  const distinctConceptChapters = useMemo(() => {
    const names = new Set<string>();
    for (const t of conceptGroups) for (const c of t.chapters) names.add(c.chapterName);
    return names;
  }, [conceptGroups]);
  const totalConceptBullets = Array.from(distinctConceptChapters).reduce(
    (n, name) => n + (CHAPTER_CONCEPTS[name]?.length ?? 0),
    0
  );

  function setAllOpen(open: boolean) {
    bodyRef.current?.querySelectorAll("details").forEach((d) => {
      (d as HTMLDetailsElement).open = open;
    });
  }

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

  const activeGroups = tab === "answers" ? grouped : conceptGroups;
  const forceOpen = tab === "concepts" || keyword.trim() !== "" || undefined;

  return (
    <main className="max-w-3xl mx-auto w-full px-4 py-6 print:max-w-none print:px-0">
      <div className="flex items-start justify-between gap-2 mb-2 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold glow-text">Cheat Sheet</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tab === "answers" ? (
              <>
                {filtered.length} question{filtered.length === 1 ? "" : "s"}
                {licenseClass === "B" ? " · Class B" : " · all classes"} — every
                correct answer, laid out to memorize.
              </>
            ) : (
              <>
                {distinctConceptChapters.size} chapter{distinctConceptChapters.size === 1 ? "" : "s"} ·{" "}
                {totalConceptBullets} key facts
                {licenseClass === "B" ? " · Class B" : " · all classes"} — no
                questions, just the rule behind them.
              </>
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="shrink-0">
          🖨️ Print
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-1 bg-secondary rounded-full p-1 mb-3 print:hidden">
        <button
          onClick={() => setTab("answers")}
          className={`rounded-full py-1.5 text-sm font-medium transition-colors ${
            tab === "answers" ? "bg-primary text-primary-foreground glow-primary" : "hover:bg-background/60"
          }`}
        >
          Answer Key
        </button>
        <button
          onClick={() => setTab("concepts")}
          className={`rounded-full py-1.5 text-sm font-medium transition-colors ${
            tab === "concepts" ? "bg-primary text-primary-foreground glow-primary" : "hover:bg-background/60"
          }`}
        >
          Concepts
        </button>
      </div>

      {tab === "answers" ? (
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-muted-foreground mb-4 print:hidden">
          <p className="font-semibold text-warning mb-1">⚠️ Memorize the answer, not the letter</p>
          <p>
            On the real exam, options are shown in whatever order that particular
            screen uses - the letters here (A/B/C) are just how this dataset
            happens to list them, not a fixed position. Memorize which{" "}
            <em>answer text</em> is correct, marked ✓ below, not &ldquo;always
            pick B&rdquo;.
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
      ) : (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground mb-4 print:hidden">
          <p className="font-semibold text-primary mb-1">🎓 Understand these, don&rsquo;t just recite them</p>
          <p>
            Each bullet is the rule of thumb behind an entire chapter, written to
            hold up even when a question is reworded, uses different numbers, or
            is one you&rsquo;ve never seen before - which the Answer Key alone
            can&rsquo;t do. For a literal, word-for-word guarantee on a specific
            question, pair this with the Answer Key tab; that one really is the
            answer key.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 mb-3 print:hidden">
        <input
          type="text"
          placeholder={tab === "answers" ? "Search question text..." : "Search chapters / key facts..."}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-1 border border-border rounded-lg p-2 bg-background text-sm"
        />
        <button
          onClick={() => setTocOpen((o) => !o)}
          className="text-sm font-medium border border-primary/40 text-primary rounded-lg px-3 py-2 hover:bg-primary/10 whitespace-nowrap"
        >
          {tocOpen ? "Hide" : "Show"} contents
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-4 print:hidden">
        {tab === "answers" && (
          <>
            {(["all", "2", "3", "4", "5"] as PointsFilter[]).map((p) => (
              <button
                key={p}
                onClick={() => setPointsFilter(p)}
                className={`rounded-full px-3 py-1 text-xs border ${
                  pointsFilter === p
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border"
                }`}
              >
                {p === "all" ? "All points" : `${p} Punkte`}
              </button>
            ))}
            <span className="w-px h-4 bg-border mx-1" />
          </>
        )}
        <button
          onClick={() => setAllOpen(true)}
          className="rounded-full px-3 py-1 text-xs border border-border bg-background hover:bg-secondary"
        >
          Expand all
        </button>
        <button
          onClick={() => setAllOpen(false)}
          className="rounded-full px-3 py-1 text-xs border border-border bg-background hover:bg-secondary"
        >
          Collapse all
        </button>
      </div>

      {tocOpen && (
        <div className="rounded-xl border border-border bg-card p-3 mb-4 text-sm print:hidden">
          <ul className="space-y-1">
            {activeGroups.map((t) => (
              <li key={t.themeName}>
                <a href={`#theme-${t.themeName}`} className="font-medium text-primary hover:underline">
                  {themeEmoji(t.themeName)} {themeLabel(t.themeName)}
                </a>{" "}
                <span className="text-muted-foreground">
                  ({tab === "answers" ? t.count : t.chapters.length})
                </span>
                <ul className="ml-4 mt-0.5 space-y-0.5">
                  {t.chapters.map((c) => (
                    <li key={c.chapterName}>
                      <a href={`#ch-${c.chapterName}`} className="text-xs text-muted-foreground hover:text-primary hover:underline">
                        {chapterEmoji(c.chapterName)} {chapterLabel(c.chapterName)}
                        {tab === "answers" && ` (${c.questions.length})`}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeGroups.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">
          No {tab === "answers" ? "questions" : "chapters"} match &ldquo;{keyword}&rdquo;.
        </p>
      )}

      <div ref={bodyRef}>
        {activeGroups.map((t) => (
          <details key={t.themeName} id={`theme-${t.themeName}`} open className="mb-8 print:break-before-page">
            <summary className="flex items-center gap-2 text-lg font-bold border-b-2 border-primary/40 pb-2 mb-4 cursor-pointer select-none">
              <span>{themeEmoji(t.themeName)}</span>
              {themeLabel(t.themeName)}
              <span className="text-sm font-normal text-muted-foreground">
                ({tab === "answers" ? t.count : t.chapters.length})
              </span>
            </summary>

            {t.chapters.map((c) =>
              tab === "answers" ? (
                <details
                  key={c.chapterName}
                  id={`ch-${c.chapterName}`}
                  open={forceOpen}
                  className="mb-4 print:break-inside-avoid-page"
                >
                  <summary className="text-sm font-semibold text-muted-foreground mb-2 cursor-pointer select-none">
                    {chapterEmoji(c.chapterName)} {chapterLabel(c.chapterName)}{" "}
                    <span className="font-normal">({c.questions.length})</span>
                  </summary>
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
                </details>
              ) : (
                <div
                  key={c.chapterName}
                  id={`ch-${c.chapterName}`}
                  className="mb-3 rounded-xl border border-border bg-card p-3 print:break-inside-avoid"
                >
                  <h3 className="text-sm font-semibold mb-1.5">
                    {chapterEmoji(c.chapterName)} {chapterLabel(c.chapterName)}
                  </h3>
                  <ul className="text-sm space-y-1 list-disc pl-4">
                    {(CHAPTER_CONCEPTS[c.chapterName] ?? []).map((bullet, i) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              )
            )}
          </details>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-8 print:hidden">
        {tab === "answers" ? (
          <>
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
          </>
        ) : (
          "Original summaries, written for this app - not extracted from the catalog. "
        )}
        <Link href="/practice" className="underline">
          Back to Practice →
        </Link>
      </p>
    </main>
  );
}

export default function CheatSheetPage() {
  return (
    <Suspense fallback={<main className="max-w-3xl mx-auto p-4 text-muted-foreground">Loading…</main>}>
      <CheatSheetInner />
    </Suspense>
  );
}
