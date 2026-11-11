// Fixed weekly workout template. "sets" = number of weight inputs to show.
// "tag" = training style reminder: heavy (compound, push max weight, low
// reps), moderate, light (isolation, higher reps, focus on feel), or
// core (planks/carries/control work).
//
// 4-day/week program, keyed by weekday only for calendar mapping (never
// shown in the UI). Day 1 = Mon, Day 2 = Wed, Day 3 = Fri, Day 4 = Sat.
// Tue/Thu/Sun are rest days.
const WORKOUTS = {
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
