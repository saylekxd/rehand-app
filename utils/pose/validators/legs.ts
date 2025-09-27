import { POSE_LANDMARKS } from '../constants';
import { getLandmark, isLandmarkVisible } from '../landmarks';
import type { Pose } from '../types';

/**
 * Validate feet are wide apart horizontally (using Y axis = horizontal)
 * minDeltaY: minimum horizontal separation between ankles/feet [0..1]
 */
export function validateFeetWide(pose: Pose, minDeltaY: number = 0.25): boolean {
  const leftAnkle = getLandmark(pose, POSE_LANDMARKS.LEFT_ANKLE);
  const rightAnkle = getLandmark(pose, POSE_LANDMARKS.RIGHT_ANKLE);
  if (!isLandmarkVisible(leftAnkle) || !isLandmarkVisible(rightAnkle)) return false;
  const separation = Math.abs(leftAnkle!.y - rightAnkle!.y);
  return separation >= minDeltaY;
}

/**
 * Validate feet are together (narrow) horizontally (using Y axis = horizontal)
 * maxDeltaY: maximum allowed horizontal separation between ankles/feet [0..1]
 */
export function validateFeetTogether(pose: Pose, maxDeltaY: number = 0.12): boolean {
  const leftAnkle = getLandmark(pose, POSE_LANDMARKS.LEFT_ANKLE);
  const rightAnkle = getLandmark(pose, POSE_LANDMARKS.RIGHT_ANKLE);
  if (!isLandmarkVisible(leftAnkle) || !isLandmarkVisible(rightAnkle)) return false;
  const separation = Math.abs(leftAnkle!.y - rightAnkle!.y);
  return separation <= maxDeltaY;
}


