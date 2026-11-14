export const LETTERS = ["R", "I", "A", "S", "E", "C"] as const;
export type Letter = (typeof LETTERS)[number];

export const EDUCATION_LEVELS = [
  "none",
  "certificate",
  "apprenticeship",
  "associate",
  "bachelor",
  "advanced",
] as const;
export type EducationLevel = (typeof EDUCATION_LEVELS)[number];

export const LOCATIONS = ["local", "regional", "remote", "travel"] as const;
export type LocationPref = (typeof LOCATIONS)[number];

export interface Riasec {
  R: number;
  I: number;
  A: number;
  S: number;
  E: number;
  C: number;
}

export interface Career {
  id: string;
  title: string;
  category: string;
  summary: string;
  fitFocus: string;
  blsTitle: string;
  oohUrl: string;
  payBasis: string;
  medianPay: number;
  outlookBasis: string;
  growthPercent: number;
  growthLabel: string;
  employment2025: number;
  employmentChange: number;
  entryEducation: string;
  educationLevel: EducationLevel;
  training: string;
  trainingDetail: string;
  riasec: Riasec;
  physical: number;
  people: number;
  structure: number;
  autonomy: number;
  travel: number;
  locations: LocationPref[];
  checklist: string[];
}

export interface CareerCatalog {
  source: {
    publisher: string;
    handbook: string;
    wageYear: string;
    outlookPeriod: string;
    allOccupationsMedianPay: number;
    allOccupationsGrowthPercent: number;
    note: string;
  };
  careers: Career[];
}

export interface QuestionOption {
  id: string;
  label: string;
  riasec?: Partial<Riasec>;
  physical?: number;
  people?: number;
  structure?: number;
  autonomy?: number;
  travel?: number;
  education?: EducationLevel;
  payPriority?: number;
  location?: LocationPref;
}

export interface Question {
  id: string;
  prompt: string;
  detail?: string;
  options: QuestionOption[];
}

export type Answers = Record<string, string>;

export interface UserProfile {
  riasec: Riasec;
  physical: number;
  people: number;
  structure: number;
  autonomy: number;
  travel: number;
  education: EducationLevel;
  payPriority: number;
  location: LocationPref;
}

export interface ScoreParts {
  interest: number;
  physical: number;
  people: number;
  structure: number;
  autonomy: number;
  travel: number;
  education: number;
  pay: number;
  location: number;
  total: number;
}

export interface ScoredCareer {
  career: Career;
  score: number;
  parts: ScoreParts;
  reasons: string[];
}

export interface ResultFilters {
  query: string;
  category: string;
  education: EducationLevel | "any";
  minPay: number;
  minGrowth: number;
  setting: "any" | "desk" | "active";
}
