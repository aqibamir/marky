import Link from "next/link";
import QuestionMedia from "@/components/QuestionMedia";
import {
  getAllQuestions,
  groupByPoints,
  sortByPoints,
  type DrivingQuestion,
  type Language,
  type QuestionOption,
} from "@/lib/drivingQuestions";

export const metadata = {
  title: "German Driving Theory Questions by Points",
};

interface PageProps {
  searchParams: { order?: string; lang?: string };
}

function pointsBadgeClass(points: number) {
  switch (points) {
    case 2:
      return "bg-secondary text-secondary-foreground";
    case 3:
      return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
    case 4:
      return "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300";
    case 5:
      return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
    default:
      return "bg-secondary text-secondary-foreground";
  }
}

export default async function DrivingQuestionsPage({ searchParams }: PageProps) {
  const order = searchParams.order === "asc" ? "asc" : "desc";
  const lang: Language = searchParams.lang === "en" ? "en" : "de";

  const all = await getAllQuestions(lang);
  const sorted = sortByPoints(all, order);
  const grouped = groupByPoints(sorted);

  const otherOrder = order === "asc" ? "desc" : "asc";
  const otherLang = lang === "de" ? "en" : "de";

  return (
    <main className="max-w-3xl mx-auto w-full px-4 py-6">
      <div className="flex items-center justify-between mb-2 gap-2">
        <h1 className="text-xl sm:text-2xl font-bold">
          All questions — sorted by points
        </h1>
        <Link
          href="/practice"
          className="text-sm font-medium border border-border rounded-full px-3 py-1.5 whitespace-nowrap hover:bg-secondary"
        >
          Practice →
        </Link>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {all.length} questions, sourced live from{" "}
        <a
          className="underline"
          href="https://github.com/yowmamasita/driving-theory"
          target="_blank"
          rel="noreferrer"
        >
          yowmamasita/driving-theory
        </a>{" "}
        (originally the official TÜV/DEKRA Fragenkatalog). Each question links
        back to its original source.
      </p>

      <div className="flex flex-wrap gap-2 mb-6 text-sm">
        <Link
          className="border border-border rounded-full px-3 py-1.5 hover:bg-secondary"
          href={`/driving-questions?order=${otherOrder}&lang=${lang}`}
        >
          Sort: {order === "desc" ? "highest → lowest" : "lowest → highest"}
        </Link>
        <Link
          className="border border-border rounded-full px-3 py-1.5 hover:bg-secondary"
          href={`/driving-questions?order=${order}&lang=${otherLang}`}
        >
          {lang.toUpperCase()} → {otherLang.toUpperCase()}
        </Link>
      </div>

      {Array.from(grouped.entries()).map(([points, questions]: [number, DrivingQuestion[]]) => (
        <section key={points} className="mb-8">
          <h2 className="flex items-center gap-2 text-lg font-semibold border-b border-border pb-2 mb-3">
            <span className={`px-2 py-0.5 rounded-full text-sm ${pointsBadgeClass(points)}`}>
              {points} {points === 1 ? "Punkt" : "Punkte"}
            </span>
            <span className="text-sm font-normal text-muted-foreground">
              {questions.length} questions
            </span>
          </h2>
          <ol className="space-y-3">
            {questions.map((q: DrivingQuestion) => (
              <li key={q.question_id} className="rounded-2xl border border-border bg-card shadow-sm p-4">
                <div className="text-xs text-muted-foreground mb-2">
                  {q.question_number} · {q.theme_name}
                </div>
                <QuestionMedia imageUrls={q.image_urls} videoUrls={q.video_urls} />
                <div className="font-medium mb-2">{q.question_text}</div>
                <ul className="text-sm space-y-1">
                  {q.options.map((opt: QuestionOption) => {
                    const isCorrect = q.correct_answers.some(
                      (c: QuestionOption) => c.letter === opt.letter
                    );
                    return (
                      <li
                        key={opt.letter}
                        className={isCorrect ? "font-semibold text-success" : ""}
                      >
                        {opt.letter} {opt.text}
                      </li>
                    );
                  })}
                </ul>
                {q.url && (
                  <a
                    href={q.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs underline text-muted-foreground"
                  >
                    source
                  </a>
                )}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </main>
  );
}
