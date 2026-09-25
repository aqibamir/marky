"use client";

// Two complementary study views, scoped to the current license class the
// same as everywhere else in the app:
//
// - "Answer Key": every question with its correct answer(s) marked, for
//   direct memorization. This is a drill-down, not one long page: pick a
//   chapter from a compact list, see just that chapter's questions. An
//   earlier version tried to render all ~2400 questions on one page behind
//   collapsible sections - it worked in isolated testing but was genuinely
//   unusable on a real device (a 545,000px-tall page, a 5+ second freeze on
//   "Expand all", and a table-of-contents link that scrolled to a chapter
//   without actually opening it). Keeping the DOM to "one chapter's worth
//   of questions" at a time fixes all three at once.
// - "Concepts": the compressed rule of thumb for each chapter, with no
//   question text at all - what you'd actually need to *understand* to get
//   any question on that topic right, including ones reworded or using
//   different numbers than anything in the Answer Key. Small enough (a
//   few bullets x 65 chapters) that it doesn't need the same drill-down.
//
// Data is fetched live from the same source as the rest of the app and
// never persisted - consistent with not vendoring the copyrighted catalog
// into the repo. The concept bullets are original writing, not extracted
// from the catalog.

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronRightIcon,
  DownloadIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ReaderIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import QuestionMedia from "@/components/QuestionMedia";
