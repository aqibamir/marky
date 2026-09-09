import Link from "next/link";
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

export default async function DrivingQuestionsPage({ searchParams }: PageProps) {
  const order = searchParams.order === "asc" ? "asc" : "desc";
  const lang: Language = searchParams.lang === "en" ? "en" : "de";

  const all = await getAllQuestions(lang);
  const sorted = sortByPoints(all, order);
  const grouped = groupByPoints(sorted);

  const otherOrder = order === "asc" ? "desc" : "asc";
  const otherLang = lang === "de" ? "en" : "de";

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">
        German Driving Theory Questions — sorted by points
      </h1>
      <p className="text-sm text-gray-500 mb-4">
        {all.length} questions total, sourced live from{" "}
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

      <div className="flex gap-4 mb-6 text-sm">
        <Link
          className="border rounded-md px-3 py-1 hover:bg-gray-100"
          href={`/driving-questions?order=${otherOrder}&lang=${lang}`}
        >
          Sort: {order === "desc" ? "highest → lowest" : "lowest → highest"} (click to reverse)
        </Link>
        <Link
          className="border rounded-md px-3 py-1 hover:bg-gray-100"
          href={`/driving-questions?order=${order}&lang=${otherLang}`}
        >
          Language: {lang.toUpperCase()} (switch to {otherLang.toUpperCase()})
        </Link>
      </div>

      {Array.from(grouped.entries()).map(([points, questions]: [number, DrivingQuestion[]]) => (
        <section key={points} className="mb-8">
          <h2 className="text-lg font-semibold border-b pb-1 mb-3">
            {points} {points === 1 ? "Punkt" : "Punkte"} ({questions.length} questions)
          </h2>
          <ol className="space-y-4">
            {questions.map((q: DrivingQuestion) => (
              <li key={q.question_id} className="border rounded-md p-3">
                <div className="text-xs text-gray-400 mb-1">
                  {q.question_number} · {q.theme_name}
                </div>
                <div className="font-medium mb-2">{q.question_text}</div>
                <ul className="text-sm space-y-1">
                  {q.options.map((opt: QuestionOption) => {
                    const isCorrect = q.correct_answers.some(
                      (c: QuestionOption) => c.letter === opt.letter
                    );
                    return (
                      <li
                        key={opt.letter}
                        className={isCorrect ? "font-semibold text-green-700" : ""}
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
                    className="text-xs underline text-gray-400"
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
