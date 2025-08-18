import { VisionOutput, KeyPoint, FeatureFrame, Movement, MovementPhase } from './types';

export class FeatureExtractor {
  private frameHistory: VisionOutput[] = [];
  private readonly HISTORY_SIZE = 90; // 3 seconds at 30fps
  private readonly ANGLE_SMOOTHING_WINDOW = 5;
  
  extractFeatures(visionOutput: VisionOutput): FeatureFrame {
    // Add to history
    this.frameHistory.push(visionOutput);
    if (this.frameHistory.length > this.HISTORY_SIZE) {
      this.frameHistory.shift();
    }

    // Calculate features
    const jointAngles = this.calculateJointAngles(visionOutput.keyPoints);
    const velocities = this.analyzeMovementVelocity(visionOutput.keyPoints);
    const rom = this.calculateROM(jointAngles);
    const symmetry = this.detectSymmetry(visionOutput.keyPoints);
    const tempo = this.calculateTempo();

    const featureFrame: FeatureFrame = {
      jointAngles,
      velocities,
      rom,
      symmetry,
      tempo,
      timestamp: visionOutput.timestamp
    };

    return featureFrame;
  }

  // Calculate joint angles using 3-point angle calculation
  calculateJointAngles(keyPoints: KeyPoint[]): Record<string, number> {
    const angles: Record<string, number> = {};
    
    try {
      // Left knee angle (hip -> knee -> ankle)
      const leftHip = this.findKeyPoint(keyPoints, 'left_hip');
      const leftKnee = this.findKeyPoint(keyPoints, 'left_knee');
      const leftAnkle = this.findKeyPoint(keyPoints, 'left_ankle');
      
      if (leftHip && leftKnee && leftAnkle) {
        angles.left_knee = this.calculateAngle(leftHip.position, leftKnee.position, leftAnkle.position);
      }

      // Right knee angle (hip -> knee -> ankle)  
      const rightHip = this.findKeyPoint(keyPoints, 'right_hip');
      const rightKnee = this.findKeyPoint(keyPoints, 'right_knee');
      const rightAnkle = this.findKeyPoint(keyPoints, 'right_ankle');
      
      if (rightHip && rightKnee && rightAnkle) {
        angles.right_knee = this.calculateAngle(rightHip.position, rightKnee.position, rightAnkle.position);
      }

      // Shoulder angles
      const leftShoulder = this.findKeyPoint(keyPoints, 'left_shoulder');
      const leftElbow = this.findKeyPoint(keyPoints, 'left_elbow');
      const leftWrist = this.findKeyPoint(keyPoints, 'left_wrist');
      
      if (leftShoulder && leftElbow && leftWrist) {
        angles.left_elbow = this.calculateAngle(leftShoulder.position, leftElbow.position, leftWrist.position);
      }

      const rightShoulder = this.findKeyPoint(keyPoints, 'right_shoulder');
      const rightElbow = this.findKeyPoint(keyPoints, 'right_elbow');
      const rightWrist = this.findKeyPoint(keyPoints, 'right_wrist');
      
      if (rightShoulder && rightElbow && rightWrist) {
        angles.right_elbow = this.calculateAngle(rightShoulder.position, rightElbow.position, rightWrist.position);
      }

      // Hip angles (torso -> hip -> thigh)
      if (leftShoulder && leftHip && leftKnee) {
        angles.left_hip = this.calculateAngle(leftShoulder.position, leftHip.position, leftKnee.position);
      }

      if (rightShoulder && rightHip && rightKnee) {
        angles.right_hip = this.calculateAngle(rightShoulder.position, rightHip.position, rightKnee.position);
      }

    } catch (error) {
      console.warn('Error calculating joint angles:', error);
    }

    return angles;
  }

  private calculateAngle(point1: {x: number, y: number, z?: number}, 
                        point2: {x: number, y: number, z?: number}, 
                        point3: {x: number, y: number, z?: number}): number {
    // Vectors from point2 to point1 and point2 to point3
    const vector1 = {
      x: point1.x - point2.x,
      y: point1.y - point2.y,
      z: (point1.z || 0) - (point2.z || 0)
    };
    
    const vector2 = {
      x: point3.x - point2.x,
      y: point3.y - point2.y,
      z: (point3.z || 0) - (point2.z || 0)
    };

    // Dot product and magnitudes
    const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y + vector1.z * vector2.z;
    const magnitude1 = Math.sqrt(vector1.x ** 2 + vector1.y ** 2 + vector1.z ** 2);
    const magnitude2 = Math.sqrt(vector2.x ** 2 + vector2.y ** 2 + vector2.z ** 2);

    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    // Angle in radians, convert to degrees
    const angleRad = Math.acos(Math.max(-1, Math.min(1, dotProduct / (magnitude1 * magnitude2))));
    return angleRad * (180 / Math.PI);
  }

  private findKeyPoint(keyPoints: KeyPoint[], name: string): KeyPoint | undefined {
    return keyPoints.find(kp => kp.name === name);
  }

