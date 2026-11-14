import {
  EDUCATION_LEVELS,
  LETTERS,
  type Answers,
  type Career,
  type EducationLevel,
  type Letter,
  type LocationPref,
  type Question,
  type ResultFilters,
  type Riasec,
  type ScoreParts,
  type ScoredCareer,
  type UserProfile,
} from "./types";

const LETTER_NAMES: Record<Letter, string> = {
  R: "Realistic (hands-on)",
  I: "Investigative",
  A: "Artistic",
  S: "Social",
  E: "Enterprising",
  C: "Conventional",
};

const WEIGHTS = {
  interest: 40,
  physical: 12,
  people: 8,
  structure: 6,
  autonomy: 6,
  travel: 5,
  education: 12,
  pay: 6,
  location: 5,
} as const;

function emptyRiasec(): Riasec {
  return { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
}

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function average(values: number[], fallback: number): number {
  if (values.length === 0) return fallback;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function educationIndex(level: EducationLevel): number {
  return EDUCATION_LEVELS.indexOf(level);
}

export function educationFit(user: EducationLevel, required: EducationLevel): number {
  const gap = educationIndex(required) - educationIndex(user);
  if (gap <= 0) return 1;
  if (gap === 1) return 0.4;
  return 0;
}

export function cosine(left: Riasec, right: Riasec): number {
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (const letter of LETTERS) {
    dot += left[letter] * right[letter];
    leftNorm += left[letter] * left[letter];
    rightNorm += right[letter] * right[letter];
  }
  if (leftNorm === 0 || rightNorm === 0) return 0;
  return dot / Math.sqrt(leftNorm * rightNorm);
}

export function payBounds(careers: Career[]): { min: number; max: number } {
  const pays = careers.map((career) => career.medianPay);
  return { min: Math.min(...pays), max: Math.max(...pays) };
}

export function payFit(priority: number, medianPay: number, bounds: { min: number; max: number }): number {
  const span = bounds.max - bounds.min;
  const normalized = span === 0 ? 0.5 : (medianPay - bounds.min) / span;
  const lean = clamp01(priority);
  return lean * normalized + (1 - lean) * 0.65;
}

export function locationFit(preference: LocationPref, locations: LocationPref[]): number {
  if (preference === "travel") return 1;
  if (preference === "regional") return locations.some((item) => item === "local" || item === "regional" || item === "travel") ? 1 : 0.35;
  if (preference === "remote") return locations.includes("remote") ? 1 : 0.15;
  return locations.includes("local") ? 1 : locations.includes("regional") ? 0.45 : 0.1;
}

export function buildUserProfile(answers: Answers, questions: Question[]): UserProfile {
  const riasec = emptyRiasec();
  const physical: number[] = [];
  const people: number[] = [];
  const structure: number[] = [];
  const autonomy: number[] = [];
  const travel: number[] = [];
  let education: EducationLevel = "bachelor";
  let payPriority = 0.5;
  let location: LocationPref = "regional";

  for (const question of questions) {
    const selected = question.options.find((option) => option.id === answers[question.id]);
    if (!selected) continue;
    if (selected.riasec) {
      for (const letter of LETTERS) {
        riasec[letter] += selected.riasec[letter] ?? 0;
      }
    }
    if (selected.physical !== undefined) physical.push(selected.physical);
    if (selected.people !== undefined) people.push(selected.people);
    if (selected.structure !== undefined) structure.push(selected.structure);
    if (selected.autonomy !== undefined) autonomy.push(selected.autonomy);
    if (selected.travel !== undefined) travel.push(selected.travel);
    if (selected.education) education = selected.education;
    if (selected.payPriority !== undefined) payPriority = selected.payPriority;
    if (selected.location) location = selected.location;
  }

  return {
    riasec,
    physical: clamp01(average(physical, 0.5)),
    people: clamp01(average(people, 0.5)),
    structure: clamp01(average(structure, 0.5)),
    autonomy: clamp01(average(autonomy, 0.5)),
    travel: clamp01(average(travel, 0.4)),
    education,
    payPriority: clamp01(payPriority),
    location,
  };
}

function closeness(left: number, right: number): number {
  return 1 - Math.abs(left - right);
}

export function scoreParts(
  career: Career,
  user: UserProfile,
  bounds: { min: number; max: number },
): ScoreParts {
  const interest = cosine(user.riasec, career.riasec);
  const physical = closeness(user.physical, career.physical);
  const people = closeness(user.people, career.people);
  const structure = closeness(user.structure, career.structure);
  const autonomy = closeness(user.autonomy, career.autonomy);
  const travel = closeness(user.travel, career.travel);
  const education = educationFit(user.education, career.educationLevel);
  const pay = payFit(user.payPriority, career.medianPay, bounds);
  const location = locationFit(user.location, career.locations);
  const total =
    interest * WEIGHTS.interest +
    physical * WEIGHTS.physical +
    people * WEIGHTS.people +
    structure * WEIGHTS.structure +
    autonomy * WEIGHTS.autonomy +
    travel * WEIGHTS.travel +
    education * WEIGHTS.education +
    pay * WEIGHTS.pay +
    location * WEIGHTS.location;
  return {
    interest,
    physical,
    people,
    structure,
    autonomy,
    travel,
    education,
    pay,
    location,
    total: Math.round(clamp01(total / 100) * 100),
  };
}

function sharedLetters(user: Riasec, career: Riasec): Letter[] {
  return [...LETTERS]
    .filter((letter) => career[letter] >= 3 && user[letter] > 0)
    .sort((left, right) => career[right] * user[right] - career[left] * user[left]);
}

export function explainMatch(career: Career, user: UserProfile, parts: ScoreParts): string[] {
  const reasons: string[] = [];
  const shared = sharedLetters(user.riasec, career.riasec);
  if (parts.interest >= 0.55 && shared.length > 0) {
    const names = shared.slice(0, 2).map((letter) => LETTER_NAMES[letter]).join(" and ");
    reasons.push(`Your answers lean ${names}, which matches ${career.fitFocus}.`);
  } else if (shared.length > 0) {
    reasons.push(`There is some overlap around ${career.fitFocus}, with a weaker interest match.`);
  } else {
    reasons.push(`Your interest pattern is different from ${career.fitFocus}.`);
  }

  if (parts.physical >= 0.75) {
    reasons.push(
      career.physical >= 0.65
        ? "You asked for active, physical work, and this job is typically on your feet."
        : "You asked for quieter, seated work, and this job is mostly at a desk.",
    );
  }

  const gap = educationIndex(career.educationLevel) - educationIndex(user.education);
  if (gap <= 0) {
    reasons.push("The usual entry route fits the schooling or training you said you would consider.");
  } else if (gap === 1) {
    reasons.push("Typical entry preparation is one step past the level you selected.");
  } else {
    reasons.push("Typical entry preparation is beyond the level you selected, so this score is lower.");
  }

  if (parts.location >= 0.9) {
    reasons.push("The usual work setting fits the location flexibility you chose.");
  } else if (user.location === "remote") {
    reasons.push("This occupation is not usually set up as remote work.");
  }

  if (user.payPriority >= 0.75 && career.medianPay >= 90000) {
    reasons.push("Pay is a high priority for you, and the published median is in the upper part of this list.");
  } else if (user.payPriority <= 0.3) {
    reasons.push("You said pay is secondary, so wages moved the score less than interests and training.");
  }

  return reasons.slice(0, 4);
}

export function scoreCareer(career: Career, user: UserProfile, bounds: { min: number; max: number }): ScoredCareer {
  const parts = scoreParts(career, user, bounds);
  return {
    career,
    score: parts.total,
    parts,
    reasons: explainMatch(career, user, parts),
  };
}

export function rankCareers(careers: Career[], user: UserProfile): ScoredCareer[] {
  const bounds = payBounds(careers);
  return careers
    .map((career) => scoreCareer(career, user, bounds))
    .sort((left, right) => right.score - left.score || left.career.title.localeCompare(right.career.title));
}

export function topMatches(ranked: ScoredCareer[], count = 5): ScoredCareer[] {
  return ranked.slice(0, count);
}

export function applyFilters(ranked: ScoredCareer[], filters: ResultFilters): ScoredCareer[] {
  const query = filters.query.trim().toLowerCase();
  return ranked.filter(({ career }) => {
    if (filters.category !== "any" && career.category !== filters.category) return false;
    if (filters.education !== "any" && educationIndex(career.educationLevel) > educationIndex(filters.education)) {
      return false;
    }
    if (career.medianPay < filters.minPay) return false;
    if (career.growthPercent < filters.minGrowth) return false;
    if (filters.setting === "desk" && career.physical > 0.45) return false;
    if (filters.setting === "active" && career.physical < 0.55) return false;
    if (!query) return true;
    const haystack = `${career.title} ${career.summary} ${career.blsTitle} ${career.category}`.toLowerCase();
    return haystack.includes(query);
  });
}
