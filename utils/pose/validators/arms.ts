import { POSE_LANDMARKS } from '../constants';
import { angle } from '../math';
import { getLandmark, isLandmarkVisible } from '../landmarks';
import type { Pose } from '../types';

export function validateWristsAtShoulderHeight(pose: Pose, toleranceY: number = 0.08): boolean {
  const leftShoulder = getLandmark(pose, POSE_LANDMARKS.LEFT_SHOULDER);
  const rightShoulder = getLandmark(pose, POSE_LANDMARKS.RIGHT_SHOULDER);
  const leftWrist = getLandmark(pose, POSE_LANDMARKS.LEFT_WRIST);
  const rightWrist = getLandmark(pose, POSE_LANDMARKS.RIGHT_WRIST);
  if (!isLandmarkVisible(leftShoulder) || !isLandmarkVisible(rightShoulder) ||
      !isLandmarkVisible(leftWrist) || !isLandmarkVisible(rightWrist)) {
    return false;
  }
  const avgShoulderY = (leftShoulder!.y + rightShoulder!.y) / 2;
  const leftWristValid = Math.abs(leftWrist!.y - avgShoulderY) <= toleranceY;
  const rightWristValid = Math.abs(rightWrist!.y - avgShoulderY) <= toleranceY;
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

export function validateArmsRaised(pose: Pose, minShoulderHeightY: number = 0.35): boolean {
  const leftShoulder = getLandmark(pose, POSE_LANDMARKS.LEFT_SHOULDER);
  const rightShoulder = getLandmark(pose, POSE_LANDMARKS.RIGHT_SHOULDER);
  if (!isLandmarkVisible(leftShoulder) || !isLandmarkVisible(rightShoulder)) {
    return false;
  }
  return leftShoulder!.y <= minShoulderHeightY && rightShoulder!.y <= minShoulderHeightY;
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


