import { describe, expect, it } from "vitest";
import catalogJson from "../data/careers.json";
import { questions } from "../data/questions";
import { decodeAnswers, encodeAnswers } from "./hash";
import {
  applyFilters,
  buildUserProfile,
  cosine,
  educationFit,
  rankCareers,
  topMatches,
} from "./score";
import type { Answers, CareerCatalog, Riasec } from "./types";

const catalog = catalogJson as CareerCatalog;

function answers(map: Record<string, string>): Answers {
  const complete: Answers = {};
  for (const question of questions) {
    const choice = map[question.id];
    if (!choice) throw new Error(`Missing ${question.id}`);
    complete[question.id] = choice;
  }
  return complete;
}

const handsOn = answers({
  q1: "a", q2: "c", q3: "a", q4: "a", q5: "c", q6: "c", q7: "c", q8: "b", q9: "b", q10: "c",
  q11: "a", q12: "a", q13: "c", q14: "d", q15: "a", q16: "a", q17: "c", q18: "b", q19: "a", q20: "a",
});

const research = answers({
  q1: "b", q2: "c", q3: "c", q4: "c", q5: "c", q6: "d", q7: "c", q8: "a", q9: "c", q10: "a",
  q11: "c", q12: "b", q13: "f", q14: "a", q15: "c", q16: "c", q17: "a", q18: "a", q19: "a", q20: "b",
});

function scoreOf(ranked: ReturnType<typeof rankCareers>, id: string): number {
  const found = ranked.find((item) => item.career.id === id);
  if (!found) throw new Error(id);
  return found.score;
}

describe("education and interest math", () => {
  it("treats a higher preparation choice as a full fit", () => {
    expect(educationFit("bachelor", "apprenticeship")).toBe(1);
    expect(educationFit("bachelor", "bachelor")).toBe(1);
    expect(educationFit("certificate", "apprenticeship")).toBe(0.4);
    expect(educationFit("none", "bachelor")).toBe(0);
  });

  it("measures cosine similarity", () => {
    const same: Riasec = { R: 2, I: 0, A: 0, S: 1, E: 0, C: 0 };
    const other: Riasec = { R: 0, I: 3, A: 0, S: 0, E: 0, C: 0 };
    expect(cosine(same, same)).toBeCloseTo(1);
    expect(cosine(same, other)).toBe(0);
  });
});

describe("ranking", () => {
  const handsRanked = rankCareers(catalog.careers, buildUserProfile(handsOn, questions));
  const researchRanked = rankCareers(catalog.careers, buildUserProfile(research, questions));

  it("keeps every score on a 0 to 100 scale", () => {
    for (const row of [...handsRanked, ...researchRanked]) {
      expect(row.score).toBeGreaterThanOrEqual(0);
      expect(row.score).toBeLessThanOrEqual(100);
      expect(row.reasons.length).toBeGreaterThanOrEqual(2);
      expect(row.reasons.length).toBeLessThanOrEqual(4);
    }
  });

  it("ranks a skilled trade above desk research for hands-on answers", () => {
    expect(scoreOf(handsRanked, "electrician")).toBeGreaterThan(scoreOf(handsRanked, "data-scientist"));
    expect(scoreOf(handsRanked, "electrician")).toBeGreaterThan(scoreOf(handsRanked, "physician-assistant"));
    expect(topMatches(handsRanked).some((item) => item.career.category === "trades" || item.career.category === "construction")).toBe(true);
  });

  it("ranks analytical technology work above roofing for research answers", () => {
    expect(scoreOf(researchRanked, "data-scientist")).toBeGreaterThan(scoreOf(researchRanked, "roofer"));
    expect(scoreOf(researchRanked, "data-scientist")).toBeGreaterThan(scoreOf(researchRanked, "electrician"));
    expect(topMatches(researchRanked)[0].career.category).toBe("tech");
  });

  it("sorts ties by title", () => {
    const titles = handsRanked.map((item) => item.career.title);
    const sorted = [...handsRanked].sort((left, right) => right.score - left.score || left.career.title.localeCompare(right.career.title));
    expect(titles).toEqual(sorted.map((item) => item.career.title));
  });
});

describe("filters and sharing", () => {
  const ranked = rankCareers(catalog.careers, buildUserProfile(research, questions));

  it("drops careers above the selected preparation and pay", () => {
    const filtered = applyFilters(ranked, {
      query: "nurse",
      category: "healthcare",
      education: "bachelor",
      minPay: 60000,
      minGrowth: 0,
      setting: "any",
    });
    expect(filtered.map((item) => item.career.id)).toContain("registered-nurse");
    expect(filtered.map((item) => item.career.id)).not.toContain("physician-assistant");
    expect(filtered.every((item) => item.career.medianPay >= 60000)).toBe(true);
  });

  it("round-trips answers through the url hash", () => {
    const encoded = encodeAnswers(handsOn);
    expect(decodeAnswers(`#${encoded}`, questions)).toEqual(handsOn);
    expect(decodeAnswers("#nope", questions)).toBeNull();
    expect(decodeAnswers("#r=not-valid", questions)).toBeNull();
  });
});

describe("career catalog", () => {
  it("includes the published outlook fields for at least 60 careers", () => {
    expect(catalog.careers.length).toBeGreaterThanOrEqual(60);
    expect(catalog.source.wageYear).toBe("May 2025");
    expect(catalog.source.outlookPeriod).toBe("2025-35");
    const ids = new Set<string>();
    for (const career of catalog.careers) {
      expect(ids.has(career.id)).toBe(false);
      ids.add(career.id);
      expect(career.oohUrl.startsWith("https://www.bls.gov/ooh/")).toBe(true);
      expect(career.medianPay).toBeGreaterThan(20000);
      expect(Number.isInteger(career.growthPercent)).toBe(true);
      expect(career.checklist.length).toBeGreaterThanOrEqual(3);
      expect(career.entryEducation.length).toBeGreaterThan(0);
      expect(career.training.length).toBeGreaterThan(0);
    }
  });
});
