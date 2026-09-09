import { NextRequest, NextResponse } from "next/server";
import {
  getAllQuestions,
  sortByPoints,
  type Language,
} from "@/lib/drivingQuestions";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const lang = (searchParams.get("lang") === "en" ? "en" : "de") as Language;
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";
  const pointsFilter = searchParams.get("points");

  try {
    const all = await getAllQuestions(lang);
    let questions = sortByPoints(all, order);

    if (pointsFilter) {
      const wanted = parseInt(pointsFilter, 10);
      questions = questions.filter((q) => q.pointsValue === wanted);
    }

    const breakdown = all.reduce<Record<number, number>>((acc, q) => {
      acc[q.pointsValue] = (acc[q.pointsValue] ?? 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      total: questions.length,
      totalOverall: all.length,
      pointsBreakdown: breakdown,
      order,
      lang,
      questions,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load driving theory questions" },
      { status: 502 }
    );
  }
}
