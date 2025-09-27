import { POSE_LANDMARKS } from '../constants';
import { getLandmark, isLandmarkVisible } from '../landmarks';
import type { Pose } from '../types';

/**
 * Head roll (lateral tilt) to the left: left ear higher (smaller X) than right ear by minDeltaX
 */
export function validateHeadTiltLeft(pose: Pose, minDeltaX: number = 0.03): boolean {
  const leftEar = getLandmark(pose, POSE_LANDMARKS.LEFT_EAR);
  const rightEar = getLandmark(pose, POSE_LANDMARKS.RIGHT_EAR);
  if (!isLandmarkVisible(leftEar) || !isLandmarkVisible(rightEar)) return false;
  return (rightEar!.x - leftEar!.x) >= minDeltaX;
}

/**
 * Head roll (lateral tilt) to the right: right ear higher (smaller X) than left ear by minDeltaX
 */
export function validateHeadTiltRight(pose: Pose, minDeltaX: number = 0.03): boolean {
  const leftEar = getLandmark(pose, POSE_LANDMARKS.LEFT_EAR);
  const rightEar = getLandmark(pose, POSE_LANDMARKS.RIGHT_EAR);
  if (!isLandmarkVisible(leftEar) || !isLandmarkVisible(rightEar)) return false;
  return (leftEar!.x - rightEar!.x) >= minDeltaX;
}

/**
 * Head roll neutral: ears nearly level in vertical (X) within maxDeltaX
 */
export function validateHeadTiltNeutral(pose: Pose, maxDeltaX: number = 0.02): boolean {
  const leftEar = getLandmark(pose, POSE_LANDMARKS.LEFT_EAR);
  const rightEar = getLandmark(pose, POSE_LANDMARKS.RIGHT_EAR);
  if (!isLandmarkVisible(leftEar) || !isLandmarkVisible(rightEar)) return false;
  return Math.abs(leftEar!.x - rightEar!.x) <= maxDeltaX;
}

/**
 * Head yaw to the left relative to torso center. For front camera, horizontal is mirrored.
 */
export function validateHeadYawLeft(
  pose: Pose,
  minDeltaY: number = 0.025,
  isFrontCamera: boolean = true
): boolean {
  const nose = getLandmark(pose, POSE_LANDMARKS.NOSE);
  const leftShoulder = getLandmark(pose, POSE_LANDMARKS.LEFT_SHOULDER);
  const rightShoulder = getLandmark(pose, POSE_LANDMARKS.RIGHT_SHOULDER);
  if (!isLandmarkVisible(nose) || !isLandmarkVisible(leftShoulder) || !isLandmarkVisible(rightShoulder)) return false;
  const avgShoulderY = (leftShoulder!.y + rightShoulder!.y) / 2;
  const deltaY = nose!.y - avgShoulderY; // + right, - left (screen coords)
  if (isFrontCamera) {
    return deltaY >= minDeltaY; // mirrored: person's left ≈ screen right
  }
  return deltaY <= -minDeltaY;
}

/**
 * Head yaw to the right relative to torso center. For front camera, horizontal is mirrored.
 */
export function validateHeadYawRight(
  pose: Pose,
  minDeltaY: number = 0.025,
  isFrontCamera: boolean = true
): boolean {
  const nose = getLandmark(pose, POSE_LANDMARKS.NOSE);
  const leftShoulder = getLandmark(pose, POSE_LANDMARKS.LEFT_SHOULDER);
  const rightShoulder = getLandmark(pose, POSE_LANDMARKS.RIGHT_SHOULDER);
  if (!isLandmarkVisible(nose) || !isLandmarkVisible(leftShoulder) || !isLandmarkVisible(rightShoulder)) return false;
  const avgShoulderY = (leftShoulder!.y + rightShoulder!.y) / 2;
  const deltaY = nose!.y - avgShoulderY; // + right, - left (screen coords)
  if (isFrontCamera) {
    return deltaY <= -minDeltaY; // mirrored: person's right ≈ screen left
  }
  return deltaY >= minDeltaY;
}

/**
 * Head yaw centered: nose horizontally near torso center within maxAbsDeltaY
 */
export function validateHeadYawCenter(pose: Pose, maxAbsDeltaY: number = 0.02): boolean {
  const nose = getLandmark(pose, POSE_LANDMARKS.NOSE);
  const leftShoulder = getLandmark(pose, POSE_LANDMARKS.LEFT_SHOULDER);
  const rightShoulder = getLandmark(pose, POSE_LANDMARKS.RIGHT_SHOULDER);
  if (!isLandmarkVisible(nose) || !isLandmarkVisible(leftShoulder) || !isLandmarkVisible(rightShoulder)) return false;
  const avgShoulderY = (leftShoulder!.y + rightShoulder!.y) / 2;
  return Math.abs(nose!.y - avgShoulderY) <= maxAbsDeltaY;
}

/**
 * Head pitch up: nose above shoulder line by minDeltaX (X = vertical)
 */
export function validateHeadPitchUp(pose: Pose, minDeltaX: number = 0.02): boolean {
  const nose = getLandmark(pose, POSE_LANDMARKS.NOSE);
  const leftShoulder = getLandmark(pose, POSE_LANDMARKS.LEFT_SHOULDER);
  const rightShoulder = getLandmark(pose, POSE_LANDMARKS.RIGHT_SHOULDER);
  if (!isLandmarkVisible(nose) || !isLandmarkVisible(leftShoulder) || !isLandmarkVisible(rightShoulder)) return false;
  const avgShoulderX = (leftShoulder!.x + rightShoulder!.x) / 2;
  return (avgShoulderX - nose!.x) >= minDeltaX;
}

/**
 * Head pitch down: nose below shoulder line by minDeltaX (X = vertical)
 */
export function validateHeadPitchDown(pose: Pose, minDeltaX: number = 0.02): boolean {
  const nose = getLandmark(pose, POSE_LANDMARKS.NOSE);
  const leftShoulder = getLandmark(pose, POSE_LANDMARKS.LEFT_SHOULDER);
  const rightShoulder = getLandmark(pose, POSE_LANDMARKS.RIGHT_SHOULDER);
  if (!isLandmarkVisible(nose) || !isLandmarkVisible(leftShoulder) || !isLandmarkVisible(rightShoulder)) return false;
  const avgShoulderX = (leftShoulder!.x + rightShoulder!.x) / 2;
  return (nose!.x - avgShoulderX) >= minDeltaX;
}

/**
 * Head pitch neutral: nose near shoulder line within maxAbsDeltaX
 */
export function validateHeadPitchNeutral(pose: Pose, maxAbsDeltaX: number = 0.015): boolean {
  const nose = getLandmark(pose, POSE_LANDMARKS.NOSE);
  const leftShoulder = getLandmark(pose, POSE_LANDMARKS.LEFT_SHOULDER);
  const rightShoulder = getLandmark(pose, POSE_LANDMARKS.RIGHT_SHOULDER);
  if (!isLandmarkVisible(nose) || !isLandmarkVisible(leftShoulder) || !isLandmarkVisible(rightShoulder)) return false;
  const avgShoulderX = (leftShoulder!.x + rightShoulder!.x) / 2;
  return Math.abs(nose!.x - avgShoulderX) <= maxAbsDeltaX;
}


