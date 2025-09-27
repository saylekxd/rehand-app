import { getLandmark, isLandmarkVisible } from './landmarks';
import { POSE_LANDMARKS } from './constants';
import type { Pose } from './types';

class MotionTrail {
  private positions: Array<{ x: number; y: number; timestamp: number }> = [];
  private maxSize: number;

  constructor(maxSize: number = 10) {
    this.maxSize = maxSize;
  }

  addPosition(x: number, y: number): void {
    this.positions.push({ x, y, timestamp: Date.now() });
    if (this.positions.length > this.maxSize) {
      this.positions.shift();
    }
  }

  getAverageSpeed(): number {
    if (this.positions.length < 2) return 0;
    let totalDistance = 0;
    let totalTime = 0;
    for (let i = 1; i < this.positions.length; i++) {
      const prev = this.positions[i - 1];
      const curr = this.positions[i];
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const time = curr.timestamp - prev.timestamp;
      totalDistance += dist;
      totalTime += time;
    }
    return totalTime > 0 ? totalDistance / (totalTime / 1000) : 0;
  }

  clear(): void {
    this.positions = [];
  }
}

export const leftWristTrail = new MotionTrail(10);
export const rightWristTrail = new MotionTrail(10);

export function updateMotionTrails(pose: Pose): void {
  const leftWrist = getLandmark(pose, POSE_LANDMARKS.LEFT_WRIST);
  const rightWrist = getLandmark(pose, POSE_LANDMARKS.RIGHT_WRIST);

  if (isLandmarkVisible(leftWrist)) {
    leftWristTrail.addPosition(leftWrist!.x, leftWrist!.y);
  }
  if (isLandmarkVisible(rightWrist)) {
    rightWristTrail.addPosition(rightWrist!.x, rightWrist!.y);
  }
}


