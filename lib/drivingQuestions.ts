// Fetches the German driving theory question catalog on demand from the
// public dataset at https://github.com/yowmamasita/driving-theory instead of
// vendoring a static copy of it into this repo. The underlying questions
// originate from the official TÜV/DEKRA "Amtlicher Fragenkatalog" and are
// third-party licensed content, so we source them live (with images
// hotlinked to their original hosts) rather than duplicating the full
// catalog as committed files here.

export interface QuestionOption {
  letter: string;
  text: string;
}

export interface RawDrivingQuestion {
  theme_number: string;
  theme_name: string;
  chapter_number: string;
  chapter_name: string;
  question_id: string;
  question_number: string;
  points: string; // e.g. "4 Punkte"
  question_text: string;
  options: QuestionOption[];
  correct_answers: QuestionOption[];
  comment: string;
  url?: string;
  image_urls?: string[];
  video_urls?: string[];
}

export interface DrivingQuestion extends RawDrivingQuestion {
  pointsValue: number;
}

export type Language = "de" | "en";

const SOURCE_URL: Record<Language, string> = {
  de: "https://raw.githubusercontent.com/yowmamasita/driving-theory/main/driving_theory_questions_de.json",
  en: "https://raw.githubusercontent.com/yowmamasita/driving-theory/main/driving_theory_questions.json",
};

// Revalidate periodically rather than re-fetching on every request, and
// rather than persisting a copy of the dataset in this repo.
const REVALIDATE_SECONDS = 60 * 60 * 6; // 6 hours

function parsePoints(points: string): number {
  const match = points.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

export async function getAllQuestions(lang: Language = "de"): Promise<DrivingQuestion[]> {
  const res = await fetch(SOURCE_URL[lang], {
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch driving theory questions (${res.status})`);
  }

  const raw: RawDrivingQuestion[] = await res.json();

  return raw.map((q) => ({
    ...q,
    pointsValue: parsePoints(q.points),
  }));
}

export function sortByPoints(
  questions: DrivingQuestion[],
  order: "asc" | "desc" = "desc"
): DrivingQuestion[] {
  const sorted = [...questions].sort((a, b) => a.pointsValue - b.pointsValue);
  return order === "desc" ? sorted.reverse() : sorted;
}

export function groupByPoints(questions: DrivingQuestion[]): Map<number, DrivingQuestion[]> {
  const groups = new Map<number, DrivingQuestion[]>();
  for (const q of questions) {
    const bucket = groups.get(q.pointsValue) ?? [];
    bucket.push(q);
    groups.set(q.pointsValue, bucket);
  }
  return new Map(Array.from(groups.entries()).sort((a, b) => b[0] - a[0]));
}

export async function getQuestionsSortedByPoints(
  lang: Language = "de",
  order: "asc" | "desc" = "desc"
): Promise<DrivingQuestion[]> {
  const all = await getAllQuestions(lang);
  return sortByPoints(all, order);
}

export type MediaType = "video" | "image" | "none";

export function questionMediaType(q: RawDrivingQuestion): MediaType {
  if (q.video_urls?.length) return "video";
  if (q.image_urls?.length) return "image";
  return "none";
}

// Friendly English label + icon for each raw German theme name, so filters
// and category chips don't just dump the raw catalog theme strings on users.
export const THEME_INFO: Record<string, { label: string; emoji: string }> = {
  "Verkehrszeichen": { label: "Traffic Signs", emoji: "🚸" },
  "Gefahrenlehre": { label: "Hazard Perception", emoji: "⚠️" },
  "Verhalten Im Strassenverkehr": { label: "Road Behavior", emoji: "🚗" },
  "Technik": { label: "Vehicle Technology", emoji: "🔧" },
  "Vorschriften Ueber Den Betrieb Der Fahrzeuge": {
    label: "Vehicle Operation Rules",
    emoji: "📋",
  },
  "Umweltschutz": { label: "Environment", emoji: "🌱" },
  "Vorfahrt Vorrang": { label: "Right of Way", emoji: "🛑" },
  "Eignung Und Befaehigung Von Kraftfahrern": {
    label: "Driver Fitness",
    emoji: "🩺",
  },
};

export function themeLabel(theme: string): string {
  return THEME_INFO[theme]?.label ?? theme;
}

export function themeEmoji(theme: string): string {
  return THEME_INFO[theme]?.emoji ?? "📘";
}
