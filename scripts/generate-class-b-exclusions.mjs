// Regenerates lib/classBExclusions.ts
//
// The catalog has no per-license-class tagging, and chapter-level mapping is
// too coarse: chapters Class B genuinely needs (e.g. 2.2.03 Geschwindigkeit)
// also carry variants of the same question for other vehicle classes, which a
// car candidate is never asked. This flags Zusatzstoff questions belonging to
// another class - matching phrasing in BOTH the German and English catalogs
// (they share question ids) and taking the union, so the result is identical
// whichever language the app is showing.
//
// Usage: node scripts/generate-class-b-exclusions.mjs > lib/classBExclusions.ts

const SOURCES = {
  de: "https://raw.githubusercontent.com/yowmamasita/driving-theory/main/driving_theory_questions_de.json",
  en: "https://raw.githubusercontent.com/yowmamasita/driving-theory/main/driving_theory_questions.json",
};

// -- Heavy goods vehicle / bus (Class C/CE/D/DE territory) --------------------
const HV_DE = "(?:Lkw|Lastkraftwagen|Lastzug|Gliederzug|Sattelzug|Sattelkraftfahrzeug|Kraftomnibus|Omnibus|Bus)";
const HV_EN = "(?:truck|lorry|bus|coach|articulated\\s+(?:motor\\s+)?vehicle|semitrailer|tractor[- ]trailer|tractor\\s+unit)";
const HV_DE_PLURAL = "(?:Busse|Lkws|Kraftomnibusse|Omnibusse|Lastzüge)";

// -- Motorcycle / moped (Class A/A1/A2/AM/M territory) -----------------------
// Unlike Lkw/Bus, these virtually never appear as "other traffic near a car"
// in the Zusatzstoff set (verified: every match in a manual pass of all 110
// hits was rider gear, riding technique, or motorcycle-specific maintenance)
// - so any mention in a Zusatzstoff question is treated as that question's
// subject.
const MOPED_DE = "(?:Motorrad(?:es|s|fahrer\\w*)?|Kraftrad(?:es|s|fahrer\\w*)?|Leichtkraftrad|Kleinkraftrad|Mofa(?:s|fahrer\\w*)?|Leichtmofa|Moped)";
const MOPED_EN = "(?:motorcycle|motorbike|moped|light\\s+moped|small\\s+motorcycle)";

// -- Agricultural tractor (Class T/L territory) - only when it's the vehicle
// you're driving; "overtaking a farm tractor" is car-relevant and must stay.
const TRACTOR_DE = "(?:landwirtschaftlich\\w*\\s+)?Zugmaschine";
const TRACTOR_EN = "(?:farm\\s+)?tractor";

// -- Compressed-air brake systems: hydraulic brakes on a Pkw have no "air
// tank" - this equipment only exists on heavy vehicles/trailers.
const AIR_BRAKES = /Luftbehälter|Druckluftbremse|Druckluftanlage|Anhängerbremsventil|Federspeicherbremse|Feststellbremshebel im Zugfahrzeug|air\s+tank|air\s+reservoir|air[- ]brake|trailer\s+brake\s+valve|spring[- ]loaded\s+brake/i;

// -- Explicit non-B license classes named in the question (allows a plural
// "Klassen B und D1" listing, as long as a non-B/BE class is among them) ----
const OTHER_CLASS_DE = /\bKlassen?\s+[\w\s]*?\b(?:C1E|C1|CE|C|D1E|D1|DE|D|AM|A1|A2|A|L|M|T)\b/;
const OTHER_CLASS_EN = /\b(?:driving\s+(?:permit|licen[cs]e)s?|licen[cs]es?)\s+class(?:es)?\s+[\w\s]*?\b(?:C1E|C1|CE|C|D1E|D1|DE|D|AM|A1|A2|A|L|M|T)\b/i;

