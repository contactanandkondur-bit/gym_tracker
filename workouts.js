// Workout templates are versioned by effective date, so past dates always
// render with whatever program was actually in effect then — not today's
// current one. Add a new entry to SCHEDULE_VERSIONS (sorted ascending by
// effectiveFrom) whenever the program changes; never edit an old entry's
// exercises, or past logged data will look "missing" on the Log page.
//
// "sets" = number of weight inputs to show. "tag" = training style
// reminder: heavy (compound, push max weight, low reps), moderate, light
// (isolation, higher reps, focus on feel), or core (planks/carries/control).

const SCHEDULE_V1_6DAY = {
  1: {
    day: "Monday",
    title: "Push (Chest, Shoulders, Triceps)",
    exercises: [
      { name: "Flat Barbell Bench Press", sets: 3, reps: "8-10", tag: "heavy" },
      { name: "Incline Dumbbell Press", sets: 2, reps: "8-10", tag: "heavy" },
      { name: "Overhead Barbell Press", sets: 3, reps: "8-10", tag: "heavy" },
      { name: "Dumbbell Lateral Raises", sets: 4, reps: "12-15", tag: "light" },
      { name: "Cable Tricep Pushdowns", sets: 2, reps: "10-12", tag: "light" },
      { name: "Overhead Tricep Extensions", sets: 2, reps: "10-12", tag: "light" },
      { name: "Push-Ups", sets: 2, reps: "Failure", tag: "light" },
    ],
  },
  2: {
    day: "Tuesday",
    title: "Pull (Back, Biceps, Rear Delts)",
    exercises: [
      { name: "Chest-Supported T-Bar Row", sets: 3, reps: "8-10", tag: "heavy" },
      { name: "Pull-Ups or Lat Pulldown", sets: 3, reps: "8-10", tag: "heavy" },
      { name: "Barbell Rows", sets: 3, reps: "8-10", tag: "heavy" },
      { name: "Face Pulls", sets: 3, reps: "12-15", tag: "light" },
      { name: "Barbell Bicep Curls", sets: 2, reps: "10-12", tag: "moderate" },
      { name: "Incline Dumbbell Curls", sets: 3, reps: "8-10", tag: "light" },
    ],
  },
  3: {
    day: "Wednesday",
    title: "Power + Core (Glutes, Full Body, Core)",
    exercises: [
      { name: "Barbell Hip Thrust", sets: 4, reps: "8-12", tag: "heavy" },
      { name: "Farmer's Carry", sets: 4, reps: "30-40m", tag: "heavy" },
      { name: "Hanging Leg Raises", sets: 4, reps: "15-20", tag: "core" },
      { name: "Plank with Side Twists", sets: 3, reps: "20 twists", tag: "core" },
    ],
  },
  4: {
    day: "Thursday",
    title: "Chest + Back (Upper Body Focus)",
    exercises: [
      { name: "Incline Barbell Bench Press", sets: 3, reps: "8-10", tag: "heavy" },
      { name: "Flat Dumbbell Press", sets: 2, reps: "8-10", tag: "heavy" },
      { name: "Pull-Ups (Weighted if needed)", sets: 4, reps: "8-10", tag: "heavy" },
      { name: "Seated Cable Row", sets: 3, reps: "8-10", tag: "heavy" },
      { name: "Dumbbell Chest Flys", sets: 3, reps: "12-15", tag: "light" },
      { name: "Cable Lat Pullover", sets: 2, reps: "10-12", tag: "light" },
      { name: "Machine Chest Press", sets: 3, reps: "8-10", tag: "moderate" },
    ],
  },
  5: {
    day: "Friday",
    title: "Full Arms + Shoulders",
    exercises: [
      { name: "Cable Tricep Pushdown", sets: 3, reps: "8-10", tag: "light" },
      { name: "Close-Grip Bench Press", sets: 3, reps: "8-10", tag: "heavy" },
      { name: "Preacher Curls", sets: 2, reps: "10-12", tag: "light" },
      { name: "Incline Dumbbell Curls", sets: 2, reps: "8-10", tag: "light" },
      { name: "Hammer Curls", sets: 2, reps: "10-12", tag: "light" },
      { name: "Dumbbell Lateral Raises", sets: 4, reps: "12-15", tag: "light" },
      { name: "Face Pulls", sets: 4, reps: "12-15", tag: "light" },
    ],
  },
  6: {
    day: "Saturday",
    title: "Legs + Core (Lower Body + Core)",
    exercises: [
      { name: "Front Squats", sets: 3, reps: "8-10", tag: "heavy" },
      { name: "Goblet Squats", sets: 3, reps: "12-15", tag: "moderate" },
      { name: "Leg Extension (Machine)", sets: 2, reps: "12-15", tag: "light" },
      { name: "Hamstring Curls (Machine)", sets: 3, reps: "10-12", tag: "light" },
      { name: "Seated Leg Curl", sets: 3, reps: "10-12", tag: "light" },
      { name: "Standing Calf Raises", sets: 4, reps: "15-20", tag: "light" },
      { name: "Seated Calf Raises", sets: 4, reps: "15-20", tag: "light" },
      { name: "Cable Woodchoppers", sets: 3, reps: "15/side", tag: "core" },
      { name: "Weighted Decline Sit-Ups", sets: 3, reps: "15-20", tag: "core" },
    ],
  },
  0: {
    day: "Sunday",
    title: "Rest",
    exercises: [],
  },
};

