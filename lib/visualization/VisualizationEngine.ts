import { Dimensions } from 'react-native';
import { 
  OverlayConfiguration,
  OverlayState,
  OverlayPreferences,
  AngleVisualization,
  QualityIndicator,
  MovementGuide,
  ErrorHighlight,
  VisualizationColors,
  Point3D,
  Vector3D,
  ExerciseSpecificOverlay,
  OverlayMetrics
} from './types';
import { VisionOutput, FeatureFrame, KeyPoint } from '../vision/types';
import { MLModelOutput, ExerciseType } from '../ml/types';
import { ExerciseOverlayConfigs } from './ExerciseOverlayConfigs';

export class VisualizationEngine {
  private configuration: OverlayConfiguration;
  private preferences: OverlayPreferences;
  private currentState: OverlayState;
  private screenDimensions: { width: number; height: number };
  private frameRate = 30;
  private lastRenderTime = 0;
  private metrics: OverlayMetrics;
  private elementIdCounter = 0;

  constructor(
    config?: Partial<OverlayConfiguration>,
    preferences?: Partial<OverlayPreferences>
  ) {
    this.configuration = {
      showAngles: true,
      showQualityIndicators: true,
      showMovementGuides: true,
      showErrorHighlights: true,
      adaptiveVisibility: true,
      maxOverlayElements: 20,
      updateFrequency: 30,
      animationEnabled: true,
      debugMode: false,
      ...config
    };

    this.preferences = {
      detailLevel: 'standard',
      colorScheme: 'default',
      animationLevel: 'normal',
      autoHide: false,
      showLabels: true,
      showValues: false,
      opacity: 0.8,
      ...preferences
    };

    this.screenDimensions = Dimensions.get('window');
    this.currentState = this.getEmptyState();
    this.metrics = this.getEmptyMetrics();

    console.log('🎨 VisualizationEngine initialized');
  }

  async updateVisualization(
    visionOutput: VisionOutput,
    features: FeatureFrame,
    mlAnalysis: MLModelOutput,
    exerciseType: ExerciseType
  ): Promise<OverlayState> {
    const startTime = performance.now();
    
    try {
      // Check if we should update based on frame rate
      if (!this.shouldUpdate()) {
        return this.currentState;
      }

      // Get exercise-specific overlay configuration
      const exerciseConfig = ExerciseOverlayConfigs[exerciseType];

      // Clear previous state
      this.currentState = this.getEmptyState();

      // Generate visualizations based on configuration
      if (this.configuration.showAngles) {
        this.generateAngleVisualizations(visionOutput, features, exerciseConfig);
      }

      if (this.configuration.showQualityIndicators) {
        this.generateQualityIndicators(visionOutput, mlAnalysis, exerciseConfig);
      }

      if (this.configuration.showMovementGuides) {
        this.generateMovementGuides(visionOutput, features, exerciseConfig);
      }

      if (this.configuration.showErrorHighlights) {
        this.generateErrorHighlights(visionOutput, mlAnalysis, exerciseConfig);
      }

      // Apply adaptive visibility
      if (this.configuration.adaptiveVisibility) {
        this.applyAdaptiveVisibility();
      }

      // Limit number of overlay elements for performance
      this.limitOverlayElements();

      // Update timestamp
      this.currentState.timestamp = Date.now();

      // Update metrics
      const renderTime = performance.now() - startTime;
      this.updateMetrics(renderTime);

      this.lastRenderTime = startTime;
      return this.currentState;

    } catch (error) {
      console.error('Error updating visualization:', error);
      return this.currentState;
    }
  }

  private generateAngleVisualizations(
    visionOutput: VisionOutput,
    features: FeatureFrame,
    exerciseConfig: ExerciseSpecificOverlay
  ): void {
    if (!exerciseConfig) return;

    // Generate primary angles (always show)
    exerciseConfig.primaryAngles.forEach(angleName => {
      const angle = features.jointAngles[angleName];
      if (angle !== undefined) {
        const keyPoints = this.getAngleKeyPoints(visionOutput.keyPoints, angleName);
        if (keyPoints) {
          const angleViz = this.createAngleVisualization(
            angleName,
            angle,
            keyPoints,
            'primary'
          );
          this.currentState.angles.push(angleViz);
        }
      }
    });

    // Generate secondary angles if detail level allows
    if (this.preferences.detailLevel !== 'minimal' && this.currentState.angles.length < 8) {
      exerciseConfig.secondaryAngles.forEach(angleName => {
        const angle = features.jointAngles[angleName];
        if (angle !== undefined) {
          const keyPoints = this.getAngleKeyPoints(visionOutput.keyPoints, angleName);
          if (keyPoints) {
            const angleViz = this.createAngleVisualization(
              angleName,
              angle,
              keyPoints,
              'secondary'
            );
            this.currentState.angles.push(angleViz);
          }
        }
      });
    }
  }

