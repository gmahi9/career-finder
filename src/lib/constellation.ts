import { CATEGORY_LABELS } from "./format";

export interface FieldNode {
  id: string;
  short: string;
  ring: number;
  slot: number;
  color: string;
  emissive: string;
}

export const STILL_TURN = 0.35;
export const ANCHOR_X = 13.2;
export const ANCHOR_Z = 16;
export const ANCHOR_Y = 8;

export const PATH_FIELDS: FieldNode[] = [
  { id: "tech", short: "Tech", ring: 0, slot: 0, color: "#7eafd6", emissive: "#2c679c" },
  { id: "design", short: "Design", ring: 0, slot: 1, color: "#e4b894", emissive: "#8d4520" },
  { id: "healthcare", short: "Health", ring: 0, slot: 2, color: "#9ec6e4", emissive: "#3d78a8" },
  { id: "engineering", short: "Engineer", ring: 1, slot: 0, color: "#8eb8dc", emissive: "#2f6ea3" },
  { id: "finance", short: "Finance", ring: 1, slot: 1, color: "#d7b496", emissive: "#8d4520" },
  { id: "education", short: "Teach", ring: 1, slot: 2, color: "#c5d8ea", emissive: "#4d7ea6" },
  { id: "trades", short: "Trades", ring: 1, slot: 3, color: "#e0c2a4", emissive: "#a15a32" },
  { id: "construction", short: "Build", ring: 2, slot: 0, color: "#d9b08a", emissive: "#8d4520" },
  { id: "business", short: "Business", ring: 2, slot: 1, color: "#b7cbe0", emissive: "#3e6f99" },
  { id: "public-safety", short: "Safety", ring: 2, slot: 2, color: "#8aa9c8", emissive: "#2a5278" },
  { id: "logistics", short: "Logistics", ring: 2, slot: 3, color: "#a9c3da", emissive: "#355e86" },
  { id: "sales", short: "Sales", ring: 2, slot: 4, color: "#e7c3a2", emissive: "#8d4520" },
];

export function ringRadius(ring: number): number {
  return 1.08 + ring * 0.78;
}

export function fieldAngle(field: Pick<FieldNode, "ring" | "slot">, turn = 0): number {
  const count = PATH_FIELDS.filter((item) => item.ring === field.ring).length || 1;
  return -Math.PI / 2 + field.ring * 0.42 + (field.slot / count) * Math.PI * 2 + turn;
}

export function fieldPosition(field: FieldNode, turn = 0): { x: number; y: number; z: number } {
  const radius = ringRadius(field.ring);
  const angle = fieldAngle(field, turn);
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle * 2) * 0.14,
    z: Math.sin(angle) * radius * 0.62,
  };
}

export function fieldAnchor(field: FieldNode, turn = STILL_TURN): { x: number; y: number } {
  const point = fieldPosition(field, turn);
  return {
    x: 50 + point.x * ANCHOR_X,
    y: 50 + point.z * ANCHOR_Z - point.y * ANCHOR_Y,
  };
}

export function adjacentPairs(fields: readonly Pick<FieldNode, "ring">[]): [number, number][] {
  const pairs: [number, number][] = [];
  const rings = [...new Set(fields.map((field) => field.ring))];
  for (const ring of rings) {
    const indexes = fields
      .map((field, index) => (field.ring === ring ? index : -1))
      .filter((index) => index >= 0);
    if (indexes.length < 2) continue;
    for (let index = 0; index < indexes.length; index += 1) {
      pairs.push([indexes[index], indexes[(index + 1) % indexes.length]]);
    }
  }
  return pairs;
}

export function tiltFromPointer(x: number, y: number): { x: number; y: number } {
  const nx = Math.max(-1, Math.min(1, x));
  const ny = Math.max(-1, Math.min(1, y));
  const tiltX = ny * -0.22;
  const tiltY = nx * 0.4;
  return { x: tiltX === 0 ? 0 : tiltX, y: tiltY === 0 ? 0 : tiltY };
}

export function webglAvailable(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}

export function fieldIdsMatchCatalog(): string[] {
  return Object.keys(CATEGORY_LABELS);
}
