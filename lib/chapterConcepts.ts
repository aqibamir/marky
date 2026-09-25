// Original, hand-written "key facts" per catalog chapter - the rule of
// thumb that covers the chapter's whole topic, not a restatement of any one
// question. Keyed by the exact same chapter_name strings as CHAPTER_INFO in
// drivingQuestions.ts (straight from the live catalog), so a chapter group
// built from real fetched questions can look its bullets up directly.
//
// This is the "understand the rule" complement to the full Answer Key: the
// Answer Key guarantees a correct pick IF you've memorized that exact
// question verbatim, letter-for-letter; these bullets are what still gets
// you the right answer when a question is reworded, uses different numbers,
// or is one you've simply never seen before - which is most of what "know
// the material" actually means on the real exam.

export const CHAPTER_CONCEPTS: Record<string, string[]> = {
  "Fahrbetrieb Fahrphysik Fahrtechnik": [
    "Braking distance grows with the square of speed - double the speed, roughly quadruple the distance.",
    "Cornering force also grows with speed squared - slow down before a curve, never in it.",
    "ABS keeps you able to steer while braking hard - press firmly and hold, don't pump the pedal.",
    "A heavier/loaded vehicle needs a longer stopping distance than an empty one.",
    "Worn or underinflated tires reduce grip in curves and lengthen stopping distance.",
  ],
  "Besondere Verkehrssituationen": [
    "When rules conflict or nothing is posted, the safest, most cautious interpretation wins.",
    "Yield even if you technically have priority, whenever taking it would cause an accident.",
    "In an unclear situation, default to mutual caution and confirm eye contact / hand signals with other road users.",
  ],
  "Vorschriftzeichen": [
    "Round signs with a blue background = mandatory instruction - you must comply, not just consider it.",
    "Round signs with a red border = prohibition or restriction.",
    "A blue mandatory-direction arrow means you MUST go that way, not that you may.",
  ],
  "Ueberholen": [
    "Only overtake if you can see far enough to finish it and return safely before any hazard, oncoming vehicle, or restriction.",
    "Never overtake near crests, bends, unprioritized junctions, or pedestrian crossings.",
    "Passing on the right is prohibited except specific motorway/slow-queued-traffic situations.",
    "Give cyclists extra clearance when overtaking - at least 1.5m in town, 2m outside it.",
  ],
  "Sonstige Pflichten Des Fahrzeugfuehrers": [
    "You must always keep enough control of speed and steering to react to a foreseeable hazard.",
    "Duty of care covers passengers, cargo, and third parties, even with no explicit sign telling you so.",
    "Not knowing a rule doesn't excuse breaking it.",
  ],
  "Umweltschutz": [
    "Avoid unnecessary idling, harsh acceleration, and excess engine noise.",
    "Smooth, anticipatory driving measurably cuts fuel use and emissions.",
    "Entering an Umweltzone (environmental zone) needs the correct sticker - it isn't optional.",
  ],
  "Maengelerkennung Lokalisierung Von Stoerungen": [
    "A pulling brake, spongy pedal, or longer stopping distance means a brake fault - stop driving.",
    "Unusual engine/brake noises or smells are early failure warnings, not something to wait out.",
    "Tire vibration or pulling usually means bad alignment, imbalance, or wrong pressure.",
  ],
  "Fahrbahn Und Witterungsverhaeltnisse": [
    "Wet roads roughly double braking distance versus dry ones.",
    "Standing water risks aquaplaning - ease off the gas, avoid sharp braking or steering.",
    "Ice and snow need much greater following distance and gentler steering/braking/accelerating.",
    "Slow down on unfamiliar, unpaved, or patchy surfaces even with no sign telling you to.",
  ],
  "Bremsanlagen Und Geschwindigkeitsregler": [
    "Two independent brake circuits exist so one failure never means total brake loss.",
    "On long descents, use a lower gear (engine braking) to avoid overheating and brake fade.",
    "A speed limiter caps top speed but doesn't replace normal braking/following-distance judgment.",
  ],
  "Geschwindigkeit": [
    "A posted limit is the legal maximum under ideal conditions - not a target; go slower for rain, fog, traffic, or poor visibility.",
    "Default without a sign: 50 km/h in built-up areas, 100 km/h on the open road for a car.",
    "No general Autobahn limit without a sign, but 130 km/h is the recommended speed, and §3 (adapt to conditions) still applies.",
  ],
  "Abbiegen Wenden Und Rueckwaertsfahren": [
    "Signal early, check mirrors and blind spot, then position correctly before turning.",
    "A turning vehicle yields to oncoming traffic and to anyone going straight through the space you're crossing.",
    "Reversing and three-point turns put full responsibility on the driver doing them - use a spotter if visibility is unclear.",
  ],
  "Ladung": [
    "You're responsible for securing cargo so it can't shift even under emergency braking.",
    "Loads protruding past a certain length must be marked/flagged; lights and plates must stay visible.",
    "Overloading changes handling and braking distance - respect the vehicle's weight limit.",
  ],
  "Zulassung Zum Strassenverkehr Fahrzeugpapiere Fahrerlaubnis": [
    "Carry a valid license and the vehicle's registration document (Zulassungsbescheinigung Teil I); the insurance card generally doesn't need to be carried.",
    "Class B covers cars/vans up to 3,500 kg and up to 8 passenger seats, plus an optional trailer under specific combined-weight limits.",
    "Driving without a valid license or insurance is a serious offense regardless of how well you drive.",
  ],
  "Verhalten Gegenueber Fussgaengern": [
    "Pedestrians already on or clearly approaching a marked crosswalk have priority - slow down expecting to stop.",
    "Turning across a crosswalk still means yielding to pedestrians on it, even though you have priority over cross-traffic.",
    "Children, older, and disabled pedestrians can move unpredictably - give them extra margin.",
  ],
  "Gefahrzeichen": [
    "Triangular signs are hazard warnings (\"be ready\"), not a prohibition or a command.",
    "They tell you what to expect ahead - adjust your speed and attention accordingly, without waiting for a further instruction.",
  ],
  "Richtzeichen": [
    "Blue rectangular/informational signs point out facilities, routes, or permitted uses - they don't restrict anything on their own.",
  ],
  "Vorfahrt Vorrang": [
    "Default at an unsigned intersection: right before left (rechts vor links).",
    "Priority, stop/yield signs, and traffic lights always override that default.",
    "Entering from a driveway, unpaved ground, or a construction exit - you always yield, no matter which side.",
    "Having the right of way never excuses causing an accident - yield anyway if that's what avoids one.",
  ],
  "Halten Und Parken": [
    "\"Halten\" = a stop under 3 minutes with the driver present and ready to move; \"Parken\" = anything longer, or leaving the vehicle - different rules apply to each.",
    "Never park within 5m of an intersection or crosswalk, in front of a driveway, or on a level crossing.",
    "Always leave crosswalks, dropped kerbs, and emergency access clear.",
  ],
  "Autobahnen Und Kraftfahrstrassen": [
    "Enter only via the acceleration lane, matching motorway speed before merging - never stop on it.",
    "No stopping, reversing, U-turns, pedestrians, mopeds, or slow vehicles on the carriageway.",
    "The left lane is for overtaking only - don't sit in it once you're done passing.",
  ],
  "Personenbefoerderung": [
    "You're responsible for making sure every passenger, especially children, is properly secured before moving off.",
    "Never exceed the vehicle's approved passenger count.",
    "Give way to a stopped bus/tram signaling to pull away from a stop without a boarding island.",
  ],
  "Affektiv Emotionales Verhalten Im Strassenverkehr": [
    "Anger, stress, or road rage impairs judgment much like a substance would - pull over and calm down instead of reacting.",
    "Never retaliate to another driver's mistake or provocation; de-escalate first.",
  ],
  "Verwendung Und Wartung Von Reifen": [
    "Legal minimum tread depth is 1.6mm, but 3mm is the practical point to actually replace tires.",
    "Winter/all-season tires (snowflake symbol) are legally required whenever conditions are wintry - by condition, not calendar date.",
    "Never mix different tire types on the same axle; check pressure regularly.",
  ],
  "Unfall": [
    "Sequence: secure the scene (hazard lights, warning triangle placed well back) → protect from further danger → first aid within your ability → call emergency services.",
    "Leaving an accident scene you're involved in, without exchanging information or waiting a reasonable time, is a criminal offense (Fahrerflucht).",
    "Form a Rettungsgasse (emergency corridor) on multi-lane roads as soon as traffic starts slowing - not only once you see the incident.",
  ],
  "Beleuchtung": [
    "Dipped headlights are required whenever visibility drops - dusk, fog, rain, snow - so others can see you.",
    "Rear fog lights only below ~50m visibility, and must go off again once it improves - they blind drivers behind you.",
    "Hazard lights mean danger, obstruction, or an emergency stop only - never a \"thank you\" gesture.",
  ],
  "Anhaengerbetrieb": [
    "Towing usually lowers your max speed (100 km/h motorway, 80 km/h elsewhere) unless the combination is specifically rated higher.",
    "Extra weight means longer braking distance and a wider turning radius - plan for both.",
    "A Class B trailer limit depends on the combined vehicle+trailer weight (generally up to 3,500 kg combined).",
  ],
  "Lenk Und Ruhezeiten": [
    "EU driving/rest-time rules mainly apply to vehicles over 3.5t or commercial passenger transport, not an ordinary Class B car.",
    "The underlying reason they exist: fatigue behind the wheel is as dangerous as impairment.",
  ],
  "Abmessungen Gewichte Und Geschwindigkeitsbegrenzer": [
    "Governs maximum dimensions/weights and mandatory speed limiters for heavy/commercial vehicles - not a standard car.",
  ],
  "Anhaengekupplungssysteme": [
    "Check the coupling, safety chain/cable, and lighting connector before every tow.",
    "A properly secured coupling stops the trailer detaching under braking or over bumps.",
  ],
  "Autobahn": [
    "Same core rules as any motorway: merge via the acceleration lane, never stop on the carriageway, keep right except to overtake.",
    "130 km/h is a recommendation, not a limit - but §3 (adapt speed to conditions) still applies at any speed.",
  ],
  "Grundformen Des Verkehrsverhaltens": [
    "Core duty: constant caution plus consideration (Rücksichtnahme) for everyone else on the road.",
    "Never assume another road user will do the correct thing - stay ready to brake or yield regardless of who technically has priority.",
  ],
  "Alkohol Drogen Medikamente": [
    "Thresholds: 0.5‰ is an administrative offense, 1.1‰ a criminal one; novice drivers and under-21s: 0.0‰, no exceptions.",
    "Impairment starts well below 0.5‰ - the safest answer is almost always \"don't drive at all.\"",
    "Illegal drugs are zero-tolerance regardless of measured impairment; some legal medications impair too - check before driving.",
  ],
  "Wechsellichtzeichen Und Dauerlichtzeichen": [
    "A working traffic light fully replaces the normal right-of-way rules at that intersection.",
    "Flashing yellow = proceed with caution under normal right-of-way rules (the light is effectively off).",
    "A green arrow only permits that specific direction - it doesn't clear the whole intersection.",
  ],
  "Abstand": [
    "Rule of thumb for a safe gap: half your speedometer reading in meters, or a 2-second time gap.",
    "Increase the gap in poor visibility, on wet/icy roads, or behind a large vehicle blocking your view ahead.",
    "Tailgating removes your margin for someone else's mistake, not just your own.",
  ],
  "Benutzung Von Fahrstreifen Durch Kraftfahrzeuge": [
    "Keep-right rule: drive in the rightmost lane that fits your speed; use other lanes only to overtake.",
    "A solid lane line may never be crossed; a dashed one may, when it's safe.",
    "Get into the correct lane for your direction well before the junction, not at the last second.",
  ],
  "Lesen Einer Strassenkarte Und Streckenplanung": [
    "Plan your route and check restrictions (weight/height/width limits, environmental zones) before you set off, not while driving.",
    "Never study a map or navigation device while the vehicle is moving.",
  ],
  "Strassenbenutzung": [
    "Use the part of the road built for your vehicle type - carriageway, not a cycle path or footpath.",
    "Parking or driving on pavements, cycle paths, or verges is generally not allowed.",
  ],
  "Bahnuebergaenge": [
    "Be ready to stop even without a barrier or light - not every crossing has both.",
    "Flashing red or a lowering/lowered barrier means stop, whether or not a train is visible yet.",
    "No overtaking approaching or at a level crossing; never stop on the tracks, even if traffic ahead is queued.",
  ],
  "Entgegennahme Transport Und Ablieferung Der Gueter": [
    "Covers commercial freight acceptance/delivery responsibilities - not part of standard Class B car driving.",
  ],
  "Besondere Verkehrslagen": [
    "In unusual, congested, or obstructed conditions, reduce speed and raise alertness beyond the posted default.",
    "If signals are out of service, treat the intersection as uncontrolled (rechts vor links) with extra caution.",
  ],
  "Verhalten An Fussgaengerueberwegen Und Gegenueber Fussgaengern": [
    "Same crosswalk rule as pedestrian behavior generally: anyone on or entering a marked crossing has priority - approach ready to stop.",
    "No overtaking directly at or approaching a marked pedestrian crossing.",
  ],
  "Sorgfaltspflichten": [
    "You're responsible for foreseeing and avoiding harm to others, even in situations no specific rule directly addresses.",
    "Faced with two options, pick the one that reduces risk to others, even at some cost to your own convenience.",
  ],
  "Verbrennungsmaschine Fluessigkeiten Kraftstoffsystem Elektrische Anlage Zuendung Kraftuebertragung": [
    "Check oil, coolant, and brake fluid regularly - low levels risk engine or brake failure.",
    "A warning light (oil pressure, battery/alternator, coolant temperature) means stop and check, not \"drive carefully.\"",
    "A failing alternator or battery can cause a sudden loss of lights and other electrics while driving.",
  ],
  "Eignung Und Befaehigung Von Kraftfahrern": [
    "Fitness to drive is about actual impairment - illness, medication, fatigue, strong emotion - not intent.",
    "Some medical conditions or medications legally mean you shouldn't drive, even without a formal restriction on your license.",
  ],
  "Dunkelheit Und Schlechte Sicht": [
    "Dipped headlights are required as soon as visibility drops, even before full darkness.",
    "Below roughly 50m visibility (fog), the legal speed cap is 50 km/h regardless of the posted limit.",
    "Slow enough that you can stop within what your headlights actually let you see.",
  ],
  "Oeffentliche Verkehrsmittel Und Schulbusse": [
    "Give way to a stopped bus/tram at a stop without a boarding island when it signals to pull away.",
    "Pass a stopped school bus with hazard lights at walking pace only, watching for children crossing from either side.",
  ],
  "Liegenbleiben Und Abschleppen Von Fahrzeugen": [
    "Breaking down: hazard lights on, warning triangle placed well back (further on faster roads), get off the carriageway if you can.",
    "Towing a broken-down vehicle: hazard lights on both vehicles, a proper tow connection, drive slowly and smoothly.",
  ],
  "Ausruestung Von Fahrzeugen": [
    "Mandatory equipment for a car includes a warning triangle and a high-vis vest (plus, in most states, a first-aid kit).",
    "Equipment must actually be present, in reach, and (for a first-aid kit) not expired to satisfy the requirement.",
  ],
  "Zeichen Und Weisungen Der Polizeibeamten": [
    "A police officer's hand signals always override traffic lights and signs.",
    "Arms raised or crossed = stop for the indicated direction(s); an arm swung forward = go/proceed.",
  ],
  "Untersuchung Der Fahrzeuge": [
    "Regular technical inspection (HU/TÜV) is mandatory - an expired sticker is itself an offense.",
    "A vehicle with a known safety defect (e.g. failed brakes) must not be driven until it's repaired.",
  ],
  "Wartung Von Kraftfahrzeugen Und Rechtzeitige Veranlassung Von Reparaturen": [
    "The driver/owner must repair known defects promptly - \"I didn't know\" isn't valid if it was reasonably detectable.",
    "Preventive maintenance (tires, brakes, lights, fluids) is what actually reduces breakdown and accident risk.",
  ],
  "Einfahren Und Anfahren": [
    "Before pulling away or entering traffic from the roadside, you yield to everyone already moving on the road.",
    "Check mirrors, blind spot, and signal before moving off - treat it exactly like a lane change.",
  ],
  "Ermuedung Ablenkung": [
    "Handling a phone while driving is prohibited even briefly (hands-free is the exception) - the rule is about the attention gap, not the device.",
    "A 2-second glance away at 100 km/h covers roughly 55m blind - treat any distraction as that dangerous.",
    "Microsleeps can happen without you noticing - the correct response to drowsiness is to stop and rest, not push through.",
  ],
  "Warnzeichen": [
    "Vehicle-mounted warning signals (horn, hazard lights, a headlight flash) each carry a specific meaning - use them purposefully, not as social gestures.",
  ],
  "Verkehrshindernisse": [
    "Treat anything blocking your lane (parked vehicle, debris, roadworks) as requiring you to yield to oncoming traffic before passing it, unless signs say otherwise.",
  ],
  "Eg Kontrollgeraet": [
    "Tachograph rules apply to vehicles under EU driving-time regulation - generally over 3.5t or commercial - not a standard Class B car.",
  ],
  "Schmier Und Frostschutzmittel": [
    "Check engine oil and coolant/antifreeze regularly - low coolant risks overheating, low oil risks engine damage.",
    "Use the fluid grades specified for your vehicle - the wrong antifreeze concentration risks freezing or corrosion damage.",
  ],
  "Sonntagsfahrverbot": [
    "Applies to heavy goods vehicles over 7.5t on Sundays/public holidays - doesn't restrict a standard Class B car.",
  ],
  "Vorbeifahren": [
    "Passing a stationary obstacle or parked vehicle: leave enough clearance and make sure oncoming traffic has room too.",
    "If the road narrows around the obstacle, you still yield right of way to oncoming traffic as needed.",
  ],
  "Blaues Blinklicht Und Gelbes Blinklicht": [
    "Blue flashing light with siren = emergency vehicle - always make way, pull to the side if needed.",
    "Blue light alone (no siren) doesn't carry full priority rights, but you still generally give way.",
    "Yellow flashing light = a slow-moving or hazard vehicle (tow truck, wide load) - pass with caution, no automatic priority granted.",
  ],
  "Einrichtungen Zur Ueberwachung Der Parkzeit": [
    "In a zone requiring a parking disc or meter, set/display it correctly the moment you park - forgetting is a violation even if you'd have paid.",
  ],
  "Uebermaessige Strassenbenutzung": [
    "Avoid unnecessarily monopolizing road space - blocking multiple lanes, idling in traffic longer than needed, and similar excess use.",
  ],
  "Gesundheitsrisiken": [
    "Sudden symptoms (dizziness, chest pain, vision problems) mean stop driving immediately - don't try to reach your destination first.",
    "A chronic condition affecting alertness or reaction time must be managed (medication, rest) before driving, not compensated for by driving carefully.",
  ],
  "Grundregeln Ueber Das Verhalten Im Strassenverkehr": [
    "The foundational rule (§1 StVO): take part in traffic with constant caution and mutual consideration.",
    "When a rule is unclear or simply doesn't cover the situation, caution and consideration for others is the fallback standard.",
  ],
  "Verkehrseinrichtungen": [
    "Barriers, bollards, cones, and temporary markings carry the same legal weight as permanent signs while they're in place.",
    "Temporary/construction markings override the road's normal permanent markings for as long as they're there.",
  ],
  "Fahrzeuge Mit Vorfahrt": [
    "An emergency vehicle using blue light plus siren always has priority - yield and clear a path immediately.",
    "Vehicles already on a priority road, in a roundabout, or running on rails (trams) generally have priority over ones joining or crossing.",
  ],
};
