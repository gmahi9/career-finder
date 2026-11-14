import type { Question } from "../lib/types";

export const questions: Question[] = [
  {
    id: "q1",
    prompt: "Which kind of work sounds most like you?",
    options: [
      { id: "a", label: "Building, fixing, or operating things", riasec: { R: 5 } },
      { id: "b", label: "Investigating how a system or dataset works", riasec: { I: 5 } },
      { id: "c", label: "Helping, teaching, or caring for people", riasec: { S: 5 } },
      { id: "d", label: "Leading, selling, or organizing a result", riasec: { E: 4, C: 2 } },
    ],
  },
  {
    id: "q2",
    prompt: "What second pull do you notice?",
    options: [
      { id: "a", label: "Designing how something looks or feels", riasec: { A: 5 } },
      { id: "b", label: "Keeping records, rules, and details straight", riasec: { C: 5 } },
      { id: "c", label: "Troubleshooting a technical problem", riasec: { I: 3, R: 2 } },
      { id: "d", label: "Talking with customers and closing the loop", riasec: { E: 3, S: 3 } },
    ],
  },
  {
    id: "q3",
    prompt: "Where do you picture a good day?",
    options: [
      { id: "a", label: "A shop, jobsite, vehicle, or the outdoors", physical: 0.92, riasec: { R: 2 } },
      { id: "b", label: "A clinic, classroom, or place where people come to you", physical: 0.48, people: 0.85 },
      { id: "c", label: "A desk at home or in an office", physical: 0.1, people: 0.35 },
      { id: "d", label: "A mix of field time and desk time", physical: 0.55, people: 0.5 },
    ],
  },
  {
    id: "q4",
    prompt: "How physical should the work be?",
    options: [
      { id: "a", label: "Active most of the day: lifting, climbing, or standing", physical: 1 },
      { id: "b", label: "Some movement, with breaks to sit", physical: 0.55 },
      { id: "c", label: "Mostly seated", physical: 0.08 },
    ],
  },
  {
    id: "q5",
    prompt: "How much of the day do you want to spend with other people?",
    options: [
      { id: "a", label: "Most of the day", people: 0.95, riasec: { S: 2 } },
      { id: "b", label: "A balance of people and focused work", people: 0.5 },
      { id: "c", label: "Mostly on my own", people: 0.12 },
    ],
  },
  {
    id: "q6",
    prompt: "What kind of contribution feels worth learning?",
    options: [
      { id: "a", label: "Teaching, coaching, or explaining", riasec: { S: 4 } },
      { id: "b", label: "Direct care for a patient, client, or animal", riasec: { S: 4, R: 1 } },
      { id: "c", label: "Infrastructure other people rely on", riasec: { R: 3, C: 2 } },
      { id: "d", label: "A product, model, or system", riasec: { I: 3 } },
    ],
  },
  {
    id: "q7",
    prompt: "How do you like to influence an outcome?",
    options: [
      { id: "a", label: "Persuading someone to say yes", riasec: { E: 5 } },
      { id: "b", label: "Coordinating people and a plan", riasec: { E: 3, S: 2 } },
      { id: "c", label: "Being the specialist others call", riasec: { I: 2, R: 1 } },
      { id: "d", label: "Working the numbers behind a decision", riasec: { C: 4, I: 2 } },
    ],
  },
  {
    id: "q8",
    prompt: "Which thinking style fits you better?",
    options: [
      { id: "a", label: "Deep research before I commit", riasec: { I: 5 }, structure: 0.35 },
      { id: "b", label: "Practical troubleshooting in the moment", riasec: { R: 3, I: 2 }, structure: 0.4 },
      { id: "c", label: "Trying visual or creative options", riasec: { A: 4, I: 1 }, structure: 0.25 },
      { id: "d", label: "A checklist I can trust", riasec: { C: 4 }, structure: 0.85 },
    ],
  },
  {
    id: "q9",
    prompt: "How much routine do you want?",
    detail: "Routine here means repeating a known process. Variety means new problems.",
    options: [
      { id: "a", label: "A predictable routine", structure: 0.92 },
      { id: "b", label: "A mix", structure: 0.5 },
      { id: "c", label: "New problems often", structure: 0.12 },
    ],
  },
  {
    id: "q10",
    prompt: "How do you like to work with a group?",
    options: [
      { id: "a", label: "Mostly independently", autonomy: 0.9 },
      { id: "b", label: "A small team", autonomy: 0.5 },
      { id: "c", label: "A crew, shift, or larger group", autonomy: 0.15 },
    ],
  },
  {
    id: "q11",
    prompt: "How do you feel about hazardous or emergency settings?",
    options: [
      { id: "a", label: "Heights, weather, traffic, or emergencies are acceptable", physical: 0.85, riasec: { R: 2 } },
      { id: "b", label: "Some jobsite or clinical risk is fine", physical: 0.5 },
      { id: "c", label: "I want a controlled, low-hazard setting", physical: 0.12, riasec: { C: 1 } },
    ],
  },
  {
    id: "q12",
    prompt: "Which tools do you want in your hands?",
    options: [
      { id: "a", label: "Hand tools, power tools, or vehicles", riasec: { R: 4 } },
      { id: "b", label: "Code, data, and software", riasec: { I: 4 } },
      { id: "c", label: "Clinical, lab, or diagnostic instruments", riasec: { I: 2, S: 2, R: 1 } },
      { id: "d", label: "Spreadsheets, files, contracts, or lesson plans", riasec: { C: 3, E: 1 } },
    ],
  },
  {
    id: "q13",
    prompt: "What preparation are you willing to take on?",
    detail: "Pick the highest level you would actually start. Higher choices still match shorter routes.",
    options: [
      { id: "a", label: "None beyond high school", education: "none" },
      { id: "b", label: "A certificate or short college program", education: "certificate" },
      { id: "c", label: "An apprenticeship", education: "apprenticeship" },
      { id: "d", label: "An associate degree", education: "associate" },
      { id: "e", label: "A bachelor's degree", education: "bachelor" },
      { id: "f", label: "A master's degree or beyond", education: "advanced" },
    ],
  },
  {
    id: "q14",
    prompt: "How should pay affect the match?",
    options: [
      { id: "a", label: "Pay is the main thing I am optimizing for", payPriority: 1 },
      { id: "b", label: "Pay matters, along with the work itself", payPriority: 0.65 },
      { id: "c", label: "I will trade some pay for fit or schedule", payPriority: 0.3 },
      { id: "d", label: "Pay is secondary", payPriority: 0.05 },
    ],
  },
  {
    id: "q15",
    prompt: "What location pattern can you accept?",
    options: [
      { id: "a", label: "Stay local and sleep at home", location: "local", travel: 0.1 },
      { id: "b", label: "A regional commute or move is fine", location: "regional", travel: 0.35 },
      { id: "c", label: "I want work I can do remotely", location: "remote", travel: 0.2 },
      { id: "d", label: "Travel or relocation is fine", location: "travel", travel: 0.9 },
    ],
  },
  {
    id: "q16",
    prompt: "Which schedule sounds workable?",
    options: [
      { id: "a", label: "Standard weekday hours", structure: 0.75, autonomy: 0.4 },
      { id: "b", label: "Shifts, nights, or weekends", structure: 0.4, people: 0.45 },
      { id: "c", label: "Project bursts and deadlines", structure: 0.22, autonomy: 0.55 },
      { id: "d", label: "Appointments I help set", autonomy: 0.82, riasec: { E: 2 } },
    ],
  },
  {
    id: "q17",
    prompt: "What do you want to be trusted for?",
    options: [
      { id: "a", label: "Accuracy when a small error is costly", riasec: { C: 4, I: 2 } },
      { id: "b", label: "Direction and decisions", riasec: { E: 3 } },
      { id: "c", label: "Craft and finish quality", riasec: { R: 3, A: 2 } },
      { id: "d", label: "Relationships and follow-through", riasec: { S: 4 } },
    ],
  },
  {
    id: "q18",
    prompt: "Which setting do you want to learn first?",
    options: [
      { id: "a", label: "Technology and data", riasec: { I: 3 } },
      { id: "b", label: "Buildings, vehicles, and utilities", riasec: { R: 4 } },
      { id: "c", label: "Health, care, or community services", riasec: { S: 4 } },
      { id: "d", label: "Business, money, or a classroom", riasec: { E: 2, C: 2, S: 1 } },
    ],
  },
  {
    id: "q19",
    prompt: "How much travel belongs in the job?",
    options: [
      { id: "a", label: "Little or none", travel: 0.05 },
      { id: "b", label: "Occasional trips", travel: 0.4 },
      { id: "c", label: "Regular travel or customer sites", travel: 0.85 },
    ],
  },
  {
    id: "q20",
    prompt: "Which sentence fits you best?",
    options: [
      { id: "a", label: "I want to be the person who can fix it", riasec: { R: 3 } },
      { id: "b", label: "I want to be the person who can explain it", riasec: { S: 2, I: 2 } },
      { id: "c", label: "I want to be the person who can sell or decide it", riasec: { E: 3 } },
      { id: "d", label: "I want to be the person who keeps it accurate", riasec: { C: 3 } },
    ],
  },
];