  private generateQualityIndicators(
    visionOutput: VisionOutput,
    mlAnalysis: MLModelOutput,
    exerciseConfig: ExerciseSpecificOverlay
  ): void {
    // Overall quality indicator
    const overallIndicator = this.createQualityIndicator(
      this.getScreenCenter(),
      mlAnalysis.qualityScore,
      'overall'
    );
    this.currentState.qualityIndicators.push(overallIndicator);

    // Joint-specific quality indicators
    if (this.preferences.detailLevel === 'detailed' || this.preferences.detailLevel === 'expert') {
      exerciseConfig.qualityFocusAreas.forEach(areaName => {
        const jointPosition = this.findJointPosition(visionOutput.keyPoints, areaName);
        if (jointPosition) {
          // Calculate joint-specific quality (simplified)
          const jointQuality = this.calculateJointQuality(areaName, mlAnalysis);
          
          const indicator = this.createQualityIndicator(
            jointPosition,
            jointQuality,
            'joint',
            areaName
          );
          this.currentState.qualityIndicators.push(indicator);
        }
      });
    }
  }

  private generateMovementGuides(
    visionOutput: VisionOutput,
    features: FeatureFrame,
    exerciseConfig: ExerciseSpecificOverlay
  ): void {
    if (this.preferences.detailLevel === 'minimal') return;

    // Generate movement path guides based on exercise type
    exerciseConfig.movementPathGuides.forEach(guideName => {
      const guide = this.createMovementGuide(visionOutput, features, guideName);
      if (guide) {
        this.currentState.movementGuides.push(guide);
      }
    });

    // Add ROM indicators
    if (this.preferences.detailLevel === 'expert') {
      Object.entries(features.rom).forEach(([jointName, romValue]) => {
        const romGuide = this.createROMGuide(visionOutput, jointName, romValue);
        if (romGuide) {
          this.currentState.movementGuides.push(romGuide);
        }
      });
    }
  }

  private generateErrorHighlights(
    visionOutput: VisionOutput,
    mlAnalysis: MLModelOutput,
    exerciseConfig: ExerciseSpecificOverlay
  ): void {
    Object.entries(mlAnalysis.commonErrors).forEach(([errorType, probability]) => {
      if (probability > 0.5) {
        const severity = this.getErrorSeverity(probability);
        const affectedJoints = this.getErrorAffectedJoints(errorType, exerciseConfig);
        
        const errorHighlight: ErrorHighlight = {
          affectedJoints,
          errorType,
          severity,
          correctionHint: this.getErrorCorrectionHint(errorType),
          visualization: {
            color: VisualizationColors.errors[severity],
            animation: severity === 'high' ? 'urgent' : 'warning',
            duration: severity === 'high' ? 2000 : 1000
          }
        };

        // Add position if we can locate the error
        const errorPosition = this.getErrorPosition(visionOutput, errorType, affectedJoints);
        if (errorPosition) {
          errorHighlight.position = errorPosition;
        }

        this.currentState.errorHighlights.push(errorHighlight);
      }
    });
  }

  private createAngleVisualization(
    angleName: string,
    angle: number,
    keyPoints: { center: KeyPoint; point1: KeyPoint; point2: KeyPoint },
    priority: 'primary' | 'secondary'
  ): AngleVisualization {
    const idealRange = this.getIdealAngleRange(angleName);
    const status = this.getAngleStatus(angle, idealRange);
    
    return {
      joint: angleName,
      angle,
      idealRange,
      currentStatus: status,
      visualStyle: {
        color: this.getAngleColor(status),
        thickness: priority === 'primary' ? 3 : 2,
        opacity: this.preferences.opacity,
        animation: status === 'poor' ? 'warning' : 'static'
      },
      centerPoint: this.keyPointToPoint3D(keyPoints.center),
      startVector: this.calculateVector(keyPoints.center, keyPoints.point1),
      endVector: this.calculateVector(keyPoints.center, keyPoints.point2)
    };
  }

