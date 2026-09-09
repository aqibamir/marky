import Link from "next/link";
import {
  getAllQuestions,
  groupByPoints,
  isGrundstoff,
  isNumericAnswerQuestion,
  questionMediaType,
  themeEmoji,
  themeLabel,
} from "@/lib/drivingQuestions";
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
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight glow-text">
            German Driving
            <br />
            <span className="text-primary">Theory Test</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-md">
            Every official Fragenkatalog question, with photos and hazard
            clips where the exam has them. Practice by points, by theme, or
            just shuffle the whole deck - and see exactly where you keep
            slipping up.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/practice">Start practicing →</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/driving-questions">Browse all questions</Link>
            </Button>
          </div>

          <DueReviewBanner />

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-border pt-8">
            <Stat value={questions.length} label="questions" />
            <Stat value={themeCount} label="themes" />
            <Stat value={mediaCount} label="with photo/video" />
            <Stat value="DE / EN" label="languages" />
          </div>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-semibold text-lg mb-4">Practice by exam part</h2>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <Link
              href="/practice?part=grundstoff"
              className="rounded-2xl p-4 border border-primary/30 bg-primary/5 hover:shadow-md transition"
            >
              <div className="text-2xl">📚</div>
              <div className="font-medium text-sm mt-1">Basic knowledge</div>
              <div className="text-xs text-muted-foreground mt-1">
                Grundstoff · {grundstoffCount} questions
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Asked in every license class&rsquo;s exam
              </div>
            </Link>
            <Link
              href="/practice?part=zusatzstoff"
              className="rounded-2xl p-4 border border-accent/30 bg-accent/5 hover:shadow-md transition"
            >
              <div className="text-2xl">🚙</div>
              <div className="font-medium text-sm mt-1">Class-specific</div>
              <div className="text-xs text-muted-foreground mt-1">
                Zusatzstoff · {zusatzstoffCount} questions
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Narrows to your class when Class B mode is on
              </div>
            </Link>
          </div>

          <h2 className="font-semibold text-lg mb-4">Practice by category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {themesByCount.map(([theme, count]) => (
              <Link
                key={theme}
                href={`/practice?theme=${encodeURIComponent(theme)}`}
                className="rounded-2xl p-4 border border-border bg-card hover:shadow-md transition"
              >
                <div className="text-2xl">{themeEmoji(theme)}</div>
                <div className="font-medium text-sm mt-1">{themeLabel(theme)}</div>
                <div className="text-xs text-muted-foreground mt-1">{count} questions</div>
              </Link>
            ))}
          </div>

          <h2 className="font-semibold text-lg mb-4">Practice by type</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <Link
              href="/practice?media=video"
              className="rounded-2xl p-4 border border-border bg-card hover:shadow-md transition"
            >
              <div className="text-2xl">🎬</div>
              <div className="font-medium text-sm mt-1">Hazard videos</div>
              <div className="text-xs text-muted-foreground mt-1">{videoCount} questions</div>
            </Link>
            <Link
              href="/practice?media=image"
              className="rounded-2xl p-4 border border-border bg-card hover:shadow-md transition"
            >
              <div className="text-2xl">🖼️</div>
              <div className="font-medium text-sm mt-1">Picture questions</div>
              <div className="text-xs text-muted-foreground mt-1">{imageCount} questions</div>
            </Link>
            <Link
              href="/practice?numeric=1"
              className="rounded-2xl p-4 border border-border bg-card hover:shadow-md transition"
            >
              <div className="text-2xl">🔢</div>
              <div className="font-medium text-sm mt-1">Numbers & measurements</div>
              <div className="text-xs text-muted-foreground mt-1">{numericCount} questions</div>
            </Link>
            <Link
              href="/practice?media=none"
              className="rounded-2xl p-4 border border-border bg-card hover:shadow-md transition"
            >
              <div className="text-2xl">📝</div>
              <div className="font-medium text-sm mt-1">Text only</div>
              <div className="text-xs text-muted-foreground mt-1">
                {questions.length - mediaCount} questions
              </div>
            </Link>
          </div>

          <h2 className="font-semibold text-lg mb-4">Questions by points</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from(grouped.entries()).map(([points, qs]) => (
              <Link
                key={points}
                href={`/practice?points=${points}`}
                className={`rounded-2xl p-4 border transition hover:shadow-md ${pointsStyle(
                  points
                )}`}
              >
                <div className="text-2xl font-bold">{points}</div>
                <div className="text-xs opacity-70">
                  {points === 1 ? "Punkt" : "Punkte"}
                </div>
                <div className="text-xs opacity-70 mt-2">{qs.length} questions</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function pointsStyle(points: number) {
  switch (points) {
    case 5:
      return "bg-destructive/10 border-destructive/30";
    case 4:
      return "bg-warning/10 border-warning/30";
    case 3:
      return "bg-accent/10 border-accent/30";
    default:
      return "bg-secondary border-border";
  }
}