// -- Misc commercial/professional-only terminology ---------------------------
const COMMERCIAL = /Gelegenheitsverkehr|Linienverkehr|Fahrgastbeförderung|Güterbeförderung|Güterkraftverkehr|Kraftomnibus|Fahrgäste|Tageslenkzeit|Lenkzeit|Auflaufbremse|Wechselbehälter|ADR-Bescheinigung|über\s*3[,.]5\s*t|mehr\s+als\s+3[,.]5\s*t|7[,.]5\s*t|\b12\s*t\b|occasional\s+traffic|scheduled\s+service|passenger\s+transport|goods\s+transport|road\s+haulage|commercially|driving\s+and\s+rest|daily\s+driving\s+time|overrun\s+brake|interchangeable\s+container|exchangeable\s+load\s+carrier|ADR\s+Certificate|over\s*3\.5\s*t|more\s+than\s*3\.5\s*t|exceeding\s*3\.5\s*t|7\.5\s*t|\b12\s*t\b/i;

// Up to 2 descriptive words allowed between an article and the noun itself
// ("einem schwer beladenen Lkw", "einem voll besetzten Bus").
const ADJ = "(?:\\w+\\s+){0,2}";

function subjectVehiclePattern(noun) {
  // The noun is the vehicle in play - being driven, owned, or operated -
  // not one merely mentioned nearby ("Sie fahren hinter einem Lkw" / "rechts
  // neben einem Lkw", both car-perspective and must stay:
  //   - "mit einem/Ihrem/e/er [adj] X", "bei einem/dem X" (operational
  //     context, e.g. "wie wirkt es sich bei einem Lastzug aus...")
  //   - "in einem/dem X" (equipment/rules carried IN it)
  //   - "Sie fahren/befahren/besitzen/wollen/führen/stellen [mit] Ihr(e/en) X"
  //   - "um einen/eine X ... zu sichern" (purpose clause: securing it)
  //   - "als X-fahrer", "Ihr(es/em/en/e) X"
  return new RegExp(
    `(?:mit\\s+(?:einem|eine|einer|Ihrem|Ihrer|dem|der)\\s+${ADJ}(?:"?Tempo-100-)?${noun}` +
    `|bei\\s+(?:einem|dem)\\s+${ADJ}${noun}` +
    `|\\bin\\s+(?:einem|dem)\\s+${ADJ}${noun}\\b` +
    `|Sie\\s+(?:fahren|befahren|besitzen|wollen|führen|stellen)\\b[^.?!]{0,50}?\\b(?:mit\\s+)?(?:einen|eine|ein|einer|Ihren|Ihre|Ihr|Ihrer|den|die|das|der)\\s+${ADJ}(?:"?Tempo-100-)?${noun}` +
    `|um\\s+(?:einen|eine|ein)\\b[^.?!]{0,60}?\\b${noun}\\b[^.?!]{0,60}?\\bzu\\s+sichern` +
    `|(?:darf|dürfen)\\s+(?:ein|eine|Ihr|Ihre)\\s+${ADJ}${noun}` +
    `|als\\s+${noun}[-\\s]?fahrer` +
    `|Ihr(?:es|em|en|e)?\\s+${noun})`,
    "i"
  );
}
function subjectVehiclePatternEn(noun) {
  return new RegExp(
    `(?:driv(?:e|ing)\\s+(?:a|your|the)\\s+(?:speed[- ]limited\\s+)?${noun}` +
    `|driving\\b[^.?!]{0,40}?\\b(?:a|your|the)\\s+${noun}` +
    `|with\\s+(?:a|your|the)\\s+${noun}\\b` +
    `|speed\\s+(?:a|your|the)\\s+${noun}` +
    `|as\\s+a\\s+(?:school\\s*)?${noun}\\s+driver` +
    `|(?:a|the)\\s+${noun}\\s+with\\s+(?:a\\s+)?(?:permissible|gross)` +
    `|your\\s+${noun}\\b)`,
    "i"
  );
}

