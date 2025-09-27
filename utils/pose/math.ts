import type { PoseLandmark } from './types';

export function angle(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let degrees = Math.abs(radians * (180 / Math.PI));
  if (degrees > 180) {
    degrees = 360 - degrees;
  }
  return degrees;
}

export function absDiff(a: number, b: number): number {
  return Math.abs(a - b);
}

export function isApprox(a: number, b: number, tolerance: number): boolean {
  return absDiff(a, b) <= tolerance;
}

export function distance(p1: PoseLandmark, p2: PoseLandmark): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}


