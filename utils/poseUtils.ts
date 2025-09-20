/**
 * Pose analysis utilities for exercise session validation
 * Provides functions to analyze pose landmarks and validate exercise constraints
 */

export interface PoseLandmark {
  keypoint: number;
  name: string;
  x: number; // normalized [0..1]
  y: number; // normalized [0..1]
  z: number; // depth
  visibility: number; // confidence [0..1]
}

export interface Pose {
  landmarks: PoseLandmark[];
}

// MediaPipe Pose landmark indices
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

/**
 * Calculate angle between three points (in degrees)
 * @param a First point (shoulder)
 * @param b Middle point (elbow) 
 * @param c Third point (wrist)
 */
export function angle(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let degrees = Math.abs(radians * (180 / Math.PI));
  if (degrees > 180) {
    degrees = 360 - degrees;
  }
  return degrees;
}

/**
 * Calculate absolute difference between two values
 */
export function absDiff(a: number, b: number): number {
  return Math.abs(a - b);
}

/**
 * Check if two values are approximately equal within tolerance
 */
export function isApprox(a: number, b: number, tolerance: number): boolean {
  return absDiff(a, b) <= tolerance;
}

/**
 * Calculate Euclidean distance between two points
 */
export function distance(p1: PoseLandmark, p2: PoseLandmark): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Get landmark by keypoint index from pose (optimized with Map for frequent lookups)
 */
let landmarkMapCache = new Map<Pose, Map<number, PoseLandmark>>();

export function getLandmark(pose: Pose, keypoint: number): PoseLandmark | null {
  // Use cached map for this pose if available
  if (!landmarkMapCache.has(pose)) {
    const map = new Map<number, PoseLandmark>();
    for (const landmark of pose.landmarks) {
      map.set(landmark.keypoint, landmark);
    }
    landmarkMapCache.set(pose, map);
    
    // Clear cache if it gets too large
    if (landmarkMapCache.size > 10) {
      landmarkMapCache.clear();
      landmarkMapCache.set(pose, map);
    }
  }
  
  return landmarkMapCache.get(pose)?.get(keypoint) || null;
}

/**
 * Check if landmark is visible (confidence > threshold)
 */
export function isLandmarkVisible(landmark: PoseLandmark | null, threshold: number = 0.5): boolean {
  return landmark !== null && landmark.visibility > threshold;
}

/**
 * Validate wrists are at shoulder height constraint
 */
export function validateWristsAtShoulderHeight(pose: Pose, toleranceY: number = 0.08): boolean {
  const leftShoulder = getLandmark(pose, POSE_LANDMARKS.LEFT_SHOULDER);
  const rightShoulder = getLandmark(pose, POSE_LANDMARKS.RIGHT_SHOULDER);
  const leftWrist = getLandmark(pose, POSE_LANDMARKS.LEFT_WRIST);
  const rightWrist = getLandmark(pose, POSE_LANDMARKS.RIGHT_WRIST);

  // Check if all landmarks are visible
  if (!isLandmarkVisible(leftShoulder) || !isLandmarkVisible(rightShoulder) ||
      !isLandmarkVisible(leftWrist) || !isLandmarkVisible(rightWrist)) {
    return false;
  }

  // Calculate average shoulder height
  const avgShoulderY = (leftShoulder!.y + rightShoulder!.y) / 2;

  // Check if both wrists are within tolerance of shoulder height
  const leftWristValid = isApprox(leftWrist!.y, avgShoulderY, toleranceY);
  const rightWristValid = isApprox(rightWrist!.y, avgShoulderY, toleranceY);

  return leftWristValid && rightWristValid;
}

/**
 * Validate elbows are extended (straight arms)
 */
export function validateElbowsExtended(pose: Pose, minAngleDeg: number = 155): boolean {
  const leftShoulder = getLandmark(pose, POSE_LANDMARKS.LEFT_SHOULDER);
  const leftElbow = getLandmark(pose, POSE_LANDMARKS.LEFT_ELBOW);
  const leftWrist = getLandmark(pose, POSE_LANDMARKS.LEFT_WRIST);
  
  const rightShoulder = getLandmark(pose, POSE_LANDMARKS.RIGHT_SHOULDER);
  const rightElbow = getLandmark(pose, POSE_LANDMARKS.RIGHT_ELBOW);
  const rightWrist = getLandmark(pose, POSE_LANDMARKS.RIGHT_WRIST);

  // Check if all landmarks are visible
  if (!isLandmarkVisible(leftShoulder) || !isLandmarkVisible(leftElbow) || !isLandmarkVisible(leftWrist) ||
      !isLandmarkVisible(rightShoulder) || !isLandmarkVisible(rightElbow) || !isLandmarkVisible(rightWrist)) {
    return false;
  }

  // Calculate elbow angles
  const leftElbowAngle = angle(leftShoulder!, leftElbow!, leftWrist!);
  const rightElbowAngle = angle(rightShoulder!, rightElbow!, rightWrist!);

  return leftElbowAngle >= minAngleDeg && rightElbowAngle >= minAngleDeg;
}

