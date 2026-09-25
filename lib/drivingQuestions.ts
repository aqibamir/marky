// Fetches the German driving theory question catalog on demand from the
// public dataset at https://github.com/yowmamasita/driving-theory instead of
// vendoring a static copy of it into this repo. The underlying questions
// originate from the official TÜV/DEKRA "Amtlicher Fragenkatalog" and are
// third-party licensed content, so we source them live (with images
// hotlinked to their original hosts) rather than duplicating the full
// catalog as committed files here.

import { CLASS_B_EXCLUDED_QUESTION_IDS } from "./classBExclusions";

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

// A question "requires a numerical answer" when its answer options are
// themselves numbers/measurements (speed, distance, time, quantity, a sign
// number, ...) rather than descriptive text - e.g. "50 km/h" / "30 km/h" /
// "20 km/h", or "110" / "112" / "115".
function looksNumeric(text: string): boolean {
  return /^[+-]?\d+([.,]\d+)?/.test(text.trim());
}

// Some questions aren't multiple choice at all: the catalog ships them with
// no options and the answer stored as the number itself, and the exam has
// you type it in ("____ m", "____ km/h").
export function isFreeEntryQuestion(q: RawDrivingQuestion): boolean {
  return q.options.length === 0 && q.correct_answers.length > 0;
}

export function isNumericAnswerQuestion(q: RawDrivingQuestion): boolean {
  // Fill-in-the-number questions are numeric by definition.
  if (isFreeEntryQuestion(q)) {
    return q.correct_answers.every((a) => looksNumeric(a.letter));
  }
  if (q.options.length < 2) return false;
  const numericCount = q.options.filter((o) => looksNumeric(o.text)).length;
  return numericCount >= Math.max(2, q.options.length - 1);
}

// The official Fragenkatalog is split into "Thema 1.x" (Grundstoff - basic
// knowledge asked in every license class's exam) and "Thema 2.x"
// (Zusatzstoff - only asked for specific classes). Within Zusatzstoff, only
// some of the theme numbers apply to a given class; per driving-school
// references for Klasse B (car), that's themes 2.1/2.2/2.5/2.6/2.7 - not
// 2.4 (traffic signs) or 2.8 (professional-driver fitness), which belong to
// other classes. We only have a verified mapping for Class B so far.
export type LicenseClass = "all" | "B";

function themeMajorMinor(themeNumber: string): [number, number] | null {
  const m = themeNumber.match(/(\d+)\.(\d+)\./);
  if (!m) return null;
  return [parseInt(m[1], 10), parseInt(m[2], 10)];
}

export function isGrundstoff(q: RawDrivingQuestion): boolean {
  return themeMajorMinor(q.theme_number)?.[0] === 1;
}

const CLASS_B_ZUSATZSTOFF_MINORS = new Set([1, 2, 5, 6, 7]);

// Theme-level alone is too coarse: a few chapters sitting inside otherwise
// Class-B-relevant themes are squarely commercial-vehicle material, scoped
// by law to vehicles over 3.5 t or to commercial passenger/goods transport,
// so a car candidate never sees them. Keyed on the chapter's numeric code,
// which is the same in the German and English catalogs.
const CLASS_B_EXCLUDED_CHAPTERS = new Set([
  "2.6.04", // Lenk- und Ruhezeiten (EU driving/rest times, >3.5 t)
  "2.6.05", // EG-Kontrollgerät (tachograph)
  "2.6.06", // Abmessungen, Gewichte und Geschwindigkeitsbegrenzer
  "2.2.30", // Sonntagsfahrverbot (HGV weekend/holiday ban)
  "2.7.09", // Entgegennahme, Transport und Ablieferung der Güter
]);

function chapterCode(chapterNumber: string): string | null {
  return chapterNumber.match(/\d+\.\d+\.\d+/)?.[0] ?? null;
}

// The theory exam itself is asked in two parts: Grundstoff (basic knowledge,
// identical for every license class) and Zusatzstoff (the questions specific
// to the class you're taking). Klasse B, for example, is 20 Grundstoff + 10
// Zusatzstoff questions. Combine this with the license-class mode to get
// "Class B specific" rather than "any class's Zusatzstoff".
export type ExamPart = "all" | "grundstoff" | "zusatzstoff";

export function matchesExamPart(q: RawDrivingQuestion, part: ExamPart): boolean {
  if (part === "all") return true;
  return part === "grundstoff" ? isGrundstoff(q) : !isGrundstoff(q);
}