// "Ein Bus hat/ist/muss..." (descriptive-subject framing) and "Busse/Lkws
// sind/müssen/dürfen ..." or "sind Busse ... vorzuführen" (plural subject,
// either word order) - none of these match the templates above.
const HEAVY_DESCRIPTIVE = new RegExp(
  `(?:\\bEin\\w*\\s+${HV_DE}\\s+(?:hat|ist|muss|kann|darf)` +
  `|\\b${HV_DE_PLURAL}\\b[^.?!]{0,40}?\\b(?:sind|müssen|dürfen)\\b` +
  `|\\b(?:sind|müssen|dürfen)\\b[^.?!]{0,40}?\\b${HV_DE_PLURAL}\\b)`,
  "i"
);
// "Anhänger/Anhängelast ... hinter einem Lkw" (a trailer, or its load
// capacity, behind a heavy tow vehicle) - distinct from "Sie fahren hinter
// einem Lkw" (you, following a truck). "Anhäng" (not "Anhänger") is the
// shared root of both Anhänger and Anhängelast.
const TRAILER_BEHIND_HEAVY = new RegExp(`Anhäng\\w*[^.?!]{0,25}(?:hinter|an)\\s+(?:einem|dem)\\s+${ADJ}${HV_DE}`, "i");
// "wenn ein/eine Lastzug/Lkw/... [langer Zwischentext] wird" - passive
// voice describing an operational event happening TO that vehicle.
const HEAVY_PASSIVE_EVENT = new RegExp(`wenn\\s+ein\\w*\\s+${HV_DE}\\b[^.?!]{0,100}?\\bwird\\b`, "i");

const HEAVY_SUBJECT = subjectVehiclePattern(HV_DE);
const HEAVY_SUBJECT_EN = subjectVehiclePatternEn(HV_EN);
const MOPED_ANY = new RegExp(MOPED_DE, "i");
const MOPED_ANY_EN = new RegExp(MOPED_EN, "i");
const TRACTOR_SUBJECT = subjectVehiclePattern(TRACTOR_DE);
const TRACTOR_SUBJECT_EN = subjectVehiclePatternEn(TRACTOR_EN);

// A car ("Pkw"/"car") is explicitly named as the subject vehicle - overrides
// a broad/ambiguous commercial-terminology match (e.g. "Auflaufbremse" also
// applies to a Pkw-towed trailer).
const CAR_SUBJECT = /\bPkw\b|\b(?:passenger\s+)?car\b/i;

function isOtherClass(text) {
  if (HEAVY_SUBJECT.test(text) || HEAVY_SUBJECT_EN.test(text)) return true;
  if (HEAVY_DESCRIPTIVE.test(text) || TRAILER_BEHIND_HEAVY.test(text)) return true;
  if (HEAVY_PASSIVE_EVENT.test(text)) return true;
  if (MOPED_ANY.test(text) || MOPED_ANY_EN.test(text)) return true;
  if (TRACTOR_SUBJECT.test(text) || TRACTOR_SUBJECT_EN.test(text)) return true;
  if (AIR_BRAKES.test(text)) return true;
  if (OTHER_CLASS_DE.test(text) || OTHER_CLASS_EN.test(text)) return true;
  if (COMMERCIAL.test(text)) {
    return !(CAR_SUBJECT.test(text) && !HEAVY_SUBJECT.test(text) && !HEAVY_SUBJECT_EN.test(text));
  }
  return false;
}

const isZusatzstoff = (q) => {
  const m = q.theme_number.match(/(\d+)\.(\d+)\./);
  return m ? Number(m[1]) === 2 : false;
};

const flagged = new Map();
for (const [lang, url] of Object.entries(SOURCES)) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${lang} failed: ${res.status}`);
  for (const q of await res.json()) {
    if (isZusatzstoff(q) && isOtherClass(q.question_text)) {
      if (!flagged.has(q.question_id)) flagged.set(q.question_id, q.question_text);
    }
  }
}

const ids = [...flagged.keys()].sort();
process.stdout.write(`// GENERATED by scripts/generate-class-b-exclusions.mjs - do not edit by hand.
//
// Zusatzstoff questions belonging to another license class - the subject
// vehicle is a truck/bus/tractor unit, a motorcycle or moped, a farm tractor,
// uses compressed-air brakes (heavy-vehicle-only equipment), names another
// class explicitly (Klasse C/D/T/A/...), or is otherwise professional/
// commercial-driver material. Detected from question phrasing across both the
// German and English catalogs, so the two languages exclude exactly the same
// ${ids.length} questions.
export const CLASS_B_EXCLUDED_QUESTION_IDS = new Set<string>([
${ids.map((id) => `  ${JSON.stringify(id)},`).join("\n")}
]);
`);
console.error(`flagged ${ids.length} questions`);