const SCHEDULE_V2_4DAY = {
  1: {
    day: "Day 1",
    title: "Horizontal Push/Pull",
    exercises: [
      { name: "Flat Dumbbell Press", sets: 4, reps: "6-8", tag: "heavy" },
      { name: "T-Bar Row", sets: 4, reps: "6-8", tag: "heavy" },
      { name: "Seated Dumbbell Shoulder Press", sets: 3, reps: "8-10", tag: "heavy" },
      { name: "Lat Pulldown (wide grip)", sets: 3, reps: "8-10", tag: "heavy" },
      { name: "Dumbbell Lateral Raises", sets: 3, reps: "12-15", tag: "light" },
      { name: "EZ Bar Curl", sets: 3, reps: "8-10", tag: "moderate" },
      { name: "Cable Tricep Pushdown", sets: 3, reps: "10-12", tag: "light" },
    ],
  },
  2: {
    day: "Rest Day",
    title: "",
    exercises: [],
  },
  3: {
    day: "Day 2",
    title: "Vertical Push/Pull + Triceps",
    exercises: [
      { name: "Incline Dumbbell Press", sets: 4, reps: "6-8", tag: "heavy" },
      { name: "Pull-Ups (Weighted if needed)", sets: 4, reps: "6-8", tag: "heavy" },
      { name: "Overhead Barbell Press", sets: 3, reps: "8-10", tag: "heavy" },
      { name: "Seated Cable Row", sets: 3, reps: "8-10", tag: "heavy" },
      { name: "Face Pulls", sets: 3, reps: "12-15", tag: "light" },
      { name: "Incline Dumbbell Curls", sets: 3, reps: "8-10", tag: "light" },
      { name: "Close-Grip Bench Press", sets: 3, reps: "8-10", tag: "heavy" },
    ],
  },
  4: {
    day: "Rest Day",
    title: "",
    exercises: [],
  },
  5: {
    day: "Day 3",
    title: "Isolation / Pump + Rear Delts",
    exercises: [
      { name: "Flat Dumbbell Press", sets: 3, reps: "10-12", tag: "moderate" },
      { name: "One-Arm Dumbbell Row", sets: 3, reps: "10-12", tag: "moderate" },
      { name: "Dumbbell Lateral Raises", sets: 4, reps: "12-15", tag: "light" },
      { name: "Reverse Pec Deck (Rear Delt Fly)", sets: 3, reps: "12-15", tag: "light" },
      { name: "Dumbbell Chest Flys", sets: 3, reps: "12-15", tag: "light" },
      { name: "Hammer Curls", sets: 3, reps: "10-12", tag: "light" },
      { name: "Overhead Tricep Extensions", sets: 3, reps: "10-12", tag: "light" },
    ],
  },
  6: {
    day: "Day 4",
    title: "Legs + Core",
    exercises: [
      { name: "Front Squats", sets: 4, reps: "6-8", tag: "heavy" },
      { name: "Leg Press", sets: 3, reps: "10-12", tag: "moderate" },
      { name: "Barbell Hip Thrust", sets: 4, reps: "8-12", tag: "heavy" },
      { name: "Hamstring Curls (Machine)", sets: 3, reps: "10-12", tag: "light" },
      { name: "Seated Leg Curl", sets: 3, reps: "10-12", tag: "light" },
      { name: "Leg Extension (Machine)", sets: 3, reps: "12-15", tag: "light" },
      { name: "Standing Calf Raises", sets: 4, reps: "15-20", tag: "light" },
      { name: "Seated Calf Raises", sets: 4, reps: "15-20", tag: "light" },
      { name: "Hanging Leg Raises", sets: 3, reps: "15-20", tag: "core" },
    ],
  },
  0: {
    day: "Rest Day",
    title: "",
    exercises: [],
  },
};

const SCHEDULE_VERSIONS = [
  { effectiveFrom: "2000-01-01", workouts: SCHEDULE_V1_6DAY },
  { effectiveFrom: "2026-11-09", workouts: SCHEDULE_V2_4DAY },
];

// The program in effect for a given YYYY-MM-DD date key.
function getWorkoutsForDate(dateKey) {
  let chosen = SCHEDULE_VERSIONS[0].workouts;
  for (const v of SCHEDULE_VERSIONS) {
    if (v.effectiveFrom <= dateKey) chosen = v.workouts;
  }
  return chosen;
}
