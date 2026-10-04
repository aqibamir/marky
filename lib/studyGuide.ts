// Study guide: for every Class B chapter, the rules that answer its questions,
// the German terms explained, and the traps/anomalies where the obvious answer
// is wrong. Written from a full read of every question and answer in the
// Class B pool - the explanations are original, not copied from the catalog.
//
// Every rule and trap cites real question IDs as evidence:
//   "ID"        the question exists in the Class B pool
//   "ID=text"   "text" appears in that question's CORRECT answer(s) (DE or EN)
//   "ID~text"   "text" appears in one of that question's WRONG options
// scripts/verify-study-guide.mjs checks all of these against the live catalog
// (run it after the dataset or the Class B exclusions change). The app also
// uses the IDs to show the actual question as proof, fetched live.

export interface StudyTerm {
  de: string;
  en: string;
  explain: string;
}

export interface StudyPoint {
  text: string;
  evidence: string[];
}

export interface StudyChapter {
  chapter: string; // same key as chapter_name in the catalog / CHAPTER_INFO
  gist: string;
  terms: StudyTerm[];
  rules: StudyPoint[];
  traps: StudyPoint[];
}

/** Parse "ID", "ID=text" or "ID~text" into its parts. */
export function parseEvidence(ev: string): { id: string; kind: "exists" | "correct" | "wrong"; text: string } {
  const m = ev.match(/^([^=~]+)([=~])?(.*)$/);
  const id = m ? m[1] : ev;
  const op = m?.[2];
  return { id, kind: op === "=" ? "correct" : op === "~" ? "wrong" : "exists", text: m?.[3] ?? "" };
}

