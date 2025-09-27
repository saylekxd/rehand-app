import { POSE_LANDMARKS } from '../constants';
import { angle } from '../math';
import { getLandmark, isLandmarkVisible } from '../landmarks';
import type { Pose } from '../types';

export function validateWristsAtShoulderHeight(pose: Pose, toleranceX: number = 0.08): boolean {
  const leftShoulder = getLandmark(pose, POSE_LANDMARKS.LEFT_SHOULDER);
  const rightShoulder = getLandmark(pose, POSE_LANDMARKS.RIGHT_SHOULDER);
  const leftWrist = getLandmark(pose, POSE_LANDMARKS.LEFT_WRIST);
  const rightWrist = getLandmark(pose, POSE_LANDMARKS.RIGHT_WRIST);
  if (!isLandmarkVisible(leftShoulder) || !isLandmarkVisible(rightShoulder) ||
      !isLandmarkVisible(leftWrist) || !isLandmarkVisible(rightWrist)) {
    return false;
  }
  // X = wysokość (0 top, 1 bottom): porównujemy wysokość nadgarstków do średniej wysokości barków
  const avgShoulderX = (leftShoulder!.x + rightShoulder!.x) / 2;
  const leftWristValid = Math.abs(leftWrist!.x - avgShoulderX) <= toleranceX;
  const rightWristValid = Math.abs(rightWrist!.x - avgShoulderX) <= toleranceX;
  return leftWristValid && rightWristValid;
}

export function validateElbowsExtended(pose: Pose, minAngleDeg: number = 155): boolean {
  const leftShoulder = getLandmark(pose, POSE_LANDMARKS.LEFT_SHOULDER);
  const leftElbow = getLandmark(pose, POSE_LANDMARKS.LEFT_ELBOW);
  const leftWrist = getLandmark(pose, POSE_LANDMARKS.LEFT_WRIST);
  const rightShoulder = getLandmark(pose, POSE_LANDMARKS.RIGHT_SHOULDER);
  const rightElbow = getLandmark(pose, POSE_LANDMARKS.RIGHT_ELBOW);
  const rightWrist = getLandmark(pose, POSE_LANDMARKS.RIGHT_WRIST);
  if (!isLandmarkVisible(leftShoulder) || !isLandmarkVisible(leftElbow) || !isLandmarkVisible(leftWrist) ||
      !isLandmarkVisible(rightShoulder) || !isLandmarkVisible(rightElbow) || !isLandmarkVisible(rightWrist)) {
    return false;
  }
  const leftElbowAngle = angle(leftShoulder!, leftElbow!, leftWrist!);
  const rightElbowAngle = angle(rightShoulder!, rightElbow!, rightWrist!);
  return leftElbowAngle >= minAngleDeg && rightElbowAngle >= minAngleDeg;
}

export function validateArmsRaised(pose: Pose, minShoulderHeightX: number = 0.35): boolean {
  const leftShoulder = getLandmark(pose, POSE_LANDMARKS.LEFT_SHOULDER);
  const rightShoulder = getLandmark(pose, POSE_LANDMARKS.RIGHT_SHOULDER);
  if (!isLandmarkVisible(leftShoulder) || !isLandmarkVisible(rightShoulder)) {
    return false;
  }
  // X mniejsze = wyżej. Oba barki powinny być powyżej (mniejsze lub równe) progu wysokości.
  return leftShoulder!.x <= minShoulderHeightX && rightShoulder!.x <= minShoulderHeightX;
}

export function validateRightArmRaised(pose: Pose, minHeightX: number = 0.7, isFrontCamera: boolean = true): boolean {
  const wristLandmark = isFrontCamera ? getLandmark(pose, POSE_LANDMARKS.LEFT_WRIST) : getLandmark(pose, POSE_LANDMARKS.RIGHT_WRIST);
  const nose = getLandmark(pose, POSE_LANDMARKS.NOSE);
  if (!isLandmarkVisible(wristLandmark) || !isLandmarkVisible(nose)) return false;
  return wristLandmark!.x <= minHeightX && wristLandmark!.x < nose!.x;
}

export function validateLeftArmRaised(pose: Pose, minHeightX: number = 0.4, isFrontCamera: boolean = true): boolean {
  const wristLandmark = isFrontCamera ? getLandmark(pose, POSE_LANDMARKS.RIGHT_WRIST) : getLandmark(pose, POSE_LANDMARKS.LEFT_WRIST);
  const nose = getLandmark(pose, POSE_LANDMARKS.NOSE);
  if (!isLandmarkVisible(wristLandmark) || !isLandmarkVisible(nose)) return false;
  return wristLandmark!.x <= minHeightX && wristLandmark!.x < nose!.x;
}

