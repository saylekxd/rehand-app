// ML Model Types for Exercise Analysis

export interface MLModelInput {
  // Time-series window (e.g., last 60 frames = 2 seconds at 30fps)
  angleSequence: number[][];     // [timestamp][joint_angles]
  velocitySequence: number[][];  // [timestamp][velocities] 
  romSequence: number[][];       // [timestamp][rom_values]
  exerciseType: number;          // one-hot encoded exercise ID
}

export interface MLModelOutput {
  movementPhase: {
    eccentric: number;    // 0-1 probability
    concentric: number;   // 0-1 probability
    isometric: number;    // 0-1 probability
    transition: number;   // 0-1 probability
  };
  repEndProbability: number;      // 0-1 is this rep end?
  commonErrors: {
    valgusKnee: number;          // 0-1 probability
    excessiveForwardLean: number; // 0-1 probability
    asymmetricMovement: number;   // 0-1 probability
    limitedROM: number;          // 0-1 probability
    improperTempo: number;       // 0-1 probability
    insufficientDepth: number;   // 0-1 probability (for squats)
    headForwardPosture: number;  // 0-1 probability (for neck exercises)
  };
  qualityScore: number;          // 0-100 overall movement quality
  confidence: number;            // 0-1 model confidence
  timestamp: number;
}

export interface TCNArchitecture {
  inputSize: number;        // features per timestamp
  sequenceLength: number;   // time window (e.g., 60 frames)
  dilatedConvLayers: 4;     // temporal convolution layers
  residualBlocks: 3;        // skip connections
  outputClasses: {
    phases: 4;              // movement phases
    errors: 7;              // common error types  
    quality: 1;             // regression output
    repEnd: 1;              // binary classification
  };
}

export interface ExerciseMLModel {
  modelId: string;
  exerciseType: string;
  version: string;
  architecture: TCNArchitecture;
  inputPreprocessing: {
    normalizeAngles: boolean;
    smoothingWindow: number;
    outlierRemoval: boolean;
  };
  outputPostprocessing: {
    confidenceThreshold: number;
    temporalSmoothing: boolean;
    movingAverageWindow: number;
  };
}

export interface TrainingDataPoint {
  exerciseId: string;
  userId: string;
  features: MLModelInput;
  groundTruth: {
    phase: 'eccentric' | 'concentric' | 'isometric' | 'transition';
    isRepEnd: boolean;
    errors: string[];
    qualityScore: number;
    expertAnnotation: string;
  };
  metadata: {
    timestamp: number;
    deviceTier: 'basic' | 'enhanced' | 'pro' | 'ultra';
    conditions: string; // lighting, clothing, environment
  };
}

export interface ModelPerformanceMetrics {
  repDetectionAccuracy: number;    // vs manual counting
  phaseDetectionAccuracy: number;  // vs expert annotation
  errorDetectionPrecision: number; // false positive rate
  errorDetectionRecall: number;    // false negative rate
  qualityScoringCorrelation: number; // vs physiotherapist scores
  latencyBenchmark: number;        // inference time in ms
  memoryUsage: number;             // MB during inference
}

// Supported Exercise Types
export enum ExerciseType {
  NECK_STRETCH = 'neck_stretch',
  SHOULDER_ROLLS = 'shoulder_rolls', 
  ARM_CIRCLES = 'arm_circles',
  TORSO_TWIST = 'torso_twist',
  LEG_RAISES = 'leg_raises',
  ANKLE_PUMPS = 'ankle_pumps',
  SQUATS = 'squats',
  LUNGES = 'lunges',
  GENERAL = 'general'
}

export interface ExerciseConfig {
  type: ExerciseType;
  keyJoints: string[];              // Primary joints to track
  criticalAngles: string[];         // Most important angles for this exercise
  commonErrorPatterns: string[];    // Typical mistakes
  qualityFactors: {
    symmetry: number;               // Weight 0-1
    rangeOfMotion: number;          // Weight 0-1
    tempo: number;                  // Weight 0-1
    alignment: number;              // Weight 0-1
  };
  repDetectionCriteria: {
    primaryMovement: string;        // Which joint/angle indicates rep completion
    threshold: number;              // Angle threshold for rep detection
    minDuration: number;            // Minimum time for valid rep (seconds)
  };
}