  // Analyze movement velocity
  analyzeMovementVelocity(currentKeyPoints: KeyPoint[]): number[] {
    if (this.frameHistory.length < 2) return [];

    const previousFrame = this.frameHistory[this.frameHistory.length - 2];
    const velocities: number[] = [];

    currentKeyPoints.forEach(currentKP => {
      const previousKP = previousFrame.keyPoints.find(kp => kp.name === currentKP.name);
      if (previousKP) {
        // Calculate Euclidean distance
        const distance = Math.sqrt(
          Math.pow(currentKP.position.x - previousKP.position.x, 2) +
          Math.pow(currentKP.position.y - previousKP.position.y, 2) +
          Math.pow((currentKP.position.z || 0) - (previousKP.position.z || 0), 2)
        );

        // Convert to velocity (assuming 30fps)
        const timeDelta = 1/30; // seconds
        const velocity = distance / timeDelta;
        velocities.push(velocity);
      }
    });

    return velocities;
  }

  // Calculate Range of Motion
  calculateROM(currentAngles: Record<string, number>): Record<string, number> {
    const rom: Record<string, number> = {};
    
    // Need historical data to calculate ROM
    if (this.frameHistory.length < 30) return rom; // Need at least 1 second of data

    Object.keys(currentAngles).forEach(jointName => {
      const angleHistory = this.frameHistory
        .slice(-30) // Last 1 second
        .map(frame => {
          // Extract angles from stored frames (would need to calculate or store)
          const frameAngles = this.calculateJointAngles(frame.keyPoints);
          return frameAngles[jointName];
        })
        .filter(angle => angle !== undefined);

      if (angleHistory.length > 0) {
        const minAngle = Math.min(...angleHistory);
        const maxAngle = Math.max(...angleHistory);
        rom[jointName] = maxAngle - minAngle;
      }
    });

    return rom;
  }

  // Detect left-right symmetry
  detectSymmetry(keyPoints: KeyPoint[]): number {
    try {
      // Compare key symmetric joints
      const leftKnee = this.findKeyPoint(keyPoints, 'left_knee');
      const rightKnee = this.findKeyPoint(keyPoints, 'right_knee'); 
      const leftHip = this.findKeyPoint(keyPoints, 'left_hip');
      const rightHip = this.findKeyPoint(keyPoints, 'right_hip');

      if (!leftKnee || !rightKnee || !leftHip || !rightHip) return 0.5;

      // Calculate symmetry based on relative positions
      const leftKneeHeight = leftKnee.position.y;
      const rightKneeHeight = rightKnee.position.y;
      const leftHipHeight = leftHip.position.y;
      const rightHipHeight = rightHip.position.y;

      const kneeSymmetry = 1 - Math.abs(leftKneeHeight - rightKneeHeight);
      const hipSymmetry = 1 - Math.abs(leftHipHeight - rightHipHeight);

      return (kneeSymmetry + hipSymmetry) / 2;
    } catch (error) {
      console.warn('Error calculating symmetry:', error);
      return 0.5;
    }
  }

  // Calculate movement tempo
  calculateTempo(): number {
    if (this.frameHistory.length < 60) return 0; // Need at least 2 seconds

    // Analyze movement patterns over time
    const recentFrames = this.frameHistory.slice(-60);
    let movementChanges = 0;

    for (let i = 1; i < recentFrames.length; i++) {
      const currentFrame = recentFrames[i];
      const previousFrame = recentFrames[i - 1];
      
      // Detect significant movement
      let hasMovement = false;
      const threshold = 0.01; // Adjust based on testing
      
      for (const kp of currentFrame.keyPoints) {
        const prevKp = previousFrame.keyPoints.find(p => p.name === kp.name);
        if (prevKp) {
          const distance = Math.sqrt(
            Math.pow(kp.position.x - prevKp.position.x, 2) +
            Math.pow(kp.position.y - prevKp.position.y, 2)
          );
          
          if (distance > threshold) {
            hasMovement = true;
            break;
          }
        }
      }
      
      if (hasMovement) movementChanges++;
    }

    // Return tempo as movements per second
    return movementChanges / 2; // 2 seconds of data
  }

  // Detect movement phase
  detectMovementPhase(angles: Record<string, number>): MovementPhase {
    // Simple heuristic - would be replaced by ML model
    const kneeAngles = [angles.left_knee, angles.right_knee].filter(a => a !== undefined);
    
    if (kneeAngles.length === 0) {
      return { type: 'isometric', confidence: 0.3 };
    }

    const avgKneeAngle = kneeAngles.reduce((a, b) => a + b, 0) / kneeAngles.length;
    
    // Simple phase detection based on knee angle
    if (avgKneeAngle > 120) {
      return { type: 'eccentric', confidence: 0.7 };
    } else if (avgKneeAngle < 90) {
      return { type: 'concentric', confidence: 0.7 };
    } else {
      return { type: 'transition', confidence: 0.5 };
    }
  }

  getFrameHistory(): VisionOutput[] {
    return [...this.frameHistory];
  }

  clearHistory(): void {
    this.frameHistory = [];
  }
}