export function validateRightArmLowered(pose: Pose, maxHeightX: number = 0.8, isFrontCamera: boolean = true): boolean {
  const wristLandmark = isFrontCamera ? getLandmark(pose, POSE_LANDMARKS.LEFT_WRIST) : getLandmark(pose, POSE_LANDMARKS.RIGHT_WRIST);
  const leftHip = getLandmark(pose, POSE_LANDMARKS.LEFT_HIP);
  const rightHip = getLandmark(pose, POSE_LANDMARKS.RIGHT_HIP);
  if (!isLandmarkVisible(wristLandmark) || !isLandmarkVisible(leftHip) || !isLandmarkVisible(rightHip)) return false;
  const avgHipX = (leftHip!.x + rightHip!.x) / 2;
  return wristLandmark!.x >= maxHeightX && wristLandmark!.x > avgHipX;
}

export function validateLeftArmLowered(pose: Pose, maxHeightX: number = 0.8, isFrontCamera: boolean = true): boolean {
  const wristLandmark = isFrontCamera ? getLandmark(pose, POSE_LANDMARKS.RIGHT_WRIST) : getLandmark(pose, POSE_LANDMARKS.LEFT_WRIST);
  const leftHip = getLandmark(pose, POSE_LANDMARKS.LEFT_HIP);
  const rightHip = getLandmark(pose, POSE_LANDMARKS.RIGHT_HIP);
  if (!isLandmarkVisible(wristLandmark) || !isLandmarkVisible(leftHip) || !isLandmarkVisible(rightHip)) return false;
  const avgHipX = (leftHip!.x + rightHip!.x) / 2;
  return wristLandmark!.x >= maxHeightX && wristLandmark!.x > avgHipX;
}

/**
 * Validate both wrists are below shoulder height by a margin (uses X axis = vertical)
 */
export function validateWristsBelowShoulders(pose: Pose, minDeltaX: number = 0.05): boolean {
  const leftShoulder = getLandmark(pose, POSE_LANDMARKS.LEFT_SHOULDER);
  const rightShoulder = getLandmark(pose, POSE_LANDMARKS.RIGHT_SHOULDER);
  const leftWrist = getLandmark(pose, POSE_LANDMARKS.LEFT_WRIST);
  const rightWrist = getLandmark(pose, POSE_LANDMARKS.RIGHT_WRIST);
  if (!isLandmarkVisible(leftShoulder) || !isLandmarkVisible(rightShoulder) ||
      !isLandmarkVisible(leftWrist) || !isLandmarkVisible(rightWrist)) {
    return false;
  }
  const avgShoulderX = (leftShoulder!.x + rightShoulder!.x) / 2;
  return (
    leftWrist!.x >= avgShoulderX + minDeltaX &&
    rightWrist!.x >= avgShoulderX + minDeltaX
  );
}

/**
 * Validate both wrists are near chest area and close together (clap in front)
 * - chest band by X (vertical) between minChestX..maxChestX
 * - horizontal proximity by Y: |leftWrist.y - rightWrist.y| <= maxDeltaY
 */
export function validateChestClap(
  pose: Pose,
  opts: { minChestX?: number; maxChestX?: number; maxDeltaY?: number; dynamicBand?: boolean } = {}
): boolean {
  const { minChestX, maxChestX, maxDeltaY = 0.12, dynamicBand = true } = opts;
  const leftWrist = getLandmark(pose, POSE_LANDMARKS.LEFT_WRIST);
  const rightWrist = getLandmark(pose, POSE_LANDMARKS.RIGHT_WRIST);
  const leftShoulder = getLandmark(pose, POSE_LANDMARKS.LEFT_SHOULDER);
  const rightShoulder = getLandmark(pose, POSE_LANDMARKS.RIGHT_SHOULDER);
  if (!isLandmarkVisible(leftWrist) || !isLandmarkVisible(rightWrist)) return false;

  // Absolute band (if provided via params)
  const inProvidedBand =
    minChestX !== undefined && maxChestX !== undefined
      ? (leftWrist!.x >= minChestX && leftWrist!.x <= maxChestX &&
         rightWrist!.x >= minChestX && rightWrist!.x <= maxChestX)
      : false;

  // Dynamic band relative to shoulders (X = vertical): slightly below shoulders down to klatka
  let inDynamicBand = false;
  if (dynamicBand && isLandmarkVisible(leftShoulder) && isLandmarkVisible(rightShoulder)) {
    const avgShoulderX = (leftShoulder!.x + rightShoulder!.x) / 2;
    const dynMin = avgShoulderX - 0.02; // tuż pod barkami (dopuszczamy lekkie odchyłki)
    const dynMax = avgShoulderX + 0.22; // w dół w kierunku klatki
    inDynamicBand =
      leftWrist!.x >= dynMin && leftWrist!.x <= dynMax &&
      rightWrist!.x >= dynMin && rightWrist!.x <= dynMax;
  }

  const inChestBand = inProvidedBand || inDynamicBand;
  const horizontalClose = Math.abs(leftWrist!.y - rightWrist!.y) <= maxDeltaY;

  return inChestBand && horizontalClose;
}


