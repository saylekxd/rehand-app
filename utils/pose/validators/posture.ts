import { POSE_LANDMARKS } from '../constants';
import { getLandmark, isLandmarkVisible } from '../landmarks';
import type { Pose } from '../types';

export function validateUprightTorso(pose: Pose, maxLeanDeg: number = 10): boolean {
  const leftShoulder = getLandmark(pose, POSE_LANDMARKS.LEFT_SHOULDER);
  const rightShoulder = getLandmark(pose, POSE_LANDMARKS.RIGHT_SHOULDER);
  const leftHip = getLandmark(pose, POSE_LANDMARKS.LEFT_HIP);
  const rightHip = getLandmark(pose, POSE_LANDMARKS.RIGHT_HIP);
  if (!isLandmarkVisible(leftShoulder) || !isLandmarkVisible(rightShoulder) ||
      !isLandmarkVisible(leftHip) || !isLandmarkVisible(rightHip)) {
    return false;
  }
  const shoulderCenterX = (leftShoulder!.x + rightShoulder!.x) / 2;
  const shoulderCenterY = (leftShoulder!.y + rightShoulder!.y) / 2;
  const hipCenterX = (leftHip!.x + rightHip!.x) / 2;
  const hipCenterY = (leftHip!.y + rightHip!.y) / 2;
  // X = wysokość (vertical), Y = poziom (horizontal)
  const deltaX = shoulderCenterX - hipCenterX; // vertical separation
  const deltaY = shoulderCenterY - hipCenterY; // horizontal offset
  // Kąt od pionu: atan2(|horizontal|, |vertical|)
  const leanAngle = Math.abs(Math.atan2(Math.abs(deltaY), Math.abs(deltaX)) * (180 / Math.PI));
  return leanAngle <= maxLeanDeg;
}