export function appliesToLicenseClass(q: RawDrivingQuestion, cls: LicenseClass): boolean {
  if (cls === "all") return true;
  const mm = themeMajorMinor(q.theme_number);
  if (!mm) return true;
  const [major, minor] = mm;
  if (major === 1) return true; // Grundstoff applies to every class
  if (cls === "B") {
    if (major !== 2 || !CLASS_B_ZUSATZSTOFF_MINORS.has(minor)) return false;
    const code = chapterCode(q.chapter_number);
    if (code && CLASS_B_EXCLUDED_CHAPTERS.has(code)) return false;
    // Chapters Class B does need still carry the Lkw/Bus variants of the same
    // question (2.2.03 Geschwindigkeit is half truck/bus speed limits), so
    // drop those individually too.
    return !CLASS_B_EXCLUDED_QUESTION_IDS.has(q.question_id);
  }
  return true;
}

// Friendly English label + icon for every catalog chapter (finer-grained
// than the 8 top-level themes above). Straight administrative translation of
// the catalog's own chapter names, not creative content.
export const CHAPTER_INFO: Record<string, { label: string; emoji: string }> = {
  "Fahrbetrieb Fahrphysik Fahrtechnik": { label: "Vehicle Dynamics & Technique", emoji: "🏎️" },
  "Besondere Verkehrssituationen": { label: "Special Traffic Situations", emoji: "⚠️" },
  "Vorschriftzeichen": { label: "Mandatory Signs", emoji: "🔵" },
  "Ueberholen": { label: "Overtaking", emoji: "🔄" },
  "Sonstige Pflichten Des Fahrzeugfuehrers": { label: "Driver's General Duties", emoji: "📋" },
  "Umweltschutz": { label: "Environmental Protection", emoji: "🌱" },
  "Maengelerkennung Lokalisierung Von Stoerungen": { label: "Diagnosing Faults", emoji: "🔍" },
  "Fahrbahn Und Witterungsverhaeltnisse": { label: "Road & Weather Conditions", emoji: "🌧️" },
  "Bremsanlagen Und Geschwindigkeitsregler": { label: "Brakes & Speed Limiters", emoji: "🛑" },
  "Geschwindigkeit": { label: "Speed", emoji: "🚦" },
  "Abbiegen Wenden Und Rueckwaertsfahren": { label: "Turning, U-Turns & Reversing", emoji: "↩️" },
  "Ladung": { label: "Cargo & Loading", emoji: "📦" },
  "Zulassung Zum Strassenverkehr Fahrzeugpapiere Fahrerlaubnis": { label: "Registration & Licensing", emoji: "📄" },
  "Verhalten Gegenueber Fussgaengern": { label: "Behavior Toward Pedestrians", emoji: "🚶" },
  "Gefahrzeichen": { label: "Warning Signs", emoji: "⚠️" },
  "Richtzeichen": { label: "Informational Signs", emoji: "ℹ️" },
  "Vorfahrt Vorrang": { label: "Right of Way", emoji: "🛑" },
  "Halten Und Parken": { label: "Stopping & Parking", emoji: "🅿️" },
  "Autobahnen Und Kraftfahrstrassen": { label: "Motorways & Expressways", emoji: "🛣️" },
  "Personenbefoerderung": { label: "Passenger Transport", emoji: "🚌" },
  "Affektiv Emotionales Verhalten Im Strassenverkehr": { label: "Emotional Behavior in Traffic", emoji: "😤" },
  "Verwendung Und Wartung Von Reifen": { label: "Tire Use & Maintenance", emoji: "⚙️" },
  "Unfall": { label: "Accidents", emoji: "🚑" },
  "Beleuchtung": { label: "Lighting", emoji: "💡" },
  "Anhaengerbetrieb": { label: "Trailer Operation", emoji: "🚛" },
  "Lenk Und Ruhezeiten": { label: "Driving & Rest Times", emoji: "⏱️" },
  "Abmessungen Gewichte Und Geschwindigkeitsbegrenzer": { label: "Dimensions, Weights & Speed Limiters", emoji: "📏" },
  "Anhaengekupplungssysteme": { label: "Trailer Coupling Systems", emoji: "🔗" },
  "Autobahn": { label: "Motorway", emoji: "🛤️" },
  "Grundformen Des Verkehrsverhaltens": { label: "Basic Traffic Behavior", emoji: "🚗" },
  "Alkohol Drogen Medikamente": { label: "Alcohol, Drugs & Medication", emoji: "🍺" },
  "Wechsellichtzeichen Und Dauerlichtzeichen": { label: "Traffic Lights", emoji: "🚥" },
  "Abstand": { label: "Following Distance", emoji: "↔️" },
  "Benutzung Von Fahrstreifen Durch Kraftfahrzeuge": { label: "Lane Usage", emoji: "🛣️" },
  "Lesen Einer Strassenkarte Und Streckenplanung": { label: "Map Reading & Route Planning", emoji: "🗺️" },
  "Strassenbenutzung": { label: "Road Usage", emoji: "🛣️" },
  "Bahnuebergaenge": { label: "Level Crossings", emoji: "🚆" },
  "Entgegennahme Transport Und Ablieferung Der Gueter": { label: "Freight Handling & Delivery", emoji: "📦" },
  "Besondere Verkehrslagen": { label: "Special Traffic Conditions", emoji: "⚠️" },
  "Verhalten An Fussgaengerueberwegen Und Gegenueber Fussgaengern": { label: "Crosswalks & Pedestrians", emoji: "🚸" },
  "Sorgfaltspflichten": { label: "Duty of Care", emoji: "🤝" },
  "Verbrennungsmaschine Fluessigkeiten Kraftstoffsystem Elektrische Anlage Zuendung Kraftuebertragung": {
    label: "Engine, Fluids & Electrical Systems",
    emoji: "🔧",
  },
  "Eignung Und Befaehigung Von Kraftfahrern": { label: "Driver Fitness & Qualification", emoji: "🩺" },
  "Dunkelheit Und Schlechte Sicht": { label: "Darkness & Poor Visibility", emoji: "🌙" },
  "Oeffentliche Verkehrsmittel Und Schulbusse": { label: "Public Transport & School Buses", emoji: "🚌" },
  "Liegenbleiben Und Abschleppen Von Fahrzeugen": { label: "Breakdowns & Towing", emoji: "🆘" },
  "Ausruestung Von Fahrzeugen": { label: "Vehicle Equipment", emoji: "🧰" },
  "Zeichen Und Weisungen Der Polizeibeamten": { label: "Police Signals", emoji: "👮" },
  "Untersuchung Der Fahrzeuge": { label: "Vehicle Inspection", emoji: "🔍" },
  "Wartung Von Kraftfahrzeugen Und Rechtzeitige Veranlassung Von Reparaturen": {
    label: "Vehicle Maintenance & Repairs",
    emoji: "🛠️",
  },
  "Einfahren Und Anfahren": { label: "Entering Traffic & Starting Off", emoji: "🚗" },
  "Ermuedung Ablenkung": { label: "Fatigue & Distraction", emoji: "😴" },
  "Warnzeichen": { label: "Warning Signals", emoji: "⚠️" },
  "Verkehrshindernisse": { label: "Traffic Obstructions", emoji: "🚧" },
  "Eg Kontrollgeraet": { label: "EU Tachograph", emoji: "📟" },
  "Schmier Und Frostschutzmittel": { label: "Lubricants & Antifreeze", emoji: "🧴" },
  "Sonntagsfahrverbot": { label: "Sunday/Holiday Driving Ban", emoji: "🚫" },
  "Vorbeifahren": { label: "Passing / Driving By", emoji: "➡️" },
  "Blaues Blinklicht Und Gelbes Blinklicht": { label: "Blue & Yellow Beacons", emoji: "🔵" },
  "Einrichtungen Zur Ueberwachung Der Parkzeit": { label: "Parking Time Devices", emoji: "⏲️" },
  "Uebermaessige Strassenbenutzung": { label: "Excessive Road Use", emoji: "🚫" },
  "Gesundheitsrisiken": { label: "Health Risks", emoji: "🏥" },
  "Grundregeln Ueber Das Verhalten Im Strassenverkehr": { label: "Basic Rules of Traffic Behavior", emoji: "📖" },
  "Verkehrseinrichtungen": { label: "Traffic Installations", emoji: "🚏" },
  "Fahrzeuge Mit Vorfahrt": { label: "Vehicles with Right of Way", emoji: "🚨" },
};

