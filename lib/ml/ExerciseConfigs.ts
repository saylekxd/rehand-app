import { ExerciseType, ExerciseConfig } from './types';

export const ExerciseConfigs: Record<ExerciseType, ExerciseConfig> = {
  [ExerciseType.NECK_STRETCH]: {
    type: ExerciseType.NECK_STRETCH,
    keyJoints: ['nose', 'left_ear', 'right_ear', 'left_shoulder', 'right_shoulder'],
    criticalAngles: ['neck_flexion', 'neck_lateral'],
    commonErrorPatterns: ['headForwardPosture', 'asymmetricMovement', 'excessiveRange'],
    qualityFactors: {
      symmetry: 0.4,
      rangeOfMotion: 0.3,
      tempo: 0.2,
      alignment: 0.1
    },
    repDetectionCriteria: {
      primaryMovement: 'neck_flexion',
      threshold: 20, // degrees
      minDuration: 2 // seconds
    }
  },

  [ExerciseType.SHOULDER_ROLLS]: {
    type: ExerciseType.SHOULDER_ROLLS,
    keyJoints: ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow'],
    criticalAngles: ['shoulder_elevation', 'shoulder_protraction'],
    commonErrorPatterns: ['asymmetricMovement', 'limitedROM', 'improperTempo'],
    qualityFactors: {
      symmetry: 0.4,
      rangeOfMotion: 0.4,
      tempo: 0.1,
      alignment: 0.1
    },
    repDetectionCriteria: {
      primaryMovement: 'shoulder_elevation',
      threshold: 30,
      minDuration: 3
    }
  },

  [ExerciseType.ARM_CIRCLES]: {
    type: ExerciseType.ARM_CIRCLES,
    keyJoints: ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist'],
    criticalAngles: ['shoulder_flexion', 'shoulder_abduction'],
    commonErrorPatterns: ['asymmetricMovement', 'limitedROM', 'improperTempo'],
    qualityFactors: {
      symmetry: 0.35,
      rangeOfMotion: 0.35,
      tempo: 0.2,
      alignment: 0.1
    },
    repDetectionCriteria: {
      primaryMovement: 'shoulder_flexion',
      threshold: 90,
      minDuration: 4
    }
  },

  [ExerciseType.TORSO_TWIST]: {
    type: ExerciseType.TORSO_TWIST,
    keyJoints: ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'],
    criticalAngles: ['torso_rotation', 'hip_stability'],
    commonErrorPatterns: ['asymmetricMovement', 'limitedROM', 'hipMovement'],
    qualityFactors: {
      symmetry: 0.3,
      rangeOfMotion: 0.4,
      tempo: 0.2,
      alignment: 0.1
    },
    repDetectionCriteria: {
      primaryMovement: 'torso_rotation',
      threshold: 45,
      minDuration: 3
    }
  },

  [ExerciseType.LEG_RAISES]: {
    type: ExerciseType.LEG_RAISES,
    keyJoints: ['left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    criticalAngles: ['hip_flexion', 'knee_extension'],
    commonErrorPatterns: ['asymmetricMovement', 'limitedROM', 'kneeCompensation'],
    qualityFactors: {
      symmetry: 0.3,
      rangeOfMotion: 0.4,
      tempo: 0.2,
      alignment: 0.1
    },
    repDetectionCriteria: {
      primaryMovement: 'hip_flexion',
      threshold: 45,
      minDuration: 2
    }
  },

  [ExerciseType.ANKLE_PUMPS]: {
    type: ExerciseType.ANKLE_PUMPS,
    keyJoints: ['left_ankle', 'right_ankle', 'left_heel', 'right_heel', 'left_foot_index', 'right_foot_index'],
    criticalAngles: ['ankle_dorsiflexion', 'ankle_plantarflexion'],
    commonErrorPatterns: ['asymmetricMovement', 'limitedROM', 'improperTempo'],
    qualityFactors: {
      symmetry: 0.4,
      rangeOfMotion: 0.4,
      tempo: 0.15,
      alignment: 0.05
    },
    repDetectionCriteria: {
      primaryMovement: 'ankle_dorsiflexion',
      threshold: 15,
      minDuration: 1
    }
  },

  [ExerciseType.SQUATS]: {
    type: ExerciseType.SQUATS,
    keyJoints: ['left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    criticalAngles: ['knee_flexion', 'hip_flexion', 'ankle_dorsiflexion'],
    commonErrorPatterns: ['valgusKnee', 'excessiveForwardLean', 'asymmetricMovement', 'insufficientDepth'],
    qualityFactors: {
      symmetry: 0.25,
      rangeOfMotion: 0.35,
      tempo: 0.2,
      alignment: 0.2
    },
    repDetectionCriteria: {
      primaryMovement: 'knee_flexion',
      threshold: 90,
      minDuration: 3
    }
  },

  [ExerciseType.LUNGES]: {
    type: ExerciseType.LUNGES,
    keyJoints: ['left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    criticalAngles: ['front_knee_flexion', 'back_knee_flexion', 'hip_flexion'],
    commonErrorPatterns: ['asymmetricMovement', 'forwardKneeTravel', 'insufficientDepth', 'balanceIssues'],
    qualityFactors: {
      symmetry: 0.2, // Less important for lunges (asymmetric exercise)
      rangeOfMotion: 0.4,
      tempo: 0.2,
      alignment: 0.2
    },
    repDetectionCriteria: {
      primaryMovement: 'front_knee_flexion',
      threshold: 90,
      minDuration: 3
    }
  },

  [ExerciseType.GENERAL]: {
    type: ExerciseType.GENERAL,
    keyJoints: ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip', 'left_knee', 'right_knee'],
    criticalAngles: ['general_movement'],
    commonErrorPatterns: ['asymmetricMovement', 'limitedROM'],
    qualityFactors: {
      symmetry: 0.3,
      rangeOfMotion: 0.3,
      tempo: 0.2,
      alignment: 0.2
    },
    repDetectionCriteria: {
      primaryMovement: 'general_movement',
      threshold: 30,
      minDuration: 2
    }
  }
};

// Exercise-specific angle calculation helpers
export const AngleCalculators = {
  neckFlexion: (keyPoints: any[]) => {
    // Calculate neck flexion angle based on nose, ears, and shoulders
    // Implementation would use specific keypoint relationships
    return 0;
  },

  shoulderElevation: (keyPoints: any[]) => {
    // Calculate shoulder elevation angle
    return 0;
  },

  torsoRotation: (keyPoints: any[]) => {
    // Calculate torso rotation based on shoulder and hip positions
    return 0;
  },

  hipFlexion: (keyPoints: any[]) => {
    // Calculate hip flexion angle
    return 0;
  },

  ankleDorsiflexion: (keyPoints: any[]) => {
    // Calculate ankle dorsiflexion
    return 0;
  }
};

// Exercise-specific error detection
export const ErrorDetectors = {
  detectValgusKnee: (leftKnee: any, rightKnee: any, leftAnkle: any, rightAnkle: any) => {
    // Detect knee valgus (inward collapse)
    return 0.1;
  },

  detectForwardLean: (shoulders: any[], hips: any[]) => {
    // Detect excessive forward lean
    return 0.1;
  },

  detectHeadForwardPosture: (head: any, shoulders: any[]) => {
    // Detect head forward posture
    return 0.1;
  },

  detectAsymmetry: (leftSide: any[], rightSide: any[]) => {
    // Detect left-right asymmetry
    return 0.1;
  }
};