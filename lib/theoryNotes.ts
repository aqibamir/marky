// Original, hand-written theory primers - the underlying rule and reasoning
// behind a topic, not a restatement of any single catalog question or its
// official "comment" field. Keyed by the same cross-cutting content tag
// slugs as lib/questionTags.generated.ts, so a wrong answer can surface
// "here's the concept, not just the correct letter" for whichever topics
// that question touches.
//
// Scoped to Class B (car) driving for now, per the license-class filter
// already in the app - the wording below assumes a car, not a truck/bus/
// motorcycle. Shown regardless of which tags a question happens to carry;
// a question with no matching tag simply shows the catalog's own comment
// with nothing added.

export interface TheoryNote {
  title: string;
  body: string;
}

export const THEORY_NOTES: Record<string, TheoryNote> = {
  speed_limits: {
    title: "Why speed limits are set the way they are",
    body: "A posted limit is the maximum allowed under ideal conditions - it isn't a target you're entitled to reach regardless of circumstances. §3 StVO requires you to adapt your speed to what you can actually see and stop within, so a lower limit than the sign (rain, fog, a school zone, a bend) is still the correct choice even without a sign telling you so. When a question gives you a specific number, work out which rule set it (built-up area = 50, unless posted otherwise; open road = 100 for a car; motorway = no general limit unless posted, but §3 still applies) rather than guessing between the answer options.",
  },
  braking_distance: {
    title: "Reaction distance + braking distance = stopping distance",
    body: "Stopping distance has two separate parts: reaction distance (how far you travel before your foot even reaches the brake, roughly speed/10 × 3 in meters for a ~1s reaction time) and braking distance (how far the car travels while actually slowing down, roughly (speed/10)² in meters under normal dry braking). Doubling your speed doesn't double braking distance - it roughly quadruples it, because braking distance depends on speed squared. When a question asks for a specific meter figure, identify whether it wants reaction distance, braking distance, or the full stopping distance, and apply the right formula rather than picking the number that sounds plausible.",
  },
  following_distance: {
    title: "The distance you need depends on your reaction time, not habit",
    body: "The rule of thumb for a safe gap on the open road is the \"half your speedometer reading in meters\" rule, or equivalently a 2-second time gap: if you can count \"one thousand, two thousand\" between the car ahead passing a fixed point and you passing the same point, you're roughly there. In poor visibility or on wet roads, that gap needs to increase because your own braking distance increases. Tailgating removes your margin for the other driver's mistake, not just your own - that's the actual hazard the rule is defending against, not simply \"the sign says so.\"",
  },
  overtaking: {
    title: "Overtaking is judged on what you can see, not what's likely",
    body: "Before overtaking you need to be certain (not merely hopeful) that you can complete the maneuver and return to your lane before an oncoming vehicle, a junction, a bend, or a no-overtaking zone makes it unsafe - §5 StVO puts the burden of proof on the overtaking driver, not the overtaken one. Overtaking is prohibited near crests, bends with poor visibility, junctions without right of way, and pedestrian crossings, and always on the right on ordinary roads (only permitted on the right in specific motorway/multi-lane slow-traffic situations). When a question shows a hazard sign or limited sightline, that's usually the deciding fact, not the vehicle types involved.",
  },
  right_of_way: {
    title: "\"Right of way\" is granted, never simply taken",
    body: "The core rule is \"rechts vor links\" (right before left) at an uncontrolled intersection with no signs - but that default is overridden the moment any priority sign, traffic light, or road marking says otherwise, and it doesn't apply to entering traffic from a driveway, a construction site exit, or off unpaved ground. Even when you technically have priority, you must still give way if taking it would cause an accident - having the right of way is a legal fact, not a license to disregard what the vehicle beside you is actually doing. Read the whole scene in a question (signs + markings + who's actually moving) rather than defaulting to right-before-left whenever you see an intersection.",
  },
  traffic_signs: {
    title: "Sign categories tell you how to read them",
    body: "German signs fall into families that behave differently: round signs with a red border are prohibitions (Verbot) or mandates depending on background color, triangular signs are hazard warnings (Gefahrzeichen) that don't by themselves prohibit anything, and blue rectangular/circular signs are instructions or information. A sign's shape and color tell you its legal weight before you even read the pictogram - a triangular warning sign means \"be ready for this,\" not \"this is now banned.\" When two questions look similar but one uses a triangle and the other a red circle, that shape difference is usually the entire point of the question.",
  },
  traffic_lights: {
    title: "Lights override the default right-of-way rules entirely",
    body: "A working traffic light replaces §8 (right of way) rules completely for that intersection - a green light gives you priority even where you'd normally have to yield, and a red light binds you even where you'd normally have priority. A flashing yellow means proceed with caution using normal right-of-way rules (the light is effectively off); a steady yellow after green means stop if you can do so safely, not \"speed up to beat it.\" A green arrow only permits the specific direction it points, and doesn't clear other conflicting movements at the same intersection the way a full green does.",
  },
  intersections: {
    title: "Slow down and confirm at every intersection, signs or not",
    body: "An intersection is exactly where an assumption gets you into an accident - even with a green light or the right of way, German law requires you to be prepared to brake for someone who doesn't yield to you (Vertrauensgrundsatz has limits). Cross-traffic, cyclists in a bike lane, and pedestrians in a crosswalk are the sources of risk a question is usually testing, not the intersection geometry itself. Positioning also matters: you generally take the shortest path when turning left (inside the imaginary center of the intersection) unless signs or markings show otherwise.",
  },
  parking_stopping: {
    title: "\"Halten\" (stopping) and \"Parken\" (parking) are legally different",
    body: "Halten is a stop of under 3 minutes with the driver present and able to move immediately; anything longer, or leaving the vehicle, becomes Parken - and many restrictions (e.g. near a level crossing, in front of a driveway, within 5m of a crosswalk/junction corner) apply to one but not the other. Distance rules to remember: at least 5m from an intersection or crosswalk, no parking within 10m of certain traffic-light-controlled or priority signs, and always leaving pedestrian crossings and dropped kerbs clear. Read a question's wording carefully for whether it describes a brief stop or actually leaving the car - that distinction often decides which rule applies.",
  },
  lane_usage: {
    title: "Stay right unless overtaking, and match your lane to your exit",
    body: "The Rechtsfahrgebot (keep-right rule) requires driving in the rightmost lane that suits your speed/direction, using other lanes only to overtake or where lane markings/signs direct otherwise - persistent left-lane driving without overtaking is itself an offense, not just discourteous. Lane markings (solid vs. dashed) tell you whether crossing them to change lanes or overtake is permitted at all: a solid line may not be crossed under any circumstance. Where lanes are marked for specific directions (straight/left/right arrows), you must be in the correct lane before the junction, not merge into it at the last moment.",
  },
  turning_reversing: {
    title: "Turning and reversing both require checking for what you can't easily see",
    body: "Before turning, the sequence is: signal early, check mirrors and blind spot, position correctly in the lane, and yield to oncoming traffic and to cyclists/pedestrians going straight through the space you're about to cross - a turning vehicle almost always has to give way to traffic continuing straight. Reversing and three-point turns place the entire duty of care on the driver doing them: you must be certain no one is endangered, and use a spotter if visibility is inadequate, rather than relying on mirrors alone in tight or crowded spaces.",
  },
  roundabout: {
    title: "Traffic already in the roundabout has priority - signal on exit only",
    body: "Unless signs say otherwise, vehicles already circulating in a roundabout have priority over those entering it, so you yield on entry and merge into a gap rather than forcing one. You don't signal when entering a roundabout (you're not changing lanes relative to it), but you do signal right just before your exit to tell following traffic you're leaving. Cyclists sharing the roundabout or its marked lane are still owed the same priority logic as any other circulating vehicle.",
  },
  motorway: {
    title: "Motorway rules exist because closing speeds are extreme",
    body: "There's no general speed limit on a German Autobahn absent a sign, but there is a recommended speed (Richtgeschwindigkeit) of 130 km/h, and exceeding it can still count against you in an accident's liability even though it isn't an offense on its own. Entering is only via the acceleration lane (matching motorway speed before merging, never stopping on it), and stopping, reversing, U-turns, and pedestrians/mopeds/slow vehicles are all prohibited on the carriageway itself. The far-left lane is for overtaking only - camp there and you're breaking the keep-right rule even at high speed.",
  },
  trailer_towing: {
    title: "A trailer changes your vehicle's legal limits, not just its handling",
    body: "Towing a trailer generally caps your speed lower than an unladen car (100 km/h on motorways/expressways for most B-class combinations, 80 km/h elsewhere unless specifically rated for more), changes your overtaking margin because braking distance increases with the added mass, and can require a wider turning radius that you have to plan for at junctions. Whether you can tow a given trailer at all under a Class B license depends on the combined weight limits (generally up to 3,500 kg combination, extendable with additional conditions) - a question testing this is usually checking whether you know the applicable limit, not just that a limit exists.",
  },
  loading_cargo: {
    title: "You are responsible for how your load is secured, not just that it fits",
    body: "German law (§22 StVO) makes the driver responsible for ensuring cargo can't shift, fall, or create noise/dust/spray even under emergency braking or evasive maneuvers - \"it looked stable\" isn't a defense. Loads that protrude beyond the vehicle (front, rear, or sides) generally must be marked/flagged once past specific length thresholds, and visibility, lights, and license plates must stay unobstructed. Overloading affects handling and braking distance directly, which is why weight limits are treated as a safety rule, not just an administrative one.",
  },
  lighting_electrical: {
    title: "Lighting rules are about being seen, not just seeing",
    body: "Dipped headlights are required whenever visibility is reduced (dusk, dawn, fog, heavy rain/snow) even if you can technically still see fine yourself - the requirement is about other road users seeing you. Fog lights may only be used when visibility drops below roughly 50m, and rear fog lights specifically must be turned off again once conditions improve, since they can blind following drivers otherwise. Hazard lights communicate a specific message (danger/obstruction/emergency stop) - using them for anything else, like as a thank-you after being let in, is a common wrong-answer trap in these questions.",
  },
  tires: {
    title: "Tread depth and tire choice both directly change your stopping distance",
    body: "German law sets a legal minimum tread depth of 1.6mm, but that's a floor, not a recommendation - grip (especially in wet conditions) degrades well before you hit that number, so most guidance treats 3mm as the practical replacement point for safety. Winter/all-season tires (marked with the snowflake symbol, not just \"M+S\") are required by law whenever conditions are actually wintry (ice, snow, slush, black ice) regardless of the calendar date. Mismatched tire types on the same axle, or tires below the legal minimum, are both direct road-safety violations, not paperwork issues.",
  },
  brakes_technical: {
    title: "Two independent brake systems exist because one is allowed to fail",
    body: "A car has a service brake (the pedal, hydraulically split across at least two independent circuits) and a separate parking/emergency brake, precisely so a single hydraulic fault can't leave you with no way to stop at all. A soft or sinking brake pedal, a longer-than-normal stopping distance, or a pulling-to-one-side sensation are all signs of a fault serious enough that continuing to drive is unsafe. On long descents, engine braking (a lower gear) is recommended specifically to prevent brake fade from overheated pads/discs, which is a real and dangerous failure mode, not just a fuel-saving tip.",
  },
  environment_fuel: {
    title: "Driving style measurably changes fuel use and emissions",
    body: "Smooth, anticipatory driving (looking far ahead, coasting to a stop instead of braking late, shifting up early, avoiding unnecessary idling) reduces fuel consumption and emissions meaningfully - this isn't a minor courtesy, it's the actual mechanism these questions are testing. Aggressive acceleration and unnecessary high-RPM driving waste fuel disproportionately compared to the small time saved. Environmental zones (Umweltzonen) with sticker requirements exist because vehicle emissions in dense urban traffic have measurable public-health effects, which is the reasoning behind restricting access rather than it being arbitrary.",
  },
  documents_license: {
    title: "Know what you must carry and what a class actually authorizes",
    body: "A driver must be able to produce a valid license and the vehicle's registration document (Zulassungsbescheinigung Teil I) on request; the insurance document itself generally doesn't need to be carried, which is a common wrong-answer trap. A Class B license covers cars/vans up to 3,500 kg and up to 8 passenger seats plus the driver, optionally with a trailer under specific combined-weight rules - anything outside those limits needs a different or additional class, which is usually exactly what a question in this category is checking.",
  },
  accidents_emergency: {
    title: "The legal sequence after an accident is: secure, warn, aid, report",
    body: "At any accident, the required order is roughly: secure the scene (hazard lights, warning triangle placed well before the hazard - much further back on a motorway than a city street), protect yourself and others from further danger, then give first aid within your ability, then notify emergency services. Leaving the scene of an accident you were involved in without exchanging information or waiting a reasonable time is a criminal offense (Fahrerflucht) even for a minor accident. For a stopped emergency vehicle, forming a Rettungsgasse (emergency corridor) on multi-lane roads must happen as soon as traffic starts to slow, not only once you can see the incident.",
  },
  fitness_health: {
    title: "Fitness to drive is about impairment, not intent",
    body: "The law doesn't ask whether you meant to drive impaired - it asks whether you actually were, whether from alcohol, drugs (including some prescription/OTC medication with sedative effects), fatigue, illness, or strong emotional states. Fatigue in particular degrades reaction time comparably to alcohol well before someone notices they're too tired to drive safely, which is why the correct answer to \"what should you do\" questions is almost always to stop and rest rather than push on carefully. The responsibility to self-assess and not drive sits entirely with the driver - there's no exception for \"I felt fine.\"",
  },
  weather_visibility: {
    title: "Every adverse condition maps to a specific required adjustment",
    body: "Fog reduces sighting distance, which is why the legal speed cap when visibility drops below 50m is 50 km/h regardless of the posted limit - you must be able to stop within what you can see. Wet roads roughly double effective braking distance versus dry ones; standing water risks aquaplaning, where reducing speed and avoiding sudden steering/braking inputs is the correct response, not fighting the wheel. Strong crosswinds (open stretches, bridges, when passing trucks) require a firmer grip and reduced speed because a gust can push a car sideways with very little warning.",
  },
  children_school: {
    title: "Children are legally assumed to be unpredictable, so you must be too",
    body: "Near schools, playgrounds, and residential areas, drivers must anticipate that a child may step into the road without looking, precisely because children's traffic judgment and impulse control aren't assumed to match an adult's - this is written into how far these questions expect you to reduce speed and increase alertness, not just \"drive carefully in general.\" A stopped school bus with hazard lights on requires traffic in both directions to slow to walking pace or stop, since children may be crossing from either side of it.",
  },
  pedestrians: {
    title: "At a crosswalk, priority is the pedestrian's by default",
    body: "At a marked crosswalk (Zebrastreifen) without lights, pedestrians already on or clearly about to use it have priority, and a driver must be prepared to stop - approaching at reduced speed with that expectation is the legally required posture, not just good manners. Where there's no crosswalk at all, pedestrians don't have priority to cross mid-block, but a driver still must avoid endangering them if they do. Turning vehicles crossing a crosswalk to enter a side street must give way to pedestrians already on it, even though the driver technically has right of way over the cross-traffic.",
  },
  cyclists: {
    title: "Cyclists are traffic, with rights and vulnerabilities to match",
    body: "Overtaking a cyclist requires at least 1.5m clearance within built-up areas and 2m outside them (the exact case-law figures a question is often testing), specifically because a wobble, pothole, or gust of wind can shift a cyclist sideways with no warning. Where a marked cycle lane exists, motor vehicles generally may not use or park in it, and must check it (and the blind spot) before any turn that crosses it - the \"right hook\" against a straight-through cyclist is one of the most common and most tested collision scenarios. A cyclist proceeding straight through an intersection has priority over a vehicle turning across their path, mirroring the rule for any other traffic going straight.",
  },
  level_crossing: {
    title: "Level crossings are treated as a stop-and-verify zone by default",
    body: "Approaching a level crossing, you must be prepared to stop even without a barrier or light, since not every crossing is equipped with both; flashing red lights or a lowering/lowered barrier mean stop regardless of whether a train is visible yet. Overtaking is prohibited on the approach to and at a level crossing, and stopping on the tracks themselves (e.g. queuing traffic ahead) must be avoided even under momentary pressure to keep moving with the flow.",
  },
  construction_zone: {
    title: "Construction zone signs temporarily override the normal road rules",
    body: "Signs and markings at a construction zone (narrowed lanes, temporary speed limits, shifted lane markings) take precedence over the road's normal permanent signage for as long as they're in place - a question testing this is checking whether you follow the temporary instruction over what you'd otherwise expect from the road type. Reduced limits through work zones reflect narrower lanes and workers at close range, so maintaining a larger safety margin (speed and following distance both) is the expected behavior even where no explicit sign spells that out.",
  },
  alcohol_drugs: {
    title: "There isn't one number - there are several, and the safest is zero",
    body: "For most drivers in Germany the relevant thresholds are 0.5‰ (administrative offense) and 1.1‰ (criminal offense, presumed unfitness to drive), but novice drivers within their probationary period and drivers under 21 are held to a strict 0.0‰ limit with no exception. Impairment from alcohol begins well before any legal threshold - reaction time, judgment, and hazard perception all measurably degrade at levels far below 0.5‰, which is why the safest and legally intended answer in these questions is almost always \"don't drive at all,\" not \"stay under the limit.\" Illegal drugs carry a zero-tolerance threshold regardless of measured impairment.",
  },
  fatigue_distraction: {
    title: "Distraction removes attention completely, even briefly",
    body: "Handling a phone while driving (even at a red light, in most interpretations) is prohibited specifically because looking away for even 2 seconds at 100 km/h covers roughly 55m blind - the rule targets that attention gap, not the phone itself, which is why hands-free use remains legal. Microsleeps (a second or two of unconsciousness) can happen without a driver perceiving they occurred at all, which is the safety reasoning behind treating drowsiness as disqualifying rather than something to push through with willpower or a window down.",
  },
};

export function getTheoryNotesForTags(tags: string[]): TheoryNote[] {
  const seen = new Set<string>();
  const notes: TheoryNote[] = [];
  for (const tag of tags) {
    const note = THEORY_NOTES[tag];
    if (note && !seen.has(tag)) {
      seen.add(tag);
      notes.push(note);
    }
  }
  return notes;
}
