import { ExerciseType } from '../ml/types';
import { ExerciseSpecificOverlay } from './types';

export const ExerciseOverlayConfigs: Record<ExerciseType, ExerciseSpecificOverlay> = {
  [ExerciseType.NECK_STRETCH]: {
    exerciseType: 'neck_stretch',
    primaryAngles: ['neck_flexion', 'neck_lateral'],
    secondaryAngles: ['left_shoulder', 'right_shoulder'],
    qualityFocusAreas: ['nose', 'left_ear', 'right_ear'],
    commonErrorZones: ['nose', 'left_shoulder', 'right_shoulder'],
    movementPathGuides: ['head_movement', 'shoulder_stability'],
    visualPriority: {
      angles: 9,
      quality: 8,
      guides: 6,
      errors: 10
    }
  },

  [ExerciseType.SHOULDER_ROLLS]: {
    exerciseType: 'shoulder_rolls',
    primaryAngles: ['left_shoulder', 'right_shoulder'],
    secondaryAngles: ['left_elbow', 'right_elbow'],
    qualityFocusAreas: ['left_shoulder', 'right_shoulder'],
    commonErrorZones: ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow'],
    movementPathGuides: ['shoulder_circle', 'symmetry_line'],
    visualPriority: {
      angles: 8,
      quality: 7,
      guides: 8,
      errors: 9
    }
  },

  [ExerciseType.ARM_CIRCLES]: {
    exerciseType: 'arm_circles',
    primaryAngles: ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow'],
    secondaryAngles: ['left_wrist', 'right_wrist'],
    qualityFocusAreas: ['left_shoulder', 'right_shoulder', 'left_wrist', 'right_wrist'],
    commonErrorZones: ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow'],
    movementPathGuides: ['arm_circle_path', 'symmetry_guide', 'range_indicator'],
    visualPriority: {
      angles: 8,
      quality: 6,
      guides: 9,
      errors: 8
    }
  },

  [ExerciseType.TORSO_TWIST]: {
    exerciseType: 'torso_twist',
    primaryAngles: ['torso_rotation'],
    secondaryAngles: ['left_hip', 'right_hip', 'left_shoulder', 'right_shoulder'],
    qualityFocusAreas: ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'],
    commonErrorZones: ['left_hip', 'right_hip', 'left_shoulder', 'right_shoulder'],
    movementPathGuides: ['rotation_axis', 'hip_stability', 'shoulder_alignment'],
    visualPriority: {
      angles: 9,
      quality: 7,
      guides: 7,
      errors: 9
    }
  },

  [ExerciseType.LEG_RAISES]: {
    exerciseType: 'leg_raises',
    primaryAngles: ['left_hip', 'right_hip', 'left_knee', 'right_knee'],
    secondaryAngles: ['left_ankle', 'right_ankle'],
    qualityFocusAreas: ['left_hip', 'right_hip', 'left_knee', 'right_knee'],
    commonErrorZones: ['left_hip', 'right_hip', 'left_knee', 'right_knee'],
    movementPathGuides: ['leg_lift_path', 'hip_alignment', 'knee_control'],
    visualPriority: {
      angles: 9,
      quality: 8,
      guides: 7,
      errors: 8
    }
  },

  [ExerciseType.ANKLE_PUMPS]: {
    exerciseType: 'ankle_pumps',
    primaryAngles: ['left_ankle', 'right_ankle'],
    secondaryAngles: ['left_knee', 'right_knee'],
    qualityFocusAreas: ['left_ankle', 'right_ankle', 'left_foot_index', 'right_foot_index'],
    commonErrorZones: ['left_ankle', 'right_ankle'],
    movementPathGuides: ['ankle_flex_path', 'symmetry_guide'],
    visualPriority: {
      angles: 10,
      quality: 7,
      guides: 8,
      errors: 8
    }
  },

  [ExerciseType.SQUATS]: {
    exerciseType: 'squats',
    primaryAngles: ['left_knee', 'right_knee', 'left_hip', 'right_hip'],
    secondaryAngles: ['left_ankle', 'right_ankle'],
    qualityFocusAreas: ['left_knee', 'right_knee', 'left_hip', 'right_hip'],
    commonErrorZones: ['left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    movementPathGuides: ['squat_depth', 'knee_alignment', 'hip_hinge'],
    visualPriority: {
      angles: 10,
      quality: 9,
      guides: 8,
      errors: 10
    }
  },

  [ExerciseType.LUNGES]: {
    exerciseType: 'lunges',
    primaryAngles: ['left_knee', 'right_knee', 'left_hip', 'right_hip'],
    secondaryAngles: ['left_ankle', 'right_ankle'],
    qualityFocusAreas: ['left_knee', 'right_knee', 'left_hip', 'right_hip'],
    commonErrorZones: ['left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    movementPathGuides: ['lunge_depth', 'knee_tracking', 'balance_line'],
    visualPriority: {
      angles: 9,
      quality: 8,
      guides: 9,
      errors: 10
    }
  },

  [ExerciseType.GENERAL]: {
    exerciseType: 'general',
    primaryAngles: ['left_knee', 'right_knee', 'left_elbow', 'right_elbow'],
    secondaryAngles: ['left_hip', 'right_hip', 'left_shoulder', 'right_shoulder'],
    qualityFocusAreas: ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'],
    commonErrorZones: ['left_knee', 'right_knee', 'left_shoulder', 'right_shoulder'],
    movementPathGuides: ['symmetry_guide', 'posture_line'],
    visualPriority: {
      angles: 7,
      quality: 7,
      guides: 6,
      errors: 8
    }
  }
};

// Exercise-specific angle configurations
export const AngleConfigurations = {
  neck_flexion: {
    name: 'Neck Flexion',
    keyPoints: ['nose', 'left_ear', 'left_shoulder'],
    idealRange: { min: -20, max: 45 },
    displayPosition: 'top-center',
    priority: 'high'
  },
  
  neck_lateral: {
    name: 'Neck Lateral Bend',
    keyPoints: ['left_ear', 'nose', 'right_ear'],
    idealRange: { min: -30, max: 30 },
    displayPosition: 'top-center',
    priority: 'high'
  },

  torso_rotation: {
    name: 'Torso Rotation',
    keyPoints: ['left_shoulder', 'left_hip', 'right_hip'],
    idealRange: { min: -45, max: 45 },
    displayPosition: 'center',
    priority: 'high'
  },

  left_knee: {
    name: 'Left Knee',
    keyPoints: ['left_hip', 'left_knee', 'left_ankle'],
    idealRange: { min: 70, max: 180 },
    displayPosition: 'left-lower',
    priority: 'high'
  },

  right_knee: {
    name: 'Right Knee',
    keyPoints: ['right_hip', 'right_knee', 'right_ankle'],
    idealRange: { min: 70, max: 180 },
    displayPosition: 'right-lower',
    priority: 'high'
  },

  left_hip: {
    name: 'Left Hip',
    keyPoints: ['left_shoulder', 'left_hip', 'left_knee'],
    idealRange: { min: 160, max: 180 },
    displayPosition: 'left-center',
    priority: 'medium'
  },

  right_hip: {
    name: 'Right Hip',
    keyPoints: ['right_shoulder', 'right_hip', 'right_knee'],
    idealRange: { min: 160, max: 180 },
    displayPosition: 'right-center',
    priority: 'medium'
  },

  left_elbow: {
    name: 'Left Elbow',
    keyPoints: ['left_shoulder', 'left_elbow', 'left_wrist'],
    idealRange: { min: 30, max: 180 },
    displayPosition: 'left-upper',
    priority: 'medium'
  },

  right_elbow: {
    name: 'Right Elbow',
    keyPoints: ['right_shoulder', 'right_elbow', 'right_wrist'],
    idealRange: { min: 30, max: 180 },
    displayPosition: 'right-upper',
    priority: 'medium'
  },

  left_shoulder: {
    name: 'Left Shoulder',
    keyPoints: ['left_elbow', 'left_shoulder', 'right_shoulder'],
    idealRange: { min: 160, max: 180 },
    displayPosition: 'left-upper',
    priority: 'medium'
  },

  right_shoulder: {
    name: 'Right Shoulder',
    keyPoints: ['right_elbow', 'right_shoulder', 'left_shoulder'],
    idealRange: { min: 160, max: 180 },
    displayPosition: 'right-upper',
    priority: 'medium'
  },

  left_ankle: {
    name: 'Left Ankle',
    keyPoints: ['left_knee', 'left_ankle', 'left_foot_index'],
    idealRange: { min: 70, max: 110 },
    displayPosition: 'left-lower',
    priority: 'low'
  },

  right_ankle: {
    name: 'Right Ankle',
    keyPoints: ['right_knee', 'right_ankle', 'right_foot_index'],
    idealRange: { min: 70, max: 110 },
    displayPosition: 'right-lower',
    priority: 'low'
  }
};

// Movement guide configurations
export const MovementGuideConfigurations = {
  shoulder_circle: {
    name: 'Shoulder Circle Path',
    description: 'Ideal circular motion for shoulder rolls',
    type: 'circular',
    radius: 50,
    color: '#2196F3'
  },

  arm_circle_path: {
    name: 'Arm Circle Path',
    description: 'Full range circular motion for arms',
    type: 'circular',
    radius: 80,
    color: '#2196F3'
  },

  squat_depth: {
    name: 'Squat Depth Guide',
    description: 'Ideal depth for squat movement',
    type: 'horizontal_line',
    threshold: 90, // degrees
    color: '#4CAF50'
  },

  lunge_depth: {
    name: 'Lunge Depth Guide',
    description: 'Proper lunge depth indicator',
    type: 'vertical_line',
    threshold: 90,
    color: '#4CAF50'
  },

  symmetry_line: {
    name: 'Symmetry Guide',
    description: 'Center line for symmetrical movements',
    type: 'vertical_line',
    color: '#FF9800'
  },

  posture_line: {
    name: 'Posture Alignment',
    description: 'Proper posture alignment guide',
    type: 'vertical_line',
    color: '#9C27B0'
  },

  rotation_axis: {
    name: 'Rotation Axis',
    description: 'Central axis for rotational movements',
    type: 'vertical_line',
    color: '#E91E63'
  },

  hip_alignment: {
    name: 'Hip Alignment',
    description: 'Proper hip alignment indicator',
    type: 'horizontal_line',
    color: '#607D8B'
  },

  knee_tracking: {
    name: 'Knee Tracking',
    description: 'Proper knee tracking path',
    type: 'arrow',
    color: '#FF5722'
  },

  balance_line: {
    name: 'Balance Reference',
    description: 'Balance and stability reference line',
    type: 'cross',
    color: '#795548'
  }
};

// Error zone configurations
export const ErrorZoneConfigurations = {
  valgus_knee: {
    name: 'Knee Valgus Zone',
    description: 'Area to watch for knee inward collapse',
    affectedJoints: ['left_knee', 'right_knee'],
    warningColor: '#FF9800',
    errorColor: '#F44336',
    shape: 'circle',
    size: 'medium'
  },

  forward_head: {
    name: 'Forward Head Posture',
    description: 'Head position relative to shoulders',
    affectedJoints: ['nose', 'left_ear', 'right_ear'],
    warningColor: '#FF9800',
    errorColor: '#F44336',
    shape: 'oval',
    size: 'small'
  },

  asymmetric_movement: {
    name: 'Movement Asymmetry',
    description: 'Left-right movement imbalance',
    affectedJoints: ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'],
    warningColor: '#FF9800',
    errorColor: '#F44336',
    shape: 'highlight',
    size: 'large'
  },

  limited_rom: {
    name: 'Limited Range of Motion',
    description: 'Insufficient movement range',
    affectedJoints: [], // Dynamic based on exercise
    warningColor: '#FF9800',
    errorColor: '#F44336',
    shape: 'arc',
    size: 'medium'
  },

  improper_tempo: {
    name: 'Tempo Issue',
    description: 'Movement too fast or too slow',
    affectedJoints: [], // Global indicator
    warningColor: '#FF9800',
    errorColor: '#F44336',
    shape: 'pulse',
    size: 'small'
  }
};

// Quality indicator positions for different exercises
export const QualityIndicatorPositions = {
  [ExerciseType.NECK_STRETCH]: {
    overall: { x: 0.5, y: 0.1 }, // Top center
    joint: {
      'nose': { x: 0.5, y: 0.15 },
      'left_ear': { x: 0.4, y: 0.12 },
      'right_ear': { x: 0.6, y: 0.12 }
    }
  },

  [ExerciseType.SQUATS]: {
    overall: { x: 0.5, y: 0.1 }, // Top center
    joint: {
      'left_knee': { x: 0.3, y: 0.7 },
      'right_knee': { x: 0.7, y: 0.7 },
      'left_hip': { x: 0.35, y: 0.5 },
      'right_hip': { x: 0.65, y: 0.5 }
    }
  },

  [ExerciseType.SHOULDER_ROLLS]: {
    overall: { x: 0.5, y: 0.1 },
    joint: {
      'left_shoulder': { x: 0.25, y: 0.3 },
      'right_shoulder': { x: 0.75, y: 0.3 }
    }
  },

  // Default positions for other exercises
  [ExerciseType.ARM_CIRCLES]: {
    overall: { x: 0.5, y: 0.1 },
    joint: {}
  },

  [ExerciseType.TORSO_TWIST]: {
    overall: { x: 0.5, y: 0.1 },
    joint: {}
  },

  [ExerciseType.LEG_RAISES]: {
    overall: { x: 0.5, y: 0.1 },
    joint: {}
  },

  [ExerciseType.ANKLE_PUMPS]: {
    overall: { x: 0.5, y: 0.1 },
    joint: {}
  },

  [ExerciseType.LUNGES]: {
    overall: { x: 0.5, y: 0.1 },
    joint: {}
  },

  [ExerciseType.GENERAL]: {
    overall: { x: 0.5, y: 0.1 },
    joint: {}
  }
};