  private createQualityIndicator(
    position: Point3D,
    score: number,
    type: 'joint' | 'movement' | 'overall',
    label?: string
  ): QualityIndicator {
    return {
      position,
      score,
      type,
      size: type === 'overall' ? 40 : 30,
      color: this.getQualityColor(score),
      animation: score < 50 ? 'pulse' : 'none',
      label
    };
  }

  private createMovementGuide(
    visionOutput: VisionOutput,
    features: FeatureFrame,
    guideName: string
  ): MovementGuide | null {
    // This would create specific movement guides based on exercise type
    // For now, return a simple example
    const shoulder = this.findJointPosition(visionOutput.keyPoints, 'left_shoulder');
    const elbow = this.findJointPosition(visionOutput.keyPoints, 'left_elbow');
    
    if (shoulder && elbow) {
      return {
        from: shoulder,
        to: elbow,
        type: 'ideal-path',
        animation: 'flow',
        style: {
          color: VisualizationColors.guides.ideal,
          thickness: 2,
          opacity: 0.6,
          dashPattern: [5, 5]
        },
        label: guideName
      };
    }
    
    return null;
  }

  private createROMGuide(
    visionOutput: VisionOutput,
    jointName: string,
    romValue: number
  ): MovementGuide | null {
    const jointPosition = this.findJointPosition(visionOutput.keyPoints, jointName);
    if (!jointPosition) return null;

    // Create ROM range indicator
    return {
      from: jointPosition,
      to: { x: jointPosition.x, y: jointPosition.y - romValue, z: jointPosition.z },
      type: 'range-indicator',
      animation: 'glow',
      style: {
        color: romValue > 30 ? VisualizationColors.quality.good : VisualizationColors.quality.poor,
        thickness: 1,
        opacity: 0.4
      },
      label: `ROM: ${romValue.toFixed(0)}°`
    };
  }

  // Utility methods
  private shouldUpdate(): boolean {
    const now = performance.now();
    const interval = 1000 / this.configuration.updateFrequency;
    return now - this.lastRenderTime >= interval;
  }

  private applyAdaptiveVisibility(): void {
    // Hide less important elements if screen is crowded
    const totalElements = this.getTotalElements();
    
    if (totalElements > this.configuration.maxOverlayElements) {
      // Remove secondary angles first
      this.currentState.angles = this.currentState.angles.filter(a => 
        this.isHighPriorityAngle(a.joint)
      );
      
      // Reduce movement guides
      this.currentState.movementGuides = this.currentState.movementGuides.slice(0, 2);
    }
  }

  private limitOverlayElements(): void {
    const maxElements = this.configuration.maxOverlayElements;
    let totalElements = this.getTotalElements();

    // Priority order: errors > quality > angles > guides
    if (totalElements > maxElements) {
      const excessElements = totalElements - maxElements;
      
      // Remove guides first
      const guidesToRemove = Math.min(excessElements, this.currentState.movementGuides.length);
      this.currentState.movementGuides = this.currentState.movementGuides.slice(0, -guidesToRemove);
      totalElements -= guidesToRemove;
      
      // Then remove secondary angles
      if (totalElements > maxElements) {
        const anglesToRemove = Math.min(totalElements - maxElements, this.currentState.angles.length);
        this.currentState.angles = this.currentState.angles
          .filter(a => this.isHighPriorityAngle(a.joint))
          .slice(0, this.currentState.angles.length - anglesToRemove);
      }
    }
  }

  private getAngleKeyPoints(keyPoints: KeyPoint[], angleName: string) {
    // Map angle names to key point triplets
    const angleMap: Record<string, { center: string; point1: string; point2: string }> = {
      'left_knee': { center: 'left_knee', point1: 'left_hip', point2: 'left_ankle' },
      'right_knee': { center: 'right_knee', point1: 'right_hip', point2: 'right_ankle' },
      'left_elbow': { center: 'left_elbow', point1: 'left_shoulder', point2: 'left_wrist' },
      'right_elbow': { center: 'right_elbow', point1: 'right_shoulder', point2: 'right_wrist' },
      'left_hip': { center: 'left_hip', point1: 'left_shoulder', point2: 'left_knee' },
      'right_hip': { center: 'right_hip', point1: 'right_shoulder', point2: 'right_knee' }
    };

    const mapping = angleMap[angleName];
    if (!mapping) return null;

    const center = keyPoints.find(kp => kp.name === mapping.center);
    const point1 = keyPoints.find(kp => kp.name === mapping.point1);
    const point2 = keyPoints.find(kp => kp.name === mapping.point2);

    if (!center || !point1 || !point2) return null;
    
    return { center, point1, point2 };
  }