export const STUDY_GUIDE: StudyChapter[] = [
  {
    "chapter": "Grundformen Des Verkehrsverhaltens",
    "gist": "Defensive and anticipatory driving, what causes accidents, and tiredness.",
    "terms": [
      {
        "de": "defensives Fahren",
        "en": "defensive driving",
        "explain": "Not insisting on your rights AND allowing for other people's mistakes. It does not mean over-cautious stopping at every junction."
      },
      {
        "de": "vorausschauendes Fahren",
        "en": "anticipatory driving",
        "explain": "Reacting early to what is probably about to happen and reading other road users' intentions - not staring only at the car in front."
      },
      {
        "de": "Sekundenschlaf",
        "en": "microsleep",
        "explain": "A few seconds of unnoticed sleep at the wheel - the end result of ignoring tiredness."
      }
    ],
    "rules": [
      {
        "text": "\"What can cause / what can be dangerous / what can happen\" questions: almost every realistic cause is correct. Only the absurd option is wrong (a car's flashy colour, daytime running lights, bad radio reception).",
        "evidence": [
          "1.1.01-104~spectacular",
          "1.1.01-111~lights turned on during day",
          "2.1.01-101~radio"
        ]
      },
      {
        "text": "Feeling tired → take a break right now and get out into fresh air. Music does not fix tiredness.",
        "evidence": [
          "1.1.01-109=break",
          "1.1.01-109~music"
        ]
      },
      {
        "text": "Tiredness shows as heavy eyelids and yawning and makes your reactions SLOWER - \"quicker reaction time\" is always wrong.",
        "evidence": [
          "1.1.01-107=yawning",
          "1.1.01-107~Quicker",
          "1.1.01-110=Delays reactions"
        ]
      },
      {
        "text": "Driving needlessly slowly is wrong too: it obstructs traffic, causes rear-end collisions and provokes risky overtaking.",
        "evidence": [
          "1.1.01-103=obstructs",
          "1.1.01-103=overtake dangerously"
        ]
      },
      {
        "text": "If someone takes your right of way anyway, slow down and give it up - never horn and push through.",
        "evidence": [
          "2.1.01-005-B=waive",
          "2.1.01-005-B~horn"
        ]
      },
      {
        "text": "Someone overtaking you can't get back in? You slow down so they can pull in ahead of you.",
        "evidence": [
          "2.1.01-007-M=reduce my speed",
          "2.1.01-007-M~accelerate"
        ]
      }
    ],
    "traps": [
      {
        "text": "Defensive driving is NOT \"stopping as a precaution at every crossroads\".",
        "evidence": [
          "1.1.01-001~every crossroads"
        ]
      },
      {
        "text": "A truck changing into your lane: you let it in because the driver may not see you and out of consideration - NOT because \"the zipper merge applies\".",
        "evidence": [
          "2.1.01-008-M=may fail to see",
          "2.1.01-008-M~alternate merging"
        ]
      },
      {
        "text": "Very loud bass music makes it HARDER for blind people to orient themselves, not easier.",
        "evidence": [
          "2.1.01-102=lose their orientation",
          "2.1.01-102~easier for blind"
        ]
      }
    ]
  },
  {
    "chapter": "Verhalten Gegenueber Fussgaengern",
    "gist": "Children, older people, disabled people and passengers at bus/tram stops - expect them to do the wrong thing.",
    "terms": [
      {
        "de": "Schrittgeschwindigkeit",
        "en": "walking pace",
        "explain": "About 4-7 km/h. The speed for passing a bus with hazard lights on at a stop."
      },
      {
        "de": "Warnblinklicht",
        "en": "hazard warning lights",
        "explain": "All indicators flashing. On a bus at a stop it means: pass only at walking pace, and only if nobody is endangered."
      },
      {
        "de": "gelbe Armbinde mit drei schwarzen Punkten",
        "en": "yellow armband with three black dots",
        "explain": "Marks a disabled (blind/deaf) person - you are obliged to take special care."
      },
      {
        "de": "weißer Stock",
        "en": "white stick",
        "explain": "Marks a blind or severely visually impaired person."
      },
      {
        "de": "Haltestelleninsel",
        "en": "tram-stop island",
        "explain": "Raised platform in the road; people step off it and run to it without looking."
      }
    ],
    "rules": [
      {
        "text": "Children, elderly people and pedestrians are always assumed to behave wrongly. Any option saying they will wait, react correctly or obey the rules is wrong.",
        "evidence": [
          "1.1.02-004~Proper road conduct",
          "1.1.02-005~always correctly judge",
          "1.1.02-127~all adults obey",
          "1.1.02-041-M~all children will wait"
        ]
      },
      {
        "text": "Default reaction to people near the road: slow down (to walking pace) and be ready to brake. \"Continue at the same speed\" and the horn are wrong.",
        "evidence": [
          "1.1.02-113=ready to brake",
          "1.1.02-113~horn",
          "1.1.02-042-M=walking pace",
          "1.1.02-119~Continue driving as before"
        ]
      },
      {
        "text": "Bus stopped at a stop with hazard lights: you MAY pass, in both directions, but only at walking pace and only if no passenger is endangered. Never overtake it while it is still moving towards/away from the stop.",
        "evidence": [
          "1.1.02-110-B=walking speed",
          "1.1.02-108-B~not pass under any circumstances",
          "1.1.02-026-B=not overtake the bus while it is still moving"
        ]
      },
      {
        "text": "Tram stopped at a stop without an island: passengers must not be endangered or impeded - you wait. No horn.",
        "evidence": [
          "1.1.02-116=endangered",
          "1.1.02-116~horn"
        ]
      },
      {
        "text": "Pedestrian with a white stick: slow down and stop if necessary - no warning signal.",
        "evidence": [
          "1.1.02-129=reduce speed",
          "1.1.02-129~warning signal"
        ]
      },
      {
        "text": "Yellow armband with three black dots = disabled person, special care required.",
        "evidence": [
          "1.1.02-133=disabled"
        ]
      },
      {
        "text": "Video \"Why must you brake/slow down?\": the answer is the vulnerable person (child, pedestrian) - not the car, van, motorbike or cyclist next to them.",
        "evidence": [
          "1.1.02-137-M=child",
          "1.1.02-202-M=child",
          "1.1.02-134-M=child",
          "1.1.02-136-M=pedestrian"
        ]
      },
      {
        "text": "Child runs out 20 m ahead: a collision is unavoidable at 50 km/h (not at 30 or 20).",
        "evidence": [
          "2.1.02-002=50"
        ]
      },
      {
        "text": "A ball rolls onto the road → BRAKE (a child will follow it). Just swerving round the ball is wrong.",
        "evidence": [
          "1.1.02-112=Brake",
          "1.1.02-112~Avoid hitting it"
        ]
      }
    ],
    "traps": [
      {
        "text": "Flashing your headlights to wave a pedestrian across is WRONG - you simply stop and let them cross.",
        "evidence": [
          "1.1.02-051-M=stop and allow",
          "1.1.02-051-M~flash"
        ]
      },
      {
        "text": "Blind man about to cross: \"make eye contact\" is wrong (he cannot see you). Stop and let him cross.",
        "evidence": [
          "1.1.02-036=Stop",
          "1.1.02-036~eye contact"
        ]
      },
      {
        "text": "Braking EARLY to show pedestrians you are letting them cross is correct; arcing around them is wrong.",
        "evidence": [
          "1.1.02-120-M=Brake early",
          "1.1.02-120-M~Arc around"
        ]
      },
      {
        "text": "Wheelchair user on the road even though there is a pavement: follow, then overtake with lots of room. Never honk to \"correct\" them.",
        "evidence": [
          "1.1.02-028=plenty of room",
          "1.1.02-028~honk"
        ]
      }
    ]
  },
  {
    "chapter": "Fahrbahn Und Witterungsverhaeltnisse",
    "gist": "Rain, ice, fog, crosswind, aquaplaning, loose chippings, ESP and adaptive cruise control.",
    "terms": [
      {
        "de": "Aquaplaning",
        "en": "aquaplaning",
        "explain": "The tyres float on a film of water - you can no longer steer or brake. Caused by speed, worn tyres and ruts."
      },
      {
        "de": "Schmierfilm",
        "en": "greasy film",
        "explain": "Dust + oil + the first rain after a dry spell = a very slippery surface and LONGER braking distances."
      },
      {
        "de": "Rollsplitt",
        "en": "loose chippings",
        "explain": "Loose gravel on the surface: don't brake hard, keep a straight course."
      },
      {
        "de": "Seitenwind / Windschatten",
        "en": "crosswind / wind shadow (slipstream)",
        "explain": "Wind pushes you sideways; beside a truck you are suddenly sheltered and then hit again when you leave its shadow."
      },
      {
        "de": "ESP / ESC",
        "en": "electronic stability control",
        "explain": "Its warning light FLASHING while you drive means you are going too fast for the conditions - it is not a fault and it does not make you safe."
      },
      {
        "de": "ACC (Abstandsregeltempomat)",
        "en": "adaptive cruise control",
        "explain": "Keeps distance automatically, but may not work properly in bad weather - you remain responsible."
      },
      {
        "de": "Nebelschlussleuchte",
        "en": "rear fog light",
        "explain": "Only allowed when fog limits visibility to under 50 m - then max. 50 km/h."
      },
      {
        "de": "Glatteis / Reifglätte",
        "en": "black ice / hoar frost",
        "explain": "Forms first on bridges and in forests."
      }
    ],
    "rules": [
      {
        "text": "Rain, especially the first rain after a dry spell: greasy film, worse visibility, LONGER braking distance → slow down and increase distance. Any option with \"shorter braking distance\" or \"reduce the distance\" is wrong.",
        "evidence": [
          "2.1.03-103~Shorter braking distance",
          "2.1.03-104~brakes react more quickly",
          "1.1.03-121~reduce the safety distance"
        ]
      },
      {
        "text": "On a slippery patch (ice, oil, chippings) avoid braking, accelerating AND steering; hold your course. Never brake hard in a bend or use the handbrake.",
        "evidence": [
          "1.1.03-104=Braking",
          "2.1.03-032~parking brake",
          "1.1.03-120~brake hard",
          "2.1.03-004~handbrake"
        ]
      },
      {
        "text": "Aquaplaning: gently take your foot off the accelerator and keep the wheel straight - don't brake firmly. It happens in dips and ruts, at high speed and with worn tyres.",
        "evidence": [
          "2.1.03-123=accelerator",
          "2.1.03-123~brake firmly",
          "2.1.03-015=Worn tyres",
          "2.1.03-101=dips"
        ]
      },
      {
        "text": "Where to expect it: ice on bridges and through forests; fog near rivers, lakes and marshes; dirt near construction sites and farm-track junctions.",
        "evidence": [
          "1.1.03-003=bridges",
          "1.1.03-109=rivers",
          "1.1.03-001=construction"
        ]
      },
      {
        "text": "Fog with visibility under 50 m: rear fog light on, max. 50 km/h. Never drive up close to use someone's tail lights, never straddle the centre line.",
        "evidence": [
          "1.1.03-118=50 km/h",
          "1.1.03-118~80 km/h",
          "1.1.03-110~Drive up close",
          "2.1.03-105=No"
        ]
      },
      {
        "text": "Crosswind: steer against it and slow down. Dangerous on bridges, at forest gaps and when overtaking trucks - the danger points are entering AND leaving the truck's wind shadow.",
        "evidence": [
          "2.1.03-018=Steer against",
          "2.1.03-020=bridges",
          "2.1.03-022-B=leave the slipstream",
          "2.1.03-022-B~change lane after overtaking"
        ]
      },
      {
        "text": "ESP/ESC light flashes while driving → you are too fast, reduce speed. Not \"it keeps me safe\", not \"go to a garage\".",
        "evidence": [
          "2.1.03-118=too high",
          "2.1.03-118~garage",
          "2.1.03-121=too high"
        ]
      },
      {
        "text": "Adaptive cruise control in bad weather may not work - you control speed and distance yourself.",
        "evidence": [
          "2.1.03-119=personally"
        ]
      },
      {
        "text": "The only safe ice test: brake carefully at very low speed.",
        "evidence": [
          "1.1.03-105=carefully applying the brakes"
        ]
      },
      {
        "text": "Heavy rain / wet road: increase distance because spray blocks your view, uneven spots are hidden and braking takes longer (these lists are usually all correct).",
        "evidence": [
          "1.1.03-119-M=spray",
          "1.1.03-002=Braking distances are greater"
        ]
      }
    ],
    "traps": [
      {
        "text": "Fogged-up windscreen: switching the fan OFF and keeping the windows shut is wrong. Slush: put the wipers on BEFORE it hits.",
        "evidence": [
          "2.1.03-107~ventilator off",
          "2.1.03-107=before slush"
        ]
      },
      {
        "text": "Sudden fog in daylight: dipped headlights - \"only parking lights\" is wrong.",
        "evidence": [
          "2.1.03-106=dipped",
          "2.1.03-106~parking lights"
        ]
      },
      {
        "text": "Ice is more likely on quiet stretches and bridges - \"on frequently used stretches\" is the wrong option.",
        "evidence": [
          "1.1.03-003~frequently used"
        ]
      },
      {
        "text": "Narrow avenue: you must be able to stop within HALF the distance you can see (oncoming traffic needs the same road).",
        "evidence": [
          "2.1.03-120=half"
        ]
      }
    ]
  },
  {
    "chapter": "Dunkelheit Und Schlechte Sicht",
    "gist": "Being dazzled, night driving, poor visibility and wild animals.",
    "terms": [
      {
        "de": "Abblendlicht",
        "en": "dipped headlights / low beam",
        "explain": "Normal night light; at night you must be able to stop within its range."
      },
      {
        "de": "Fernlicht",
        "en": "main beam / high beam",
        "explain": "Dazzles oncoming traffic; animals freeze in it. Wrong answer in fog and when you are dazzled."
      },
      {
        "de": "Blendung",
        "en": "dazzle",
        "explain": "Being blinded by oncoming lights - look at the right edge of the road."
      }
    ],
    "rules": [
      {
        "text": "Dazzled by oncoming lights: look at the right-hand edge of the road, slow down, stop if necessary. Switching on your own main beam or accelerating out of it is always wrong.",
        "evidence": [
          "1.1.04-103-B=right-hand edge",
          "1.1.04-103-B~Accelerate",
          "2.1.04-101~full beam",
          "2.1.04-001=Reduce speed"
        ]
      },
      {
        "text": "Your eyes adapt only slowly to darkness (e.g. turning into an unlit road or an underground car park).",
        "evidence": [
          "1.1.04-001=adapt only slowly",
          "1.1.04-001~already adapted"
        ]
      },
      {
        "text": "Poor visibility (rain, fog): slow down and keep right - main beam is wrong.",
        "evidence": [
          "1.1.04-111=reduce my speed",
          "1.1.04-111~main beam"
        ]
      },
      {
        "text": "Narrow avenue: stop within half the distance you can see.",
        "evidence": [
          "2.1.04-105=half"
        ]
      }
    ],
    "traps": [
      {
        "text": "Wild animals in your main beam: dip the lights immediately AND sound the horn and brake - one of the few questions where the horn is correct.",
        "evidence": [
          "2.1.04-002=dip",
          "2.1.04-002=horn"
        ]
      },
      {
        "text": "Main beam risks = dazzling oncoming traffic and animals freezing. \"Stationary vehicles will be seen too late\" is the wrong option (main beam helps you see them).",
        "evidence": [
          "2.1.04-103~Stationary vehicles"
        ]
      }
    ]
  },
  {
    "chapter": "Geschwindigkeit",
    "gist": "Stopping-distance formulas, speed limits and choosing a safe speed.",
    "terms": [
      {
        "de": "Reaktionsweg",
        "en": "reaction distance",
        "explain": "Distance travelled before you even touch the brake: (km/h ÷ 10) × 3. At 50 km/h = 15 m, at 100 km/h = 30 m."
      },
      {
        "de": "Bremsweg",
        "en": "braking distance",
        "explain": "(km/h ÷ 10) × (km/h ÷ 10). At 50 km/h = 25 m, at 100 km/h = 100 m. Double the speed = 4× the braking distance."
      },
      {
        "de": "Gefahrenbremsung",
        "en": "emergency (evasive) braking",
        "explain": "Normal braking distance ÷ 2."
      },
      {
        "de": "Anhalteweg",
        "en": "stopping distance",
        "explain": "Reaction distance + braking distance. 50 km/h → 40 m, 100 km/h → 130 m."
      },
      {
        "de": "Richtgeschwindigkeit",
        "en": "recommended speed",
        "explain": "130 km/h - advisory, for cars and motorbikes on motorways and dual carriageways outside towns."
      },
      {
        "de": "Sichtweite",
        "en": "visibility range",
        "explain": "How far you can see. Fog under 50 m → max. 50 km/h."
      }
    ],
    "rules": [
      {
        "text": "Reaction distance = (speed ÷ 10) × 3.",
        "evidence": [
          "1.2.03-104=x 3",
          "2.2.03-011=15",
          "2.2.03-008=30"
        ]
      },
      {
        "text": "Braking distance = (speed ÷ 10) × (speed ÷ 10). Double the speed → 4× the braking distance (30 km/h = 9 m, so 60 km/h = 36 m).",
        "evidence": [
          "1.2.03-105=x {Speed",
          "1.2.03-102=4",
          "1.2.03-106=36",
          "2.2.03-010=25",
          "2.2.03-007=100"
        ]
      },
      {
        "text": "Emergency braking distance = normal braking distance ÷ 2 (40 km/h ≈ 8 m → 50 km/h = 12.5 m).",
        "evidence": [
          "2.2.03-015=: 2",
          "2.2.03-016=12.5"
        ]
      },
      {
        "text": "Stopping distance = reaction + braking: 50 km/h → 40 m, 100 km/h → 130 m.",
        "evidence": [
          "2.2.03-009=40",
          "2.2.03-006=130"
        ]
      },
      {
        "text": "Speed limits you are asked to type: 50 in built-up areas, 100 for a car on a country road, 80 for a car with trailer outside towns (and on the motorway without 100-approval), 50 with snow chains, 50 in fog under 50 m.",
        "evidence": [
          "1.2.03-101=50",
          "2.2.03-104=100",
          "2.2.03-018=80",
          "2.2.03-109=80",
          "2.2.03-101=50",
          "2.2.03-025=50"
        ]
      },
      {
        "text": "Stop within the distance you can see on a good, wide road; within HALF of it on a narrow road (50 m visible → 25 m); at night within the range of your dipped headlights.",
        "evidence": [
          "2.2.03-023=visible to me",
          "2.2.03-012=25",
          "2.2.03-024=dipped"
        ]
      },
      {
        "text": "Recommended speed 130 km/h: applies to cars and motorbikes (not trucks over 3.5 t), on motorways and on roads outside towns with separated carriageways or at least two marked lanes per direction.",
        "evidence": [
          "2.2.03-304~Trucks",
          "2.2.03-305=Motorways",
          "2.2.03-305=two marked lanes"
        ]
      },
      {
        "text": "Brake BEFORE the bend, accelerate only when the road straightens. Too fast into a left bend → you are thrown out to the RIGHT.",
        "evidence": [
          "1.1.05-003=before reaching",
          "2.1.05-006=to the right",
          "2.1.05-006~to the left"
        ]
      },
      {
        "text": "You underestimate your speed after long fast driving and on wide, empty roads - not on narrow, bumpy roads or where trees/houses keep flashing past.",
        "evidence": [
          "2.1.05-004~constantly changing",
          "2.1.05-009~narrow roads",
          "2.1.05-005~Loud engine"
        ]
      },
      {
        "text": "Speed choice depends on visibility, weather, road, traffic and your own ability (all correct).",
        "evidence": [
          "1.2.03-103=Personal driving ability"
        ]
      }
    ],
    "traps": [
      {
        "text": "Car + trailer approved for 100 km/h: the 100 only applies on motorways/expressways. On an ordinary federal road it is still 80.",
        "evidence": [
          "2.2.03-110=80"
        ]
      },
      {
        "text": "Winter (M+S) tyres: simply never exceed the tyre's own maximum speed. There is no general 80 km/h limit, and the 50 km/h snow-chain limit does not apply.",
        "evidence": [
          "2.2.03-107=maximum permissible speed for these tyres",
          "2.2.03-107~80 km/h"
        ]
      },
      {
        "text": "Bus with hazard lights at a stop: \"I may not drive past\" is wrong - you may pass at walking pace.",
        "evidence": [
          "1.1.05-103~may not drive past",
          "1.1.05-105=walking speed"
        ]
      }
    ]
  },
  {
    "chapter": "Ueberholen",
    "gist": "When overtaking is allowed, side clearance, aborting, being overtaken, trams and slow vehicles.",
    "terms": [
      {
        "de": "Seitenabstand",
        "en": "side clearance",
        "explain": "Space to the side when passing. People on foot/bicycle/e-scooter: 1.5 m in town, 2 m outside."
      },
      {
        "de": "Überholweg",
        "en": "overtaking distance",
        "explain": "How far you need to complete the overtake - people UNDER-estimate it."
      },
      {
        "de": "Kuppe",
        "en": "hill crest",
        "explain": "You can't see past it: overtaking that can't be finished before it is forbidden."
      },
      {
        "de": "Fahrstreifenbegrenzung / Leitlinie",
        "en": "solid line / broken line",
        "explain": "Finish overtaking before a solid line starts; a broken line may be crossed."
      },
      {
        "de": "Rechtsfahrgebot",
        "en": "keep-right rule",
        "explain": "Go back to the right lane as soon as you've overtaken."
      },
      {
        "de": "Kolonne",
        "en": "convoy",
        "explain": "A group of vehicles driving together - don't overtake or split it."
      }
    ],
    "rules": [
      {
        "text": "Side clearance when overtaking pedestrians, cyclists or e-scooters: 1.5 m inside built-up areas, 2 m outside. \"1.0 m\" is always wrong.",
        "evidence": [
          "1.2.05-004=1,5",
          "1.2.05-005=1,5",
          "1.2.05-003=2",
          "1.2.05-124=1.5 m",
          "1.2.05-124~1.0 m"
        ]
      },
      {
        "text": "Can't keep that clearance (e.g. only 50 cm)? Don't overtake. No warning signal, no \"carefully\".",
        "evidence": [
          "1.1.06-124=refrain",
          "1.1.06-124~warning signal"
        ]
      },
      {
        "text": "You may only overtake at an appreciably higher speed; whoever is being overtaken must keep right and must NOT speed up - and should slow down if the overtaker gets into trouble.",
        "evidence": [
          "1.2.05-105=appreciably",
          "1.2.05-106~Increase your speed",
          "2.1.06-010=reduce my speed"
        ]
      },
      {
        "text": "Abort when the vehicle you're overtaking speeds up or oncoming danger appears - not when it slows down.",
        "evidence": [
          "1.1.06-105=suddenly accelerates",
          "1.1.06-105~reduces his speed"
        ]
      },
      {
        "text": "THE big pattern: \"Why are you not allowed to overtake?\" → the answer is the real hazard (view too short, the cyclist could turn left, the motorbike behind wants to overtake, not enough side room). \"Because of a no-overtaking sign\" or \"because I may not cross the line\" is almost always the wrong option.",
        "evidence": [
          "1.1.06-201-M~no-overtaking sign",
          "1.1.06-202-M~no-overtaking sign",
          "2.1.06-009~central line",
          "2.1.06-019-M~no-overtaking zone",
          "2.1.06-028-M~central lane",
          "2.1.06-029-M~centre line",
          "2.1.06-031-M~no-overtaking sign",
          "2.1.06-034-M~prohibited here",
          "2.1.06-035-M~lane marking",
          "2.1.06-005-B~broken line"
        ]
      },
      {
        "text": "A tractor or truck \"inviting\" you to overtake with its indicator: don't - it may be about to turn left.",
        "evidence": [
          "2.2.05-021-M~prompt to overtake",
          "2.1.06-023-M~demanding"
        ]
      },
      {
        "text": "Tram in the middle of a normal road: overtake on the RIGHT. On the left only in one-way streets or when the rails are too far to the right.",
        "evidence": [
          "1.2.05-107=right",
          "1.2.05-108=one-way"
        ]
      },
      {
        "text": "Autobahn: overtaking on the right is only allowed when there is a queue in the left lane.",
        "evidence": [
          "2.1.06-004-B=no queue"
        ]
      },
      {
        "text": "Indicate before pulling out AND before pulling back in; pull back in without cutting off the vehicle you passed.",
        "evidence": [
          "1.2.05-110=pulling in",
          "1.2.05-104~right in front"
        ]
      },
      {
        "text": "Slow vehicle with a queue behind: let them pass, stop at a suitable place if needed. Hazard lights are wrong.",
        "evidence": [
          "1.2.05-122~hazard",
          "1.2.05-122=allow the vehicles behind"
        ]
      },
      {
        "text": "Horse-drawn carriage: maximum side space, as little noise as possible, watch the driver's arm signals.",
        "evidence": [
          "1.2.05-121=most space",
          "1.2.05-120~high engine speed"
        ]
      },
      {
        "text": "Numbers: 100 km/h behind a 70 km/h truck → at least 800 m to a hill crest. Finish before a solid line or no-overtaking sign begins.",
        "evidence": [
          "2.2.05-005=800",
          "2.2.05-007=solid line"
        ]
      },
      {
        "text": "Convoys and truck-trailers: overtaking distance is much longer and they hide what's ahead - usually don't.",
        "evidence": [
          "2.1.06-032=considerably larger",
          "2.2.05-018=significantly increased"
        ]
      }
    ],
    "traps": [
      {
        "text": "Overtaking is NOT banned \"in all one-way streets\" or \"at bus lanes\" - it IS banned at pedestrian crossings and where you can't see.",
        "evidence": [
          "1.2.05-101~all one-way",
          "1.2.05-115~bus lanes",
          "1.2.05-115=pedestrian crossings"
        ]
      },
      {
        "text": "Bicycles and motorcycles need extra side clearance - trams are the wrong option.",
        "evidence": [
          "1.2.05-109~Trams"
        ]
      },
      {
        "text": "Heavy rain with ~50 m visibility: max 50 km/h and trucks over 7.5 t may not overtake - but the rear fog light is NOT required (rain isn't fog).",
        "evidence": [
          "2.2.05-202=50 km/h",
          "2.2.05-202~rear fog"
        ]
      },
      {
        "text": "Sometimes the correct answer is to complete the overtake quickly (when breaking it off would be more dangerous) - read the situation, don't auto-pick \"abort\".",
        "evidence": [
          "2.1.06-014=quickly continue"
        ]
      },
      {
        "text": "Typical misjudgement: you OVER-estimate how far away oncoming traffic is and UNDER-estimate your own overtaking distance.",
        "evidence": [
          "1.1.06-103=overestimated",
          "1.1.06-103~overestimate your overtaking"
        ]
      }
    ]
  },
  {
    "chapter": "Besondere Verkehrssituationen",
    "gist": "Wild animals, tunnels, turning trucks and farm vehicles, emergency braking, cyclists and blind spots.",
    "terms": [
      {
        "de": "Wildwechsel",
        "en": "wild animal crossing",
        "explain": "Deer etc. crossing - most likely at dusk and dawn, and they come in groups."
      },
      {
        "de": "Gefahrenbremsung / Vollbremsung",
        "en": "emergency braking",
        "explain": "Braking as hard as possible - with ABS you can still steer, but the catalog's answer is almost always 'brake hard and hold the wheel straight'."
      },
      {
        "de": "Pannenbucht / Notausgang",
        "en": "emergency bay / emergency exit",
        "explain": "Safety installations in tunnels - you are expected to know where they are."
      },
      {
        "de": "toter Winkel",
        "en": "blind spot",
        "explain": "Area not visible even in the mirrors (the interior mirror has one too) - check over your shoulder."
      }
    ],
    "rules": [
      {
        "text": "Emergency in front of you (video): brake hard and hold the steering wheel straight. \"Swerve left/right\" is the wrong option every time.",
        "evidence": [
          "1.1.07-150=straight ahead",
          "1.1.07-150~swerve to the left",
          "1.1.07-156-M=straight and firmly",
          "2.1.07-116=no evasive",
          "2.1.07-121-M=do not swerve"
        ]
      },
      {
        "text": "Unavoidable collision with an animal: brake as hard as possible and keep your direction - never swerve (\"always take evasive action\" is wrong).",
        "evidence": [
          "2.1.07-119=maintain my direction",
          "2.1.07-119~always take an evasive"
        ]
      },
      {
        "text": "Wild animals: expect them at dusk and dawn (not noon), expect more to follow, expect them to stop or turn back. Main beam does NOT scare them off.",
        "evidence": [
          "1.1.07-117=dusk",
          "1.1.07-117~noon",
          "1.1.07-114=stragglers",
          "1.1.07-173~main beam"
        ]
      },
      {
        "text": "After hitting a wild animal: stop, hazard lights, secure the scene, inform the police (or forestry office). Never drive on, never load the animal into your car.",
        "evidence": [
          "2.1.07-105=Inform the police",
          "2.1.07-105~without stopping"
        ]
      },
      {
        "text": "Tunnel: dipped headlights even by day, take off sunglasses, no U-turns, no fog lights. Jam: hazard lights, ~5 m gap. Vehicle fire you can't drive out of: hazard lights, engine off, key left in, don't lock, raise the alarm, fight the fire if you can.",
        "evidence": [
          "1.1.07-120=dipped headlights",
          "1.1.07-120~fog headlamps",
          "1.1.07-121=5 m",
          "1.1.07-144=leave the key",
          "1.1.07-145~lock"
        ]
      },
      {
        "text": "Trucks, combine harvesters and tractors turning: they slow down a lot and swing OUT the other way first; their load/implement can swing out or fall and their indicators may be hidden.",
        "evidence": [
          "1.1.07-001=swing out",
          "1.1.07-011=swing far out",
          "1.1.07-101=swing out"
        ]
      },
      {
        "text": "Turning right: cyclists and pedestrians going straight have priority - check over your shoulder, let them through. A glance in the mirror alone is not enough.",
        "evidence": [
          "1.1.07-137=over your shoulder",
          "1.1.07-137~ahead of the cyclist",
          "1.1.07-111~simply glance"
        ]
      },
      {
        "text": "In a built-up area a narrow, poor-looking side road can still have priority. \"The better road always has priority\" and \"right before left without exception\" are both wrong.",
        "evidence": [
          "1.1.07-002=narrow",
          "1.1.07-002~always has priority",
          "1.1.07-002~without exception"
        ]
      },
      {
        "text": "In the wrong lane (left-turn lane but you want to go right): just turn left and find another way - never reverse or cut across.",
        "evidence": [
          "1.1.07-142=turn left",
          "1.1.07-142~reverse"
        ]
      },
      {
        "text": "Tyre burst at high speed: ease off, steer against it, brake gently - not full braking.",
        "evidence": [
          "2.1.07-106=brake cautiously",
          "2.1.07-106~fully"
        ]
      },
      {
        "text": "50 → 100 km/h: braking distance ×4 (25 m → 100 m), reaction distance ×2 (15 m → 30 m), safety gap from 15 m to at least 50 m.",
        "evidence": [
          "2.1.07-109=quadrupled",
          "2.1.07-208=doubled",
          "2.1.07-110=50 m"
        ]
      },
      {
        "text": "A fast car veering on a dry, straight road: gusts of wind or a tyre blow-out - not a steady headwind.",
        "evidence": [
          "2.1.07-101~headwind",
          "2.1.07-209~head wind"
        ]
      },
      {
        "text": "E-bikes are deceptively fast and look like normal bikes; you can't hear them coming.",
        "evidence": [
          "1.1.07-023=deceptively fast",
          "1.1.07-023~engine noise"
        ]
      },
      {
        "text": "Hazard lights on another vehicle mean: breakdown, school bus with children, or the end of a traffic jam.",
        "evidence": [
          "1.1.07-010=school buses"
        ]
      }
    ],
    "traps": [
      {
        "text": "A deer seen some way ahead: reduce speed and be ready to brake - an emergency stop is the WRONG option here. Match the reaction to how close the danger is.",
        "evidence": [
          "1.1.07-140=reduce speed",
          "1.1.07-140~emergency braking"
        ]
      },
      {
        "text": "Video where the horn IS correct: emergency braking plus a warning signal.",
        "evidence": [
          "1.1.07-151=horn"
        ]
      },
      {
        "text": "Someone tailgating you (video): keep driving steadily - braking to \"teach\" them or speeding up is wrong.",
        "evidence": [
          "2.1.07-115=maintain my speed",
          "2.1.07-115~brake briefly"
        ]
      },
      {
        "text": "The interior mirror DOES have a blind spot - the option claiming it doesn't is wrong.",
        "evidence": [
          "2.1.07-203~no blind spot"
        ]
      },
      {
        "text": "A reported traffic jam ahead: keep following the reports and be careful at bends and crests - relying on emergency-brake assist is wrong.",
        "evidence": [
          "1.1.07-170~emergency brake assist"
        ]
      }
    ]
  },
  {
    "chapter": "Alkohol Drogen Medikamente",
    "gist": "Alcohol limits, how long it takes to sober up, drugs and medication.",
    "terms": [
      {
        "de": "Promille (‰)",
        "en": "per mille (blood alcohol)",
        "explain": "Parts per thousand of alcohol in the blood. The body breaks down roughly 0.1‰ per hour - 1.0‰ takes about 10 hours."
      },
      {
        "de": "Probezeit",
        "en": "probation period",
        "explain": "The first 2 years after getting your licence: absolutely no alcohol at the wheel (0.0‰). Same for every driver under 21."
      },
      {
        "de": "MPU (medizinisch-psychologische Untersuchung)",
        "en": "medical-psychological examination",
        "explain": "Compulsory assessment that can be ordered after drink/drug driving or leaving an accident scene."
      },
      {
        "de": "Fahrverbot / Entzug der Fahrerlaubnis",
        "en": "driving ban / licence withdrawal",
        "explain": "Temporary ban vs. losing the licence entirely."
      }
    ],
    "rules": [
      {
        "text": "NOTHING sobers you up quickly - not coffee, not sleeping half an hour, not a walk, not sport. Only time.",
        "evidence": [
          "1.1.09-029=Nothing",
          "1.1.09-029~coffee",
          "1.1.09-001=strong coffee"
        ]
      },
      {
        "text": "1.0‰ takes about 10 hours to clear (≈ 0.1‰ per hour).",
        "evidence": [
          "1.1.09-006=10 hours"
        ]
      },
      {
        "text": "Under 21 or in your probation period: no alcohol at all when driving. It does NOT apply to \"all drivers\", and there is no 30/50 mg allowance for beginners.",
        "evidence": [
          "1.1.09-021=under 21",
          "1.1.09-021~All drivers",
          "1.1.09-022=definitely not"
        ]
      },
      {
        "text": "Things that make alcohol hit harder: sleeping pills/painkillers/sedatives, an empty stomach, downing drinks in one.",
        "evidence": [
          "1.1.09-007=empty"
        ]
      },
      {
        "text": "Drugs (hashish, cocaine, heroin, amphetamines, LSD, crystal meth): even a single use can make you unfit to drive. Cannabis is broken down unevenly and stays detectable in urine for weeks.",
        "evidence": [
          "1.1.09-010=LSD",
          "1.1.09-015=Unevenly",
          "1.1.09-027=some weeks"
        ]
      },
      {
        "text": "Drug-dependent people are fit to drive again only after at least ONE YEAR proven abstinence with no expected relapse.",
        "evidence": [
          "1.1.09-014=one year"
        ]
      },
      {
        "text": "Consequences of drug driving: licence confiscated or driving ban, fine and/or prison, MPU - usually all correct.",
        "evidence": [
          "1.1.09-017=imprisonment"
        ]
      },
      {
        "text": "Coffee, tea and soft drinks are the wrong options for \"impairs you like alcohol\" - medicines and drugs are right.",
        "evidence": [
          "1.1.09-003~coffee",
          "1.1.09-030~Soft drinks"
        ]
      }
    ],
    "traps": [
      {
        "text": "Wording trap: alcohol does NOT \"reduce the reaction time\" - it makes your reactions slower (longer). The correct options are narrower field of vision and worse spatial vision.",
        "evidence": [
          "1.1.09-024=field of vision",
          "1.1.09-024~reduces the reaction time"
        ]
      },
      {
        "text": "Wording trap: cannabis does NOT \"reduce sensitivity to glare\" (it makes you more glare-sensitive). It reduces awareness and concentration.",
        "evidence": [
          "1.1.09-025~glare",
          "1.1.09-031~glare"
        ]
      },
      {
        "text": "Drugs never produce a lasting improvement in abilities, and hashish never improves your judgement of time.",
        "evidence": [
          "1.1.09-009~Prolonged improvement",
          "1.1.09-018~Improved judgement"
        ]
      }
    ]
  },
  {
    "chapter": "Gesundheitsrisiken",
    "gist": "Heat and physical symptoms.",
    "terms": [],
    "rules": [
      {
        "text": "Hot weather: plan regular breaks and drink enough - travelling around noon is the wrong option.",
        "evidence": [
          "1.1.10-001=breaks",
          "1.1.10-001~noon"
        ]
      },
      {
        "text": "Nausea, dizziness or fever → don't drive (all three correct).",
        "evidence": [
          "1.1.10-002=Fever"
        ]
      }
    ],
    "traps": []
  },
  {
    "chapter": "Grundregeln Ueber Das Verhalten Im Strassenverkehr",
    "gist": "§1 StVO: constant caution and consideration.",
    "terms": [
      {
        "de": "§1 StVO",
        "en": "basic rule of the road traffic regulations",
        "explain": "Constant caution and mutual consideration - expect others to make mistakes."
      }
    ],
    "rules": [
      {
        "text": "Caution and consideration = expect others to behave wrongly and drive with foresight; never \"insist on your priority at all times\".",
        "evidence": [
          "1.2.01-001=improper conduct",
          "1.2.01-001~insist"
        ]
      },
      {
        "text": "Special care for people with obvious disabilities and children (taxi drivers is the wrong option).",
        "evidence": [
          "1.2.01-003=children",
          "1.2.01-003~taxi"
        ]
      }
    ],
    "traps": []
  },
  {
    "chapter": "Strassenbenutzung",
    "gist": "Which part of the road to use, hard shoulders, lane choice.",
    "terms": [
      {
        "de": "Seitenstreifen",
        "en": "hard shoulder",
        "explain": "The paved strip to the right of the road. On normal roads: for stopping/parking and slow vehicles - never for overtaking."
      },
      {
        "de": "Kraftfahrstraße / Autobahn",
        "en": "expressway / motorway",
        "explain": "Only for vehicles whose design top speed is MORE than 60 km/h."
      }
    ],
    "rules": [
      {
        "text": "Right hard shoulder (ordinary road): stopping, parking and slow vehicles may use it - overtaking on it is wrong. Slow tractors and mopeds must use it where possible (small motorcycles need not).",
        "evidence": [
          "1.2.02-101-B=stopping and parking",
          "1.2.02-101-B~overtaking",
          "1.2.02-106=Mopeds",
          "1.2.02-106~Small-engine"
        ]
      },
      {
        "text": "In the wrong lane: carry on in the direction that lane allows (straight on or left) - don't squeeze across at the last moment.",
        "evidence": [
          "1.2.02-104-M=straight ahead or turn left",
          "1.2.02-104-M~move carefully"
        ]
      },
      {
        "text": "Motorway/expressway: the vehicle's design top speed must be more than 60 km/h.",
        "evidence": [
          "1.2.02-111=60"
        ]
      },
      {
        "text": "Turning left on a road with one lane each way: position yourself towards the centre of the road.",
        "evidence": [
          "2.2.02-001=centre"
        ]
      },
      {
        "text": "Outside towns with 3 marked lanes in your direction and only scattered slow vehicles on the right: you may stay in the MIDDLE lane.",
        "evidence": [
          "2.2.02-006=middle"
        ]
      },
      {
        "text": "Driving alongside a truck: you can be overlooked and you can't see others - the hot-exhaust option is nonsense.",
        "evidence": [
          "2.2.02-007=overlooked",
          "2.2.02-303~exhaust"
        ]
      },
      {
        "text": "Oncoming horse-drawn carriage: keep right and avoid noise.",
        "evidence": [
          "1.2.02-108=noise"
        ]
      }
    ],
    "traps": [
      {
        "text": "Cars waiting at a red light in the right lane: you MAY pass them carefully on the right if there is enough room on the ROADWAY (never via the pavement). But if every lane is queuing, you wait behind the last car.",
        "evidence": [
          "2.2.02-003=adequate space",
          "2.2.02-003~pavement",
          "2.2.07-001=behind the last car"
        ]
      }
    ]
  },
  {
    "chapter": "Abstand",
    "gist": "Safe following distances and the 7 m rule for trailers.",
    "terms": [
      {
        "de": "Sicherheitsabstand",
        "en": "safety distance",
        "explain": "Outside towns: half the speedometer reading in metres (100 km/h → 50 m), or 2 seconds."
      },
      {
        "de": "halber Tacho",
        "en": "half the speedometer",
        "explain": "The rule of thumb for the gap outside built-up areas."
      }
    ],
    "rules": [
      {
        "text": "Outside built-up areas: at least half the speedometer reading in metres (100 km/h → 50 m). 1/3 and 1/5 are wrong.",
        "evidence": [
          "2.2.04-003=1/2",
          "2.2.04-005=One half",
          "2.2.04-004=50"
        ]
      },
      {
        "text": "Or use the 2-second rule (e.g. at 80 km/h) - 1 second or 15 m is too little.",
        "evidence": [
          "2.2.04-001=2 seconds"
        ]
      },
      {
        "text": "Town traffic at 50 km/h, dry: at least 15 m (≈ 3 car lengths).",
        "evidence": [
          "2.2.04-002=15 m"
        ]
      },
      {
        "text": "Combinations longer than 7 m (and trucks over 3.5 t) outside towns on roads with ONE lane per direction: leave enough room for an overtaking car to pull in ahead of you.",
        "evidence": [
          "2.2.04-102=7",
          "2.2.04-107=7",
          "2.2.04-306=longer than 7 m",
          "2.2.04-307=pull back into lane"
        ]
      },
      {
        "text": "Distance depends on speed, visibility and road surface (all correct).",
        "evidence": [
          "1.2.04-101=Visibility"
        ]
      },
      {
        "text": "Heavily loaded car: longer braking distance and different handling → bigger gap. \"My reaction time gets longer\" is wrong.",
        "evidence": [
          "2.2.04-106=braking distance",
          "2.2.04-106~reaction time"
        ]
      }
    ],
    "traps": [
      {
        "text": "The gap behind a vehicle may NOT be capped at \"your own length\" or \"10 m\" to save space - it must be big enough for one overtaker to pull in.",
        "evidence": [
          "2.2.04-101~must not be greater",
          "2.2.04-307~not be greater than 10 m"
        ]
      }
    ]
  },
  {
    "chapter": "Vorbeifahren",
    "gist": "Passing obstacles: whoever has the obstacle on their side waits.",
    "terms": [],
    "rules": [
      {
        "text": "Obstacle (roadworks, parked car) on YOUR side → you wait for oncoming traffic. Not \"the smaller vehicle\", not \"we agree\".",
        "evidence": [
          "1.2.06-001=side of the roadway where the roadworks",
          "1.2.06-001~smaller vehicle",
          "1.2.06-101-M=wait",
          "1.2.06-101-M~agree"
        ]
      },
      {
        "text": "Not enough room between a cyclist and an oncoming car → wait.",
        "evidence": [
          "1.2.06-005=Wait"
        ]
      }
    ],
    "traps": []
  },
  {
    "chapter": "Benutzung Von Fahrstreifen Durch Kraftfahrzeuge",
    "gist": "Lane changes, the zipper merge and queuing in lanes.",
    "terms": [
      {
        "de": "Reißverschlussverfahren",
        "en": "zipper merge (alternate merging)",
        "explain": "When a lane ends or is blocked: drive up to the narrowing and merge alternately there. It does NOT apply at motorway slip roads."
      },
      {
        "de": "Fahrstreifenwechsel",
        "en": "lane change",
        "explain": "Indicate in time and watch the traffic behind - no heavy braking."
      }
    ],
    "rules": [
      {
        "text": "Lane ending or blocked by an obstacle: keep going to just before the narrowing, then merge one-by-one. Moving over early or \"always being first\" is wrong; the through lane lets one in each time.",
        "evidence": [
          "1.2.07-103=just before",
          "1.2.07-103~immediately after",
          "1.2.07-113=alternate merging"
        ]
      },
      {
        "text": "The zipper rule applies where a lane ends or is blocked - NOT where an on-ramp/acceleration lane joins.",
        "evidence": [
          "1.2.07-112~merging lanes join",
          "2.2.07-011~merging lane ends on the motorway"
        ]
      },
      {
        "text": "Changing lanes: indicate in time and watch the traffic behind - no heavy braking first.",
        "evidence": [
          "1.2.07-001=signal",
          "1.2.07-001~brake heavily"
        ]
      },
      {
        "text": "Red light with queues in every lane: wait behind the last car - don't pass on either side.",
        "evidence": [
          "2.2.07-001=behind the last car"
        ]
      },
      {
        "text": "Inside built-up areas, vehicles up to 3.5 t may freely choose their lane.",
        "evidence": [
          "2.2.07-002=3,5"
        ]
      },
      {
        "text": "Narrowing with oncoming traffic: stop before the constriction and let the oncoming car through.",
        "evidence": [
          "2.2.06-001=stop and wait"
        ]
      },
      {
        "text": "Tunnel with oncoming traffic: don't cross the lane boundary and never turn round.",
        "evidence": [
          "1.2.07-104=U-turn"
        ]
      }
    ],
    "traps": [
      {
        "text": "Hard shoulder in a picture: it depends on the signs. When released for traffic it must be used like a right-hand lane; otherwise it's for breakdowns only. Read the sign, don't assume.",
        "evidence": [
          "2.2.07-012-M=right-hand lane",
          "2.2.07-013-M=breakdown"
        ]
      }
    ]
  },
  {
    "chapter": "Abbiegen Wenden Und Rueckwaertsfahren",
    "gist": "Turning left/right, who has priority when turning, U-turns and reversing.",
    "terms": [
      {
        "de": "Rückschau - Zeichen - Einordnen",
        "en": "mirror - signal - position",
        "explain": "The order for a turn: check behind, indicate, move into the lane (and check behind again just before turning)."
      },
      {
        "de": "voreinander abbiegen",
        "en": "turning in front of each other",
        "explain": "Two oncoming left-turners normally turn passing in front of each other (not round the back)."
      },
      {
        "de": "abknickende Vorfahrt",
        "en": "priority road that bends",
        "explain": "Follow the bend → indicate. Leave it by going straight on → no indicator."
      },
      {
        "de": "Kraftfahrstraße",
        "en": "expressway (clearway for motor vehicles)",
        "explain": "Like the autobahn: no U-turns, no stopping."
      }
    ],
    "rules": [
      {
        "text": "Order for a left turn: watch traffic behind → indicate → get into lane; check behind again immediately before turning.",
        "evidence": [
          "1.2.09-120=Observe traffic behind you, indicate",
          "1.2.09-006=again immediately before"
        ]
      },
      {
        "text": "Two oncoming cars both turning left normally turn IN FRONT of each other. Behind each other only if markings, the layout or the traffic require it - or the other driver clearly wants to.",
        "evidence": [
          "1.2.09-009=in front of each other",
          "1.2.09-018=in front of one another",
          "1.2.09-018~communicate"
        ]
      },
      {
        "text": "When turning you give way to: oncoming traffic, trams, cyclists going straight on (from both directions) and pedestrians crossing the road you turn into.",
        "evidence": [
          "1.2.09-123=Pedestrians",
          "1.2.09-122=both cyclists",
          "1.2.09-022-M=both"
        ]
      },
      {
        "text": "Indicate when turning into a road or property, when leaving a roundabout, and when FOLLOWING a priority road that bends. Going straight on and leaving the bending priority road: no indicator.",
        "evidence": [
          "1.2.09-117=continue following",
          "1.2.09-117~continue straight on"
        ]
      },
      {
        "text": "Roundabout: no indicator on entry, indicate on exit, don't stop on it, drive over the central island only if your vehicle is too big otherwise. Give way to pedestrians/cyclists at the exit.",
        "evidence": [
          "1.2.09-109=indicate to leave",
          "1.2.09-021-M=pedestrian"
        ]
      },
      {
        "text": "U-turns are forbidden on motorways and expressways (not on farm tracks).",
        "evidence": [
          "2.2.09-001=motorways",
          "2.2.09-001~farm"
        ]
      },
      {
        "text": "Reversing: slowly, look all round including the blind spot, get someone to guide you if needed. A reversing camera alone is never enough.",
        "evidence": [
          "2.2.09-101=blind spot",
          "2.2.09-202~solely",
          "2.2.09-204~only use the rear view camera"
        ]
      },
      {
        "text": "Turning right in town: walking speed reduces the risk; taking it quickly is wrong.",
        "evidence": [
          "2.2.09-203=walking speed",
          "2.2.09-203~quickly"
        ]
      },
      {
        "text": "About to turn left off a country road while someone behind is overtaking you: turn only after they have passed.",
        "evidence": [
          "2.2.09-003-M=overtaken me",
          "2.2.09-006-M=overtaken me"
        ]
      }
    ],
    "traps": [
      {
        "text": "Lots of picture questions ask which \"driving line\" (left/middle/right) to take for a turn. There is no fixed answer - it depends on the lanes shown. Pick the line that ends up in the correct lane of the road you're turning into without crossing other lanes.",
        "evidence": [
          "2.2.09-009-M=middle",
          "2.2.09-011-M=left driving line"
        ]
      }
    ]
  },
  {
    "chapter": "Einfahren Und Anfahren",
    "gist": "Pulling out from driveways, parking spaces, petrol stations and traffic-calmed areas.",
    "terms": [
      {
        "de": "abgesenkter Bordstein",
        "en": "sunken (dropped) kerb",
        "explain": "Whoever crosses it to enter the road must give way to everyone - right-before-left does not apply."
      },
      {
        "de": "verkehrsberuhigter Bereich",
        "en": "traffic-calmed area (play street)",
        "explain": "Leaving one = like leaving a driveway: you wait."
      }
    ],
    "rules": [
      {
        "text": "Pulling out of a property, parking space, petrol station, traffic-calmed area or over a dropped kerb: YOU wait for everyone (cars, cyclists, pedestrians). Right-before-left does not apply and nobody \"negotiates\".",
        "evidence": [
          "1.2.10-005=sunken kerbstone must wait",
          "1.2.10-105=I have to wait",
          "1.2.10-106=I have to wait",
          "1.2.10-106~agree"
        ]
      },
      {
        "text": "Before moving off: indicate and check behind - a mirror glance alone isn't enough.",
        "evidence": [
          "1.2.10-101=direction indicator",
          "1.2.10-101~sufficient"
        ]
      },
      {
        "text": "Pedestrians on the footpath you cross have priority - no horn; get guided out if necessary.",
        "evidence": [
          "1.2.10-108~horn",
          "1.2.10-107=directed"
        ]
      }
    ],
    "traps": []
  },
  {
    "chapter": "Besondere Verkehrslagen",
    "gist": "Traffic jams: what to keep clear and when you may not enter a junction.",
    "terms": [
      {
        "de": "Verband / Kolonne",
        "en": "closed convoy",
        "explain": "A convoy (often marked with blue lights) - let it pass through."
      }
    ],
    "rules": [
      {
        "text": "In a jam keep these clear: crossroads/junctions, level crossings, pedestrian crossings, merging points. (Driveways and bus stops are the wrong options.)",
        "evidence": [
          "1.2.11-003=Level crossings",
          "1.2.11-003~Driveways",
          "1.2.11-006~Bus stops",
          "1.2.11-004=Pedestrian crossings"
        ]
      },
      {
        "text": "Even on green / with priority you must not enter if you'd get stuck in the junction because of tail-backs, if police signal stop, or if you'd block a blue-light vehicle.",
        "evidence": [
          "1.2.11-108=backing up",
          "1.2.11-109=flashing blue"
        ]
      },
      {
        "text": "A truck driver waves you through: go only if it's a clear hand signal AND you won't endanger cross traffic - not just because he's urging you.",
        "evidence": [
          "1.2.11-113-M=hand signal",
          "1.2.11-113-M~urging"
        ]
      }
    ],
    "traps": [
      {
        "text": "Exception: waiting INSIDE the junction to turn left because of oncoming traffic is allowed - that option is the wrong \"may not enter\" answer.",
        "evidence": [
          "1.2.11-109~want to turn left"
        ]
      },
      {
        "text": "A \"Stop. Give way\" sign is not a reason you can't enter on green - lights beat signs.",
        "evidence": [
          "1.2.11-108~Stop. Give way"
        ]
      },
      {
        "text": "Picture: a truck pulls away immediately on green while you want to go straight → wait for it, and a warning signal (horn) is correct if needed.",
        "evidence": [
          "1.2.11-201-M=warning signal"
        ]
      }
    ]
  },
  {
    "chapter": "Halten Und Parken",
    "gist": "Stopping vs parking, the distances, and where each is banned.",
    "terms": [
      {
        "de": "Halten",
        "en": "stopping",
        "explain": "Up to 3 minutes, staying with the car."
      },
      {
        "de": "Parken",
        "en": "parking",
        "explain": "Stopping for more than 3 minutes OR leaving the vehicle."
      },
      {
        "de": "Andreaskreuz",
        "en": "St Andrew's cross",
        "explain": "The X-shaped sign at level crossings."
      },
      {
        "de": "Bordsteinabsenkung",
        "en": "dropped kerb",
        "explain": "No parking in front of one."
      },
      {
        "de": "Taxistand",
        "en": "taxi rank",
        "explain": "No stopping."
      }
    ],
    "rules": [
      {
        "text": "Parked = stopped for more than 3 minutes, or left the vehicle. (Waiting at a closed level crossing is not parking.)",
        "evidence": [
          "1.2.12-107=3 minutes",
          "1.2.12-107~level crossing"
        ]
      },
      {
        "text": "The distances: 5 m before a pedestrian crossing; 5 m before and after junctions (8 m if a cycle path runs alongside); 15 m before/after a bus or tram stop sign; 10 m before traffic lights or a stop sign/St Andrew's cross they'd hide; St Andrew's cross 5 m in town, 50 m outside; 3 m gap to a solid line.",
        "evidence": [
          "1.2.12-108=5",
          "1.2.12-109=5",
          "1.2.12-129=8",
          "1.2.12-133=8",
          "1.2.12-112=15",
          "2.2.12-104=10",
          "1.2.12-111=5",
          "1.2.12-110=50",
          "2.2.12-204=3"
        ]
      },
      {
        "text": "Max 3 minutes stopping at a bus stop (if no bus is obstructed). Parking on designated footpaths only up to 2.8 t.",
        "evidence": [
          "1.2.12-113=3",
          "2.2.12-102=2,8"
        ]
      },
      {
        "text": "No STOPPING: level crossings, narrow or blind spots, sharp bends, on/off slip lanes, lanes with direction arrows, taxi ranks, fire-brigade access, autobahn/expressway outside parking areas, on the road when there's a wide hard shoulder.",
        "evidence": [
          "1.2.12-001=level crossings",
          "1.2.12-125=merging",
          "1.2.12-103=taxi ranks",
          "1.2.12-132=fire service",
          "2.2.12-001=autobahns"
        ]
      },
      {
        "text": "No PARKING (stopping is OK): on priority roads OUTSIDE built-up areas, in front of dropped kerbs, opposite driveways on narrow roads, where you block designated parking spaces.",
        "evidence": [
          "1.2.12-002=outside built-up areas",
          "1.2.12-002~within built-up areas",
          "1.2.12-105=sunken kerbstones",
          "2.2.12-003=opposite"
        ]
      },
      {
        "text": "Parking on the LEFT is allowed in one-way streets and where there are rails on the right.",
        "evidence": [
          "1.2.12-106=One-way",
          "1.2.12-106~prohibited on the right"
        ]
      },
      {
        "text": "Double-parking (second row): only taxis letting passengers in/out. Hazard lights don't make it legal.",
        "evidence": [
          "1.2.12-118=Taxis",
          "1.2.12-124~hazard"
        ]
      },
      {
        "text": "Two cars want the same space: whoever got there first (directly) has priority - but in videos the right answer may be to give it up to avoid a conflict.",
        "evidence": [
          "2.2.12-005=first",
          "2.2.12-107-M=forego"
        ]
      }
    ],
    "traps": [
      {
        "text": "The #1 repeated wrong option: \"immediately BEHIND a pedestrian crossing\" - stopping and parking there is NOT forbidden (the 5 m rule is only BEFORE it).",
        "evidence": [
          "1.2.12-001~Immediately behind",
          "1.2.12-104~Immediately behind",
          "1.2.12-105~Immediately behind",
          "2.2.12-003~Immediately behind"
        ]
      },
      {
        "text": "Also NOT stopping bans: over manholes, in front of property entrances, at bus stops (brief stop), in no-parking zones.",
        "evidence": [
          "1.2.12-104~manholes",
          "1.2.12-125~entrances",
          "2.2.12-001~bus stops",
          "1.2.12-132~non-parking zones"
        ]
      },
      {
        "text": "A trailer without its towing vehicle may stand on public roads for at most 2 weeks.",
        "evidence": [
          "2.2.12-106=2 weeks",
          "2.2.12-106~unlimited"
        ]
      }
    ]
  },
  {
    "chapter": "Warnzeichen",
    "gist": "Horn, headlight flashing and hazard lights - when each is allowed.",
    "terms": [
      {
        "de": "Schallzeichen",
        "en": "horn / acoustic signal",
        "explain": "In town: warning only. Outside towns: warning or to announce overtaking. Never to call someone."
      },
      {
        "de": "Lichthupe",
        "en": "headlight flash",
        "explain": "To announce overtaking - only outside built-up areas (day or night)."
      }
    ],
    "rules": [
      {
        "text": "Horn inside built-up areas: only as a warning signal. Outside: warning OR overtaking signal. Never as a \"calling\" signal.",
        "evidence": [
          "1.2.16-102=warning",
          "1.2.16-102~overtaking",
          "1.2.16-101=overtaking signal",
          "1.2.16-101~calling"
        ]
      },
      {
        "text": "Flashing headlights to announce overtaking: only outside built-up areas (by day or night).",
        "evidence": [
          "2.2.16-001=outside built-up areas",
          "2.2.16-001~in built-up"
        ]
      },
      {
        "text": "Hazard lights are required when you've broken down where you can't be seen well, or when you're being towed - NOT for double-parking.",
        "evidence": [
          "2.2.16-101=towed",
          "2.2.16-101~double-parked"
        ]
      },
      {
        "text": "Seeing hazard lights: slow down and expect sudden danger.",
        "evidence": [
          "1.2.16-002=reduce my speed"
        ]
      },
      {
        "text": "Breakdown in a tunnel: hazard lights, emergency bay if possible, engine off. Jam end in a tunnel: hazard lights - no U-turn, don't abandon the car.",
        "evidence": [
          "1.2.16-103~engine run",
          "1.2.16-104~U-turn"
        ]
      }
    ],
    "traps": []
  },
  {
    "chapter": "Beleuchtung",
    "gist": "Which lights when - and the indicator colours.",
    "terms": [
      {
        "de": "Abblendlicht",
        "en": "dipped headlights",
        "explain": "Required at dusk, in the dark, in tunnels, and by day in fog, snow or rain."
      },
      {
        "de": "Fernlicht (blaue Kontrollleuchte)",
        "en": "main beam (BLUE warning light)",
        "explain": "Dip it for oncoming traffic, when close behind someone, on continuously lit roads and when waiting at a level crossing."
      },
      {
        "de": "Nebelschlussleuchte (gelbe/orange Kontrollleuchte)",
        "en": "rear fog light (AMBER warning light)",
        "explain": "Only when FOG cuts visibility below 50 m - never just for rain."
      },
      {
        "de": "Nebelscheinwerfer",
        "en": "front fog lights",
        "explain": "Allowed when visibility is considerably reduced by fog, falling snow OR rain."
      },
      {
        "de": "Standlicht / Parklicht",
        "en": "side lights / parking lights",
        "explain": "Never enough for driving. Parked on an unlit road: enough inside built-up areas only."
      },
      {
        "de": "Leuchtweitenregelung",
        "en": "headlight levelling",
        "explain": "Set it for the load - wrong setting dazzles others or shortens your view."
      }
    ],
    "rules": [
      {
        "text": "Indicator colours: main beam = BLUE, rear fog light = AMBER/yellow. Green and red are the wrong options.",
        "evidence": [
          "2.2.17-013=blue",
          "2.2.17-104=blue",
          "2.2.17-001=amber"
        ]
      },
      {
        "text": "Rear fog light: only when FOG reduces visibility to under 50 m - not at 100 m, not for heavy rain.",
        "evidence": [
          "2.2.17-102=less than 50 m",
          "2.2.17-102~heavy rain"
        ]
      },
      {
        "text": "Front fog lights: fog, falling snow AND rain are all correct (when visibility is considerably reduced).",
        "evidence": [
          "2.2.17-005=In rain",
          "2.2.17-101=by rain"
        ]
      },
      {
        "text": "Dipped headlights: at dusk, in the dark, in tunnels, and by day in fog/snow/rain - so OTHERS can see you (not to see signs further or drive faster).",
        "evidence": [
          "2.2.17-114=tunnel",
          "2.2.17-109=by rain",
          "2.2.17-404=more easily seen"
        ]
      },
      {
        "text": "Driving in the dark on side lights only: never allowed.",
        "evidence": [
          "2.2.17-107=No"
        ]
      },
      {
        "text": "Dip the main beam: for oncoming traffic, when driving close behind someone, on continuously lit roads, when waiting at a level crossing.",
        "evidence": [
          "2.2.17-402=oncoming",
          "2.2.17-403=constant, adequate lighting"
        ]
      },
      {
        "text": "Main beam bulb dies: switch to dipped immediately and replace it soon - don't crawl on parking lights.",
        "evidence": [
          "2.2.17-004=dipped",
          "2.2.17-004~parking lights"
        ]
      },
      {
        "text": "Lights must be correctly installed, clean and working. Too-high setting, wrong bulbs or overloading make even dipped lights dazzle.",
        "evidence": [
          "1.2.17-001=clean",
          "1.2.17-101=overloaded"
        ]
      },
      {
        "text": "Rear lights covered (e.g. by a bike rack): a replacement must be fitted in every case, day or night.",
        "evidence": [
          "2.2.17-010=in any case"
        ]
      },
      {
        "text": "High-beam assist can fail to dip in time over crests and in bends; automatic lights may not switch on in daytime fog, so you're seen late from behind.",
        "evidence": [
          "2.2.17-117=summit",
          "2.2.17-118=does not turn on"
        ]
      }
    ],
    "traps": [
      {
        "text": "Pedestrians walking ahead in the same direction are NOT a reason you must dip the main beam - that's the repeated wrong option.",
        "evidence": [
          "2.2.17-402~pedestrians",
          "2.2.17-403~pedestrians"
        ]
      },
      {
        "text": "A misted windscreen or ice on it is NOT a reason for dipped/fog lights (only fog, snow, rain).",
        "evidence": [
          "2.2.17-109~misted",
          "2.2.17-101~ice"
        ]
      },
      {
        "text": "Parked on an unlit road: parking lights are enough only INSIDE built-up areas. Parked on a hard shoulder outside towns at dusk: at least side lights on.",
        "evidence": [
          "2.2.17-103=In built-up areas",
          "2.2.17-111=hard shoulder"
        ]
      }
    ]
  },
  {
    "chapter": "Bahnuebergaenge",
    "gist": "Level crossings: where you wait (always at the St Andrew's cross) and when.",
    "terms": [
      {
        "de": "Andreaskreuz",
        "en": "St Andrew's cross",
        "explain": "The red-white X sign: trains ALWAYS have priority; you wait IN FRONT of it. With a lightning bolt = overhead electric wires."
      },
      {
        "de": "Halbschranke / Blinklicht",
        "en": "half barrier / flashing red light",
        "explain": "Red flashing = stop, even if the barrier is still up."
      },
      {
        "de": "Bake (3-, 2-, 1-streifig)",
        "en": "countdown beacon",
        "explain": "Striped posts before a crossing: 3 stripes ≈ 240 m, 2 ≈ 160 m, 1 ≈ 80 m."
      }
    ],
    "rules": [
      {
        "text": "You must wait when: the red light flashes, the barriers are lowering/closed, a railway worker waves a white-red-white flag or a red lamp, or you'd have to stop ON the crossing because of traffic.",
        "evidence": [
          "1.2.19-002=flashing red",
          "1.2.19-002=white-red-white",
          "1.2.19-004=wait",
          "1.2.19-005=traffic congestion"
        ]
      },
      {
        "text": "WHERE you wait: always in front of the St Andrew's cross - not at the barrier, not at the rails, not at a beacon.",
        "evidence": [
          "1.2.19-105=St. Andrew",
          "1.2.19-105~barrier",
          "1.2.19-107=St. Andrew",
          "1.2.19-107~beacon"
        ]
      },
      {
        "text": "Red flashing but barrier still open: wait. After a train passes: go only when the red light goes OUT.",
        "evidence": [
          "1.2.19-003=Wait",
          "1.2.19-003~half barrier is open",
          "1.2.19-104=goes out"
        ]
      },
      {
        "text": "Barriers open: approach at a MODERATE speed and look along the track. Walking speed is not required (wrong option); expect bumps.",
        "evidence": [
          "1.2.19-117=moderate speed",
          "1.2.19-117~walking speed",
          "1.2.19-005=moderate speed"
        ]
      },
      {
        "text": "Crossing without St Andrew's cross (forest track, industrial area): trains still have priority - moderate speed, look and listen.",
        "evidence": [
          "1.2.19-101=Listen",
          "1.2.19-101~rail vehicles are required to wait",
          "1.2.19-008=all level crossings"
        ]
      },
      {
        "text": "Barriers that haven't moved for ages: don't cross, report it to the police.",
        "evidence": [
          "1.2.19-009=report",
          "1.2.19-009~extra care"
        ]
      },
      {
        "text": "Waiting in the dark at closed barriers: switch on side lights if possible, don't block junctions.",
        "evidence": [
          "1.2.19-102=side lights"
        ]
      },
      {
        "text": "Red flashing ARROW pointing right: only traffic turning right must stop.",
        "evidence": [
          "1.2.19-112=turning right"
        ]
      }
    ],
    "traps": [
      {
        "text": "Barrier starts to lower and no train in sight: still wait. Hazard lights are not the answer.",
        "evidence": [
          "1.2.19-115=wait",
          "1.2.19-115~no train"
        ]
      }
    ]
  },
  {
    "chapter": "Oeffentliche Verkehrsmittel Und Schulbusse",
    "gist": "Buses and trams at stops.",
    "terms": [
      {
        "de": "Linienbus / Schulbus",
        "en": "regular bus / school bus",
        "explain": "You must let them pull out from marked stops (not taxis)."
      }
    ],
    "rules": [
      {
        "text": "Bus stopped at a stop with hazard lights: pass only at walking pace (also from the opposite direction), keep enough distance, stop if passengers could be endangered.",
        "evidence": [
          "1.2.20-003=walking speed",
          "1.2.20-005=walking speed",
          "1.2.20-005~same speed"
        ]
      },
      {
        "text": "Expect passengers to run across the road to and from the bus - not to wait until the hazard lights go off.",
        "evidence": [
          "1.2.20-101=catch the bus",
          "1.2.20-101~switched off"
        ]
      },
      {
        "text": "Let regular buses and school buses pull away from marked stops - taxis are the wrong option.",
        "evidence": [
          "1.2.20-004=School buses",
          "1.2.20-004~Taxis"
        ]
      },
      {
        "text": "Tram passengers stepping onto the road: pass on the right only at walking pace and only without endangering them - otherwise wait. Never horn.",
        "evidence": [
          "1.2.20-001=walking speed",
          "1.2.20-001~warning signal"
        ]
      },
      {
        "text": "Bus or tram still moving towards the stop with hazards on: stay behind it.",
        "evidence": [
          "1.2.20-102=remain behind",
          "1.2.20-107-M=remain behind"
        ]
      },
      {
        "text": "Everyone stuck at a junction: give up your right of way with clear hand signals.",
        "evidence": [
          "1.2.20-106=hand signals"
        ]
      }
    ],
    "traps": [
      {
        "text": "\"I must not pass a stationary bus\" is always wrong - you may, at walking pace.",
        "evidence": [
          "1.2.20-111-M~must not pass",
          "1.2.20-109-M~may not drive past"
        ]
      },
      {
        "text": "A bus at a stop WITHOUT hazard lights (picture): keep your speed with extra alertness - walking pace is only required when its hazard lights are on.",
        "evidence": [
          "1.2.20-108-M=maintain my speed",
          "1.2.20-108-M~walking speed now"
        ]
      }
    ]
  },
  {
    "chapter": "Ladung",
    "gist": "Securing loads, overhang limits, roof racks and bike carriers.",
    "terms": [
      {
        "de": "Ladungssicherung",
        "en": "load securing",
        "explain": "The load must not slide, tip, fall or make avoidable noise - even under emergency braking."
      },
      {
        "de": "Rückstrahler",
        "en": "rear reflectors",
        "explain": "The overhang rules are measured from these."
      },
      {
        "de": "Dachlast",
        "en": "roof load",
        "explain": "Maximum given in the manufacturer's manual (not the registration document)."
      },
      {
        "de": "Stützlast",
        "en": "vertical (tow-bar) load",
        "explain": "How much weight may press down on the tow hitch - matters for rear bike carriers."
      },
      {
        "de": "orangefarbene Warntafel",
        "en": "orange warning plate",
        "explain": "Dangerous goods. White plate with black 'A' = waste."
      }
    ],
    "rules": [
      {
        "text": "Rear overhang: more than 1 m beyond the rear reflectors must be marked; in the dark with a red light + red reflector (max 1.50 m high). On trips over 100 km it may stick out at most 1.5 m.",
        "evidence": [
          "1.2.22-101=1",
          "1.2.22-102=red light",
          "2.2.22-109=1.50 m",
          "2.2.22-129=1,5"
        ]
      },
      {
        "text": "Front overhang: only above 2.50 m height, and then at most 50 cm.",
        "evidence": [
          "1.2.22-108=2.50 m",
          "2.2.22-111=2,5",
          "2.2.22-112=50 cm"
        ]
      },
      {
        "text": "Load sticking out more than 40 cm sideways beyond the lights: white light to the front, red to the back.",
        "evidence": [
          "2.2.22-108=white light",
          "2.2.22-108~hazard"
        ]
      },
      {
        "text": "Never exceed the permissible total mass or axle loads - there is no 5% tolerance. 20% overload overstrains brakes and steering.",
        "evidence": [
          "1.2.22-109~5%",
          "1.2.22-104=brakes"
        ]
      },
      {
        "text": "Roof load: obey the manufacturer's max roof load AND the total mass. A higher centre of gravity makes handling WORSE (more lean, more crosswind sensitivity, longer braking, more fuel).",
        "evidence": [
          "2.2.22-102=maximum roof load",
          "2.2.22-103~improved",
          "2.2.22-126~reduced",
          "2.2.22-123~registration certificate"
        ]
      },
      {
        "text": "In a car: secure with lashing straps, nets, anti-slip mats (not chocks); heavy items at the bottom; warning triangle within reach.",
        "evidence": [
          "2.2.22-125~Chocks",
          "2.2.22-128=heavy luggage at the bottom"
        ]
      },
      {
        "text": "Damaged/torn strap: continue only after replacing it or securing the load another way - not \"at max 50 km/h\", not \"the side walls will catch it\".",
        "evidence": [
          "2.2.22-113~side panels",
          "2.2.22-131~50 km/h"
        ]
      },
      {
        "text": "Rear bike carrier: check it suits the car, everything is fixed, lights/number plate aren't covered, the tow-bar vertical load is enough and tyre pressure is adjusted.",
        "evidence": [
          "2.2.22-105=number plate",
          "2.2.22-132=vertical load"
        ]
      },
      {
        "text": "Load-securing rules apply to ALL small vans, not just open ones.",
        "evidence": [
          "2.2.22-114=all small transporters"
        ]
      },
      {
        "text": "Orange plate = dangerous goods (not cattle or food).",
        "evidence": [
          "1.2.22-106=dangerous goods"
        ]
      }
    ],
    "traps": [
      {
        "text": "A load MAY project over the front (above 2.50 m, max 50 cm) - \"may never project over the front\" is wrong.",
        "evidence": [
          "1.2.22-107~never project"
        ]
      }
    ]
  },
  {
    "chapter": "Sonstige Pflichten Des Fahrzeugfuehrers",
    "gist": "Roadworthiness, phones, insurance, number plates, snow, securing the car.",
    "terms": [
      {
        "de": "Betriebssicherheit / Verkehrssicherheit",
        "en": "roadworthiness",
        "explain": "Driver AND owner are responsible."
      },
      {
        "de": "Haftpflichtversicherung",
        "en": "liability insurance",
        "explain": "Mandatory; without it the car may not be used and must be de-registered."
      },
      {
        "de": "Zulassungsbescheinigung Teil I / II",
        "en": "registration certificate Part I / II",
        "explain": "Part I (Fahrzeugschein) you carry; Part II (Fahrzeugbrief) proves ownership."
      },
      {
        "de": "Freisprecheinrichtung",
        "en": "hands-free kit",
        "explain": "The only way to phone while driving - and it still distracts."
      }
    ],
    "rules": [
      {
        "text": "Roadworthiness is the responsibility of the driver AND the owner (not the insurer). Car becomes unroadworthy → take it out of traffic, continue only once repaired.",
        "evidence": [
          "1.2.23-001=The owner",
          "1.2.23-001~insurance",
          "1.2.23-002=out of the traffic"
        ]
      },
      {
        "text": "Phone while driving: only hands-free, or with the car parked and the engine fully OFF. There is no 7- or 15-second rule and no walking-pace exception. Even hands-free distracts.",
        "evidence": [
          "1.2.23-007=engine is fully switched off",
          "1.2.23-007~walking pace",
          "2.2.23-040~15 seconds",
          "2.2.23-122~7 seconds",
          "1.2.23-006~does not distract"
        ]
      },
      {
        "text": "Using a public road needs a roadworthy vehicle with liability insurance - you don't have to own it. Insurance expired → may not be used, must be de-registered.",
        "evidence": [
          "1.2.23-008=liability insurance",
          "1.2.23-008~owner",
          "2.2.23-035=de-registered"
        ]
      },
      {
        "text": "Parking on a slope: manual - handbrake + 1st or reverse gear (not neutral). Automatic - handbrake + \"P\" (not \"N\").",
        "evidence": [
          "2.2.23-104=first gear",
          "2.2.23-104~neutral",
          "2.2.23-105=\"P\"",
          "2.2.23-105~\"N\""
        ]
      },
      {
        "text": "Snow/ice: clear windows, mirrors, lights (even by day), number plate AND the roof before driving. Warming up the engine is not a requirement.",
        "evidence": [
          "2.2.23-126=roof",
          "2.2.23-118=lighting",
          "2.2.23-118~warm up"
        ]
      },
      {
        "text": "Head restraint: top of the head level with its upper edge, as close to the back of the head as possible; it's a safety device.",
        "evidence": [
          "2.2.23-119=level with the upper edge",
          "2.2.23-124=safety"
        ]
      },
      {
        "text": "Misted windscreen while driving: climate control / full airflow on the screen - opening the window when it's humid outside is wrong.",
        "evidence": [
          "2.2.23-125=climate control",
          "2.2.23-125~humidity"
        ]
      },
      {
        "text": "Number plate: you may change NOTHING (no foil, no stickers); it must be legible and the rear one lit at night.",
        "evidence": [
          "2.2.23-036=Nothing",
          "2.2.23-034=lit up"
        ]
      },
      {
        "text": "Blind spot = areas you can't see even with the mirrors. Reduce the risk by checking behind often and turning only when sure - not by turning quickly.",
        "evidence": [
          "2.2.23-039=not visible even with",
          "2.2.23-212~turning quickly"
        ]
      },
      {
        "text": "Reversing: look mainly backwards but also front/sides, go slowly, have someone guide you if needed. Camera alone, hazard lights or horn don't count.",
        "evidence": [
          "2.2.23-106=Mainly look to the back",
          "2.2.23-213~hazard",
          "2.2.23-114~reversing camera"
        ]
      },
      {
        "text": "Never let a cyclist be towed/pulled along - under no circumstances.",
        "evidence": [
          "2.2.23-403=no circumstances"
        ]
      },
      {
        "text": "Loud radio, headphones, a loud exhaust or a phone call can stop you hearing warnings (low engine revs is the wrong option).",
        "evidence": [
          "2.2.23-031=headphones",
          "2.2.23-063~low engine speed"
        ]
      }
    ],
    "traps": [
      {
        "text": "New owner of a used car: notify the authority and prove insurance - a new roadworthiness test is NOT automatically required.",
        "evidence": [
          "2.2.23-054~roadworthiness test"
        ]
      },
      {
        "text": "You must report a change of name or address - not a change of insurer.",
        "evidence": [
          "2.2.23-053~insurance"
        ]
      }
    ]
  },
  {
    "chapter": "Verhalten An Fussgaengerueberwegen Und Gegenueber Fussgaengern",
    "gist": "Zebra crossings and pedestrians when turning.",
    "terms": [
      {
        "de": "Fußgängerüberweg (Zebrastreifen)",
        "en": "zebra crossing",
        "explain": "Pedestrians who want to cross have priority. On it and just before it: no overtaking, stopping or parking."
      }
    ],
    "rules": [
      {
        "text": "On and just before a zebra crossing: no overtaking, no stopping, no parking (all three correct).",
        "evidence": [
          "1.2.26-005=overtake",
          "1.2.26-005=park"
        ]
      },
      {
        "text": "Pedestrian wants to cross → be ready to stop, let them cross, don't overtake the vehicles waiting at it.",
        "evidence": [
          "1.2.26-113=refrain from overtaking",
          "1.2.26-113~overtake the waiting"
        ]
      },
      {
        "text": "Turning into a road: let pedestrians cross it - whether or not there's a marked crossing, and also on green.",
        "evidence": [
          "1.2.26-108=Allow",
          "1.2.26-109~marked crossing",
          "1.2.26-110-M=Wait"
        ]
      },
      {
        "text": "Crossing covered in snow, only the sign visible: it still counts - brake carefully, let them cross.",
        "evidence": [
          "1.2.26-112=Allow the pedestrian",
          "1.2.26-112~no road markings"
        ]
      },
      {
        "text": "Traffic backed up beyond the crossing: stop BEFORE it, never wait on it.",
        "evidence": [
          "1.2.26-118=before the pedestrian crossing",
          "1.2.26-118~shorten"
        ]
      },
      {
        "text": "Accidentally stopped on a crossing: move slightly forward or back to clear it (reversing is allowed).",
        "evidence": [
          "2.2.26-102=forward or backward",
          "2.2.26-102~under no circumstances"
        ]
      },
      {
        "text": "A truck has stopped at the crossing in the next lane: approach at moderate speed (someone may be hidden in front of it) - no warning signal, no speeding past.",
        "evidence": [
          "1.2.26-116=moderate speed",
          "1.2.26-116~warning signal"
        ]
      }
    ],
    "traps": [
      {
        "text": "A cyclist riding across the zebra without dismounting: the catalog answer is still to let them cross.",
        "evidence": [
          "1.2.26-117=allow the cyclist"
        ]
      }
    ]
  },
  {
    "chapter": "Unfall",
    "gist": "What to do at and after an accident - order, numbers, duties.",
    "terms": [
      {
        "de": "Absichern - Erste Hilfe - Notruf",
        "en": "secure - first aid - call",
        "explain": "The order at an accident with injured people."
      },
      {
        "de": "110 / 112",
        "en": "police / emergency services",
        "explain": "112 works anywhere in Europe. 115 is wrong."
      },
      {
        "de": "Unfallflucht",
        "en": "leaving the scene of an accident",
        "explain": "Fine or prison, licence withdrawal or ban, MPU."
      },
      {
        "de": "Leitpfosten",
        "en": "delineator posts",
        "explain": "Black arrows on them point to the nearest emergency phone on motorways."
      },
      {
        "de": "eCall",
        "en": "automatic emergency call",
        "explain": "Sends the car's position and time of accident - not how badly people are hurt."
      }
    ],
    "rules": [
      {
        "text": "Order at an accident with injured people: secure the scene → first aid → call the rescue service. The very first thing is always securing the scene.",
        "evidence": [
          "1.2.34-102=Make the scene of the accident safe - give first aid",
          "1.2.34-103=Make the scene"
        ]
      },
      {
        "text": "Numbers: 110 police, 112 emergency services (112 Europe-wide). 115 is wrong.",
        "evidence": [
          "1.2.34-005=110",
          "1.2.34-005~115",
          "1.2.34-011=112"
        ]
      },
      {
        "text": "Securing on a country road: hazard lights, warning triangle about 100 m back, hand signals if needed.",
        "evidence": [
          "1.2.34-111=100 m"
        ]
      },
      {
        "text": "Hit a parked car and the owner doesn't appear after a reasonable wait: leave your name and address AND report it to the police. Telling a witness is not enough.",
        "evidence": [
          "1.2.34-002=report the accident to the police",
          "1.2.34-002~witness",
          "1.2.34-009=police"
        ]
      },
      {
        "text": "Show on request: driving licence and registration certificate Part I - not the insurance contract.",
        "evidence": [
          "1.2.34-006=driving licence",
          "1.2.34-006~insurance contract"
        ]
      },
      {
        "text": "Minor damage → move to the side promptly (only for minor damage, not \"in any case\").",
        "evidence": [
          "2.2.34-208=minor damage",
          "2.2.34-208~in any case"
        ]
      },
      {
        "text": "\"Involved\" = anyone whose conduct may have contributed - not a mere witness.",
        "evidence": [
          "2.2.34-207=contributed",
          "2.2.34-207~witness"
        ]
      },
      {
        "text": "Leaving the scene unlawfully: fine/prison, licence withdrawal/ban, MPU (all correct).",
        "evidence": [
          "1.2.34-114=imprisonment"
        ]
      },
      {
        "text": "Accident with an orange-plated (dangerous goods) vehicle leaking: give the plate number in the emergency call, keep away from the liquid, don't try to plug the leak.",
        "evidence": [
          "1.2.34-010=number of the orange",
          "1.2.34-010~block the leak"
        ]
      },
      {
        "text": "Accident in a tunnel: hazard lights, SOS phone; leave the key, leave via the emergency exit - staying in the car is wrong.",
        "evidence": [
          "1.2.34-109=SOS",
          "1.2.34-109~Do not leave",
          "1.2.34-004=emergency exit"
        ]
      },
      {
        "text": "Nearest emergency phone on the motorway: follow the black arrows on the delineator posts.",
        "evidence": [
          "1.2.34-112=delineators"
        ]
      },
      {
        "text": "eCall transmits position and time - not injury severity; trigger it manually for a serious accident you witness or a medical emergency (not a puncture).",
        "evidence": [
          "2.2.34-103=position",
          "2.2.34-103~severity",
          "2.2.34-104~puncture"
        ]
      }
    ],
    "traps": [
      {
        "text": "The European accident report helps document the accident - it does NOT settle liability on the spot.",
        "evidence": [
          "2.2.34-102~liability"
        ]
      },
      {
        "text": "First on the scene: \"document the accident\" is the wrong option - first aid and calling the emergency services are right.",
        "evidence": [
          "1.2.34-007~document"
        ]
      }
    ]
  },
  {
    "chapter": "Zeichen Und Weisungen Der Polizeibeamten",
    "gist": "Police officers' signals and police-car messages.",
    "terms": [
      {
        "de": "STOP POLIZEI",
        "en": "stop - police",
        "explain": "Shown from a police car behind you: applies to YOU only."
      },
      {
        "de": "BITTE FOLGEN",
        "en": "please follow",
        "explain": "Shown from a police car in front of you: only you follow it and stop when it stops."
      },
      {
        "de": "Anhaltekelle",
        "en": "police signalling disc",
        "explain": "Follow that vehicle until it stops; don't overtake it."
      }
    ],
    "rules": [
      {
        "text": "Police signals beat traffic lights, priority signs and right-before-left - and must be obeyed. They don't release you from your own duty of care.",
        "evidence": [
          "1.2.36-001=police officer",
          "1.2.36-002=police officer",
          "1.2.36-003=must be obeyed",
          "1.2.36-003~release"
        ]
      },
      {
        "text": "Officer side-on to you with arms out = you may go (cross briskly). Officer facing you or with back to you = stop. Arm raised = everyone wait, those already in the junction clear it.",
        "evidence": [
          "1.2.36-006-B=brisk pace",
          "1.2.36-005-B=Wait",
          "1.2.36-004-B=must leave the crossroads"
        ]
      },
      {
        "text": "\"STOP POLIZEI\" behind you and \"BITTE FOLGEN\" in front of you apply to you alone - follow, stop when it stops, switch the engine off.",
        "evidence": [
          "1.2.36-007=To you only",
          "1.2.36-008=Only you",
          "1.2.36-011~engine"
        ]
      },
      {
        "text": "Signalling disc held out of a vehicle in front: follow it until it stops, don't overtake.",
        "evidence": [
          "1.2.36-013=may not overtake",
          "1.2.36-013~turn in the direction"
        ]
      }
    ],
    "traps": []
  },
  {
    "chapter": "Wechsellichtzeichen Und Dauerlichtzeichen",
    "gist": "Traffic lights, amber, the green-arrow sign and lane-control signals.",
    "terms": [
      {
        "de": "Grünpfeil",
        "en": "green arrow sign (metal sign next to a red light)",
        "explain": "Turn right on red ONLY after stopping at the stop line, from the right lane, without obstructing anyone."
      },
      {
        "de": "gelbes Blinklicht (Ampel)",
        "en": "flashing amber",
        "explain": "The light is effectively off: proceed carefully, the signs decide priority."
      },
      {
        "de": "Dauerlichtzeichen",
        "en": "lane-control signals",
        "explain": "Red X = lane closed, green arrow = lane open, yellow diagonal arrow = move over. No stopping on such roads."
      }
    ],
    "rules": [
      {
        "text": "Green-arrow SIGN: always stop at the stop line first (or before the junction if there's none), then turn right from the right lane without obstructing or endangering anyone. Not into any lane, not without stopping.",
        "evidence": [
          "1.2.37-007=after having stopped first",
          "1.2.37-007~without stopping",
          "1.2.37-016~any lane",
          "1.2.37-020-M~Without stopping"
        ]
      },
      {
        "text": "Flashing amber: carry on with extra care, giving way according to the signs.",
        "evidence": [
          "1.2.37-004-B=greater caution"
        ]
      },
      {
        "text": "Amber at ~40 km/h: 10 m away → go through; 40 m away → stop.",
        "evidence": [
          "2.2.37-002=Proceed",
          "2.2.37-003=Stop"
        ]
      },
      {
        "text": "A light that's been green for a while: watch it and be ready to stop - don't speed up to make it.",
        "evidence": [
          "2.2.37-004=ready to stop",
          "2.2.37-004~Accelerate",
          "1.2.37-022-M~accelerate"
        ]
      },
      {
        "text": "Turning left on green with a tram going straight on your left: YOU wait.",
        "evidence": [
          "1.2.37-101=You must wait"
        ]
      },
      {
        "text": "You may cross on red only to make way carefully for a blue-light vehicle with siren, or when a police officer directs you. \"Under no circumstances\" is wrong.",
        "evidence": [
          "1.2.37-019=emergency vehicle",
          "1.2.37-019~Under no circumstances"
        ]
      },
      {
        "text": "Wrong lane at traffic lights (in the right lane but want left): go straight or right - not left.",
        "evidence": [
          "1.2.37-102-B=Straight ahead",
          "1.2.37-102-B~To the left"
        ]
      },
      {
        "text": "Lane-control signals block or open lanes, apply to all vehicles, and you may not stop beside them.",
        "evidence": [
          "2.2.37-007=block lanes",
          "2.2.37-007~multi-track"
        ]
      }
    ],
    "traps": [
      {
        "text": "The green-arrow sign with a bicycle symbol only lets CYCLISTS turn right on red - not cars.",
        "evidence": [
          "1.2.37-021=cyclists are permitted",
          "1.2.37-021~motor vehicles are permitted"
        ]
      }
    ]
  },
  {
    "chapter": "Blaues Blinklicht Und Gelbes Blinklicht",
    "gist": "Emergency vehicles and yellow beacons.",
    "terms": [
      {
        "de": "Blaulicht + Martinshorn",
        "en": "blue light + siren",
        "explain": "Clear the way immediately - even onto the pavement carefully if needed."
      },
      {
        "de": "Blaulicht ohne Martinshorn",
        "en": "blue light without siren",
        "explain": "Warning of an accident/danger, a fire-brigade operation or a closed convoy - still give way."
      },
      {
        "de": "gelbes Blinklicht (Fahrzeug)",
        "en": "yellow flashing beacon",
        "explain": "Roadworks/accident danger, wide or slow heavy transports, tow trucks - no special priority."
      }
    ],
    "rules": [
      {
        "text": "Blue light + siren: clear the way at once (onto the pavement carefully if necessary). Braking hard to a stop \"at all events\" is wrong; don't wait for green.",
        "evidence": [
          "1.2.38-001=Clear the way",
          "1.2.38-001~brake hard",
          "1.2.38-104~traffic light"
        ]
      },
      {
        "text": "Hearing a siren: ask where it's coming from and whether you're in its way - not whether it's allowed to use one.",
        "evidence": [
          "1.2.38-002~allowed to use"
        ]
      },
      {
        "text": "Blue light without siren: warning of an accident or danger, fire brigade in action, or a convoy - the vehicle is on duty, give way. It does NOT mean nothing, and it's not a breakdown truck.",
        "evidence": [
          "1.2.38-101=accident",
          "1.2.38-101~breakdown",
          "1.2.38-102~does not mean anything"
        ]
      },
      {
        "text": "Yellow flashing light: roadworks/accident danger, an extra-wide vehicle, a slow heavy transport (all correct).",
        "evidence": [
          "1.2.38-003=exceptionally wide"
        ]
      }
    ],
    "traps": []
  },
  {
    "chapter": "Vorfahrt Vorrang",
    "gist": "Right of way: the order of rules and the picture questions.",
    "terms": [
      {
        "de": "rechts vor links",
        "en": "right before left",
        "explain": "Default at unsigned crossroads/junctions. NOT at driveways, farm/forest tracks, dropped kerbs or the end of traffic-calmed areas - those always wait."
      },
      {
        "de": "Vorfahrtstraße",
        "en": "priority road (yellow diamond)",
        "explain": "You have priority at every junction until it ends."
      },
      {
        "de": "Hineintasten",
        "en": "inching forward",
        "explain": "Creeping carefully into a junction when parked cars block your view."
      }
    ],
    "rules": [
      {
        "text": "The order to work out any priority picture: 1) police officer, 2) traffic lights, 3) signs, 4) right before left. Then: left-turners give way to oncoming traffic; turning traffic gives way to cyclists/pedestrians going straight; trams usually get priority.",
        "evidence": [
          "1.2.36-001=police officer",
          "1.3.01-042-M=tram",
          "1.3.01-007-M=cyclist"
        ]
      },
      {
        "text": "Right-before-left applies at unsigned crossroads and junctions - NOT at driveways, the end of a traffic-calmed area, dropped kerbs, or where farm/forest tracks meet a road.",
        "evidence": [
          "1.3.01-001=crossroads",
          "1.3.01-001~driveways",
          "1.3.01-002~sunken kerbstone",
          "1.3.01-002~farm tracks"
        ]
      },
      {
        "text": "Turning right into a priority road: look left AND right, and watch for cyclists/pedestrians beside or behind you.",
        "evidence": [
          "1.3.01-053=from the left and from the right",
          "1.3.01-053~Only for vehicles coming from the left"
        ]
      },
      {
        "text": "Crossing a priority road with your view blocked by parked cars: inch carefully into the junction - not quickly, no horn.",
        "evidence": [
          "1.3.01-119=carefully ease",
          "1.3.01-119~quickly",
          "1.3.01-119~horn"
        ]
      },
      {
        "text": "A vehicle coming out of a dirt/farm track must wait.",
        "evidence": [
          "1.3.01-101-M=dirt track"
        ]
      }
    ],
    "traps": [
      {
        "text": "Priority unclear at a crossroads: wait, observe and if necessary come to an AGREEMENT with the others. This is the one place where \"agree with each other\" is correct - everywhere else (pulling out, oncoming left-turners) it's the wrong option.",
        "evidence": [
          "1.3.01-003=come to an agreement",
          "1.3.01-003~right before left",
          "1.2.10-105~agree"
        ]
      },
      {
        "text": "Giving up your priority so you don't block the junction can be the correct answer.",
        "evidence": [
          "1.3.01-052=forgo my right of way"
        ]
      }
    ]
  },
  {
    "chapter": "Gefahrzeichen",
    "gist": "Triangular warning signs - and the distance plates under them.",
    "terms": [
      {
        "de": "Gefahrzeichen",
        "en": "danger (warning) sign",
        "explain": "Red-bordered triangle. It warns - it never gives anyone priority. Outside towns it stands 150-250 m before the danger."
      },
      {
        "de": "Zusatzzeichen",
        "en": "supplementary plate",
        "explain": "A plain distance (\"100 m\") = the danger STARTS that far ahead. Distance with arrows / under a gradient = how LONG it lasts."
      },
      {
        "de": "Gefälle",
        "en": "downhill gradient",
        "explain": "Change down a gear; long braking makes brakes fade; braking distance is longer downhill."
      }
    ],
    "rules": [
      {
        "text": "Warning signs never give anyone priority - options like \"riders/horse carriages have priority\" or \"oncoming traffic takes precedence\" are wrong.",
        "evidence": [
          "1.4.40-008~priority",
          "1.4.40-009~priority",
          "1.4.40-005~taking precedence"
        ]
      },
      {
        "text": "Outside built-up areas a warning sign is 150-250 m before the danger.",
        "evidence": [
          "1.4.40-101=150 m and 250 m"
        ]
      },
      {
        "text": "Level-crossing beacons: 3 stripes ≈ 240 m, 2 ≈ 160 m, 1 ≈ 80 m.",
        "evidence": [
          "1.4.40-132=240",
          "1.4.40-130=160",
          "1.4.40-131=80"
        ]
      },
      {
        "text": "Supplementary distance plate: \"100 m\" means the danger begins in 100 m (not that it is 100 m long).",
        "evidence": [
          "1.4.40-136=commencing",
          "1.4.40-115=approximately 50 m ahead"
        ]
      },
      {
        "text": "Gradient sign: change down a gear if necessary - not up, not neutral, not constant braking. Braking distance is longer downhill and brakes fade with long use.",
        "evidence": [
          "1.4.40-107=Change down",
          "1.4.40-107~higher gear",
          "1.4.40-002=less efficient",
          "1.4.40-002~no gear"
        ]
      },
      {
        "text": "Ice/snow warning at +3 °C: still slow down - ice is possible.",
        "evidence": [
          "1.4.40-137=reduce my speed"
        ]
      },
      {
        "text": "Road-narrowing sign: slow down, don't overtake - you don't always have to stop.",
        "evidence": [
          "1.4.40-114=Refrain from overtaking",
          "1.4.40-114~Always stop"
        ]
      },
      {
        "text": "Road narrows / priority to oncoming: give way to oncoming traffic; with two lanes in your direction use the zipper - the left lane has no \"absolute precedence\".",
        "evidence": [
          "1.4.40-004=zipper",
          "1.4.40-004~absolute precedence"
        ]
      },
      {
        "text": "Uneven road sign: slow down - no sudden steering; ignoring it risks skidding, broken axles/springs and load damage.",
        "evidence": [
          "1.4.40-108=Reduce",
          "1.4.40-109=broken axle"
        ]
      }
    ],
    "traps": [
      {
        "text": "Gradient sign with an \"800 m\" plate: the downhill stretch is 800 m LONG (not \"starts in 800 m\").",
        "evidence": [
          "1.4.40-106=800 m in length",
          "1.4.40-106~beginning"
        ]
      },
      {
        "text": "For the steep-descent sign, \"I drive down carefully\" alone is the WRONG option - the expected answer is changing down a gear.",
        "evidence": [
          "1.4.40-157=change down",
          "1.4.40-157~carefully"
        ]
      }
    ]
  },
  {
    "chapter": "Vorschriftzeichen",
    "gist": "Round regulatory signs: no stopping, mandatory directions, speed signs, zones, roundabouts.",
    "terms": [
      {
        "de": "absolutes Haltverbot",
        "en": "absolute no-stopping (red X on blue)",
        "explain": "No stopping at all - not even to load or let passengers out."
      },
      {
        "de": "eingeschränktes Haltverbot",
        "en": "restricted no-stopping (single red bar)",
        "explain": "Stopping up to 3 minutes and loading/boarding allowed; no parking even with a disc."
      },
      {
        "de": "Mindestgeschwindigkeit",
        "en": "minimum speed (blue round sign with number)",
        "explain": "You must go at least that fast if conditions allow; vehicles that can't may not use the road."
      },
      {
        "de": "Zone 30 / Tempo 30",
        "en": "30 zone",
        "explain": "Max. 30 km/h."
      },
      {
        "de": "Fußgängerzone",
        "en": "pedestrian zone",
        "explain": "No motor vehicles - except signed delivery times, then walking pace."
      },
      {
        "de": "Fahrradstraße",
        "en": "cycle street",
        "explain": "Other vehicles only if signed; max 30, cyclists may ride side by side, don't impede them."
      },
      {
        "de": "Anlieger frei",
        "en": "residents only (and their visitors)",
        "explain": "No through-traffic."
      },
      {
        "de": "Sperrfläche",
        "en": "restricted (hatched) area",
        "explain": "Never drive on it - not to turn, not in a jam."
      }
    ],
    "rules": [
      {
        "text": "Absolute no-stopping: you may not stop - even to load or let someone out.",
        "evidence": [
          "1.4.41-014=may not stop",
          "1.4.41-014~loading",
          "1.4.41-025~passengers"
        ]
      },
      {
        "text": "Restricted no-stopping (and its zone): stopping up to 3 minutes and loading/boarding allowed - parking with a disc is not.",
        "evidence": [
          "1.4.41-015=3 minutes",
          "1.4.41-015~parking disc",
          "1.4.41-135=3 minutes"
        ]
      },
      {
        "text": "Mandatory direction arrow: you must go that way and indicate it - even though it's the only way.",
        "evidence": [
          "1.4.41-004=indicate right",
          "1.4.41-005=indicate left",
          "1.4.41-162=signal a right-turn"
        ]
      },
      {
        "text": "Blue round sign with a number = MINIMUM speed (drive at least that if conditions allow; slower vehicles may not use the road). Red ring = maximum.",
        "evidence": [
          "1.4.41-128=at least",
          "1.4.41-128~not allowed to drive faster",
          "1.4.41-124=maximum speed of 30"
        ]
      },
      {
        "text": "Speed limit with a \"when wet\" plate: you may go faster when the road is dry.",
        "evidence": [
          "1.4.41-127=dry"
        ]
      },
      {
        "text": "No-overtaking sign: you may still overtake single-track vehicles (motorbike without sidecar).",
        "evidence": [
          "1.4.41-129=without sidecar"
        ]
      },
      {
        "text": "End-of-restrictions sign cancels overtaking bans and speed limits - not parking bans.",
        "evidence": [
          "1.4.41-133=No overtaking",
          "1.4.41-133~No parking"
        ]
      },
      {
        "text": "Stop sign: stop at the stop line - or at the sight line if there isn't one - and give way, even with no cross traffic.",
        "evidence": [
          "1.4.41-155=stop and give way",
          "1.4.41-156=line of sight",
          "1.4.41-157=stop line"
        ]
      },
      {
        "text": "Roundabout signs: give way to traffic in it, indicate only when LEAVING, no stopping on it.",
        "evidence": [
          "1.4.41-141~indicate when entering",
          "1.4.41-142=Stopping on the roundabout is forbidden",
          "1.4.41-143=leaving"
        ]
      },
      {
        "text": "Pedestrian zone: no motor vehicles; during permitted delivery times only at walking pace, even with nobody around.",
        "evidence": [
          "1.4.41-010=may not drive",
          "1.4.41-149=walking speed",
          "1.4.41-149~faster"
        ]
      },
      {
        "text": "Traffic-calmed area (play street): walking pace, watch pedestrians, park only in marked places - there's no minimum speed.",
        "evidence": [
          "1.4.41-125~minimum speed"
        ]
      },
      {
        "text": "Residents-only sign: residents and their visitors may enter, no through-traffic. Delivery sign: delivery drivers only.",
        "evidence": [
          "1.4.41-116=People visiting",
          "1.4.41-116~Through-traffic",
          "1.4.41-114=delivering"
        ]
      },
      {
        "text": "Bus-lane marking: regular buses only (not cars, not trucks).",
        "evidence": [
          "1.4.41-115=Regular buses"
        ]
      },
      {
        "text": "Yellow road markings are temporary (e.g. roadworks) and override the white ones for everyone.",
        "evidence": [
          "1.4.41-019=replace",
          "1.4.41-019~only apply to construction"
        ]
      },
      {
        "text": "Never drive on a hatched restricted area.",
        "evidence": [
          "1.4.41-020-M=not drive on the restricted zone"
        ]
      }
    ],
    "traps": [
      {
        "text": "Distance plate under a sign: \"200 m\" = it STARTS in 200 m; \"3 km\" with arrows = it applies FOR 3 km. Read whether there are arrows.",
        "evidence": [
          "1.4.41-131=200 m ahead",
          "1.4.41-130=for 3 km",
          "1.4.41-121=100 m ahead"
        ]
      },
      {
        "text": "Children at a marked school-bus stop: slow down and be ready to brake - not only when a school bus is there.",
        "evidence": [
          "1.4.41-008=Reduce your speed",
          "1.4.41-008~only necessary"
        ]
      },
      {
        "text": "Priority-to-oncoming sign (small red arrow on your side): give way to oncoming traffic.",
        "evidence": [
          "1.4.41-102=give precedence"
        ]
      }
    ]
  },
  {
    "chapter": "Richtzeichen",
    "gist": "Rectangular information signs: priority road, play street, tunnels, parking signs.",
    "terms": [
      {
        "de": "Vorfahrtstraße",
        "en": "priority road (yellow diamond)",
        "explain": "Priority until its end sign. Outside towns: no parking on the carriageway (stopping on the right edge and parking on the hard shoulder are OK)."
      },
      {
        "de": "Vorfahrt (an der nächsten Kreuzung)",
        "en": "priority at the next junction only",
        "explain": "Red-bordered triangle with a black upward arrow: applies at the next junction only."
      },
      {
        "de": "verkehrsberuhigter Bereich",
        "en": "traffic-calmed area / play street",
        "explain": "Walking pace, children may play everywhere, pedestrians may use the whole road, park only in marked spaces."
      },
      {
        "de": "Schutzstreifen",
        "en": "advisory cycle lane (dashed line)",
        "explain": "Cars may drive on it when necessary if no cyclist is endangered - but not park or stop on it."
      }
    ],
    "rules": [
      {
        "text": "Priority at the next junction sign: valid only at the NEXT junction.",
        "evidence": [
          "1.4.42-001=only at the next"
        ]
      },
      {
        "text": "Priority road outside towns: you may stop on the right edge and park on the hard shoulder - but not park on the carriageway.",
        "evidence": [
          "1.4.42-104=Parking on the hard shoulder",
          "1.4.42-104~Parking on the roadway",
          "1.4.42-134=No parking"
        ]
      },
      {
        "text": "Bending priority road: follow the bend → indicate.",
        "evidence": [
          "1.4.42-136=signal a left-turn",
          "1.4.42-136~signal a right-turn"
        ]
      },
      {
        "text": "Traffic-calmed area: walking pace, don't impede pedestrians, children may play on the whole road, park only in marked spaces.",
        "evidence": [
          "1.4.42-140=walking speed",
          "1.4.42-142=entire road"
        ]
      },
      {
        "text": "Tunnel sign: dipped headlights on (not just side lights or daytime running lights), take off your sunglasses.",
        "evidence": [
          "1.4.42-129=dipped",
          "1.4.42-132~daytime running",
          "1.4.42-131=sunglasses"
        ]
      },
      {
        "text": "Expressway sign: vehicles must be able to go faster than 60 km/h → at least 61 km/h.",
        "evidence": [
          "1.4.42-116=61"
        ]
      },
      {
        "text": "Advisory cycle lane (dashed): may be driven on when necessary without endangering cyclists - never parked or stopped on.",
        "evidence": [
          "1.4.42-147-M=when necessary",
          "1.4.42-147-M~park",
          "1.4.42-137~in no event"
        ]
      },
      {
        "text": "Priority over oncoming traffic at a narrowing: go only when the narrowing is clear, and be ready to stop anyway.",
        "evidence": [
          "1.4.42-107=ready to stop"
        ]
      },
      {
        "text": "Parking with a ticket: don't exceed the time and display it readably - a ticket and a disc are not interchangeable.",
        "evidence": [
          "1.4.42-111=easily read",
          "1.4.42-111~rank equal"
        ]
      },
      {
        "text": "Disabled parking: only with the official permit (also companions of blind people) - not \"briefly for shopping\".",
        "evidence": [
          "1.4.42-110=seriously disabled",
          "1.4.42-110~shopping"
        ]
      }
    ],
    "traps": [
      {
        "text": "A street-lamp ring sign (red band) means the lamp doesn't stay on all night - not that you may park without lights.",
        "evidence": [
          "1.4.42-125=does not stay on"
        ]
      }
    ]
  },
  {
    "chapter": "Verkehrseinrichtungen",
    "gist": "Red-white warning plates.",
    "terms": [
      {
        "de": "rot-weiße Warntafel",
        "en": "red-white warning plate",
        "explain": "Marks a parked trailer in town or an over-wide vehicle - not dangerous goods (that's orange)."
      }
    ],
    "rules": [
      {
        "text": "Red-white warning plates: a trailer parked on the road in town, or an extra-wide vehicle - not dangerous goods.",
        "evidence": [
          "1.4.43-101=excessive width",
          "1.4.43-101~dangerous goods"
        ]
      }
    ],
    "traps": []
  },
  {
    "chapter": "Umweltschutz",
    "gist": "Eco-driving: gears, revs, idling, tyres, roof racks, environmental zones, electric cars.",
    "terms": [
      {
        "de": "niedertouriges Fahren",
        "en": "driving at low revs",
        "explain": "Shift up early, shift down late - saves fuel and noise."
      },
      {
        "de": "Umweltzone / Umweltplakette",
        "en": "environmental zone / emissions sticker",
        "explain": "You need the right sticker, on the INSIDE of the windscreen - meeting the requirements without the sticker is not enough."
      },
      {
        "de": "Start-Stopp-Automatik",
        "en": "automatic start-stop",
        "explain": "Switches the engine off while you wait - saves fuel and noise (not tyre wear)."
      },
      {
        "de": "Rekuperation",
        "en": "recuperation (energy recovery)",
        "explain": "An electric car recharging while braking - more range, less brake wear; weak when the battery is full or cold."
      },
      {
        "de": "Kickdown",
        "en": "kick-down",
        "explain": "Flooring the pedal in an automatic - wastes fuel."
      }
    ],
    "rules": [
      {
        "text": "Gears: change UP as early as possible and DOWN as late as possible; drive at low revs. \"Rev to the limit\" options are always wrong.",
        "evidence": [
          "1.5.01-103=higher gear as early",
          "1.5.01-103~upper revolution limit",
          "1.5.01-131~upper engine speed",
          "1.5.01-012=low engine speed"
        ]
      },
      {
        "text": "After starting: drive off promptly at low revs - letting the engine warm up while standing is wrong.",
        "evidence": [
          "1.5.01-119=promptly",
          "1.5.01-119~warm up",
          "2.5.01-108=warm up"
        ]
      },
      {
        "text": "Switch the engine off for long waits (traffic jam, closed level crossing, loading) - but NOT at a stop sign.",
        "evidence": [
          "1.5.01-005=traffic jam",
          "1.5.01-005~STOP",
          "1.5.01-123~stop sign",
          "1.5.01-013=switching off the engine"
        ]
      },
      {
        "text": "Anticipate: coast towards a red light, avoid needless acceleration and braking, no \"playing\" with the accelerator while waiting.",
        "evidence": [
          "1.5.01-110=momentum",
          "1.5.01-110~maximum",
          "1.5.01-106=playing with the accelerator"
        ]
      },
      {
        "text": "Fuel guzzlers: roof/ski racks, unnecessary luggage, air-conditioning, seat heating, high speed. (Too HIGH tyre pressure and the sat-nav are wrong options.) Store luggage in the boot, not on the roof.",
        "evidence": [
          "2.5.01-106=roof rack",
          "2.5.01-106~Excessive tyre pressure",
          "2.5.01-014=air-conditioning",
          "2.5.01-014~navigation",
          "2.5.01-119~roof-rack"
        ]
      },
      {
        "text": "Tyres: under-inflation raises consumption and wear; keep at least the pressure in the manual. Winter tyres in summer increase consumption and wear.",
        "evidence": [
          "1.5.01-004=Fuel consumption increases",
          "2.5.01-107=at least",
          "2.5.01-011=fuel consumption"
        ]
      },
      {
        "text": "160 instead of 130 km/h uses up to 35% more fuel. Air resistance depends most on speed.",
        "evidence": [
          "2.5.01-113=35",
          "2.5.01-125=speed"
        ]
      },
      {
        "text": "One drop of oil can pollute 600 litres of drinking water. Used oil and batteries go to recycling centres or workshops; wash the car at a car wash.",
        "evidence": [
          "1.5.01-006=600",
          "1.5.01-010=recycling",
          "2.5.01-013=carwash"
        ]
      },
      {
        "text": "Refuelling: don't top up after the nozzle clicks off, don't breathe the fumes.",
        "evidence": [
          "1.5.01-007=switched off",
          "1.5.01-007~brim"
        ]
      },
      {
        "text": "Environmental zone: only with the matching sticker (inside of the windscreen) or special rights. Exempt: two/three-wheelers, farm tractors, ambulances on duty - not residents, not \"has a catalytic converter\".",
        "evidence": [
          "2.5.01-116=sticker",
          "2.5.01-117=inside",
          "2.5.01-209=two and three-wheeled",
          "2.5.01-209~catalytic",
          "1.5.01-122~inhabitants"
        ]
      },
      {
        "text": "Smoke from the exhaust → have the car checked. Dark smoke = worn or badly tuned engine.",
        "evidence": [
          "1.5.01-117=checked",
          "1.5.01-108=dark exhaust smoke"
        ]
      },
      {
        "text": "Catalytic converter: damaged by tow-starting and by many failed starting attempts.",
        "evidence": [
          "2.5.01-102=towed to start"
        ]
      },
      {
        "text": "Electric/hybrid: recuperation adds range and saves the brakes; lower heating saves range; plug-ins should be charged from the mains regularly.",
        "evidence": [
          "2.5.01-127=recuperation",
          "2.5.01-128=conserves",
          "2.5.01-130=mains"
        ]
      },
      {
        "text": "Automatic gearbox: avoid kick-down, use eco mode, don't stamp on the pedal. Never switch the engine off on a descent.",
        "evidence": [
          "2.5.01-104=kick down",
          "2.5.01-122=eco mode",
          "2.5.01-122~Switch off the engine"
        ]
      }
    ],
    "traps": [
      {
        "text": "Driving downhill in a HIGH gear is not wasteful - it's the repeated wrong option for \"what pollutes\". (On a long descent, the safe answer is a gear where you don't need to brake much - never neutral or ignition off.)",
        "evidence": [
          "1.5.01-106~high gear",
          "1.5.01-132~downhill",
          "2.5.01-208=not required to brake",
          "2.5.01-208~neutral"
        ]
      },
      {
        "text": "Electric cars ALSO need an emissions sticker to enter an environmental zone.",
        "evidence": [
          "2.5.01-123=electric"
        ]
      },
      {
        "text": "Fragment answers: some questions end mid-sentence (\"you can help the environment by avoiding...\") and the options are fragments like \"- driving short distances\" - read the stem: here all three are correct things to AVOID.",
        "evidence": [
          "1.5.01-115=short distances",
          "1.5.01-115=flat-out"
        ]
      }
    ]
  },
  {
    "chapter": "Fahrbetrieb Fahrphysik Fahrtechnik",
    "gist": "Physics in bends, ABS/ESP, towing a trailer, tyre pressure, driver-assistance systems and electric cars.",
    "terms": [
      {
        "de": "Fliehkraft",
        "en": "centrifugal force",
        "explain": "Pushes you out of a bend - grows with speed and with a tighter radius."
      },
      {
        "de": "Untersteuern / Übersteuern",
        "en": "understeer / oversteer",
        "explain": "Front-wheel drive + too much gas in a bend → the FRONT pushes out (understeer). Rear-wheel drive → the REAR swings out (oversteer)."
      },
      {
        "de": "ABS",
        "en": "anti-lock braking system",
        "explain": "Wheels don't lock, so you can still steer. Shortest stop: brake suddenly with full force - no pumping."
      },
      {
        "de": "ASR (Antriebsschlupfregelung)",
        "en": "traction control",
        "explain": "Prevents wheel-spin when pulling away - it is NOT the anti-lock system."
      },
      {
        "de": "Spurhalteassistent",
        "en": "lane-keeping assist",
        "explain": "Needs clear road markings; fails in roadworks, heavy rain, darkness. You override it by steering or indicating."
      },
      {
        "de": "Notbremsassistent",
        "en": "emergency brake assist",
        "explain": "Should always be switched on - the systems you activate yourself are ACC and park assist."
      },
      {
        "de": "Notrad",
        "en": "space-saver spare wheel",
        "explain": "Max 80 km/h and only as long as necessary."
      }
    ],
    "rules": [
      {
        "text": "Centrifugal force depends on speed and the radius of the bend (not headwind). Brake before the bend, accelerate again only on the straight.",
        "evidence": [
          "1.7.01-003=radius",
          "1.7.01-003~Headwind",
          "2.7.01-058=before the bend",
          "2.7.01-058~apex"
        ]
      },
      {
        "text": "Front-wheel drive + too much gas in a bend: the front swings out and you lose steering. Rear-wheel drive: the rear swings out.",
        "evidence": [
          "2.7.01-114=front end",
          "2.7.01-150=Steerability",
          "2.7.01-115=rear end"
        ]
      },
      {
        "text": "ABS: shortest braking distance = brake suddenly with maximum force (not gradually, not pumping). It keeps you able to steer longer - it does NOT guarantee stability or stop you skidding out of a bend.",
        "evidence": [
          "2.7.01-139=maximum force",
          "2.7.01-139~multiple times",
          "2.7.01-130=steering capability",
          "2.7.01-130~always remain stable"
        ]
      },
      {
        "text": "Traction control (ASR) stops wheel-spin when moving off - \"no locking when braking\" is ABS, the wrong option.",
        "evidence": [
          "2.7.01-118=wheelspin",
          "2.7.01-118~locking"
        ]
      },
      {
        "text": "Towing a caravan/trailer: longer overtaking distance, more room needed in bends, less acceleration, skidding with hasty steering - stability does NOT improve and braking distance does NOT get shorter. Unbraked loaded trailer → longer BRAKING distance (not reaction distance).",
        "evidence": [
          "2.7.01-102=overtaking",
          "2.7.01-102~reduced",
          "2.7.01-103~stability increases",
          "2.7.01-108=Braking distance increases",
          "2.7.01-108~Reaction"
        ]
      },
      {
        "text": "Trailer on a long downhill: low gear in time, be ready to brake, expect the trailer to push - never coast with the clutch down.",
        "evidence": [
          "2.7.01-105=low gear",
          "2.7.01-105~clutch"
        ]
      },
      {
        "text": "Coupling a ball-head trailer: claw fully round the ball, lock engaged, electrics connected - the jockey wheel must not be left to run.",
        "evidence": [
          "2.7.01-120=locking device",
          "2.7.01-120~jack wheel"
        ]
      },
      {
        "text": "Before a caravan trip: trailer lights working and enough view in the mirrors; check towed load/coupling limits and whether extra mirrors are needed. Passengers may not ride in a caravan.",
        "evidence": [
          "2.7.01-107=lights",
          "2.7.01-107~safety belts",
          "2.7.01-109=additional rear-view mirrors"
        ]
      },
      {
        "text": "Tyre pressure: check regularly including the spare; raise it to the manual's value when heavily loaded - never lower it before a long trip.",
        "evidence": [
          "2.7.01-111=spare wheel",
          "2.7.01-111~reduce"
        ]
      },
      {
        "text": "Space-saver spare: max 80 km/h and only as long as necessary.",
        "evidence": [
          "2.7.01-112=80 km/h",
          "2.7.01-112~passengers"
        ]
      },
      {
        "text": "Car pulls to the left: too little air in the front-left tyre or wrong front-axle alignment.",
        "evidence": [
          "2.7.01-113=front left"
        ]
      },
      {
        "text": "Long descent: don't press the clutch, and never clutch-in + switch the engine off - no engine braking, steering becomes heavy and the brake servo stops helping.",
        "evidence": [
          "2.7.01-127=braking action of the engine",
          "2.7.01-126=servo-assisted steering"
        ]
      },
      {
        "text": "Automatic car: hold it on the service brake when selecting a gear.",
        "evidence": [
          "2.7.01-110=service brakes"
        ]
      },
      {
        "text": "Driver assistance helps and warns - it never compensates for being tired or unfit. Know its limits and override it when it misbehaves.",
        "evidence": [
          "2.7.01-063~unfitness",
          "2.7.01-140~tiredness",
          "2.7.01-167~tired"
        ]
      },
      {
        "text": "Lane-keeping assist needs clear markings; poor markings, roadworks, snow, heavy rain or darkness stop it working. It warns when you approach the lines or change lane without indicating. Override = steer or indicate (not accelerate).",
        "evidence": [
          "2.7.01-147=clear road markings",
          "2.7.01-155=lack of lane markings",
          "2.7.01-154=indicator",
          "2.7.01-157=counter-steering",
          "2.7.01-157~accelerating"
        ]
      },
      {
        "text": "Lane-change assist light in the mirror = a vehicle is in the zone, don't change lanes. Active systems change lanes only on marked multi-lane roads and you must still monitor them.",
        "evidence": [
          "2.7.01-156=may not now perform",
          "2.7.01-159=monitor"
        ]
      },
      {
        "text": "Emergency brake assist and brake assist have the biggest safety potential (not cruise control). ACC and park assist are the ones you switch on yourself.",
        "evidence": [
          "2.7.01-148=autonomous emergency brake",
          "2.7.01-148~cruise control",
          "2.7.01-160~emergency brake assist"
        ]
      },
      {
        "text": "Park assist finds spaces but doesn't detect every obstacle - you still watch traffic. Turn assist can miss a cyclist if the sensor is dirty or parked cars hide them.",
        "evidence": [
          "2.7.01-162=detects sufficiently large",
          "2.7.01-164~no longer",
          "2.7.01-163=dirt"
        ]
      },
      {
        "text": "Electric cars: plan charging stops and charge time; range depends on temperature; use only an approved cable; not every petrol station can charge you. They're quiet - pedestrians notice you late.",
        "evidence": [
          "2.7.01-135=temperatures",
          "2.7.01-136~every filling station",
          "2.7.01-138=not notice"
        ]
      }
    ],
    "traps": [
      {
        "text": "Wet drum brakes: dry them by driving carefully (with light braking) - pumping them while stationary or topping up fluid is wrong.",
        "evidence": [
          "1.7.01-006=drive to dry",
          "1.7.01-006~stationary"
        ]
      },
      {
        "text": "Gently accelerating out of a bend is fine - it's the wrong option in \"what makes you skid\". Heavy oversteer and too much speed are the causes.",
        "evidence": [
          "2.7.01-142~Gently accelerating",
          "2.7.01-142=Driving too fast"
        ]
      },
      {
        "text": "Adaptive cruise control set to 100 can ACCELERATE you into a bend once the car ahead is gone - you must adjust speed yourself.",
        "evidence": [
          "2.7.06-118-M=accelerate"
        ]
      }
    ]
  },
  {
    "chapter": "Eignung Und Befaehigung Von Kraftfahrern",
    "gist": "Points in Flensburg.",
    "terms": [
      {
        "de": "Fahreignungsregister (Flensburg)",
        "en": "central register of traffic offenders",
        "explain": "Where penalty points are recorded."
      }
    ],
    "rules": [
      {
        "text": "Offences carrying 2 points are deleted after 5 years.",
        "evidence": [
          "1.8.01-003=5 years"
        ]
      }
    ],
    "traps": []
  },
  {
    "chapter": "Autobahn",
    "gist": "Joining, leaving and jams on the motorway.",
    "terms": [
      {
        "de": "Beschleunigungsstreifen",
        "en": "acceleration (merging) lane",
        "explain": "Speed up to match traffic; through-traffic has priority."
      },
      {
        "de": "Verzögerungsstreifen",
        "en": "deceleration (exit) lane",
        "explain": "Brake HERE, not on the motorway itself."
      },
      {
        "de": "Rettungsgasse",
        "en": "emergency corridor",
        "explain": "Formed between the far-left lane and the lane next to it: left lane moves left, everyone else moves right."
      }
    ],
    "rules": [
      {
        "text": "Joining: on the merging lane you may be faster than the through-traffic, but the through-traffic has priority (it doesn't have to let you in).",
        "evidence": [
          "2.1.08-013=faster",
          "2.1.08-013=priority",
          "2.1.08-013~must allow"
        ]
      },
      {
        "text": "Leaving: stop overtaking in time, indicate early, brake on the EXIT lane - not while still on the motorway - and check the speedometer because after long fast driving you underestimate your speed.",
        "evidence": [
          "2.1.08-014=exit lane",
          "2.1.08-014~still on the right-hand lane",
          "2.1.08-015=speedometer",
          "2.1.08-030-M=speedometer"
        ]
      },
      {
        "text": "Jam building up: hazard lights to warn those behind and move over to form the emergency corridor.",
        "evidence": [
          "2.1.08-008-B=hazard",
          "2.1.08-016=hazard"
        ]
      },
      {
        "text": "Don't overtake alongside roadworks - little time saved, people drift over the yellow lines, accident risk rises.",
        "evidence": [
          "2.1.08-102=insignificant"
        ]
      },
      {
        "text": "Avoid driving the wrong way: look for direction signs at slip roads and when traffic routing changes - don't rely only on the sat-nav.",
        "evidence": [
          "2.1.08-103=traffic signs",
          "2.1.08-103~navigation"
        ]
      },
      {
        "text": "130 km/h recommended speed: prevents accidents, reduces their severity and evens out traffic (all correct).",
        "evidence": [
          "2.1.08-031=severity"
        ]
      }
    ],
    "traps": [
      {
        "text": "Merging when you're at least 20 km/h faster than the truck on the motorway: go in AHEAD of it - don't brake and tuck in behind, don't stop at the end of the lane.",
        "evidence": [
          "2.1.08-021=ahead of the green truck",
          "2.1.08-021~stop at the end"
        ]
      }
    ]
  },
  {
    "chapter": "Ermuedung Ablenkung",
    "gist": "Tiredness and distraction.",
    "terms": [],
    "rules": [
      {
        "text": "Signs of tiredness at night: interrupt the journey for a proper break or let a co-driver take over. Radio, coffee-without-stops and \"fighting it\" are wrong.",
        "evidence": [
          "2.1.10-001=Interrupt",
          "2.1.10-001~radio",
          "2.1.10-002~coffee",
          "2.1.10-006~fight"
        ]
      },
      {
        "text": "Distraction: phoning, lighting a cigarette, nagging children, strong emotions, animated conversation and gripping radio programmes all reduce alertness.",
        "evidence": [
          "2.1.10-102=cigarette",
          "2.1.10-101=emotions"
        ]
      },
      {
        "text": "Stop the car to pick up something you dropped or when your concentration fades - not to switch on cruise control.",
        "evidence": [
          "2.1.10-103=fallen down",
          "2.1.10-103~cruise control"
        ]
      },
      {
        "text": "Driver-assistance risk: false expectations, paying too little attention, neglecting your own responsibility.",
        "evidence": [
          "2.1.10-003=responsibility"
        ]
      },
      {
        "text": "Distracted by electronics: you may drift out of lane and miss signs - your stopping distance does NOT get shorter.",
        "evidence": [
          "2.1.10-004~reduced"
        ]
      }
    ],
    "traps": []
  },
  {
    "chapter": "Affektiv Emotionales Verhalten Im Strassenverkehr",
    "gist": "Staying calm: slow drivers, tailgaters, provocation, young-driver risks.",
    "terms": [
      {
        "de": "Discounfall",
        "en": "\"disco accident\"",
        "explain": "Night-time weekend crash of young drivers: tiredness, inexperience in the dark and with full cars, distraction, risk-taking, speed."
      }
    ],
    "rules": [
      {
        "text": "Never retaliate or \"educate\" others: no flashing, no horn, no closing the gap, no brake-checking, no driving slowly on purpose.",
        "evidence": [
          "2.1.11-003~flash",
          "2.1.11-008~brake briefly",
          "2.1.11-009-M~horn",
          "2.1.11-118~flash"
        ]
      },
      {
        "text": "Slow car ahead: adapt your speed and overtake only at a suitable place.",
        "evidence": [
          "2.1.11-017=adjust my speed",
          "2.1.11-017=suitable place"
        ]
      },
      {
        "text": "Tailgater behind you on a main road: keep your speed and keep right so they can pass - don't speed up or slow down.",
        "evidence": [
          "2.1.11-121=keep to the right",
          "2.1.11-121~increase",
          "2.1.11-121~reduce"
        ]
      },
      {
        "text": "Overtaking on the motorway and someone comes up flashing: finish overtaking swiftly, then move right as soon as possible - no braking, no hazard lights.",
        "evidence": [
          "2.1.11-122=swiftly",
          "2.1.11-122~decelerate",
          "2.1.11-124~hazard"
        ]
      },
      {
        "text": "Someone cuts in too close after overtaking: stay calm and brake to restore your distance.",
        "evidence": [
          "2.1.11-118=brake"
        ]
      },
      {
        "text": "Pushy driver wants into your queue: let them in.",
        "evidence": [
          "2.1.11-112=let the jostling driver"
        ]
      },
      {
        "text": "Angry, or shaking after a near miss: calm down first / take a break at the next opportunity - don't drive on \"to calm down\".",
        "evidence": [
          "2.1.11-010=calmed down",
          "2.1.11-019=break",
          "2.1.11-019~continue driving"
        ]
      },
      {
        "text": "Street-race challenge at a red light: ignore it completely.",
        "evidence": [
          "2.1.11-132=totally ignore",
          "2.1.11-132~50 km/h"
        ]
      },
      {
        "text": "Young drivers (18-24) crash more: little experience, overestimating themselves, risk-taking, speed. \"Defensive\" or \"hesitant\" driving is never the cause.",
        "evidence": [
          "2.1.11-119=Over-estimation",
          "2.1.11-117~Hesitant",
          "2.1.11-015~defensive"
        ]
      }
    ],
    "traps": [
      {
        "text": "Fragment trap: \"Under time pressure, what must you ensure?\" with options like \"- to exceed the speed\" / \"- to drive through red\" - all are correct because the stem means \"ensure you DON'T...\". Read the stem before judging fragments.",
        "evidence": [
          "2.1.11-116=exceed the speed",
          "2.1.11-116=through the traffic lights"
        ]
      },
      {
        "text": "A truck indicating right while someone jostles you: don't take the indicator as an invitation to overtake.",
        "evidence": [
          "2.1.11-113~assume that the truck driver"
        ]
      }
    ]
  },
  {
    "chapter": "Einrichtungen Zur Ueberwachung Der Parkzeit",
    "gist": "Parking discs, meters and tickets.",
    "terms": [
      {
        "de": "Parkscheibe",
        "en": "parking disc",
        "explain": "Set it to the next HALF HOUR after you arrive (arrive 10:40 → set 11:00)."
      }
    ],
    "rules": [
      {
        "text": "Parking disc: set it to the next half-hour mark after arriving - 10:40 → 11:00.",
        "evidence": [
          "2.2.13-003=11.00"
        ]
      },
      {
        "text": "Use a disc where signs require it and when the parking meter is broken (not in a no-waiting zone).",
        "evidence": [
          "2.2.13-001=defective parking meter",
          "2.2.13-001~no-waiting"
        ]
      },
      {
        "text": "Time left on a meter may be used without paying more.",
        "evidence": [
          "2.2.13-002=without inserting more money"
        ]
      },
      {
        "text": "Without paying at a meter you may only stop to let people in/out or to load/unload - not \"quick shopping\".",
        "evidence": [
          "2.2.13-101=load",
          "2.2.13-101~shopping"
        ]
      },
      {
        "text": "Ticket machine: display a valid ticket readably and don't exceed its time.",
        "evidence": [
          "2.2.13-004=easy to read"
        ]
      }
    ],
    "traps": []
  },
  {
    "chapter": "Sorgfaltspflichten",
    "gist": "Leaving and securing the car, opening doors safely.",
    "terms": [],
    "rules": [
      {
        "text": "Before opening the door: look back - left mirror AND over your shoulder (not just through a slightly opened door).",
        "evidence": [
          "2.2.14-108-M=shoulder",
          "2.2.14-108-M~slightly opened"
        ]
      },
      {
        "text": "Leaving the car: secure it against rolling away and against unauthorised use - key out, steering lock, windows shut, doors locked. (Child lock and differential lock are wrong.)",
        "evidence": [
          "2.2.14-101=ignition key",
          "2.2.14-101~differential",
          "2.2.14-109~child-safety"
        ]
      },
      {
        "text": "Passengers - especially children - get in/out on the pavement side; on the road side only when traffic allows (children under supervision). The right-hand doors are NOT \"always safe\".",
        "evidence": [
          "2.2.14-104~always be opened",
          "2.2.14-105=pavement side",
          "2.2.14-110=footpath"
        ]
      },
      {
        "text": "Warn passengers about traffic on the left and pedestrians/cyclists on the right before they get out.",
        "evidence": [
          "2.2.14-106=traffic flowing on the left"
        ]
      }
    ],
    "traps": []
  },
  {
    "chapter": "Liegenbleiben Und Abschleppen Von Fahrzeugen",
    "gist": "Breakdowns, warning triangle and towing.",
    "terms": [
      {
        "de": "Warndreieck",
        "en": "warning triangle",
        "explain": "About 100 m behind the car on fast roads (and on the motorway hard shoulder)."
      },
      {
        "de": "Warnweste",
        "en": "high-visibility vest",
        "explain": "Wear it when you're out of the car at a breakdown."
      },
      {
        "de": "Abschleppstange / -seil",
        "en": "tow-bar / tow-rope",
        "explain": "Max 5 m between the vehicles, rope marked; a tow-bar is better when the brake servo/power steering is dead."
      }
    ],
    "rules": [
      {
        "text": "Breakdown on a fast road or the motorway: hazard lights, warning triangle about 100 m back, hi-vis vest. A flat on the motorway: stop as far right as possible - don't drive on to the exit.",
        "evidence": [
          "2.2.15-106=100 m",
          "2.2.15-110=100 m",
          "2.2.15-110~continue",
          "2.2.15-115=100 m"
        ]
      },
      {
        "text": "Hazard lights are required when your broken-down car can't readily be recognised as an obstacle - not for double-parking or loading. Reversing lights are wrong.",
        "evidence": [
          "2.2.15-108=broken down",
          "2.2.15-108~double-parking",
          "2.2.15-107~reversing lights"
        ]
      },
      {
        "text": "Towing: a Class B licence is enough (not BE); max 5 m gap; mark the rope; hazard lights on BOTH cars; keep the rope taut.",
        "evidence": [
          "2.2.15-103=class B",
          "2.2.15-109=5 m",
          "2.2.15-112=both vehicles"
        ]
      },
      {
        "text": "Towed car with a dead engine: the brake servo and power steering don't work → much more pedal force, heavier steering. Use a tow-bar if possible. (Rear fog lights are wrong.)",
        "evidence": [
          "2.2.15-104=slight braking effect",
          "2.2.15-105=heavier",
          "2.2.15-111~rear fog"
        ]
      }
    ],
    "traps": []
  },
  {
    "chapter": "Autobahnen Und Kraftfahrstrassen",
    "gist": "Motorway and expressway rules: lanes, jams, merging, what's forbidden.",
    "terms": [
      {
        "de": "Kraftfahrstraße",
        "en": "expressway (motor-vehicles-only road)",
        "explain": "Join only at junctions; no U-turns; like the motorway it's for vehicles faster than 60 km/h."
      },
      {
        "de": "Rettungsgasse",
        "en": "emergency corridor",
        "explain": "3 lanes: between left and middle. 2 lanes: left lane far left, right lane far right."
      }
    ],
    "rules": [
      {
        "text": "Emergency corridor: between the far-left lane and the next one. 3 lanes → between left and middle; 2 lanes → left lane moves far left, right lane far right.",
        "evidence": [
          "2.2.18-011=left-hand and the middle",
          "2.2.18-019=far to the right as possible in the right-hand",
          "2.2.18-019=far to the left as possible in the left-hand"
        ]
      },
      {
        "text": "Approaching a jam: pull up carefully behind the last car - never through the emergency corridor or along the hard shoulder.",
        "evidence": [
          "2.2.18-020=behind the last car",
          "2.2.18-020~emergency corridor",
          "2.2.18-001~hard shoulder"
        ]
      },
      {
        "text": "Left lane: only as long as you're overtaking (or behind someone who is).",
        "evidence": [
          "2.2.18-007=necessary to overtake",
          "2.2.18-007~All the time"
        ]
      },
      {
        "text": "Merging lane: accelerate, you may pass slower through-traffic on the right and merge in ahead; don't stop at the end of the lane.",
        "evidence": [
          "2.2.18-012=Accelerate",
          "2.2.18-012~Always drive to the end"
        ]
      },
      {
        "text": "Forbidden on the motorway: stopping (on carriageway or hard shoulder, except a breakdown), reversing, U-turns. Missed your exit → take the next one.",
        "evidence": [
          "2.2.18-105=Reversing",
          "2.2.18-002=breakdown",
          "2.2.18-103=next exits",
          "2.2.18-103~reverse"
        ]
      },
      {
        "text": "Towing a broken-down car on the motorway: leave at the next exit, hazard lights on both.",
        "evidence": [
          "2.2.18-101=next exit",
          "2.2.18-101~nearest a suitable garage"
        ]
      },
      {
        "text": "Expressway: no U-turns, join only at junctions.",
        "evidence": [
          "2.2.18-009=No U-turns"
        ]
      },
      {
        "text": "Wrong-way driver (video): warn with horn and lights, keep far right, call the police - all correct.",
        "evidence": [
          "2.2.18-016-M=notify the police"
        ]
      },
      {
        "text": "Leaving: check behind and indicate in time - don't start braking while still on the motorway.",
        "evidence": [
          "2.2.18-022=indicators",
          "2.2.18-022~brake down"
        ]
      }
    ],
    "traps": [
      {
        "text": "Darkness: on the AUTOBAHN you may drive faster than your dipped-headlight range when conditions allow - so \"under no circumstances faster than dipped-headlight range\" is wrong. On an EXPRESSWAY (Kraftfahrstraße) that exception does not exist.",
        "evidence": [
          "2.2.18-102~under no circumstances",
          "2.2.18-009~faster than the range"
        ]
      },
      {
        "text": "Traffic radio is useful (wrong-way drivers, jams) but not a legal requirement.",
        "evidence": [
          "2.2.18-215~prescribed"
        ]
      }
    ]
  },
  {
    "chapter": "Personenbefoerderung",
    "gist": "Seatbelts, child seats and airbags.",
    "terms": [
      {
        "de": "Kindersitz (Kinderrückhalteeinrichtung)",
        "en": "child restraint",
        "explain": "Required for children under 12 AND under 150 cm; must be approved (test mark) and fit the child's size and weight."
      },
      {
        "de": "Beifahrerairbag",
        "en": "passenger airbag",
        "explain": "Must be deactivated for a REAR-facing child seat/infant carrier on the front seat."
      },
      {
        "de": "Kindersicherung",
        "en": "child safety lock",
        "explain": "On the rear doors - stops children opening them while driving."
      }
    ],
    "rules": [
      {
        "text": "Child seat needed if the child is under 12 years AND under 150 cm - approved (test mark) and suited to height and weight. Not on an adult's lap, not in a carrycot, not just the normal belt (an 11-year-old at 140 cm needs a booster seat + 3-point belt).",
        "evidence": [
          "2.2.21-122=younger than 12",
          "2.2.21-104~lap",
          "2.2.21-105=approved child seat",
          "2.2.21-106=raised seat",
          "2.2.21-107=height and weight"
        ]
      },
      {
        "text": "Rear-facing child seat/infant carrier on the front passenger seat: only with the airbag deactivated. Forward-facing is allowed.",
        "evidence": [
          "2.2.21-115=facing backwards",
          "2.2.21-123=deactivated",
          "2.2.21-113=opposite"
        ]
      },
      {
        "text": "Seatbelts on ALL seats, even with airbags. Without a belt you're unprotected already at ~20 km/h and serious/fatal injuries start from 30 km/h.",
        "evidence": [
          "2.2.21-112=all seats",
          "2.2.21-108=20 km/h",
          "2.2.21-111=30 km/h"
        ]
      },
      {
        "text": "Belt use: not twisted, pulled tight, damaged belts replaced. A thick winter coat, wearing it under both arms or not locking it properly reduces its effect.",
        "evidence": [
          "2.2.21-124=twisted",
          "2.2.21-125=winter coat"
        ]
      },
      {
        "text": "Unbelted rear passengers can injure themselves AND the people in front, and be thrown out.",
        "evidence": [
          "2.2.21-007=front seats"
        ]
      },
      {
        "text": "Airbag warning light stays on → go to a garage (not \"take it off the road immediately\").",
        "evidence": [
          "2.2.21-118=garage",
          "2.2.21-118~immediately"
        ]
      },
      {
        "text": "Child lock on the rear doors stops children opening them (not central locking).",
        "evidence": [
          "2.2.21-121=child safety locks"
        ]
      },
      {
        "text": "Before setting off: everyone can belt up, you have a clear rear view, nothing loose on the parcel shelf. The registration Part II need not be carried.",
        "evidence": [
          "2.2.21-103=parcel shelf",
          "2.2.21-126~Part II"
        ]
      },
      {
        "text": "Head restraints: adjust to head height per the manual - they aren't factory-perfect and never replace belts.",
        "evidence": [
          "2.2.21-117=head height",
          "2.2.21-117~factory"
        ]
      }
    ],
    "traps": [
      {
        "text": "Airbags only protect fully in the correct seating position, and never replace the seatbelt - not even in town.",
        "evidence": [
          "2.2.21-127=seating position",
          "2.2.21-127~replace"
        ]
      }
    ]
  },
  {
    "chapter": "Uebermaessige Strassenbenutzung",
    "gist": "Illegal street racing.",
    "terms": [],
    "rules": [
      {
        "text": "Illegal races: serious accidents, prison, licence confiscated (all correct).",
        "evidence": [
          "2.2.29-001=imprisonment"
        ]
      }
    ],
    "traps": []
  },
  {
    "chapter": "Verkehrshindernisse",
    "gist": "Dirt or fallen load on the road.",
    "terms": [],
    "rules": [
      {
        "text": "You made the road dirty (field, building site) → YOU remove it - not the road authority or residents.",
        "evidence": [
          "2.2.32-101=You, as you have caused it"
        ]
      },
      {
        "text": "Something fell off your vehicle: remove it yourself, or secure the spot and inform the police/road service - don't just drive on.",
        "evidence": [
          "2.2.32-102=remove the parts yourself",
          "2.2.32-102~proceed"
        ]
      }
    ],
    "traps": []
  },
  {
    "chapter": "Fahrzeuge Mit Vorfahrt",
    "gist": "Emergency vehicle behind you.",
    "terms": [],
    "rules": [
      {
        "text": "Blue light + siren behind you: move as far right as possible and slow down - don't stop dead immediately.",
        "evidence": [
          "2.2.38-101=far as possible",
          "2.2.38-101~stop immediately"
        ]
      }
    ],
    "traps": []
  },
  {
    "chapter": "Untersuchung Der Fahrzeuge",
    "gist": "The roadworthiness test (HU / TÜV).",
    "terms": [
      {
        "de": "Hauptuntersuchung (HU, \"TÜV\")",
        "en": "roadworthiness test",
        "explain": "Every 2 years for a private car (the first one after 3 years). The sticker on the rear plate shows when it's due."
      }
    ],
    "rules": [
      {
        "text": "Private car: next HU every 2 years (24 months) - also after buying a used car with a fresh test.",
        "evidence": [
          "2.6.01-105=two years",
          "2.6.01-108=24"
        ]
      },
      {
        "text": "When it's due: the sticker on the rear number plate and the entry in registration certificate Part I (not the owner's manual).",
        "evidence": [
          "2.6.01-003=license plate",
          "2.6.01-003~operating manual"
        ]
      },
      {
        "text": "Time a vehicle stands unused (e.g. a caravan over winter) does NOT extend the test date.",
        "evidence": [
          "2.6.01-106=must be observed",
          "2.6.01-106~extended"
        ]
      }
    ],
    "traps": []
  },
  {
    "chapter": "Zulassung Zum Strassenverkehr Fahrzeugpapiere Fahrerlaubnis",
    "gist": "Documents, insurance, modifications and what a Class B licence lets you tow.",
    "terms": [
      {
        "de": "Betriebserlaubnis",
        "en": "operating permit (type approval)",
        "explain": "Lapses with modifications like other tyre sizes, more engine power, lowered suspension, a different steering wheel or exhaust."
      },
      {
        "de": "zulässige Gesamtmasse",
        "en": "maximum authorised mass",
        "explain": "Car + trailer (both maximum masses) must stay ≤ 3,500 kg for Class B when the trailer is over 750 kg."
      },
      {
        "de": "Kfz-Haftpflichtversicherung",
        "en": "motor liability insurance",
        "explain": "Mandatory (comprehensive cover is not)."
      }
    ],
    "rules": [
      {
        "text": "Carry: driving licence + registration certificate Part I. Part II stays at home.",
        "evidence": [
          "2.6.02-027=driving licence",
          "2.6.02-027~Part II"
        ]
      },
      {
        "text": "Mandatory insurance = motor liability insurance only. Expired → the car may no longer be used.",
        "evidence": [
          "2.6.02-016=liability",
          "2.6.02-016~Complete",
          "2.6.02-010=no longer be used"
        ]
      },
      {
        "text": "Modifications that can void the operating permit: different engine power or gear ratio, other tyre sizes, a different steering wheel, a modified exhaust. Not: a radio, a rear fog lamp, an identical replacement engine.",
        "evidence": [
          "2.6.02-412=steering wheel",
          "2.6.02-412~replacement engine"
        ]
      },
      {
        "text": "Using the car with a voided permit: fine, points in Flensburg, loss of insurance cover. A required expert assessment (e.g. lowered suspension) must happen right after the modification; carry the report and get Part I corrected.",
        "evidence": [
          "2.6.02-030=insurance cover",
          "2.6.02-101=Immediately",
          "2.6.02-038=Promptly",
          "2.6.02-036=carry the inspection report"
        ]
      },
      {
        "text": "Class B trailer maths: car max. mass 2,400 kg → the trailer may have at most 1,100 kg (3,500 total), so of the options 1,000 kg is right - even though the car may tow 1,500 kg.",
        "evidence": [
          "2.6.02-104=1000"
        ]
      }
    ],
    "traps": []
  },
  {
    "chapter": "Anhaengerbetrieb",
    "gist": "Towing with a Class B licence: limits, overrun brakes, vertical load.",
    "terms": [
      {
        "de": "Anhängelast",
        "en": "towed load",
        "explain": "The ACTUAL mass being towed - must not exceed what the car is permitted to tow (in Part I of the CAR's registration)."
      },
      {
        "de": "Stützlast",
        "en": "vertical load",
        "explain": "Weight pressing on the tow ball - minimum 4% of the trailer's actual weight; max in the manual/Part I."
      },
      {
        "de": "Auflaufbremse / Abreißseil",
        "en": "overrun brake / breakaway cable",
        "explain": "The trailer brakes itself when it pushes against the car; the cable applies it if the trailer comes loose."
      }
    ],
    "rules": [
      {
        "text": "Class B may tow: up to 750 kg, or more if the combination's maximum authorised mass stays ≤ 3,500 kg.",
        "evidence": [
          "2.6.03-120=up to 750 kg",
          "2.6.03-120~of 3,500"
        ]
      },
      {
        "text": "Only ONE trailer behind a car.",
        "evidence": [
          "2.6.03-116=1"
        ]
      },
      {
        "text": "Towed load = the actual mass being towed, and it may not exceed the car's permitted towed load (found in the car's registration Part I). Max vertical load: manual and Part I.",
        "evidence": [
          "2.6.03-106=actual load",
          "2.6.03-112=my car",
          "2.6.03-113=operating manual"
        ]
      },
      {
        "text": "Minimum vertical load: 4% of the trailer's actual weight (600 kg → 24 kg).",
        "evidence": [
          "2.6.03-406=24 kg"
        ]
      },
      {
        "text": "Overrun-braked trailer: breakaway cable attached; coupling locked; lights working. Long descents can overheat its brakes; it doesn't hold uphill when stationary; apply its handbrake before uncoupling. There is no special 60 km/h limit.",
        "evidence": [
          "2.6.03-105=breakaway",
          "2.6.03-105~60 km/h",
          "2.6.03-118=overheat",
          "2.7.06-405=breakaway"
        ]
      },
      {
        "text": "Trailer jumping/swaying on bad roads: reduce speed - don't accelerate or steer quickly against it.",
        "evidence": [
          "2.6.03-102=Reduce speed",
          "2.6.03-102~Accelerate",
          "2.6.03-115~counter-steer"
        ]
      },
      {
        "text": "Stability killers: centre of gravity far back, low tyre pressure, leaking shock absorber.",
        "evidence": [
          "2.6.03-121=far back"
        ]
      },
      {
        "text": "Extra mirrors: whenever you can't otherwise see all relevant traffic. Turning circle gets BIGGER with a trailer.",
        "evidence": [
          "2.6.03-111=not possible to observe",
          "2.6.03-119~reduced"
        ]
      },
      {
        "text": "Reversing with a guide: if you lose sight of the person directing you, stop.",
        "evidence": [
          "2.6.03-001=must be stopped"
        ]
      }
    ],
    "traps": []
  },
  {
    "chapter": "Lesen Einer Strassenkarte Und Streckenplanung",
    "gist": "Map scales, autobahn numbers, sat-navs and planning trips abroad.",
    "terms": [
      {
        "de": "Maßstab",
        "en": "map scale",
        "explain": "1:300,000 → 1 cm = 3 km; 1:200,000 → 1 cm = 2 km. Drop five zeros to get km per cm."
      }
    ],
    "rules": [
      {
        "text": "Map scale: drop five zeros → km per cm. 1:300,000 = 3 km, 1:200,000 = 2 km. Overall planning for a long trip (Hamburg→Rome): 1:500,000.",
        "evidence": [
          "2.6.07-207=3 kilometres",
          "2.6.07-218=2 km",
          "2.6.07-210=1:500,000"
        ]
      },
      {
        "text": "Autobahn numbers: north-south are ODD, east-west even; regional autobahns have three digits.",
        "evidence": [
          "2.6.07-213=North/South autobahns have uneven",
          "2.6.07-213~East/West autobahns have uneven"
        ]
      },
      {
        "text": "Maps and sat-navs can be out of date and differ from reality; sat-nav instructions are only recommendations - enter destinations while stationary, keep the view clear, don't leave it lying loose.",
        "evidence": [
          "2.6.07-206=outdated",
          "2.6.07-219=recommendations",
          "2.6.07-223~followed at all times"
        ]
      },
      {
        "text": "Abroad: check city tolls, environmental-zone stickers, speed limits, and winter tyre/chain/tread rules.",
        "evidence": [
          "2.6.07-101=city toll",
          "2.6.07-229=snow chains"
        ]
      },
      {
        "text": "Very risky distractions: typing an address into the sat-nav, texting, even hands-free phoning.",
        "evidence": [
          "2.6.07-220=hands-free"
        ]
      }
    ],
    "traps": []
  },
  {
    "chapter": "Maengelerkennung Lokalisierung Von Stoerungen",
    "gist": "Recognising faults: brakes, tyres, lights, steering, warning lights.",
    "terms": [
      {
        "de": "Bremsflüssigkeit",
        "en": "brake fluid",
        "explain": "Absorbs water over time - that's why it's changed on schedule."
      },
      {
        "de": "Öldruckkontrollleuchte",
        "en": "oil-pressure warning light",
        "explain": "Stays on after starting → switch off the engine at once and check the oil."
      }
    ],
    "rules": [
      {
        "text": "Brake pedal sinks to the floor and only firms up after pumping: park immediately and have the brakes repaired - just topping up fluid is wrong.",
        "evidence": [
          "2.7.02-109=Park the car immediately",
          "2.7.02-109~sufficient"
        ]
      },
      {
        "text": "Car pulls to one side when braking: longer braking distance and veering - get it to a workshop without delay (not \"I'll counter-steer\").",
        "evidence": [
          "2.7.02-107=Longer braking distance",
          "2.7.02-030=workshop",
          "2.7.02-030~counter-steering"
        ]
      },
      {
        "text": "Brake fluid is changed because it absorbs water (and must work under high stress) - not because of leaks.",
        "evidence": [
          "2.7.02-019=water",
          "2.7.02-019~leak"
        ]
      },
      {
        "text": "Test the brakes after driving off, in an unfamiliar car and after long standstills. Replace pads when oily or worn (not just wet).",
        "evidence": [
          "2.7.02-020=different vehicle",
          "2.7.02-016~wet"
        ]
      },
      {
        "text": "Oil-pressure light stays on: switch the engine off immediately and check the oil. Engine/coolant temperature too high: stop at a suitable place as soon as possible.",
        "evidence": [
          "2.7.02-034=shut down",
          "2.7.02-034~next oil change",
          "2.7.02-049=stop",
          "2.7.02-216=stop"
        ]
      },
      {
        "text": "Indicator light flashing much faster than usual = a bulb is broken.",
        "evidence": [
          "2.7.02-026=bulb",
          "2.7.02-113=faster",
          "2.7.02-134~hazard"
        ]
      },
      {
        "text": "A light or the horn doesn't work: bulb or fuse (never \"the starter\"). Brake light out: bulb/fuse - not brake-fluid level.",
        "evidence": [
          "2.7.02-025=Fuse",
          "2.7.02-025~Starter",
          "2.7.02-033~brake fluid"
        ]
      },
      {
        "text": "Oncoming drivers flash at you at night: your lights are dazzling them (wrong setting/levelling for the load) or you forgot your dipped lights - NOT \"put on your main beam\".",
        "evidence": [
          "2.7.02-114=dazzling",
          "2.7.02-114~main beam",
          "2.7.02-138~main beam"
        ]
      },
      {
        "text": "Wrong tyre pressure: worse handling and more wear (not longer reaction distance). Far too low: tyres overheat, stability drops.",
        "evidence": [
          "2.7.02-022~Reaction distance",
          "2.7.02-024=heat up"
        ]
      },
      {
        "text": "Hit a kerb hard: have tyre, rim and car checked - handling may suffer, a slow puncture is possible.",
        "evidence": [
          "2.7.02-037=slow puncture",
          "2.7.02-023~wheel bolts"
        ]
      },
      {
        "text": "Steering much heavier than usual: defective steering or power steering - garage without delay (lowering tyre pressure is wrong).",
        "evidence": [
          "2.7.02-103=Servo-steering",
          "2.7.02-130~reduce the tyre"
        ]
      },
      {
        "text": "Steering wheel wobbles: unbalanced wheels, worn shock absorbers, broken spring. Car pulls: bent axle or bad alignment - check tyre pressure, then garage.",
        "evidence": [
          "2.7.02-123=unbalanced",
          "2.7.02-126=Wheel alignment",
          "2.7.02-132=tyre inflation pressure"
        ]
      },
      {
        "text": "Defective seatbelt: repair/replace and nobody may use that seat (an airbag is not a substitute). Broken mirror glass: replace it.",
        "evidence": [
          "2.7.02-137=may not use the seat",
          "2.7.02-121~airbag",
          "2.7.02-115=Renew"
        ]
      },
      {
        "text": "ESC lamp permanently on: the system is switched off or faulty.",
        "evidence": [
          "2.7.02-139=deactivated",
          "2.7.02-139~switched on"
        ]
      },
      {
        "text": "Sudden loud exhaust: check and repair it promptly (noise, parts could fall off).",
        "evidence": [
          "2.7.02-027=drop",
          "2.7.02-028=Check"
        ]
      }
    ],
    "traps": [
      {
        "text": "Turning the steering wheel while stationary strains the front axle and tyres - it does NOT \"make steering easier\".",
        "evidence": [
          "2.7.02-127~easier"
        ]
      },
      {
        "text": "An emergency stop on its own is not a reason to have the brakes checked - a lit brake warning light or a car that won't brake straight is.",
        "evidence": [
          "2.7.02-128~emergency braking",
          "2.7.02-128=control light"
        ]
      }
    ]
  },
  {
    "chapter": "Verbrennungsmaschine Fluessigkeiten Kraftstoffsystem Elektrische Anlage Zuendung Kraftuebertragung",
    "gist": "Engine basics, coolant and saving the clutch.",
    "terms": [
      {
        "de": "Kupplung schleifen lassen",
        "en": "slipping the clutch",
        "explain": "Wears it out - in a crawling jam use a low gear without the clutch instead."
      }
    ],
    "rules": [
      {
        "text": "Crawling in a jam: low gear, without using the clutch if possible - not stop-start, not slipping the clutch.",
        "evidence": [
          "2.7.03-102=without pressing the clutch",
          "2.7.03-102~slipped",
          "2.7.03-209~slipping"
        ]
      },
      {
        "text": "Too little coolant → overheating and engine damage (not higher consumption).",
        "evidence": [
          "2.7.03-101=overheating",
          "2.7.03-101~fuel"
        ]
      },
      {
        "text": "Clutch wear comes from starting in a high gear and manoeuvring at high revs. While waiting: neutral, foot off the clutch.",
        "evidence": [
          "2.7.03-214=Starting in high gear",
          "2.7.03-215=neutral"
        ]
      },
      {
        "text": "Diesel = self-ignition (fuel ignites in compressed hot air, no spark). Won't start in winter → summer diesel still in the tank. SAE 10W-40 covers the widest temperature range. The thermostat REGULATES engine temperature.",
        "evidence": [
          "2.7.03-201=compressed air",
          "2.7.03-208=summer diesel",
          "2.7.03-207=10 W 40",
          "2.7.03-205=regulate"
        ]
      }
    ],
    "traps": []
  },
  {
    "chapter": "Schmier Und Frostschutzmittel",
    "gist": "Engine oil and antifreeze.",
    "terms": [],
    "rules": [
      {
        "text": "Topping up oil: use the manufacturer's spec, don't exceed the max mark, never with the engine running. Check with the dipstick, sight-glass or driver-information display.",
        "evidence": [
          "2.7.04-001=specifications",
          "2.7.04-001~running",
          "2.7.04-003=dipstick",
          "2.7.04-101=driver information"
        ]
      },
      {
        "text": "Engine oil: wear protection, cooling, cleaning, reducing friction, stops pistons/bearings seizing (not lubricating the water pump).",
        "evidence": [
          "2.7.04-002=cooling",
          "2.7.04-205~water pump"
        ]
      },
      {
        "text": "Antifreeze: prevents freezing AND protects against corrosion. Check it before winter so the cooling system isn't damaged.",
        "evidence": [
          "2.7.04-203=corrosion",
          "2.7.04-201=damaged by frost"
        ]
      }
    ],
    "traps": []
  },
  {
    "chapter": "Verwendung Und Wartung Von Reifen",
    "gist": "Tyre pressure, tread, winter tyres, changing a wheel.",
    "terms": [
      {
        "de": "Profiltiefe",
        "en": "tread depth",
        "explain": "Legal minimum 1.6 mm across the main tread."
      },
      {
        "de": "TWI (Tread Wear Indicator)",
        "en": "tread wear indicator",
        "explain": "Small bars in the grooves showing the wear limit."
      },
      {
        "de": "DOT-Nummer (z. B. 1217)",
        "en": "tyre date code",
        "explain": "Week + year of manufacture: 1217 = week 12 of 2017."
      },
      {
        "de": "Alpine-Symbol (Schneeflocke) / M+S",
        "en": "winter tyre symbol",
        "explain": "Suitable for winter conditions. Never exceed the tyre's own max speed (dashboard sticker)."
      },
      {
        "de": "RDKS / TPMS",
        "en": "tyre-pressure monitoring",
        "explain": "Warning lamp: pressure too low in a tyre, or after a wheel change (needs resetting)."
      }
    ],
    "rules": [
      {
        "text": "Minimum tread depth: 1.6 mm (1 mm is wrong).",
        "evidence": [
          "2.7.05-108=1,6",
          "2.7.02-032=1,6",
          "2.7.05-215~1 mm"
        ]
      },
      {
        "text": "Check pressure regularly - about weekly - on COLD tyres and right after a tyre change (not after every trip). The correct value is in the operating manual.",
        "evidence": [
          "2.7.05-002=cool",
          "2.7.05-210=once a week",
          "2.7.05-210~each trip",
          "2.7.05-216=operating manual"
        ]
      },
      {
        "text": "Pressure far too low: tyres overheat, handling and cornering stability drop dangerously, fuel use rises - wear does NOT decrease.",
        "evidence": [
          "2.7.05-205=overheats",
          "2.7.05-005=cornering",
          "2.7.05-005~decrease"
        ]
      },
      {
        "text": "Date code 1217 = calendar week 12 of 2017.",
        "evidence": [
          "2.7.05-001=12th calendar week"
        ]
      },
      {
        "text": "Winter tyres: never exceed their max speed (the dashboard sticker, e.g. 160/190 km/h, applies in all conditions); set pressure per the manufacturer (often ~0.2 bar higher) - not lower; no general 80 km/h limit.",
        "evidence": [
          "2.7.05-105=may not be exceeded",
          "2.7.05-104~80 km/h",
          "2.7.05-106~0.5 bar lower",
          "2.7.10-101=160",
          "2.7.10-102=0.2 bar"
        ]
      },
      {
        "text": "Changing a wheel - the order: secure the car → position the jack → LOOSEN the nuts → jack up → remove the nuts. Jack only at the manufacturer's points on firm ground.",
        "evidence": [
          "2.7.05-102=loosen the wheel nuts, jack up",
          "2.7.05-101=positioning points",
          "2.7.05-101~mid-point"
        ]
      },
      {
        "text": "Re-tighten the wheel nuts after a short distance - otherwise the wheel can come off.",
        "evidence": [
          "2.7.05-217=detached from the vehicle",
          "2.7.01-242=again after driving a short distance"
        ]
      },
      {
        "text": "Slow pressure loss: a missing valve cap at motorway speed or something stuck in the tyre (not fast acceleration).",
        "evidence": [
          "2.7.05-008=valve cap",
          "2.7.05-008~Accelerating"
        ]
      },
      {
        "text": "Tyre-pressure warning lamp: one tyre too low, or a recent wheel change - not a loose nut.",
        "evidence": [
          "2.7.05-107=too low",
          "2.7.05-107~loose"
        ]
      },
      {
        "text": "Grip depends on tyre temperature, road and weather (all three).",
        "evidence": [
          "2.7.05-007=temperature"
        ]
      }
    ],
    "traps": [
      {
        "text": "The snowflake symbol does NOT mean \"only with snow chains\" - it marks a winter-suitable tyre.",
        "evidence": [
          "2.7.05-103~snow chains",
          "2.7.05-223~snow chains"
        ]
      }
    ]
  },
  {
    "chapter": "Bremsanlagen Und Geschwindigkeitsregler",
    "gist": "ABS, cruise control, adaptive cruise control and emergency brake assist.",
    "terms": [
      {
        "de": "Tempomat / Geschwindigkeitsregler",
        "en": "cruise control",
        "explain": "Holds a set speed - it does NOT keep distance or adapt to traffic."
      },
      {
        "de": "ACC (Abstandsregeltempomat)",
        "en": "adaptive cruise control",
        "explain": "Accelerates to the set speed and brakes for a slower car ahead - it doesn't guarantee the legal distance; braking or accelerating overrides it."
      },
      {
        "de": "Notbremsassistent",
        "en": "emergency brake assist",
        "explain": "Must always be switched on; can switch itself off if snow blocks the radar or the sensors were knocked out of place."
      }
    ],
    "rules": [
      {
        "text": "ABS: the wheels don't lock, so you can brake hard AND steer around an obstacle. It does NOT prevent aquaplaning, let you take bends faster or stop wheel-spin.",
        "evidence": [
          "2.7.06-104=avoid an obstacle",
          "2.7.06-101~Aquaplaning",
          "2.7.06-103~faster",
          "2.7.06-104~wheelspin"
        ]
      },
      {
        "text": "Cruise control holds a constant speed (and saves fuel) - it doesn't keep distance or adapt to traffic. Use it when you can drive at a steady speed; switching it off too late risks tailgating, too fast in bends, speeding.",
        "evidence": [
          "2.7.06-111~minimum distance",
          "2.7.06-114~traffic density",
          "2.7.06-206=constant speed",
          "2.7.06-110=Tailgating"
        ]
      },
      {
        "text": "Override cruise control by braking or accelerating - not by steering.",
        "evidence": [
          "2.7.06-116=braking",
          "2.7.06-116~steering"
        ]
      },
      {
        "text": "ACC accelerates to the set speed and brakes for a slower car ahead, but does NOT always keep the prescribed safety distance. Good on motorways/expressways, not on winding roads; heavy rain/snow can disturb it; stay attentive.",
        "evidence": [
          "2.7.06-113~automatically maintains",
          "2.7.06-117~always maintains",
          "2.7.06-115~winding",
          "2.7.06-112=heavy rain"
        ]
      },
      {
        "text": "Emergency brake assist: always switched on (above 30 km/h), warns of rear-end danger and reduces injury if a crash is unavoidable. It can switch off if snow blocks the radar or the sensors shift after a collision.",
        "evidence": [
          "2.7.06-237=always",
          "2.7.06-243=30 km/h",
          "2.7.06-119=reduce the risk of injury",
          "2.7.06-242=snow"
        ]
      },
      {
        "text": "Car + trailer jack-knifes or skids on slippery roads with abrupt steering or full braking in a bend (not gentle acceleration).",
        "evidence": [
          "2.7.06-107=steers abruptly",
          "2.7.06-107~gradually"
        ]
      },
      {
        "text": "Cruise control saves fuel only with the right gear selected - not in stop-and-go.",
        "evidence": [
          "2.7.06-241=right gear",
          "2.7.06-241~stop-and-go"
        ]
      }
    ],
    "traps": [
      {
        "text": "ACC on the motorway reduces rear-end risk and helps keep your chosen distance - but \"the safety distance can't be undercut\" is wrong.",
        "evidence": [
          "2.7.06-240~cannot be undercut"
        ]
      }
    ]
  },
  {
    "chapter": "Anhaengekupplungssysteme",
    "gist": "Coupling a car trailer (ball coupling).",
    "terms": [
      {
        "de": "Kugelkopfkupplung",
        "en": "ball coupling",
        "explain": "The claw must close securely; lift and secure the jockey wheel before driving."
      }
    ],
    "rules": [
      {
        "text": "Ball coupling: claw closed securely around the ball, jockey wheel lifted and secured before you drive off.",
        "evidence": [
          "2.7.07-208=close securely",
          "2.7.07-208=lifted"
        ]
      }
    ],
    "traps": []
  },
  {
    "chapter": "Wartung Von Kraftfahrzeugen Und Rechtzeitige Veranlassung Von Reparaturen",
    "gist": "Maintenance: brake fluid, air filter, tyres, winter check, battery.",
    "terms": [],
    "rules": [
      {
        "text": "Brake fluid is changed so the brakes keep working under load, the water content stays acceptable and components aren't damaged (all correct).",
        "evidence": [
          "2.7.08-001=water"
        ]
      },
      {
        "text": "Dirty air filter: more pollutants, more fuel, less power.",
        "evidence": [
          "2.7.08-201=Engine power"
        ]
      },
      {
        "text": "Uneven tyre wear points to wrong alignment or worn shock absorbers/suspension.",
        "evidence": [
          "2.7.08-202=camber"
        ]
      },
      {
        "text": "Before winter: coolant, battery and washer system can freeze/fail - check them.",
        "evidence": [
          "2.7.08-203=battery"
        ]
      },
      {
        "text": "Battery care: tight cable connections and mounting, clean and grease the poles - you don't swap the acid.",
        "evidence": [
          "2.7.08-204=grease",
          "2.7.08-204~acid"
        ]
      },
      {
        "text": "Coolant isn't topped up \"automatically\" by the expansion tank - lack of it overheats and damages the engine.",
        "evidence": [
          "2.7.08-206~automatically"
        ]
      }
    ],
    "traps": []
  },
  {
    "chapter": "Ausruestung Von Fahrzeugen",
    "gist": "Winter-tyre speed sticker and pressure.",
    "terms": [],
    "rules": [
      {
        "text": "\"Mit M+S 160\" sticker on the dashboard: never faster than 160 km/h - on dry and wet roads alike.",
        "evidence": [
          "2.7.10-101=160",
          "2.7.10-101~dry"
        ]
      },
      {
        "text": "Winter tyres: pressure slightly HIGHER than summer tyres (~0.2 bar); handling can differ on dry roads.",
        "evidence": [
          "2.7.10-102=0.2 bar",
          "2.7.10-102~lower"
        ]
      }
    ],
    "traps": []
  }
];
