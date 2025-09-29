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

/**
 * Validates if a person is in correct orientation (not upside down)
 * Checks if the head (nose) is above the hips in the frame
 * 
 * @param pose - The pose to validate
 * @param threshold - Visibility threshold for landmarks (default: 0.5)
 * @returns true if person is right-side up, false if upside down or landmarks not visible
 */
export function validateCorrectOrientation(pose: Pose, threshold: number = 0.5): boolean {
  const nose = getLandmark(pose, POSE_LANDMARKS.NOSE);
  const leftHip = getLandmark(pose, POSE_LANDMARKS.LEFT_HIP);
  const rightHip = getLandmark(pose, POSE_LANDMARKS.RIGHT_HIP);
  
  // Check if key landmarks are visible
  if (!isLandmarkVisible(nose, threshold)) {
    return false;
  }
  
  // If at least one hip is visible, use it for validation
  const leftHipVisible = isLandmarkVisible(leftHip, threshold);
  const rightHipVisible = isLandmarkVisible(rightHip, threshold);
  
  if (!leftHipVisible && !rightHipVisible) {
    // If no hips are visible, check shoulders as fallback
    const leftShoulder = getLandmark(pose, POSE_LANDMARKS.LEFT_SHOULDER);
    const rightShoulder = getLandmark(pose, POSE_LANDMARKS.RIGHT_SHOULDER);
    
    const leftShoulderVisible = isLandmarkVisible(leftShoulder, threshold);
    const rightShoulderVisible = isLandmarkVisible(rightShoulder, threshold);
    
    if (!leftShoulderVisible && !rightShoulderVisible) {
      // Not enough landmarks to determine orientation
      return false;
    }
    
    // Calculate average shoulder X position (X = height/vertical axis)
    let shoulderX = 0;
    let shoulderCount = 0;
    if (leftShoulderVisible) {
      shoulderX += leftShoulder!.x;
      shoulderCount++;
    }
    if (rightShoulderVisible) {
      shoulderX += rightShoulder!.x;
      shoulderCount++;
    }
    shoulderX /= shoulderCount;
    
    // X axis: smaller values = higher position (0 = top, 1 = bottom)
    // Nose should be above (lower X value) shoulders
    // Add small tolerance (0.05 = 5% of frame height) for noise
    return nose!.x < (shoulderX + 0.05);
  }
  
  // Calculate average hip X position (X = height/vertical axis)
  let hipX = 0;
  let hipCount = 0;
  if (leftHipVisible) {
    hipX += leftHip!.x;
    hipCount++;
  }
  if (rightHipVisible) {
    hipX += rightHip!.x;
    hipCount++;
  }
  hipX /= hipCount;
  
  // X axis: smaller values = higher position (0 = top, 1 = bottom)
  // So nose.x should be less than hip.x for correct orientation
  // Add small tolerance (0.1 = 10% of frame height) to avoid false negatives
  return nose!.x < (hipX + 0.1);
}


