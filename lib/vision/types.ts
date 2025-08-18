// Vision Layer Types
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
  rom: Record<string, number>;
  symmetry: number;
  tempo: number;
  timestamp: number;
}

export interface MovementPhase {
  type: 'eccentric' | 'concentric' | 'isometric' | 'transition';
  confidence: number;
}

export interface Movement {
  phase: MovementPhase;
  timestamp: number;
  keyPoints: KeyPoint[];
}