  private getIdealAngleRange(angleName: string): { min: number; max: number } {
    // Define ideal angle ranges for different joints
    const ranges: Record<string, { min: number; max: number }> = {
      'left_knee': { min: 160, max: 180 },
      'right_knee': { min: 160, max: 180 },
      'left_elbow': { min: 140, max: 180 },
      'right_elbow': { min: 140, max: 180 },
      'left_hip': { min: 160, max: 180 },
      'right_hip': { min: 160, max: 180 }
    };

    return ranges[angleName] || { min: 0, max: 180 };
  }

  private getAngleStatus(angle: number, idealRange: { min: number; max: number }): 'optimal' | 'acceptable' | 'poor' {
    if (angle >= idealRange.min && angle <= idealRange.max) {
      return 'optimal';
    } else if (angle >= idealRange.min - 20 && angle <= idealRange.max + 20) {
      return 'acceptable';
    } else {
      return 'poor';
    }
  }

  private getAngleColor(status: 'optimal' | 'acceptable' | 'poor'): string {
    switch (status) {
      case 'optimal': return VisualizationColors.angles.optimal;
      case 'acceptable': return VisualizationColors.angles.withinRange;
      case 'poor': return VisualizationColors.angles.overLimit;
      default: return VisualizationColors.angles.withinRange;
    }
  }

  private getQualityColor(score: number): string {
    if (score >= 85) return VisualizationColors.quality.excellent;
    if (score >= 70) return VisualizationColors.quality.good;
    if (score >= 50) return VisualizationColors.quality.acceptable;
    if (score >= 30) return VisualizationColors.quality.poor;
    return VisualizationColors.quality.critical;
  }

  private getErrorSeverity(probability: number): 'low' | 'medium' | 'high' {
    if (probability >= 0.8) return 'high';
    if (probability >= 0.6) return 'medium';
    return 'low';
  }

  private getErrorAffectedJoints(errorType: string, exerciseConfig: ExerciseSpecificOverlay): string[] {
    const errorJointMap: Record<string, string[]> = {
      'valgusKnee': ['left_knee', 'right_knee'],
      'asymmetricMovement': ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'],
      'headForwardPosture': ['nose', 'left_shoulder', 'right_shoulder'],
      'excessiveForwardLean': ['left_hip', 'right_hip', 'left_shoulder', 'right_shoulder'],
      'limitedROM': exerciseConfig.primaryAngles,
      'improperTempo': []
    };

    return errorJointMap[errorType] || [];
  }

  private getErrorCorrectionHint(errorType: string): string {
    const hints: Record<string, string> = {
      'valgusKnee': 'Keep knees aligned over feet',
      'asymmetricMovement': 'Match movement on both sides', 
      'headForwardPosture': 'Keep head over shoulders',
      'excessiveForwardLean': 'Maintain upright posture',
      'limitedROM': 'Increase range of motion',
      'improperTempo': 'Control movement speed'
    };

    return hints[errorType] || 'Focus on proper form';
  }

  private getErrorPosition(
    visionOutput: VisionOutput, 
    errorType: string, 
    affectedJoints: string[]
  ): Point3D | undefined {
    if (affectedJoints.length === 0) return undefined;

    // Find average position of affected joints
    const jointPositions = affectedJoints
      .map(jointName => this.findJointPosition(visionOutput.keyPoints, jointName))
      .filter(pos => pos !== null) as Point3D[];

    if (jointPositions.length === 0) return undefined;

    return {
      x: jointPositions.reduce((sum, pos) => sum + pos.x, 0) / jointPositions.length,
      y: jointPositions.reduce((sum, pos) => sum + pos.y, 0) / jointPositions.length,
      z: jointPositions.reduce((sum, pos) => sum + pos.z, 0) / jointPositions.length
    };
  }

