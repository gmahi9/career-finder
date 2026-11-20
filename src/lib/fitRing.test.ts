import { describe, expect, it } from "vitest";
import { fitRingOffset } from "./fitRing";

describe("fit score ring", () => {
  it("draws an empty ring at zero and a full ring at 100", () => {
    const empty = fitRingOffset(0);
    const full = fitRingOffset(100);
    expect(empty.offset).toBeCloseTo(empty.circumference);
    expect(full.offset).toBeCloseTo(0);
    expect(fitRingOffset(50).offset).toBeCloseTo(empty.circumference / 2);
  });

  it("clamps scores that fall outside 0 to 100", () => {
    expect(fitRingOffset(140).offset).toBeCloseTo(0);
    expect(fitRingOffset(-20).offset).toBeCloseTo(fitRingOffset(0).circumference);
  });
});
