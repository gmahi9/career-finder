export function fitRingOffset(score: number, radius = 28): { circumference: number; offset: number } {
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, score));
  return {
    circumference,
    offset: circumference * (1 - clamped / 100),
  };
}
