// Numbers cheat sheet: every Class B question whose answer is (or contains) a
// number - speeds, distances, weights, times, formulas - grouped by topic,
// with the rules of thumb behind the calculated ones. Original writing from a
// full read of those questions; the catalog itself is fetched live.
//
// Evidence uses the same format as lib/studyGuide.ts ("ID", "ID=text",
// "ID~text", quoting the English wording). scripts/verify-study-guide.mjs
// checks every citation, checks that every number question in the Class B
// pool (see isNumberQuestion) is cited by at least one topic, and runs the
// formulas below against FORMULA_CHECKS to confirm they reproduce the
// catalog's answers.

import type { RawDrivingQuestion } from "./drivingQuestions";
import type { StudyPoint } from "./studyGuide";

// --- Rules of thumb (v = speed in km/h, results in metres) -----------------

/** Distance covered during a 1-second reaction: (v / 10) x 3. */
export const reactionDistance = (v: number) => (v / 10) * 3;
/** Braking distance, normal braking: (v / 10) x (v / 10). */
export const brakingDistance = (v: number) => (v / 10) ** 2;
/** Braking distance, emergency braking: half the normal braking distance. */
export const emergencyBrakingDistance = (v: number) => brakingDistance(v) / 2;
/** Stopping distance = reaction distance + braking distance. */
export const stoppingDistance = (v: number) => reactionDistance(v) + brakingDistance(v);
/** Stopping distance with emergency braking. */
export const emergencyStoppingDistance = (v: number) => reactionDistance(v) + emergencyBrakingDistance(v);
/** Safe following distance outside built-up areas: half the speedometer, in metres. */
export const followingDistance = (v: number) => v / 2;
/** Kilometres per centimetre on a 1:scale map. */
export const mapKmPerCm = (scale: number) => scale / 100000;
/** Minimum vertical (nose) load on a trailer coupling: 4% of the trailer's actual weight. */
export const minVerticalLoad = (trailerKg: number) => trailerKg * 0.04;
/** Heaviest trailer a Class B licence allows: combination max 3500 kg, and never above the car's permitted towed load. */
export const maxTrailerClassB = (carMaxMassKg: number, permittedTowedKg: number) =>
  Math.max(750, Math.min(3500 - carMaxMassKg, permittedTowedKg));
/** Parking disc: set the next half hour after you arrive (10:40 → 11:00). Returns hours as a decimal. */
export const parkingDiscTime = (hour: number, minute: number) => (minute === 0 || minute === 30 ? hour + minute / 60 : minute < 30 ? hour + 0.5 : hour + 1);

export interface FormulaCheck {
  id: string;
  what: string;
  /** The correct answer must contain this (a number is compared numerically against the answer's numbers). */
  expect?: number | string;
  /** Multiple choice: the correct options must be exactly those whose (first) number passes. */
  correctIf?: (n: number) => boolean;
}

// Each line recomputes a catalog answer from the rules above.
export const FORMULA_CHECKS: FormulaCheck[] = [
  { id: "2.2.03-008", what: "reaction distance at 100 km/h", expect: reactionDistance(100) },
  { id: "2.2.03-011", what: "reaction distance at 50 km/h", expect: reactionDistance(50) },
  { id: "2.2.03-007", what: "braking distance at 100 km/h", expect: brakingDistance(100) },
  { id: "2.2.03-010", what: "braking distance at 50 km/h", expect: brakingDistance(50) },
  { id: "1.2.03-106", what: "braking distance at 60 km/h", expect: brakingDistance(60) },
  { id: "1.2.03-102", what: "braking distance when speed doubles (factor)", expect: brakingDistance(100) / brakingDistance(50) },
  { id: "2.1.07-109", what: "braking distance 50 → 100 km/h", expect: brakingDistance(100) },
  { id: "2.1.07-208", what: "reaction distance 50 → 100 km/h", expect: reactionDistance(100) },
  { id: "2.2.03-016", what: "emergency braking distance at 50 km/h", expect: emergencyBrakingDistance(50) },
  { id: "2.2.03-006", what: "stopping distance at 100 km/h", expect: stoppingDistance(100) },
  { id: "2.2.03-009", what: "stopping distance at 50 km/h", expect: stoppingDistance(50) },
  { id: "2.1.02-002", what: "speeds where a child 20 m ahead can't be avoided (emergency stop > 20 m)", correctIf: (v) => emergencyStoppingDistance(v) > 20 },
  { id: "2.2.37-002", what: "amber at 40 km/h, 10 m from the line (stopping distance 28 m)", expect: stoppingDistance(40) > 10 ? "Proceed" : "Stop" },
  { id: "2.2.37-003", what: "amber at 40 km/h, 40 m from the line (stopping distance 28 m)", expect: stoppingDistance(40) > 40 ? "Proceed" : "Stop" },
  { id: "2.2.04-004", what: "following distance at 100 km/h", expect: followingDistance(100) },
  { id: "2.1.07-110", what: "following distance after speeding up to 100 km/h", expect: followingDistance(100) },
  { id: "2.2.04-002", what: "following distance in town at 50 km/h (1 second)", expect: reactionDistance(50) },
  { id: "2.2.03-012", what: "max stopping distance when you can see 50 m on a narrow road", expect: 50 / 2 },
  { id: "2.6.07-207", what: "1:300,000 map", expect: mapKmPerCm(300000) },
  { id: "2.6.07-218", what: "1:200,000 map", expect: mapKmPerCm(200000) },
  { id: "2.6.03-406", what: "minimum vertical load, 600 kg trailer", expect: minVerticalLoad(600) },
  { id: "2.6.02-104", what: "heaviest trailer: car 2400 kg max mass, 1500 kg towed load", correctIf: (kg) => kg <= maxTrailerClassB(2400, 1500) },
  { id: "2.2.13-003", what: "parking disc on arrival at 10:40", expect: parkingDiscTime(10, 40) },
  { id: "1.1.09-006", what: "hours to clear 1.0 per mille at about 0.1 per mille per hour", expect: 1.0 / 0.1 },
];