import {
  appliesToLicenseClass,
  chapterLabel,
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

// 5-point questions (the ones that can sink an exam on their own) get the
// brand yellow; everything else is a plain badge.
function pointsBadgeClass(points: number) {
  return points === 5 ? "bg-signal text-signal-foreground" : "bg-secondary text-foreground";
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
}

function groupByThemeAndChapter(list: DrivingQuestion[]): ThemeGroup[] {
  const themeMap = new Map<string, ThemeGroup>();
  for (const q of list) {
    let theme = themeMap.get(q.theme_name);
    if (!theme) {
      theme = { themeName: q.theme_name, themeNumber: q.theme_number, chapters: [] };
      themeMap.set(q.theme_name, theme);
    }
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
}

function QuestionAnswerCard({ q, showChapter }: { q: DrivingQuestion; showChapter?: boolean }) {
  const isFreeEntry = q.options.length === 0;
  return (
    <li className="px-4 py-3 print:break-inside-avoid">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5 flex-wrap">
        <span className="tabular">{q.question_number}</span>
        <span className={`inline-flex items-center h-5 px-2 rounded-full font-semibold ${pointsBadgeClass(q.pointsValue)}`}>
          {q.points}
        </span>
        {showChapter && (
          <>
            <span>·</span>
            <span>
              {chapterLabel(q.chapter_name)}
            </span>
          </>
        )}
      </div>
      {(q.image_urls?.length || q.video_urls?.length) ? (
        <div className="mb-2 max-w-[220px] print:max-w-[160px]">
          <QuestionMedia imageUrls={q.image_urls} videoUrls={undefined} />
        </div>
      ) : null}
      <p className="font-medium text-[15px] leading-[22px] mb-2">{q.question_text}</p>
      {isFreeEntry ? (
        <p className="flex items-center gap-1.5 text-sm">
          <CheckIcon className="text-success shrink-0" /> Answer:{" "}
          <span className="font-semibold text-success print:underline">
            {q.correct_answers.map((a) => a.letter).join(", ")}
          </span>
        </p>
      ) : (
        <ul className="text-sm space-y-1">
          {q.options.map((opt) => {
            const isCorrect = q.correct_answers.some((c2) => c2.letter === opt.letter);
            return (
              <li
                key={opt.letter}
                className={`flex gap-2 ${isCorrect ? "font-semibold text-foreground print:underline" : "text-muted-foreground"}`}
              >
                {isCorrect ? (
                  <CheckIcon className="mt-0.5 shrink-0 text-success" aria-label="Correct" />
                ) : (
                  <span className="w-[15px] shrink-0" aria-hidden="true" />
                )}
                <span>{opt.text}</span>
              </li>
            );
          })}
        </ul>
      )}
      {q.url && (
        <a
          href={q.url}
          target="_blank"
          rel="noreferrer"
          className="text-xs underline underline-offset-2 text-muted-foreground mt-2 inline-block print:hidden"
        >
          Source
        </a>
      )}
    </li>
  );
}

function PointsFilterRow({ value, onChange }: { value: PointsFilter; onChange: (p: PointsFilter) => void }) {
  return (
    <Segmented
      label="Points"
      className="mb-5 print:hidden"
      options={(["all", "2", "3", "4", "5"] as PointsFilter[]).map((p) => ({
        value: p,
        label: p === "all" ? "All points" : `${p} pts`,
      }))}
      value={value}
      onChange={onChange}
    />
  );
}

function CheatSheetInner() {
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<Language>("de");
  const [licenseClass, setLicenseClass] = useState<LicenseClass>("all");
  const [questions, setQuestions] = useState<DrivingQuestion[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [pointsFilter, setPointsFilter] = useState<PointsFilter>("all");
  const [tab, setTab] = useState<Tab>("answers");
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [conceptTocOpen, setConceptTocOpen] = useState(false);
  const [printFull, setPrintFull] = useState(false);

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

  // Changing language/class can invalidate whatever chapter was selected -
  // back out to the chapter picker rather than risk showing a stale/empty view.
  useEffect(() => {
    setSelectedChapter(null);
  }, [lang, licenseClass]);

  // Lazily build the full print listing only when actually printing, then
  // trigger the browser print dialog once it's mounted and painted, and
  // unmount it again afterwards - keeps the expensive "render everything"
  // path off the default, interactive experience entirely.
  useEffect(() => {
    if (!printFull) return;
    const id = requestAnimationFrame(() => window.print());
    return () => cancelAnimationFrame(id);
  }, [printFull]);

  useEffect(() => {
    function onAfterPrint() {
      setPrintFull(false);
    }
    window.addEventListener("afterprint", onAfterPrint);
    return () => window.removeEventListener("afterprint", onAfterPrint);
  }, []);

  const scoped = useMemo(() => {
    if (!questions) return [];
    return licenseClass === "all" ? questions : questions.filter((q) => appliesToLicenseClass(q, licenseClass));
  }, [questions, licenseClass]);

  // Answer Key pool: license-scoped + points filter (search is applied
  // separately below, since matching search results are shown as their own
  // flat view rather than nested inside the chapter picker).
  const answerPool = useMemo(() => {
    if (pointsFilter === "all") return scoped;
    return scoped.filter((q) => q.pointsValue === Number(pointsFilter));
  }, [scoped, pointsFilter]);

  const answerGroups = useMemo(() => groupByThemeAndChapter(answerPool), [answerPool]);
  const totalAnswerQuestions = answerPool.length;

  const searchActive = tab === "answers" && keyword.trim() !== "";
  const searchResults = useMemo(() => {
    if (!searchActive) return [];
    const kw = keyword.trim().toLowerCase();
    return answerPool
      .filter((q) => q.question_text.toLowerCase().includes(kw))
      .sort((a, b) => compareDotted(a.chapter_number, b.chapter_number) || compareDotted(a.question_number, b.question_number));
  }, [answerPool, keyword, searchActive]);

  const selectedChapterData = useMemo(() => {
    if (!selectedChapter) return null;
    for (const t of answerGroups) {
      const c = t.chapters.find((c2) => c2.chapterName === selectedChapter);
      if (c) return { theme: t, chapter: c };
    }
    return null;
  }, [answerGroups, selectedChapter]);

  // --- Concepts tab: chapters that actually have a question in scope,
  // keyword matches the chapter's label/bullets rather than question text.
  const conceptGroups: ThemeGroup[] = useMemo(() => {
    const themes = groupByThemeAndChapter(scoped);
    const kw = tab === "concepts" ? keyword.trim().toLowerCase() : "";
    const result: ThemeGroup[] = [];
    for (const t of themes) {
      const chapters = kw
        ? t.chapters.filter((c) => {
            const label = chapterLabel(c.chapterName).toLowerCase();
            const bullets = CHAPTER_CONCEPTS[c.chapterName] ?? [];
            return label.includes(kw) || bullets.some((b) => b.toLowerCase().includes(kw));
          })
        : t.chapters;
      if (chapters.length > 0) result.push({ ...t, chapters });
    }
    return result;
  }, [scoped, keyword, tab]);

  // A couple of chapters (e.g. "Geschwindigkeit", "Ueberholen") legitimately
  // appear under two different themes in the catalog - count distinct
  // chapters for the headline number, not (theme, chapter) groups.
  const distinctConceptChapters = useMemo(() => {
    const names = new Set<string>();
    for (const t of conceptGroups) for (const c of t.chapters) names.add(c.chapterName);
    return names;
  }, [conceptGroups]);
  const totalConceptBullets = Array.from(distinctConceptChapters).reduce(
    (n, name) => n + (CHAPTER_CONCEPTS[name]?.length ?? 0),
    0
  );

  function selectChapter(name: string) {
    setSelectedChapter(name);
    window.scrollTo(0, 0);
  }

  function handlePrint() {
    if (tab === "concepts" || selectedChapter || searchActive) {
      window.print();
    } else {
      setPrintFull(true);
    }
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

  return (
    <main className="max-w-3xl mx-auto w-full px-4 py-6 print:max-w-none print:px-0">
      <div className="flex items-start justify-between gap-2 mb-2 print:hidden">
        <div>
          <h1 className="font-display font-bold text-[28px] leading-8">Cheat sheet</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tab === "answers" ? (
              <>
                {totalAnswerQuestions} question{totalAnswerQuestions === 1 ? "" : "s"}
                {licenseClass === "B" ? " · Class B" : " · all classes"} — pick a
                chapter to see its correct answers.
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
        <Button variant="outline" size="sm" onClick={handlePrint} className="shrink-0">
          <DownloadIcon /> Print
        </Button>
      </div>

      <Segmented
        label="Cheat sheet view"
        className="mb-3 print:hidden"
        options={[
          { value: "answers" as const, label: "Answer key" },
          { value: "concepts" as const, label: "Concepts" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "answers" ? (
        <div className="rounded-[10px] bg-warning/10 px-4 py-3 text-[13px] leading-5 mb-4 print:hidden">
          <p className="flex items-center gap-1.5 font-semibold text-warning mb-1">
            <ExclamationTriangleIcon className="shrink-0" /> Memorise the answer, not the letter
          </p>
          <p>
            On the real exam, options are shown in whatever order that particular
            screen uses - the letters here (A/B/C) are just how this dataset
            happens to list them, not a fixed position. Memorize which{" "}
            <em>answer text</em> is correct, ticked below, not &ldquo;always
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
        <div className="rounded-[10px] border border-border bg-card px-4 py-3 text-[13px] leading-5 text-muted-foreground mb-4 print:hidden">
          <p className="flex items-center gap-1.5 font-semibold text-foreground mb-1">
            <ReaderIcon className="shrink-0" /> Understand these, don&rsquo;t just recite them
          </p>
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

      {tab === "answers" && !selectedChapter && (
        <div className="relative mb-3 print:hidden">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search question text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full h-11 rounded-[10px] border border-input bg-card pl-9 pr-3 text-base placeholder:text-muted-foreground"
          />
        </div>
      )}
      {tab === "answers" && !searchActive && <PointsFilterRow value={pointsFilter} onChange={setPointsFilter} />}

      {/* ===================== ANSWER KEY TAB ===================== */}
      {tab === "answers" && searchActive && (
        <>
          <p className="text-xs text-muted-foreground mb-2 print:hidden">
            {searchResults.length} result{searchResults.length === 1 ? "" : "s"} for &ldquo;{keyword}&rdquo;
          </p>
          {searchResults.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No questions match &ldquo;{keyword}&rdquo;.</p>
          ) : (
            <ol className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border print:border-0 print:divide-y-0 print:space-y-3">
              {searchResults.map((q) => (
                <QuestionAnswerCard key={q.question_id} q={q} showChapter />
              ))}
            </ol>
          )}
        </>
      )}

      {tab === "answers" && !searchActive && selectedChapterData && (
        <>
          <button
            onClick={() => setSelectedChapter(null)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold mb-3 hover:underline underline-offset-2 print:hidden"
          >
            <ArrowLeftIcon /> All chapters
          </button>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {themeLabel(selectedChapterData.theme.themeName)}
          </p>
          <h2 className="font-display font-bold text-[22px] leading-7 mb-4">
            {chapterLabel(selectedChapterData.chapter.chapterName)}{" "}
            <span className="font-sans font-normal text-base text-muted-foreground tabular">
              · {selectedChapterData.chapter.questions.length}
            </span>
          </h2>
          {selectedChapterData.chapter.questions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              No questions in this chapter at the current points filter.
            </p>
          ) : (
            <ol className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border print:border-0 print:divide-y-0 print:space-y-3">
              {selectedChapterData.chapter.questions.map((q) => (
                <QuestionAnswerCard key={q.question_id} q={q} />
              ))}
            </ol>
          )}
        </>
      )}

      {tab === "answers" && !searchActive && !selectedChapterData && (
        <>
          {answerGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No questions at this points filter.</p>
          ) : (
            answerGroups.map((t) => (
              <div key={t.themeName} className="mb-6">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  {themeLabel(t.themeName)}
                </h2>
                <ul className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
                  {t.chapters.map((c) => (
                    <li key={c.chapterName}>
                      <button
                        onClick={() => selectChapter(c.chapterName)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary transition-colors"
                      >
                        <span className="flex-1 min-w-0 truncate text-[15px] font-medium">
                          {chapterLabel(c.chapterName)}
                        </span>
                        <span className="text-[13px] text-muted-foreground tabular shrink-0">
                          {c.questions.length}
                        </span>
                        <ChevronRightIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </>
      )}

      {/* Full listing, only mounted for the moment of printing the whole
          Answer Key (not the interactive default) - see the printFull effect. */}
      {printFull && (
        <div className="hidden print:block">
          {answerGroups.map((t) => (
            <section key={t.themeName} className="mb-8 print:break-before-page">
              <h2 className="font-display font-bold text-[22px] leading-7 border-b border-border pb-2 mb-4">
                {themeLabel(t.themeName)}
              </h2>
              {t.chapters.map((c) => (
                <div key={c.chapterName} className="mb-4 print:break-inside-avoid-page">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    {chapterLabel(c.chapterName)} ({c.questions.length})
                  </h3>
                  <ol className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border print:border-0 print:divide-y-0 print:space-y-3">
                    {c.questions.map((q) => (
                      <QuestionAnswerCard key={q.question_id} q={q} />
                    ))}
                  </ol>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}

      {/* ===================== CONCEPTS TAB ===================== */}
      {tab === "concepts" && (
        <>
          <div className="flex flex-col sm:flex-row gap-2 mb-4 print:hidden">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search chapters and key facts"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full h-11 rounded-[10px] border border-input bg-card pl-9 pr-3 text-base placeholder:text-muted-foreground"
              />
            </div>
            <Button variant="outline" onClick={() => setConceptTocOpen((o) => !o)} aria-expanded={conceptTocOpen}>
              {conceptTocOpen ? "Hide" : "Show"} contents
            </Button>
          </div>

          {conceptTocOpen && (
            <div className="rounded-2xl border border-border bg-card px-4 py-3 mb-4 text-sm print:hidden">
              <ul className="space-y-1">
                {conceptGroups.map((t) => (
                  <li key={t.themeName}>
                    <a href={`#theme-${t.themeName}`} className="font-semibold hover:underline underline-offset-2">
                      {themeLabel(t.themeName)}
                    </a>{" "}
                    <span className="text-muted-foreground">({t.chapters.length})</span>
                    <ul className="ml-4 mt-0.5 space-y-0.5">
                      {t.chapters.map((c) => (
                        <li key={c.chapterName}>
                          <a
                            href={`#ch-${c.chapterName}`}
                            className="text-[13px] text-muted-foreground hover:text-foreground hover:underline underline-offset-2"
                          >
                            {chapterLabel(c.chapterName)}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {conceptGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No chapters match &ldquo;{keyword}&rdquo;.</p>
          ) : (
            conceptGroups.map((t) => (
              <section key={t.themeName} id={`theme-${t.themeName}`} className="mb-8 print:break-before-page">
                <h2 className="flex items-center gap-2 font-display font-bold text-[22px] leading-7 border-b border-border pb-2 mb-4">
                  {themeLabel(t.themeName)}
                  <span className="font-sans text-sm font-normal text-muted-foreground tabular">· {t.chapters.length}</span>
                </h2>
                {t.chapters.map((c) => (
                  <div
                    key={c.chapterName}
                    id={`ch-${c.chapterName}`}
                    className="mb-3 rounded-2xl border border-border bg-card px-4 py-3 print:break-inside-avoid"
                  >
                    <h3 className="text-[15px] font-semibold mb-1.5">
                      {chapterLabel(c.chapterName)}
                    </h3>
                    <ul className="text-[15px] leading-[22px] space-y-1.5 list-disc pl-5 marker:text-muted-foreground">
                      {(CHAPTER_CONCEPTS[c.chapterName] ?? []).map((bullet, i) => (
                        <li key={i}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            ))
          )}
        </>
      )}

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
          "Original summaries, written for this app — not extracted from the catalogue. "
        )}
        <Link href="/practice" className="underline underline-offset-2">
          Back to Practice
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
