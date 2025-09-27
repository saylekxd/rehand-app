import type { Pose, PoseLandmark } from './types';

let landmarkMapCache = new Map<Pose, Map<number, PoseLandmark>>();

export function getLandmark(pose: Pose, keypoint: number): PoseLandmark | null {
  if (!landmarkMapCache.has(pose)) {
    const map = new Map<number, PoseLandmark>();
    for (const landmark of pose.landmarks) {
      map.set(landmark.keypoint, landmark);
    }
    landmarkMapCache.set(pose, map);
    if (landmarkMapCache.size > 10) {
      landmarkMapCache.clear();
      landmarkMapCache.set(pose, map);
    }
  }
  return landmarkMapCache.get(pose)?.get(keypoint) || null;
}

export function isLandmarkVisible(landmark: PoseLandmark | null, threshold: number = 0.5): boolean {
  return landmark !== null && landmark.visibility > threshold;
}