// --- Which questions count as "number questions" ----------------------------

/**
 * A question whose answer is a number, or whose options contain digits. Some
 * questions spell the number out in one language only ("drei Minuten" /
 * "3 minutes"), so the sheet's list also includes every question a topic
 * cites - and the verifier checks coverage in both languages.
 */
export function isNumberQuestion(q: RawDrivingQuestion): boolean {
  if (q.options.length === 0) return q.correct_answers.length > 0;
  return q.options.some((o) => /\d/.test(o.text));
}

// --- Topics -----------------------------------------------------------------

export interface NumberTopic {
  id: string;
  emoji: string;
  title: string;
  intro: string;
  facts: StudyPoint[];
  traps: StudyPoint[];
}

export const NUMBER_TOPICS: NumberTopic[] = [
  {
    id: "formulas",
    emoji: "🧮",
    title: "Formulas - stopping, braking, following",
    intro: "v = your speed in km/h. Every formula gives metres. Drop the last zero of the speed first (100 km/h → 10), then multiply.",
    facts: [
      {
        text: "Reaction distance = (v ÷ 10) × 3. That's how far you travel in the 1 second before your foot reaches the brake. 50 km/h → 15 m, 100 km/h → 30 m. The same number is how far you travel in one second at that speed.",
        evidence: ["1.2.03-104=/{10} x 3", "2.2.03-011=15", "2.2.03-008=30"],
      },
      {
        text: "Braking distance (normal braking) = (v ÷ 10) × (v ÷ 10). 30 km/h → 9 m, 50 km/h → 25 m, 60 km/h → 36 m, 100 km/h → 100 m.",
        evidence: ["1.2.03-105={speed in km/h}/{10} x {speed in km/h}/{10}", "2.2.03-010=25", "1.2.03-106=36 m", "2.2.03-007=100"],
      },
      {
        text: "Emergency braking distance = the normal braking distance ÷ 2. 40 km/h → 8 m, 50 km/h → 12.5 m.",
        evidence: ["2.2.03-015=) : 2", "2.2.03-016=12.5 m"],
      },
      {
        text: "Stopping distance = reaction distance + braking distance. 50 km/h → 15 + 25 = 40 m. 100 km/h → 30 + 100 = 130 m.",
        evidence: ["2.2.03-009=40", "2.2.03-006=130"],
      },
      {
        text: "Double the speed: the reaction distance doubles, but the braking distance FOURFOLDS (2 × 2). 50 → 100 km/h: reaction 15 → 30 m, braking 25 → 100 m. Typed answer: 4.",
        evidence: ["1.2.03-102=4", "2.1.07-109=quadrupled from 25 m to 100 m", "2.1.07-208=doubled from 15 m to 30 m"],
      },
      {
        text: "Child 20 m ahead, emergency stop: at 50 km/h you need 15 + 12.5 = 27.5 m, so you hit the child. At 30 km/h you need 9 + 4.5 = 13.5 m and stop in time.",
        evidence: ["2.1.02-002=50 km/h", "2.1.02-002~30 km/h"],
      },
      {
        text: "Amber light at 40 km/h: stopping distance is 12 + 16 = 28 m. Only 10 m from the line, you can't stop, so drive on. At 40 m, you can stop, so stop.",
        evidence: ["2.2.37-002=Proceed", "2.2.37-003=Stop"],
      },
      {
        text: "Narrow road where you can see 50 m: your stopping distance may be at most HALF of that (25 m), because an oncoming driver needs the other half to stop too.",
        evidence: ["2.2.03-012=25"],
      },
      {
        text: "Following distance outside built-up areas = half the speedometer, in metres: 100 km/h → 50 m. Speeding up from 50 to 100 km/h means growing the gap from about 15 m to at least 50 m.",
        evidence: ["2.2.04-003=1/2 the speedometer reading in metres", "2.2.04-004=50", "2.1.07-110=at least 50 m"],
      },
      {
        text: "Following distance in town = the distance you travel in about 1 second: at 50 km/h that's 15 m, about 3 car lengths. Elsewhere the minimum is the \"2-second gap\".",
        evidence: ["2.2.04-002=15 m or approximately 3 car lengths", "2.2.04-001=distance of 2 seconds"],
      },
      {
        text: "Overtaking a truck at 100 vs 70 km/h from before a crest: you need about 800 m of clear road. The overtake itself takes several hundred metres, and an oncoming car covers about as much in the same time.",
        evidence: ["2.2.05-005=800 m", "2.2.05-005~400 m"],
      },
    ],
    traps: [
      {
        text: "The formula options look alike. Reaction uses × 3, braking uses (v ÷ 10) × (v ÷ 10), emergency braking is that ÷ 2. \"× 5\" is never right.",
        evidence: ["1.2.03-104~/{10} x 5", "1.2.03-105~/{10} x 5", "2.2.03-015~x 5) : 2"],
      },
      {
        text: "1/5 of the speedometer is wrong. It's 1/2. A 15 m gap is not enough at 80 km/h; use 2 seconds.",
        evidence: ["2.2.04-003~1/5 the speedometer", "2.2.04-001~a distance of 15 metres"],
      },
    ],
  },
  {
    id: "speed",
    emoji: "🚦",
    title: "Speed limits",
    intro: "The limits that are asked as numbers. Car = up to 3.5 t.",
    facts: [
      { text: "Built-up area: 50 km/h, including right after turning.", evidence: ["1.2.03-101=50", "2.2.03-026-M=50"] },
      { text: "Outside built-up areas, on roads with one lane per direction: 100 km/h for cars.", evidence: ["2.2.03-104=100"] },
      { text: "Motorway: no general limit, but 130 km/h is the recommended speed. It applies to cars and motorbikes (not trucks over 3.5 t) on motorways and on roads with separated carriageways or two marked lanes per direction.", evidence: ["2.2.03-304=cars", "2.2.03-304=motorbikes", "2.2.03-304~in excess of 3.5 t", "2.2.03-305=motorways"] },
      { text: "Car with trailer: 80 km/h outside built-up areas AND on the motorway. A trailer with \"100 km/h\" approval may do 100 only on motorways and expressways; on an ordinary federal road (Bundesstraße) it's still 80.", evidence: ["2.2.03-018=80", "2.2.03-109=80", "2.2.03-110=80"] },
      { text: "Visibility under 50 m (fog, snow, rain): max 50 km/h, also on the motorway.", evidence: ["2.2.03-025=50", "2.2.03-005=50 km/h", "1.1.03-118=50 km/h maximum", "2.1.03-117=50 km/h maximum", "2.2.05-202=maximum permissible speed is 50 km/h"] },
      { text: "Rear fog light: only when FOG cuts visibility below 50 m - not at 100 m, not for heavy rain (even though 50 km/h applies in rain too).", evidence: ["2.2.17-102=less than 50 m", "2.2.17-102~visibility to 100 m", "2.2.17-102~heavy rain", "2.2.05-202~rear fog lamp", "1.1.03-118=rear fog lights"] },
      { text: "Snow chains: max 50 km/h. Emergency (space-saver) wheel: max 80 km/h, and only as long as necessary.", evidence: ["2.2.03-101=50", "2.7.01-112=faster than 80 km/h"] },
      { text: "Winter (M+S) tyres: the tyre's own maximum speed (sticker on the dashboard, e.g. 160 or 190) must not be exceeded - in any weather.", evidence: ["2.2.03-107=maximum permissible speed for these tyres", "2.7.05-104=permissible maximum speed for these tyres", "2.7.10-101=faster than 160 km/h", "2.7.05-105=may not be exceeded"] },
      { text: "Zone 30 sign: max 30 km/h. A number in a red circle is always a MAXIMUM, never a recommendation or minimum.", evidence: ["1.4.41-171=30", "1.4.41-124=permitted maximum speed of 30 km/h", "1.4.41-126=permitted maximum speed of 30 km/h", "1.4.41-151=may not drive faster than 60 km/h"] },
      { text: "Blue round sign with a number: MINIMUM speed (e.g. 60). Drive at least that if conditions allow; if your vehicle can't, you may not use that road/lane.", evidence: ["1.4.41-128=at least at a speed of 60 km/h", "1.4.41-170=minimum speed of 60 km/h", "1.4.41-128~not allowed to drive faster than 60 km/h"] },
      { text: "Motorways and expressways: the vehicle must be built for MORE than 60 km/h - the papers must show at least 60, the sign question's answer is 61 km/h.", evidence: ["1.2.02-111=60", "2.2.18-010=60", "1.4.42-116=61 km/h"] },
      { text: "\"60\" with a \"when wet\" plate: the limit only applies on a wet road - dry, you may go faster.", evidence: ["1.4.41-127=if the roadway is dry"] },
      { text: "Cycle street/highway open to residents: max 30 km/h, cyclists may ride side by side and must not be hindered.", evidence: ["1.4.41-168=faster than 30 km/h", "1.4.41-168=alongside one another"] },
      { text: "Level crossing with a \"10 km/h\" plate: approach and cross at max 10 km/h.", evidence: ["1.2.19-113=approach at a maximum speed of 10 km/h", "1.2.19-113=cross at a maximum speed of 10 km/h"] },
      { text: "Seat belt: without one, serious or fatal injuries from about 30 km/h; you can't brace yourself even at about 20 km/h.", evidence: ["2.2.21-111=from 30 km/h onward", "2.2.21-108=about 20 km/h"] },
      { text: "Emergency brake assistant: must be on above 30 km/h.", evidence: ["2.7.06-243=more than 30 km/h"] },
      { text: "Fuel: 160 instead of 130 km/h uses up to 35% more.", evidence: ["2.5.01-113=up to 35 %"] },
    ],
    traps: [
      { text: "\"Max 80 km/h\" with winter tyres, \"60 km/h\" with a trailer on the motorway, \"80\" in fog: all wrong.", evidence: ["2.2.03-107~not drive faster than 80 km/h", "2.6.03-105~60 km/h, including on autobahns", "1.1.03-118~80 km/h maximum"] },
      { text: "Street race \"without exceeding 50\", or a damaged lashing strap \"at max 50\": staying under a number never makes a wrong action right.", evidence: ["2.1.11-132~without exceeding 50 km/h", "2.1.11-201~without exceeding 50 km/h", "2.2.22-131~maximum of 50 km/h"] },
      { text: "Passing on the right on the motorway is not allowed just because you stay under 80. It's allowed only when the left lane is a queue.", evidence: ["2.1.06-004-B=no queue of vehicles", "2.1.06-004-B~not drive faster than 80 km/h"] },
      { text: "Slow down for the overtaking car or the tractor, not because of an 80 limit. In the commercial traffic-calmed zone there's no MINIMUM speed.", evidence: ["2.1.06-017-M=because of the overtaking car", "2.1.06-017-M~maximum permitted speed is 80 km/h", "1.4.41-125~minimum speed of 20 km/h"] },
      { text: "Leaving the motorway: brake on the exit lane, not on the motorway (\"brake down to 60 now\" is wrong).", evidence: ["2.2.18-022~brake down to 60 km/h"] },
      { text: "A yellow sign with \"35\" is a federal road number, not a speed. A sign with \"3\" is a numbered diversion.", evidence: ["1.4.42-126=federal road", "1.4.42-126~35 km/h", "1.4.42-135=numbered diversion"] },
    ],
  },
  {
    id: "parking",
    emoji: "🅿️",
    title: "Stopping & parking distances",
    intro: "\"No stopping\" = not even briefly. \"No parking\" = stopping up to 3 minutes or to load/let people out is OK.",
    facts: [
      { text: "Parking = stopping for more than 3 minutes, or leaving the vehicle. (Waiting at a closed level crossing is not parking.)", evidence: ["1.2.12-107=more than 3 minutes", "1.2.12-107=leaves his vehicle", "1.2.12-107~closed level crossing"] },
      { text: "Restricted no-stopping sign/zone: stopping up to 3 minutes, or to load/unload or let passengers in/out, is allowed. No parking, even with a disc.", evidence: ["1.4.41-015=up to 3 minutes", "1.4.41-135=up to 3 minutes", "1.4.41-015~parking disc"] },
      { text: "Pedestrian crossing: no stopping on it or 5 m before it.", evidence: ["1.2.12-104=up to 5 m before", "1.2.12-108=5"] },
      { text: "Junctions/intersections: no parking 5 m before and after - 8 m if a cycle path runs alongside.", evidence: ["1.2.12-109=5", "1.2.12-131=5", "1.2.12-129=8", "1.2.12-130=8", "1.2.12-133=8"] },
      { text: "St. Andrew's cross (level crossing): no parking within 5 m in a built-up area, 50 m outside.", evidence: ["1.2.12-111=5", "1.2.12-110=50"] },
      { text: "Bus/tram stop sign: no parking 15 m before and after; you may stop at the stop itself for up to 3 minutes if you don't obstruct buses.", evidence: ["1.2.12-112=15", "1.4.41-161=stop", "1.4.41-161~park", "1.2.12-113=3"] },
      { text: "Don't stop within 10 m before traffic lights or a \"Stop\" or St. Andrew's cross sign if your vehicle would hide it.", evidence: ["2.2.12-104=10", "2.2.12-203=diagonal cross", "2.2.12-203=stop. give way."] },
      { text: "Solid lane line: leave at least 3 m between your parked car and the line. On a priority road outside towns, parking is banned completely.", evidence: ["2.2.12-204=3", "1.4.41-166=parking is prohibited", "1.4.41-166~at least 3 m"] },
      { text: "Parking on footpaths (where signed): vehicles up to 2.8 t (and motorcycles).", evidence: ["2.2.12-102=2,8", "1.4.42-112=up to 2.8 t", "1.4.42-112~more than 3.5 t"] },
      { text: "Parking disc: set the next half hour after you arrive. Arrive 10:40 → set 11:00, then the allowed time counts from 11:00.", evidence: ["2.2.13-003=11.00", "2.2.13-003~12.40"] },
      { text: "Trailer without its towing vehicle: max 2 weeks on public roads (longer only on designated spaces). Trailers over 2 t may park regularly at night (10 pm-6 am) and on Sundays/holidays in industrial areas, and in residential areas only on designated spaces.", evidence: ["2.2.12-106=more than 2 weeks on public roads", "2.2.12-106=specially designated parking spaces", "2.2.12-105=in industrial areas", "2.2.12-105=specially designated parking spaces"] },
      { text: "In built-up areas, vehicles up to 3.5 t may freely choose their lane (with several lanes per direction).", evidence: ["2.2.07-002=3,5"] },
    ],
    traps: [
      { text: "Stopping is fine right BEHIND a pedestrian crossing and over manholes - only the 5 m before it is banned.", evidence: ["1.2.12-104~immediately behind pedestrian crossings", "1.2.12-104~over manholes"] },
    ],
  },
  {
    id: "overtaking",
    emoji: "🔄",
    title: "Overtaking & side clearance",
    intro: "Clearance is measured from the side of your car to the cyclist/pedestrian.",
    facts: [
      { text: "Passing pedestrians, cyclists or e-scooters: at least 1.5 m in built-up areas, 2 m outside.", evidence: ["1.2.05-004=1,5", "1.2.05-005=1,5", "1.2.05-003=2", "1.2.05-124=1.5 m within a built-up area", "1.2.05-124=2.0 m outside of a built-up area", "1.2.05-125-M=at least 1.5 m", "1.4.41-022=1.5 m"] },
      { text: "Choose the clearance by how the cyclists behave and how fast you are. If the road only leaves 50 cm, don't overtake.", evidence: ["1.1.06-125=how the cyclists are acting", "1.1.06-125=speed of my vehicle", "1.1.06-124=refrain from overtaking"] },
      { text: "Car + trailer longer than 7 m on a road with one lane per direction outside towns: leave a gap in front so an overtaking car can pull in. Trucks over 3.5 t must too.", evidence: ["2.2.04-102=7", "2.2.04-107=7", "2.2.04-306=longer than 7 m", "2.2.04-306=in excess of 3.5 t", "2.2.04-101=allow an overtaking car to pull in", "2.2.04-307=can pull back into lane"] },
      { text: "Rain cutting visibility to about 50 m outside towns: overtaking banned for vehicles over 7.5 t.", evidence: ["2.2.05-202=exceeding 7.5 t"] },
      { text: "Missed the motorway exit: drive on to the next one. Never reverse, even if the exit is under 100 m behind you.", evidence: ["2.2.18-103=next exits", "2.2.18-103~less than 100 m"] },
      { text: "Arrow sign for lane merging: move right after the arrow (about 200 m), and you may overtake on the right until then.", evidence: ["1.2.07-105-M=after around 200 m"] },
    ],
    traps: [
      { text: "1.0 m is never enough clearance for a cyclist.", evidence: ["1.1.06-125~1.0 m", "1.2.05-124~1.0 m", "1.2.05-125-M~1.0 m"] },
      { text: "A trailer combination's gap must fit ONE overtaking car - not \"at most 10 m\", not two cars. And there's no 60 km/h rule.", evidence: ["2.2.04-307~not be greater than 10 m", "2.2.04-307~at least two overtaking", "2.2.04-101~not drive faster than 60 km/h", "2.2.04-306~up to 3.5 t"] },
    ],
  },
  {
    id: "signs",
    emoji: "⚠️",
    title: "Distances on signs",
    intro: "A plate with just a distance = the hazard starts that far AHEAD. A plate with arrows and a distance = it LASTS that long.",
    facts: [
      { text: "Warning sign outside built-up areas: hazard 150-250 m after the sign.", evidence: ["1.4.40-101=between 150 m and 250 m"] },
      { text: "Level crossing countdown posts: each stripe ≈ 80 m. 3 stripes = 240 m, 2 = 160 m, 1 = 80 m.", evidence: ["1.4.40-132=240 m", "1.4.40-135=240 m", "1.4.40-130=160 m", "1.4.40-131=80 m"] },
      { text: "Plain distance plate (\"100 m\", \"50 m\", \"200 m\"): the sign's rule starts that far ahead.", evidence: ["1.4.41-121=no entry 100 m ahead", "1.4.40-136=commencing at a distance of approximately 100 m", "1.4.40-115=approximately 50 m ahead", "1.4.41-131=200 m ahead"] },
      { text: "Distance plate with arrows (\"800 m\", \"3 km\"): the rule/hazard lasts that long.", evidence: ["1.4.40-106=800 m in length", "1.4.41-130=for 3 km"] },
      { text: "Time plate \"22-6\": the rule applies from 10 pm to 6 am. Speed-limit end sign (grey with a diagonal): the restriction ends.", evidence: ["1.4.41-172=between 10 pm and 6 am", "1.4.41-132=end of speed restriction"] },
      { text: "Snowflake warning at +3 °C: ice is still possible - slow down.", evidence: ["1.4.40-137=reduce my speed"] },
    ],
    traps: [
      { text: "Mixing up \"ahead\" and \"for\": a plain 800 m plate would be ahead, but with arrows it's the length. \"Narrowing for 50 m\" is wrong when the plate is a plain distance.", evidence: ["1.4.40-106~beginning of a downhill slope 800 m ahead", "1.4.40-115~narrowing for 50 m", "1.4.41-131~no overtaking for 200 m", "1.4.41-130~start of a no-overtaking area 3 km ahead"] },
    ],
  },
  {
    id: "load",
    emoji: "📦",
    title: "Loads, trailers & weights",
    intro: "Projection = how far the load sticks out.",
    facts: [
      { text: "Rear: a load projecting more than 1 m beyond the rear reflectors must be marked (in the dark: red light + red reflector, the light no higher than 1.50 m). On trips over 100 km it may project at most 1.5 m.", evidence: ["1.2.22-101=1", "2.2.22-117=by more than 1 m", "2.2.22-118=exceeds 1 m", "2.7.01-125=more than 1 m beyond the rear reflectors", "1.2.22-102=red light and red rear reflector", "2.2.22-109=1.50 m", "2.2.22-129=1,5"] },
      { text: "Front: nothing may project forward below 2.50 m height; above 2.50 m, up to 50 cm forward is allowed.", evidence: ["2.2.22-111=2,5", "1.2.22-108=2.50 m", "2.2.22-112=not project over more than 50 cm and is above a height of 2.50 m", "2.2.22-117=more than 2.50 m high may not project forwards by more than 50 cm"] },
      { text: "Sides: projecting more than 40 cm beyond the side lights → white light to the front and red to the back. Attachments covering the lights or sticking out more than 40 cm sideways / 1 m at the back need their own lights.", evidence: ["2.2.22-108=white light to the front", "2.2.22-108=red light to the back", "2.2.17-406=more than 40 cm", "2.2.17-406=more than 1 m"] },
      { text: "Overloading by just 20% can overstrain brakes, steering and load-bearing parts. Axle and total weight limits may never be exceeded.", evidence: ["1.2.22-104=brakes may be overstrained", "1.2.22-109=gross axle weight rating"] },
      { text: "Class B trailers: up to 750 kg always; heavier only if car + trailer stay at or below 3,500 kg (permitted total masses). Car 2,400 kg → trailer at most 1,100 kg → 1,000 kg is the right option. Only one trailer behind a car.", evidence: ["2.6.03-120=up to 750 kg", "2.6.03-120=does not exceed 3,500 kg", "2.6.02-104=1000 kg", "2.6.03-116=1"] },
      { text: "Trailer nose (vertical) load: at least 4% of the trailer's actual weight → 600 kg trailer = 24 kg.", evidence: ["2.6.03-406=24 kg"] },
      { text: "Rear lights covered by a bike rack or load: they must be repeated in every case, not just at night or on longer trips.", evidence: ["2.2.17-010=in any case", "2.2.17-010~longer than 5 km"] },
      { text: "Parked on the road at night in built-up areas: trucks and motor caravans over 3.5 t, and trailers, need their own lights or warning plates (cars don't).", evidence: ["2.2.17-202=exceeding 3.5 t", "2.2.17-202=trailers", "2.2.17-202~cars"] },
      { text: "A farm tractor can pull 2 wide trailers.", evidence: ["1.1.07-119=2 wide trailers"] },
    ],
    traps: [
      { text: "No \"5% over the total weight\" allowance. Extra mirrors depend on visibility, not on a 1.5 m / 1 m trailer size.", evidence: ["1.2.22-109~by a maximum of 5%", "2.6.03-111~1.5 m"] },
      { text: "Class B does NOT cover a 3,500 kg trailer. 10% / 15% nose load is wrong; 4% is the minimum.", evidence: ["2.6.03-120~of 3,500 kg", "2.6.03-406~60 kg", "2.6.03-406~90 kg"] },
    ],
  },
  {
    id: "breakdown",
    emoji: "🆘",
    title: "Breakdowns, accidents & emergency numbers",
    intro: "",
    facts: [
      { text: "Warning triangle on fast roads and motorways: about 100 m behind the car (on the motorway: at the edge of the right lane / hard shoulder). Hazard lights on, hi-vis vest on.", evidence: ["2.2.15-106=around 100 m", "2.2.15-110=about 100 m", "2.2.15-115=about 100 m", "2.2.15-201=100 m", "1.2.34-111=about 100 m"] },
      { text: "Towing: max 5 m between the vehicles, rope/bar clearly marked.", evidence: ["2.2.15-109=must not exceed 5 m"] },
      { text: "Jam in a tunnel: hazard lights on, keep about 5 m to the car in front when stopped. Don't abandon the car straight away.", evidence: ["1.1.07-121=approximately 5 m", "1.1.07-121~leave vehicle immediately"] },
      { text: "Emergency numbers: 110 police, 112 fire/ambulance (112 works all over Europe). 115 is wrong. On the motorway: emergency call box, service area, or 110/112.", evidence: ["1.2.34-005=110", "1.2.34-005=112", "1.2.34-005~115", "1.2.34-011=112", "1.2.34-106=dial 112 or 110"] },
    ],
    traps: [
      { text: "Warning triangle at 50 m or 10 m is too close on fast roads.", evidence: ["2.2.15-106~around 50 m", "2.2.15-106~around 10 m"] },
    ],
  },
  {
    id: "alcohol",
    emoji: "🍺",
    title: "Alcohol, people & admin",
    intro: "",
    facts: [
      { text: "Alcohol leaves the blood at only about 0.1 per mille per hour → 1.0 per mille takes about 10 hours. Coffee or sport don't speed it up.", evidence: ["1.1.09-006=10 hours", "1.1.09-029=nothing can achieve this", "1.1.09-029~two cups of coffee", "1.1.09-029~15 minutes of sport"] },
      { text: "Hashish (THC) is broken down unevenly over an unknown time - no per-hour rule.", evidence: ["1.1.09-015=unevenly", "1.1.09-015~0.1 per mille per hour"] },
      { text: "After drug use, fitness to drive returns only after at least 1 year proven drug-free (with no expected relapse) - not after 1 or 6 months.", evidence: ["1.1.09-014=at least one year", "1.1.09-014~one month", "1.1.09-014~six months"] },
      { text: "Zero alcohol for drivers under 21 and everyone in the probation period - no milligram allowance.", evidence: ["1.1.09-021=under 21", "1.1.09-021=probation period", "1.1.09-022=no, definitely not", "1.1.09-022~50 milligrams"] },
      { text: "Child seat: required until the child is 12 years old OR 150 cm tall, whichever comes first. An 11-year-old of 140 cm needs an approved booster seat.", evidence: ["2.2.21-122=younger than 12 years old and is under 150 cm", "2.2.21-106=raised seat"] },
      { text: "Drivers aged 18-24 have a much higher accident risk: little experience, overconfidence, more risk-taking.", evidence: ["2.1.11-119=too little driving experience"] },
      { text: "Offences worth 2 points are deleted after 5 years.", evidence: ["1.8.01-003=5 years"] },
      { text: "Roadworthiness test (HU): a car that's 3 years old with a fresh certificate is next due in 24 months. A lowered suspension needs an expert report straight away.", evidence: ["2.6.01-108=24", "2.6.02-101=immediately after the alteration"] },
      { text: "Phone without hands-free: stop with the engine off. There's no \"OK for 7 or 15 seconds\".", evidence: ["2.2.23-040=engine must be switched off", "2.2.23-040~15 seconds", "2.2.23-122~7 seconds"] },
      { text: "Road maps: 1:N means 1 cm = N ÷ 100,000 km. 1:200,000 → 2 km, 1:300,000 → 3 km. For a long trip (Hamburg to Rome), plan on a large-area map like 1:500,000. Maps can be out of date as soon as they're printed.", evidence: ["2.6.07-218=2 km", "2.6.07-207=corresponds to 3 kilometres", "2.6.07-210=1:500,000", "2.6.07-206=outdated even before they are published", "2.6.07-206~valid for 4 years"] },
      { text: "School bus stopped about 80 m ahead: expect children to run across the road.", evidence: ["1.4.41-109=run across the road"] },
    ],
    traps: [],
  },
  {
    id: "car",
    emoji: "🔧",
    title: "Tyres, oil & the car",
    intro: "",
    facts: [
      { text: "Minimum tread depth: 1.6 mm across the main tread (typed answer: 1,6). Before a trip, check tyres for damage and pressure loss.", evidence: ["2.7.02-032=1,6", "2.7.05-108=1,6", "2.7.05-215=visible damage", "2.7.05-226=any loss of pressure"] },
      { text: "Winter tyres: about 0.2 bar MORE pressure than summer tyres, as per the manufacturer.", evidence: ["2.7.10-102=approx. 0.2 bar", "2.7.05-106=manufacturer's guidelines"] },
      { text: "Tyre date \"1217\" = calendar WEEK 12 of 2017.", evidence: ["2.7.05-001=12th calendar week"] },
      { text: "Engine oil: SAE 10W40 covers the widest temperature range (low first number = good when cold, high second = good when hot).", evidence: ["2.7.03-207=sae 10 w 40"] },
      { text: "One drop of oil can pollute 600 litres of drinking water.", evidence: ["1.5.01-006=600 litres"] },
      { text: "Wheel nuts: tighten to the prescribed torque, crosswise.", evidence: ["2.7.01-255=prescribed torque", "2.7.01-255=alternative tightening"] },
      { text: "Less noise in town: drive in 4th or 5th gear, low revs.", evidence: ["2.5.01-111=4th or 5th gear"] },
    ],
    traps: [
      { text: "1 mm tread is wrong (it's 1.6). Winter tyres at 0.5 bar LESS is wrong. Checking wheel nuts only after 500 km is wrong.", evidence: ["2.7.05-215~1 mm", "2.7.05-226~1 mm", "2.7.05-106~0.5 bar lower", "2.7.10-102~lower than with summer tyres", "2.7.01-255~500 km"] },
      { text: "\"1217\" is not December 2017.", evidence: ["2.7.05-001~12th month"] },
    ],
  },
  {
    id: "pictures",
    emoji: "🖼️",
    title: "Numbered picture questions",
    intro: "These answers are a sign or lane number from the picture - learn them by looking at the picture in the app.",
    facts: [
      { text: "Which sign ends your right of way / gives right of way: depends on the picture.", evidence: ["1.4.41-158=1", "1.4.42-101=traffic sign 1", "1.4.42-102=traffic sign 2"] },
      { text: "Joining the motorway - which driving line: line 3 (typed).", evidence: ["2.1.08-025=3"] },
      { text: "Permanent lane lights: green arrow - lane 1 may continue; diagonal arrow - lane 2 must move right.", evidence: ["2.2.37-008=1 may continue", "2.2.37-008=2 must change to the right-side lane"] },
      { text: "Cycle highway sign: only residents' vehicles may enter - not mopeds under 25 km/h.", evidence: ["1.4.41-018=residents", "1.4.41-018~25 km/h"] },
    ],
    traps: [],
  },
];

