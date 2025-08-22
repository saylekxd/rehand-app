import { ExerciseConfig } from '../types/ai';

export const exerciseConfigs: Record<string, ExerciseConfig> = {
  neck_stretch: {
    id: 'neck_stretch',
    name: 'Rozciąganie szyi',
    trackedJoints: ['head', 'neck', 'spine'],
    angleIndicators: ['neckFlexion', 'neckRotation'],
    qualityMetrics: ['range_of_motion', 'movement_smoothness'],
    idealAngles: {
      neckFlexion: { min: 15, max: 45 },
      neckRotation: { min: -30, max: 30 }
    },
    repDetectionRules: {
      keyAngle: 'neckFlexion',
      minAngle: 15,
      maxAngle: 45
    }
  },
  
  shoulder_raise: {
    id: 'shoulder_raise',
    name: 'Podnoszenie ramion',
    trackedJoints: ['shoulder_left', 'shoulder_right', 'elbow_left', 'elbow_right', 'spine'],
    angleIndicators: ['leftShoulderAbduction', 'rightShoulderAbduction'],
    qualityMetrics: ['bilateral_symmetry', 'movement_speed', 'range_of_motion'],
    idealAngles: {
      leftShoulderAbduction: { min: 30, max: 90 },
      rightShoulderAbduction: { min: 30, max: 90 }
    },
    repDetectionRules: {
      keyAngle: 'leftShoulderAbduction',
      minAngle: 30,
      maxAngle: 90
    }
  },
  
  arm_raise: {
    id: 'arm_raise',
    name: 'Unoszenie rąk',
    trackedJoints: ['shoulder_left', 'shoulder_right', 'elbow_left', 'elbow_right'],
    angleIndicators: ['leftShoulderAbduction', 'rightShoulderAbduction', 'leftElbowFlexion', 'rightElbowFlexion'],
    qualityMetrics: ['bilateral_symmetry', 'range_of_motion'],
    idealAngles: {
      leftShoulderAbduction: { min: 45, max: 120 },
      rightShoulderAbduction: { min: 45, max: 120 },
      leftElbowFlexion: { min: 160, max: 180 },
      rightElbowFlexion: { min: 160, max: 180 }
    },
    repDetectionRules: {
      keyAngle: 'leftShoulderAbduction',
      minAngle: 45,
      maxAngle: 120
    }
  },
  
  squat: {
    id: 'squat',
    name: 'Przysiady',
    trackedJoints: ['hip_left', 'hip_right', 'knee_left', 'knee_right', 'ankle_left', 'ankle_right'],
    angleIndicators: ['leftKneeFlexion', 'rightKneeFlexion', 'leftHipFlexion', 'rightHipFlexion'],
    qualityMetrics: ['bilateral_symmetry', 'depth', 'knee_tracking'],
    idealAngles: {
      leftKneeFlexion: { min: 70, max: 90 },
      rightKneeFlexion: { min: 70, max: 90 },
      leftHipFlexion: { min: 80, max: 110 },
      rightHipFlexion: { min: 80, max: 110 }
    },
    repDetectionRules: {
      keyAngle: 'leftKneeFlexion',
      minAngle: 70,
      maxAngle: 90
    }
  },
  
  lunge: {
    id: 'lunge',
    name: 'Wykroki',
    trackedJoints: ['hip_left', 'hip_right', 'knee_left', 'knee_right', 'ankle_left', 'ankle_right'],
    angleIndicators: ['leftKneeFlexion', 'rightKneeFlexion', 'leftHipFlexion'],
    qualityMetrics: ['balance', 'depth', 'front_knee_tracking'],
    idealAngles: {
      leftKneeFlexion: { min: 80, max: 90 },  // Przednia noga
      rightKneeFlexion: { min: 120, max: 160 }, // Tylna noga
      leftHipFlexion: { min: 85, max: 95 }
    },
    repDetectionRules: {
      keyAngle: 'leftKneeFlexion',
      minAngle: 80,
      maxAngle: 90
    }
  }
};

/**
 * Zwraca konfigurację dla danego ćwiczenia
 */
export function getExerciseConfig(exerciseId: string): ExerciseConfig {
  return exerciseConfigs[exerciseId] || exerciseConfigs.neck_stretch;
}

/**
 * Zwraca listę dostępnych ćwiczeń
 */
export function getAvailableExercises(): ExerciseConfig[] {
  return Object.values(exerciseConfigs);
}

/**
 * Sprawdza czy dany typ ćwiczenia jest obsługiwany
 */
export function isExerciseSupported(exerciseId: string): boolean {
  return exerciseId in exerciseConfigs;
}