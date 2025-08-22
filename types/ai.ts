// TypeScript interfaces for AI Exercise Analysis System

export interface KeyPoint {
  name: string;
  position: { x: number; y: number; z?: number };
  confidence: number;
}

export interface VisionOutput {
  keyPoints: KeyPoint[];
  timestamp: number;
  frameSize: { width: number; height: number };
}

export interface FeatureFrame {
  jointAngles: Record<string, number>;
  velocities: number[];
  rangeOfMotion: Record<string, number>;
  symmetryScore: number;
  timestamp: number;
}

export interface MLModelOutput {
  movementPhase: {
    eccentric: number;
    concentric: number;
    isometric: number;
    transition: number;
  };
  repEndProbability: number;
  commonErrors: {
    valgusKnee: number;
    excessiveForwardLean: number;
    asymmetricMovement: number;
    limitedROM: number;
  };
  qualityScore: number;
  confidence: number;
}

export interface DeviceCapabilities {
  hasVisionCamera: boolean;
  hasPoseDetection: boolean;
  hasMLKit: boolean;
  canRunLocalAnalysis: boolean;
  tier: 'basic' | 'enhanced' | 'pro';
}

export interface ExerciseAnalysisInput {
  sessionId: string;
  exerciseType: string;
  movementData: {
    jointAngles: Record<string, number[]>;
    repCount: number;
    movementQuality: number[];
    detectedErrors: string[];
    symmetryScores: number[];
    rangeOfMotion: Record<string, number>;
  };
  sessionMetrics: {
    totalDuration: number;
    avgQuality: number;
    completionRate: number;
  };
}

export interface CloudAnalysisResponse {
  overallAssessment: string;
  technicalFeedback: string;
  motivationalMessage: string;
  nextSessionTips: string;
  concernFlags?: string;
  score: number;
  suggestions: string[];
}

export interface AngleVisualization {
  joint: string;
  angle: number;
  idealRange: { min: number; max: number };
  currentStatus: 'optimal' | 'acceptable' | 'poor';
  visualStyle: {
    color: string;
    thickness: number;
    opacity: number;
    animation: 'static' | 'pulse' | 'warning';
  };
}

export interface ExerciseConfig {
  id: string;
  name: string;
  trackedJoints: string[];
  angleIndicators: string[];
  qualityMetrics: string[];
  idealAngles: Record<string, { min: number; max: number }>;
  repDetectionRules: {
    keyAngle: string;
    minAngle: number;
    maxAngle: number;
  };
}

export interface AnalysisSession {
  sessionId: string;
  exerciseType: string;
  startTime: number;
  endTime?: number;
  frames: FeatureFrame[];
  detectedReps: number;
  averageQuality: number;
  analysis?: CloudAnalysisResponse;
}