// --- Type-in test -----------------------------------------------------------

/**
 * The unit shown next to the answer box, as on the real exam ("___ m"). The
 * catalog doesn't carry units, so these are set by hand for every Class B
 * type-in question ("" = no unit: a phone number, a count, a line number).
 * The verifier checks this list covers exactly the Class B type-in questions.
 */
export const TYPED_ANSWER_UNITS: Record<string, string> = {
  "1.2.02-111": "km/h",
  "1.2.03-101": "km/h",
  "1.2.03-102": "times",
  "1.2.05-003": "m",
  "1.2.05-004": "m",
  "1.2.05-005": "m",
  "1.2.12-108": "m",
  "1.2.12-109": "m",
  "1.2.12-110": "m",
  "1.2.12-111": "m",
  "1.2.12-112": "m",
  "1.2.12-113": "minutes",
  "1.2.12-129": "m",
  "1.2.12-130": "m",
  "1.2.12-131": "m",
  "1.2.12-133": "m",
  "1.2.22-101": "m",
  "1.2.34-011": "",
  "1.4.41-171": "km/h",
  "2.1.08-025": "",
  "2.2.03-006": "m",
  "2.2.03-007": "m",
  "2.2.03-008": "m",
  "2.2.03-009": "m",
  "2.2.03-010": "m",
  "2.2.03-011": "m",
  "2.2.03-012": "m",
  "2.2.03-018": "km/h",
  "2.2.03-025": "km/h",
  "2.2.03-026-M": "km/h",
  "2.2.03-101": "km/h",
  "2.2.03-104": "km/h",
  "2.2.03-109": "km/h",
  "2.2.03-110": "km/h",
  "2.2.04-004": "m",
  "2.2.04-102": "m",
  "2.2.04-107": "m",
  "2.2.07-002": "t",
  "2.2.12-102": "t",
  "2.2.12-104": "m",
  "2.2.12-204": "m",
  "2.2.18-010": "km/h",
  "2.2.22-111": "m",
  "2.2.22-129": "m",
  "2.6.01-108": "months",
  "2.6.03-116": "",
  "2.7.02-032": "mm",
  "2.7.05-108": "mm",
};

/** The sheet's facts that explain a question (those citing it). */
export function factsFor(questionId: string): StudyPoint[] {
  const out: StudyPoint[] = [];
  for (const t of NUMBER_TOPICS)
    for (const p of t.facts)
      if (p.evidence.some((ev) => ev.split(/[=~]/)[0] === questionId)) out.push(p);
  return out;
}