export function chapterLabel(chapter: string): string {
  return CHAPTER_INFO[chapter]?.label ?? chapter;
}

export function chapterEmoji(chapter: string): string {
  return CHAPTER_INFO[chapter]?.emoji ?? "📘";
}

// --- Cross-cutting content tags (generated - see scripts/generate-question-tags.mjs) ---
import { QUESTION_TAGS, TAG_INFO } from "./questionTags.generated";
export { TAG_INFO };
export type { QUESTION_TAGS };

export function getContentTags(q: RawDrivingQuestion): string[] {
  return QUESTION_TAGS[q.question_id] ?? [];
}

export function tagLabel(tag: string): string {
  return TAG_INFO[tag]?.label ?? tag;
}

export function tagEmoji(tag: string): string {
  return TAG_INFO[tag]?.emoji ?? "🏷️";
}

// Every logical category a question belongs to, in one place: its theme,
// chapter, Grundstoff/Zusatzstoff part, media type, whether it needs a
// numeric/typed answer, and any cross-cutting content tags. This is the
// full "tag set" used for filtering and for display (e.g. a question's tag
// chips on its card).
export function getAllTags(q: DrivingQuestion): string[] {
  const tags: string[] = [q.theme_name, q.chapter_name];
  tags.push(isGrundstoff(q) ? "grundstoff" : "zusatzstoff");
  const media = questionMediaType(q);
  if (media !== "none") tags.push(media);
  if (isNumericAnswerQuestion(q)) tags.push("numeric");
  if (isFreeEntryQuestion(q)) tags.push("free_entry");
  tags.push(...getContentTags(q));
  return tags;
}
