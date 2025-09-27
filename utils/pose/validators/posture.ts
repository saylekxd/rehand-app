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
  const deltaX = shoulderCenterX - hipCenterX;
  const deltaY = shoulderCenterY - hipCenterY;
  const leanAngle = Math.abs(Math.atan2(deltaX, Math.abs(deltaY)) * (180 / Math.PI));
  return leanAngle <= maxLeanDeg;
}