  private calculateJointQuality(jointName: string, mlAnalysis: MLModelOutput): number {
    // Simplified joint quality calculation
    // In real implementation, this would be more sophisticated
    let quality = mlAnalysis.qualityScore;

    // Adjust based on errors affecting this joint
    Object.entries(mlAnalysis.commonErrors).forEach(([errorType, probability]) => {
      const affectedJoints = this.getErrorAffectedJoints(errorType, { 
        exerciseType: '', 
        primaryAngles: [], 
        secondaryAngles: [], 
        qualityFocusAreas: [], 
        commonErrorZones: [], 
        movementPathGuides: [],
        visualPriority: { angles: 1, quality: 1, guides: 1, errors: 1 }
      });
      
      if (affectedJoints.includes(jointName)) {
        quality -= probability * 30; // Reduce quality based on error probability
      }
    });

    return Math.max(0, Math.min(100, quality));
  }

  private keyPointToPoint3D(keyPoint: KeyPoint): Point3D {
    return {
      x: keyPoint.position.x * this.screenDimensions.width,
      y: keyPoint.position.y * this.screenDimensions.height,
      z: keyPoint.position.z || 0
    };
  }

  private calculateVector(center: KeyPoint, point: KeyPoint): Vector3D {
    const centerPos = this.keyPointToPoint3D(center);
    const pointPos = this.keyPointToPoint3D(point);
    
    return {
      x: pointPos.x - centerPos.x,
      y: pointPos.y - centerPos.y,
      z: pointPos.z - centerPos.z
    };
  }

  private findJointPosition(keyPoints: KeyPoint[], jointName: string): Point3D | null {
    const joint = keyPoints.find(kp => kp.name === jointName);
    if (!joint) return null;
    
    return this.keyPointToPoint3D(joint);
  }

  private getScreenCenter(): Point3D {
    return {
      x: this.screenDimensions.width / 2,
      y: this.screenDimensions.height / 2,
      z: 0
    };
  }

  private getTotalElements(): number {
    return this.currentState.angles.length +
           this.currentState.qualityIndicators.length +
           this.currentState.movementGuides.length +
           this.currentState.errorHighlights.length;
  }

  private isHighPriorityAngle(angleName: string): boolean {
    const highPriorityAngles = ['left_knee', 'right_knee', 'left_hip', 'right_hip'];
    return highPriorityAngles.includes(angleName);
  }

  private getEmptyState(): OverlayState {
    return {
      angles: [],
      qualityIndicators: [],
      movementGuides: [],
      errorHighlights: [],
      performance: {
        renderFPS: 0,
        droppedFrames: 0,
        memoryUsage: 0
      },
      timestamp: Date.now()
    };
  }

  private getEmptyMetrics(): OverlayMetrics {
    return {
      totalElements: 0,
      visibleElements: 0,
      renderTime: 0,
      memoryUsage: 0,
      droppedFrames: 0,
      lastUpdate: Date.now()
    };
  }

  private updateMetrics(renderTime: number): void {
    this.metrics = {
      totalElements: this.getTotalElements(),
      visibleElements: this.getTotalElements(), // Simplified
      renderTime,
      memoryUsage: this.getMemoryEstimate(),
      droppedFrames: renderTime > 16.67 ? this.metrics.droppedFrames + 1 : this.metrics.droppedFrames,
      lastUpdate: Date.now()
    };

    this.currentState.performance = {
      renderFPS: Math.round(1000 / renderTime),
      droppedFrames: this.metrics.droppedFrames,
      memoryUsage: this.metrics.memoryUsage
    };
  }

  private getMemoryEstimate(): number {
    // Rough estimate of overlay memory usage
    return this.getTotalElements() * 0.1; // ~0.1MB per element
  }

  // Public methods
  updateConfiguration(config: Partial<OverlayConfiguration>): void {
    this.configuration = { ...this.configuration, ...config };
  }

  updatePreferences(preferences: Partial<OverlayPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
  }

  getCurrentState(): OverlayState {
    return this.currentState;
  }

  getMetrics(): OverlayMetrics {
    return this.metrics;
  }

  getConfiguration(): OverlayConfiguration {
    return this.configuration;
  }

  getPreferences(): OverlayPreferences {
    return this.preferences;
  }
}