/**
 * Validate arms are raised (shoulders above certain height)
 */
export function validateArmsRaised(pose: Pose, minShoulderHeightY: number = 0.35): boolean {
  const leftShoulder = getLandmark(pose, POSE_LANDMARKS.LEFT_SHOULDER);
  const rightShoulder = getLandmark(pose, POSE_LANDMARKS.RIGHT_SHOULDER);

  if (!isLandmarkVisible(leftShoulder) || !isLandmarkVisible(rightShoulder)) {
    return false;
  }

  // Lower Y values mean higher position (coordinate system is inverted)
  return leftShoulder!.y <= minShoulderHeightY && rightShoulder!.y <= minShoulderHeightY;
}

/**
 * Validate right arm/hand is raised above head (accounting for front camera mirroring)
 */
export function validateRightArmRaised(pose: Pose, minHeightX: number = 0.7, isFrontCamera: boolean = true): boolean {
  // In front camera, physical right hand appears as left_wrist due to mirroring
  const wristLandmark = isFrontCamera ? 
    getLandmark(pose, POSE_LANDMARKS.LEFT_WRIST) :  // Front camera: left_wrist = physical right hand
    getLandmark(pose, POSE_LANDMARKS.RIGHT_WRIST); // Back camera: right_wrist = physical right hand
    
  const nose = getLandmark(pose, POSE_LANDMARKS.NOSE);

  if (!isLandmarkVisible(wristLandmark) || !isLandmarkVisible(nose)) {
    return false;
  }

  // X axis: 0 = top, 1 = bottom. Smaller X = higher position
  // Wrist should be higher (smaller X) than nose and above threshold
  console.log('[Debug] Right arm validation:', {
    wristX: wristLandmark!.x,
    noseX: nose!.x,
    minHeightX,
    isAboveNose: wristLandmark!.x < nose!.x,
    isAboveThreshold: wristLandmark!.x <= minHeightX,
    isFrontCamera,
    landmarkUsed: isFrontCamera ? 'LEFT_WRIST (mirrored)' : 'RIGHT_WRIST'
  });

  return wristLandmark!.x <= minHeightX && wristLandmark!.x < nose!.x;
}

/**
 * Validate left arm/hand is raised above head (accounting for front camera mirroring)
 */
export function validateLeftArmRaised(pose: Pose, minHeightX: number = 0.4, isFrontCamera: boolean = true): boolean {
  // In front camera, physical left hand appears as right_wrist due to mirroring
  const wristLandmark = isFrontCamera ? 
    getLandmark(pose, POSE_LANDMARKS.RIGHT_WRIST) :  // Front camera: right_wrist = physical left hand
    getLandmark(pose, POSE_LANDMARKS.LEFT_WRIST);    // Back camera: left_wrist = physical left hand
    
  const nose = getLandmark(pose, POSE_LANDMARKS.NOSE);

  if (!isLandmarkVisible(wristLandmark) || !isLandmarkVisible(nose)) {
    return false;
  }

  // X axis: smaller values = higher position
  console.log('[Debug] Left arm validation:', {
    wristX: wristLandmark!.x,
    noseX: nose!.x,
    minHeightX,
    isAboveNose: wristLandmark!.x < nose!.x,
    isAboveThreshold: wristLandmark!.x <= minHeightX,
    isFrontCamera,
    landmarkUsed: isFrontCamera ? 'RIGHT_WRIST (mirrored)' : 'LEFT_WRIST'
  });

  return wristLandmark!.x <= minHeightX && wristLandmark!.x < nose!.x;
}

/**
 * Validate right arm/hand is lowered below hips
 */
export function validateRightArmLowered(pose: Pose, maxHeightX: number = 0.8, isFrontCamera: boolean = true): boolean {
  // In front camera, physical right hand appears as left_wrist due to mirroring
  const wristLandmark = isFrontCamera ? 
    getLandmark(pose, POSE_LANDMARKS.LEFT_WRIST) :
    getLandmark(pose, POSE_LANDMARKS.RIGHT_WRIST);
    
  const leftHip = getLandmark(pose, POSE_LANDMARKS.LEFT_HIP);
  const rightHip = getLandmark(pose, POSE_LANDMARKS.RIGHT_HIP);

  if (!isLandmarkVisible(wristLandmark) || !isLandmarkVisible(leftHip) || !isLandmarkVisible(rightHip)) {
    return false;
  }

  // X axis: larger values = lower position. Wrist should be below hips.
  const avgHipX = (leftHip!.x + rightHip!.x) / 2;
  
  console.log('[Debug] Right arm lowered validation:', {
    wristX: wristLandmark!.x,
    avgHipX: avgHipX,
    maxHeightX,
    isBelowHips: wristLandmark!.x > avgHipX,
    isBelowThreshold: wristLandmark!.x >= maxHeightX,
    isFrontCamera,
    landmarkUsed: isFrontCamera ? 'LEFT_WRIST (mirrored)' : 'RIGHT_WRIST'
  });

  return wristLandmark!.x >= maxHeightX && wristLandmark!.x > avgHipX;
}

