// 3D Visualization Types

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface AngleVisualization {
  joint: string;
  angle: number;
  idealRange: { min: number; max: number };
  currentStatus: 'optimal' | 'acceptable' | 'poor';
  visualStyle: {
    color: string;          // Green/Yellow/Red based on quality
    thickness: number;      // Line thickness
    opacity: number;        // Transparency
    animation: 'static' | 'pulse' | 'warning';
  };
  centerPoint: Point3D;
  startVector: Vector3D;
  endVector: Vector3D;
}

export interface QualityIndicator {
  position: Point3D;
  score: number;
  type: 'joint' | 'movement' | 'overall';
  size: number;
  color: string;
  animation: 'none' | 'pulse' | 'glow';
  label?: string;
}

export interface MovementGuide {
  from: Point3D;
  to: Point3D;
  type: 'ideal-path' | 'correction-hint' | 'range-indicator';
  animation: 'arrow' | 'dotted-line' | 'glow' | 'flow';
  style: {
    color: string;
    thickness: number;
    opacity: number;
    dashPattern?: number[];
  };
  label?: string;
}

export interface ErrorHighlight {
  affectedJoints: string[];
  errorType: string;
  severity: 'low' | 'medium' | 'high';
  correctionHint?: string;
  visualization: {
    color: string;
    animation: 'highlight' | 'warning' | 'urgent';
    duration: number;
  };
  position?: Point3D;
}

export interface OverlayConfiguration {
  showAngles: boolean;
  showQualityIndicators: boolean;
  showMovementGuides: boolean;
  showErrorHighlights: boolean;
  adaptiveVisibility: boolean;
  maxOverlayElements: number;
  updateFrequency: number; // fps
  animationEnabled: boolean;
  debugMode: boolean;
}

export interface OverlayState {
  angles: AngleVisualization[];
  qualityIndicators: QualityIndicator[];
  movementGuides: MovementGuide[];
  errorHighlights: ErrorHighlight[];
  performance: {
    renderFPS: number;
    droppedFrames: number;
    memoryUsage: number;
  };
  timestamp: number;
}

export interface ExerciseSpecificOverlay {
  exerciseType: string;
  primaryAngles: string[];      // Most important angles to show
  secondaryAngles: string[];    // Show only if screen space allows
  qualityFocusAreas: string[];  // Where to place quality indicators
  commonErrorZones: string[];   // Areas to highlight for errors
  movementPathGuides: string[]; // Show ideal movement paths
  visualPriority: {
    angles: number;           // 1-10 priority
    quality: number;
    guides: number;
    errors: number;
  };
}

export interface OverlayPreferences {
  detailLevel: 'minimal' | 'standard' | 'detailed' | 'expert';
  colorScheme: 'default' | 'high-contrast' | 'colorblind-friendly';
  animationLevel: 'none' | 'subtle' | 'normal' | 'enhanced';
  autoHide: boolean;        // Hide overlay when not needed
  showLabels: boolean;
  showValues: boolean;      // Show numerical angle values
  opacity: number;          // Overall overlay opacity 0-1
}

export interface VisualizationLayer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  zIndex: number;
  elements: OverlayElement[];
}

export interface OverlayElement {
  id: string;
  type: 'angle' | 'quality' | 'guide' | 'error' | 'text' | 'shape';
  position: Point3D;
  properties: any;
  style: {
    color: string;
    size: number;
    opacity: number;
  };
  animation?: {
    type: string;
    duration: number;
    easing: string;
  };
  lifespan?: number;  // Auto-remove after X milliseconds
}

// Color schemes for different statuses
export const VisualizationColors = {
  quality: {
    excellent: '#4CAF50',   // Green
    good: '#8BC34A',        // Light Green  
    acceptable: '#FFC107',  // Yellow
    poor: '#FF5722',        // Orange
    critical: '#F44336'     // Red
  },
  angles: {
    optimal: '#4CAF50',
    withinRange: '#8BC34A',
    nearLimit: '#FF9800',
    overLimit: '#F44336'
  },
  errors: {
    low: '#FF9800',         // Orange
    medium: '#FF5722',      // Deep Orange
    high: '#F44336'         // Red
  },
  guides: {
    ideal: '#2196F3',       // Blue
    correction: '#9C27B0',  // Purple
    warning: '#FF9800'      // Orange
  }
};

// Animation presets
export const AnimationPresets = {
  pulse: {
    type: 'scale',
    duration: 1000,
    easing: 'ease-in-out',
    repeat: true
  },
  warning: {
    type: 'flash',
    duration: 500,
    easing: 'linear',
    repeat: true
  },
  glow: {
    type: 'opacity',
    duration: 2000,
    easing: 'ease-in-out',
    repeat: true
  },
  slideIn: {
    type: 'position',
    duration: 300,
    easing: 'ease-out',
    repeat: false
  }
};

export interface OverlayMetrics {
  totalElements: number;
  visibleElements: number;
  renderTime: number;
  memoryUsage: number;
  droppedFrames: number;
  lastUpdate: number;
}
