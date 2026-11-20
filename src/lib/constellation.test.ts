import { describe, expect, it } from "vitest";
import { prefersReducedMotion } from "./motionPrefs";
import {
  PATH_FIELDS,
  adjacentPairs,
  fieldAnchor,
  fieldAngle,
  fieldIdsMatchCatalog,
  fieldPosition,
  ringRadius,
  tiltFromPointer,
  webglAvailable,
} from "./constellation";

describe("career path constellation", () => {
  it("places every catalog field on an orbit", () => {
    expect(PATH_FIELDS.map((field) => field.id).sort()).toEqual(fieldIdsMatchCatalog().sort());
    expect(new Set(PATH_FIELDS.map((field) => field.short)).size).toBe(PATH_FIELDS.length);
    for (const ring of [0, 1, 2]) {
      const slots = PATH_FIELDS.filter((field) => field.ring === ring).map((field) => field.slot).sort((a, b) => a - b);
      expect(slots).toEqual(slots.map((_, index) => index));
    }
  });

  it("keeps outer rings farther from the center", () => {
    expect(ringRadius(0)).toBeLessThan(ringRadius(1));
    expect(ringRadius(1)).toBeLessThan(ringRadius(2));
    const inner = fieldPosition(PATH_FIELDS.find((field) => field.ring === 0)!, 0);
    const outer = fieldPosition(PATH_FIELDS.find((field) => field.ring === 2)!, 0.2);
    const span = (point: { x: number; z: number }) => Math.hypot(point.x, point.z);
    expect(span(outer)).toBeGreaterThan(span(inner));
  });

  it("spaces a ring evenly and keeps anchors inside the frame", () => {
    const outer = PATH_FIELDS.filter((field) => field.ring === 2);
    const step = (Math.PI * 2) / outer.length;
    for (let index = 1; index < outer.length; index += 1) {
      expect(fieldAngle(outer[index], 0) - fieldAngle(outer[index - 1], 0)).toBeCloseTo(step);
    }
    for (const turn of [0, 0.35, 1.2, 2.4]) {
      for (const field of PATH_FIELDS) {
        const anchor = fieldAnchor(field, turn);
        expect(anchor.x).toBeGreaterThan(10);
        expect(anchor.x).toBeLessThan(90);
        expect(anchor.y).toBeGreaterThan(12);
        expect(anchor.y).toBeLessThan(88);
        expect(Number.isFinite(anchor.x)).toBe(true);
        expect(Number.isFinite(anchor.y)).toBe(true);
      }
    }
  });

  it("links neighbors on each ring without self-links", () => {
    const pairs = adjacentPairs(PATH_FIELDS);
    expect(pairs).toHaveLength(PATH_FIELDS.length);
    for (const [from, to] of pairs) {
      expect(from).not.toBe(to);
      expect(PATH_FIELDS[from].ring).toBe(PATH_FIELDS[to].ring);
    }
  });

  it("clamps pointer tilt", () => {
    expect(tiltFromPointer(0, 0)).toEqual({ x: 0, y: 0 });
    expect(tiltFromPointer(2, -3).x).toBeCloseTo(0.22);
    expect(tiltFromPointer(2, -3).y).toBeCloseTo(0.4);
    expect(tiltFromPointer(-0.5, 0.25).x).toBeCloseTo(-0.055);
    expect(tiltFromPointer(-0.5, 0.25).y).toBeCloseTo(-0.2);
  });

  it("checks motion and graphics support without throwing", () => {
    expect(prefersReducedMotion()).toBe(false);
    expect(webglAvailable()).toBe(false);
  });
});