/**
 * Validate left arm/hand is lowered below hips
 */
export function validateLeftArmLowered(pose: Pose, maxHeightX: number = 0.8, isFrontCamera: boolean = true): boolean {
  // In front camera, physical left hand appears as right_wrist due to mirroring
  const wristLandmark = isFrontCamera ? 
    getLandmark(pose, POSE_LANDMARKS.RIGHT_WRIST) :
    getLandmark(pose, POSE_LANDMARKS.LEFT_WRIST);
    
  const leftHip = getLandmark(pose, POSE_LANDMARKS.LEFT_HIP);
  const rightHip = getLandmark(pose, POSE_LANDMARKS.RIGHT_HIP);

  if (!isLandmarkVisible(wristLandmark) || !isLandmarkVisible(leftHip) || !isLandmarkVisible(rightHip)) {
    return false;
  }

  // X axis: larger values = lower position. Wrist should be below hips.
  const avgHipX = (leftHip!.x + rightHip!.x) / 2;
  
  console.log('[Debug] Left arm lowered validation:', {
    wristX: wristLandmark!.x,
    avgHipX: avgHipX,
    maxHeightX,
    isBelowHips: wristLandmark!.x > avgHipX,
    isBelowThreshold: wristLandmark!.x >= maxHeightX,
    isFrontCamera,
    landmarkUsed: isFrontCamera ? 'RIGHT_WRIST (mirrored)' : 'LEFT_WRIST'
  });

  return wristLandmark!.x >= maxHeightX && wristLandmark!.x > avgHipX;
}

/**
 * Validate upright torso posture
 */
export function validateUprightTorso(pose: Pose, maxLeanDeg: number = 10): boolean {
  const leftShoulder = getLandmark(pose, POSE_LANDMARKS.LEFT_SHOULDER);
  const rightShoulder = getLandmark(pose, POSE_LANDMARKS.RIGHT_SHOULDER);
  const leftHip = getLandmark(pose, POSE_LANDMARKS.LEFT_HIP);
  const rightHip = getLandmark(pose, POSE_LANDMARKS.RIGHT_HIP);

  if (!isLandmarkVisible(leftShoulder) || !isLandmarkVisible(rightShoulder) ||
      !isLandmarkVisible(leftHip) || !isLandmarkVisible(rightHip)) {
    return false;
  }

  // Calculate center points
  const shoulderCenterX = (leftShoulder!.x + rightShoulder!.x) / 2;
  const shoulderCenterY = (leftShoulder!.y + rightShoulder!.y) / 2;
  const hipCenterX = (leftHip!.x + rightHip!.x) / 2;
  const hipCenterY = (leftHip!.y + rightHip!.y) / 2;

  // Calculate lean angle from vertical
  const deltaX = shoulderCenterX - hipCenterX;
  const deltaY = shoulderCenterY - hipCenterY;
  const leanAngle = Math.abs(Math.atan2(deltaX, Math.abs(deltaY)) * (180 / Math.PI));

  return leanAngle <= maxLeanDeg;
}

/**
 * Simple motion trail for tracking movement (for future use)
 * Stores last N positions for a landmark to detect motion
 */
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
    
    return totalTime > 0 ? totalDistance / (totalTime / 1000) : 0; // distance per second
  }

  clear(): void {
    this.positions = [];
  }
}

// Global motion trails for wrists (can be expanded later)
export const leftWristTrail = new MotionTrail(10);
export const rightWristTrail = new MotionTrail(10);

/**
 * Update motion trails with current pose
 */
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

/**
 * Validate constraint based on its type and parameters
 */
export function validateConstraint(pose: Pose, constraintType: string, params: any, isFrontCamera: boolean = true): boolean {
  console.log('[Debug] Validating constraint:', constraintType, 'params:', params, 'frontCamera:', isFrontCamera);
  
  switch (constraintType) {
    case 'wristsAtShoulderHeight':
      return validateWristsAtShoulderHeight(pose, params.toleranceY);
    
    case 'elbowsExtended':
      return validateElbowsExtended(pose, params.minAngleDeg);
    
    case 'armsRaised':
      return validateArmsRaised(pose, params.minShoulderHeightY);
    
    case 'rightArmRaised':
      return validateRightArmRaised(pose, params.minHeightX || params.minHeightY || 0.4, isFrontCamera);
    
    case 'leftArmRaised':
      return validateLeftArmRaised(pose, params.minHeightX || params.minHeightY || 0.4, isFrontCamera);
    
    case 'rightArmLowered':
      return validateRightArmLowered(pose, params.maxHeightX || 0.8, isFrontCamera);
    
    case 'leftArmLowered':
      return validateLeftArmLowered(pose, params.maxHeightX || 0.8, isFrontCamera);
    
    case 'uprightTorso':
      return validateUprightTorso(pose, params.maxLeanDeg);
    
    default:
      console.warn(`[PoseUtils] Unknown constraint type: ${constraintType}`);
      return false;
  }
}
