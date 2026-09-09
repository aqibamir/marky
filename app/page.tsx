import Link from "next/link";
import { getAllQuestions, groupByPoints } from "@/lib/drivingQuestions";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const questions = await getAllQuestions("de");
  const grouped = groupByPoints(questions);
  const themeCount = new Set(questions.map((q) => q.theme_name)).size;
  const mediaCount = questions.filter(
    (q) => (q.image_urls?.length ?? 0) > 0 || (q.video_urls?.length ?? 0) > 0
  ).length;

  return (
    <main className="flex-1 flex flex-col">
      <section className="bg-neutral-950 text-white px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            German Driving
            <br />
            Theory Test
          </h1>
          <p className="mt-4 text-neutral-400 max-w-md">
            Every official Fragenkatalog question, with photos and hazard
            clips where the exam has them. Practice by points, by theme, or
            just shuffle the whole deck.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/practice">Start practicing →</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-neutral-700 text-white hover:bg-neutral-800 hover:text-white"
            >
              <Link href="/driving-questions">Browse all questions</Link>
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-neutral-800 pt-8">
            <Stat value={questions.length} label="questions" />
            <Stat value={themeCount} label="themes" />
            <Stat value={mediaCount} label="with photo/video" />
            <Stat value="DE / EN" label="languages" />
          </div>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="max-w-4xl mx-auto">
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
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-neutral-500">{label}</div>
    </div>
  );
}

function pointsStyle(points: number) {
  switch (points) {
    case 2:
      return "bg-secondary border-border";
    case 3:
      return "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900";
    case 4:
      return "bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-900";
    case 5:
      return "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900";
    default:
      return "bg-secondary border-border";
  }
}
