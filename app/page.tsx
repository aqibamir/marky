import Link from "next/link";
import {
  getAllQuestions,
  groupByPoints,
  isGrundstoff,
  isNumericAnswerQuestion,
  questionMediaType,
  themeLabel,
} from "@/lib/drivingQuestions";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import DueReviewBanner from "@/components/DueReviewBanner";

export default async function Home() {
  const questions = await getAllQuestions("de");
  const grouped = groupByPoints(questions);
  const videoCount = questions.filter((q) => questionMediaType(q) === "video").length;
  const imageCount = questions.filter((q) => questionMediaType(q) === "image").length;
  const numericCount = questions.filter(isNumericAnswerQuestion).length;
  const grundstoffCount = questions.filter(isGrundstoff).length;
  const zusatzstoffCount = questions.length - grundstoffCount;
  const themeCount = new Set(questions.map((q) => q.theme_name)).size;
  const mediaCount = videoCount + imageCount;

  const themeCounts = new Map<string, number>();
  for (const q of questions) {
    themeCounts.set(q.theme_name, (themeCounts.get(q.theme_name) ?? 0) + 1);
  }
  const themesByCount = Array.from(themeCounts.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <main className="flex-1 flex flex-col">
      <div className="max-w-4xl w-full mx-auto px-4 pt-8 pb-12 sm:pt-14">
        <section className="max-w-xl">
          <h1 className="font-display font-bold text-[40px] leading-[42px] sm:text-[56px] sm:leading-[56px] tracking-tight">
            Pass the German theory test.
          </h1>
          <p className="mt-3 text-muted-foreground text-[17px] leading-relaxed">
            Every official Fragenkatalog question, with the photos and hazard clips the
            exam uses. Practise by category or points, and see exactly where you keep
            slipping up.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-2">
            <Button asChild size="lg">
              <Link href="/practice">
                Start practising <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/cheatsheet">Browse all questions</Link>
            </Button>
          </div>
        </section>

        <DueReviewBanner />

        <dl className="mt-6 grid grid-cols-3 gap-2">
          <Stat value={questions.length.toLocaleString("en")} label="questions" />
          <Stat value={themeCount} label="categories" />
          <Stat value={mediaCount.toLocaleString("en")} label="with photo or video" />
        </dl>

        <Section title="By exam part">
          <div className="grid grid-cols-2 gap-2">
            <Tile
              href="/practice?part=grundstoff"
              name="Basic knowledge"
              sub={`Grundstoff · ${grundstoffCount} questions`}
              note="Asked in every licence class"
            />
            <Tile
              href="/practice?part=zusatzstoff"
              name="Class-specific"
              sub={`Zusatzstoff · ${zusatzstoffCount} questions`}
              note="Narrows to your class in Class B mode"
            />
          </div>
        </Section>

        <Section title="By category">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {themesByCount.map(([theme, count]) => (
              <Tile
                key={theme}
                href={`/practice?theme=${encodeURIComponent(theme)}`}
                name={themeLabel(theme)}
                sub={`${count} questions`}
              />
            ))}
          </div>
        </Section>

        <Section title="By question type">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Tile href="/practice?media=video" name="Hazard videos" sub={`${videoCount} questions`} />
            <Tile href="/practice?media=image" name="Picture questions" sub={`${imageCount} questions`} />
            <Tile href="/practice?numeric=1" name="Numbers & distances" sub={`${numericCount} questions`} />
            <Tile href="/practice?media=none" name="Text only" sub={`${questions.length - mediaCount} questions`} />
          </div>
        </Section>

        <Section title="By points">
          <div className="grid grid-cols-4 gap-2">
            {Array.from(grouped.entries()).map(([points, qs]) => (
              <Link
                key={points}
                href={`/practice?points=${points}`}
                className={`rounded-[10px] border px-3 py-3 transition-colors ${
                  points === 5
                    ? "bg-signal border-signal text-signal-foreground hover:bg-signal/90"
                    : "bg-card border-border hover:bg-secondary"
                }`}
              >
                <div className="font-display font-bold text-[32px] leading-9 tabular">{points}</div>
                <div className={`text-[13px] ${points === 5 ? "" : "text-muted-foreground"}`}>
                  {points === 1 ? "Punkt" : "Punkte"} · {qs.length}
                </div>
              </Link>
            ))}
          </div>
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-semibold text-[17px] mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Tile({ href, name, sub, note }: { href: string; name: string; sub: string; note?: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-0.5 rounded-[10px] border border-border bg-card px-4 py-3 hover:bg-secondary transition-colors"
    >
      <span className="font-semibold text-[15px] leading-5">{name}</span>
      <span className="text-[13px] text-muted-foreground">{sub}</span>
      {note && <span className="text-[13px] text-muted-foreground">{note}</span>}
    </Link>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-[10px] border border-border bg-card px-3 py-3">
      <dd className="font-display font-semibold text-[28px] leading-8 tabular">{value}</dd>
      <dt className="text-[13px] text-muted-foreground leading-tight">{label}</dt>
    </div>
  );
}
