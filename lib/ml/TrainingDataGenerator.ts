import { TrainingDataPoint, ExerciseType, MLModelInput } from './types';
import { ExerciseConfigs } from './ExerciseConfigs';

export class TrainingDataGenerator {
  
  static generateSyntheticData(
    exerciseType: ExerciseType,
    numSamples: number = 1000
  ): TrainingDataPoint[] {
    console.log(`🎯 Generating ${numSamples} synthetic samples for ${exerciseType}`);
    
    const trainingData: TrainingDataPoint[] = [];
    const exerciseConfig = ExerciseConfigs[exerciseType];
    
    for (let i = 0; i < numSamples; i++) {
      const dataPoint = this.generateSingleSample(exerciseType, exerciseConfig);
      trainingData.push(dataPoint);
    }
    
    console.log(`✅ Generated ${trainingData.length} training samples`);
    return trainingData;
  }

  private static generateSingleSample(
    exerciseType: ExerciseType, 
    config: any
  ): TrainingDataPoint {
    
    // Generate realistic movement patterns
    const features = this.generateMovementSequence(exerciseType);
    
    // Generate corresponding ground truth
    const groundTruth = this.generateGroundTruth(exerciseType, features);
    
    return {
      exerciseId: exerciseType,
      userId: `synthetic_user_${Math.floor(Math.random() * 100)}`,
      features,
      groundTruth,
      metadata: {
        timestamp: Date.now() + Math.random() * 1000000,
        deviceTier: this.randomDeviceTier(),
        conditions: this.randomConditions()
      }
    };
  }

  private static generateMovementSequence(exerciseType: ExerciseType): MLModelInput {
    const sequenceLength = 60; // 2 seconds at 30fps
    const numJoints = 8; // Number of key joints
    
    // Generate base movement pattern based on exercise type
    const basePattern = this.getBaseMovementPattern(exerciseType);
    
    const angleSequence: number[][] = [];
    const velocitySequence: number[][] = [];
    const romSequence: number[][] = [];
    
    for (let frame = 0; frame < sequenceLength; frame++) {
      // Generate realistic joint angles with movement pattern
      const angles = this.generateFrameAngles(exerciseType, frame, sequenceLength, basePattern);
      const velocities = this.calculateVelocities(angles, frame > 0 ? angleSequence[frame - 1] : angles);
      const roms = this.calculateROMs(angles);
      
      angleSequence.push(angles);
      velocitySequence.push(velocities);
      romSequence.push(roms);
    }
    
    return {
      angleSequence,
      velocitySequence,
      romSequence,
      exerciseType: this.encodeExerciseType(exerciseType)
    };
  }

  private static getBaseMovementPattern(exerciseType: ExerciseType): any {
    const patterns = {
      [ExerciseType.NECK_STRETCH]: {
        primaryJoint: 'neck',
        amplitude: 30, // degrees
        frequency: 0.5, // Hz
        phases: ['flexion', 'extension', 'lateral_left', 'lateral_right']
      },
      [ExerciseType.SQUATS]: {
        primaryJoint: 'knee',
        amplitude: 90,
        frequency: 0.3,
        phases: ['descent', 'bottom', 'ascent', 'top']
      },
      [ExerciseType.SHOULDER_ROLLS]: {
        primaryJoint: 'shoulder',
        amplitude: 45,
        frequency: 0.4,
        phases: ['elevation', 'retraction', 'depression', 'protraction']
      },
      [ExerciseType.GENERAL]: {
        primaryJoint: 'general',
        amplitude: 20,
        frequency: 0.5,
        phases: ['start', 'middle', 'end']
      }
    };
    
    return patterns[exerciseType] || patterns[ExerciseType.GENERAL];
  }

  private static generateFrameAngles(
    exerciseType: ExerciseType, 
    frame: number, 
    totalFrames: number,
    pattern: any
  ): number[] {
    const angles: number[] = [];
    const progress = frame / totalFrames;
    
    // Base joint angles (realistic human pose)
    const baseAngles = {
      neck: 0,
      left_shoulder: 10,
      right_shoulder: 10,
      left_elbow: 15,
      right_elbow: 15,
      left_hip: 175,
      right_hip: 175,
      left_knee: 180,
      right_knee: 180
    };
    
    // Apply exercise-specific movement
    Object.keys(baseAngles).forEach((joint, index) => {
      let angle = (baseAngles as any)[joint];
      
      // Add exercise-specific movement
      if (joint.includes(pattern.primaryJoint) || pattern.primaryJoint === 'general') {
        const cyclePosition = (progress * 2 * Math.PI * pattern.frequency) % (2 * Math.PI);
        const movement = Math.sin(cyclePosition) * pattern.amplitude;
        angle += movement;
        
        // Add some noise for realism
        angle += (Math.random() - 0.5) * 5;
      }
      
      // Add asymmetry occasionally (error patterns)
      if (Math.random() < 0.1) { // 10% chance of asymmetry
        const asymmetryFactor = (Math.random() - 0.5) * 10;
        angle += asymmetryFactor;
      }
      
      angles.push(Math.max(0, Math.min(180, angle)));
    });
    
    return angles;
  }

  private static calculateVelocities(currentAngles: number[], previousAngles: number[]): number[] {
    const velocities: number[] = [];
    const dt = 1/30; // 30fps
    
    for (let i = 0; i < currentAngles.length; i++) {
      const velocity = (currentAngles[i] - previousAngles[i]) / dt;
      velocities.push(velocity);
    }
    
    return velocities;
  }

  private static calculateROMs(angles: number[]): number[] {
    // Simplified ROM calculation - would be more sophisticated in real implementation
    return angles.map(angle => Math.abs(angle - 90)); // Distance from neutral
  }

  private static generateGroundTruth(exerciseType: ExerciseType, features: MLModelInput): any {
    const lastFrame = features.angleSequence[features.angleSequence.length - 1];
    
    // Determine movement phase based on angle patterns
    const phase = this.determineMovementPhase(exerciseType, features);
    
    // Determine if this is a rep end
    const isRepEnd = this.determineRepEnd(exerciseType, features);
    
    // Generate error patterns
    const errors = this.generateErrorPatterns(exerciseType, features);
    
    // Calculate quality score
    const qualityScore = this.calculateSyntheticQuality(features, errors);
    
    return {
      phase,
      isRepEnd,
      errors,
      qualityScore,
      expertAnnotation: `Synthetic ${exerciseType} sample - Phase: ${phase}`
    };
  }

  private static determineMovementPhase(exerciseType: ExerciseType, features: MLModelInput): string {
    const phases = ['eccentric', 'concentric', 'isometric', 'transition'];
    
    // Simple heuristic based on velocity patterns
    const recentVelocities = features.velocitySequence.slice(-10);
    const avgVelocity = recentVelocities.reduce((sum, frame) => 
      sum + frame.reduce((a, b) => a + Math.abs(b), 0), 0
    ) / (recentVelocities.length * features.velocitySequence[0].length);
    
    if (avgVelocity < 1) return 'isometric';
    if (avgVelocity > 10) return 'transition';
    
    return Math.random() > 0.5 ? 'eccentric' : 'concentric';
  }

  private static determineRepEnd(exerciseType: ExerciseType, features: MLModelInput): boolean {
    // Simple heuristic - rep end when angles return near starting position
    const firstFrame = features.angleSequence[0];
    const lastFrame = features.angleSequence[features.angleSequence.length - 1];
    
    const similarity = this.calculateFrameSimilarity(firstFrame, lastFrame);
    return similarity > 0.8 && Math.random() > 0.7; // 30% chance if similar
  }

  private static calculateFrameSimilarity(frame1: number[], frame2: number[]): number {
    if (frame1.length !== frame2.length) return 0;
    
    const differences = frame1.map((angle, i) => Math.abs(angle - frame2[i]));
    const avgDifference = differences.reduce((a, b) => a + b) / differences.length;
    
    return Math.max(0, 1 - avgDifference / 180); // Normalize to 0-1
  }

  private static generateErrorPatterns(exerciseType: ExerciseType, features: MLModelInput): string[] {
    const errors: string[] = [];
    const config = ExerciseConfigs[exerciseType];
    
    // Check for asymmetry
    if (this.checkAsymmetry(features)) {
      errors.push('asymmetricMovement');
    }
    
    // Check for limited ROM
    if (this.checkLimitedROM(features)) {
      errors.push('limitedROM');
    }
    
    // Exercise-specific errors
    if (exerciseType === ExerciseType.SQUATS && Math.random() > 0.8) {
      errors.push('valgusKnee');
    }
    
    if (exerciseType === ExerciseType.NECK_STRETCH && Math.random() > 0.9) {
      errors.push('headForwardPosture');
    }
    
    return errors;
  }

  private static checkAsymmetry(features: MLModelInput): boolean {
    // Simple asymmetry check - compare left vs right joint patterns
    const lastFrame = features.angleSequence[features.angleSequence.length - 1];
    
    if (lastFrame.length >= 8) {
      // Assuming paired joints: [0,1], [2,3], [4,5], [6,7]
      for (let i = 0; i < lastFrame.length - 1; i += 2) {
        const difference = Math.abs(lastFrame[i] - lastFrame[i + 1]);
        if (difference > 15) return true; // Significant asymmetry
      }
    }
    
    return false;
  }

  private static checkLimitedROM(features: MLModelInput): boolean {
    // Check if ROM is below expected thresholds
    return features.romSequence.some(frame => 
      frame.some(rom => rom < 10) // Very limited range
    );
  }

  private static calculateSyntheticQuality(features: MLModelInput, errors: string[]): number {
    let baseScore = 90;
    
    // Reduce score based on errors
    baseScore -= errors.length * 10;
    
    // Check movement consistency
    const velocityVariation = this.calculateVelocityVariation(features.velocitySequence);
    baseScore -= velocityVariation * 20;
    
    // Check ROM adequacy
    const avgROM = features.romSequence.reduce((sum, frame) => 
      sum + frame.reduce((a, b) => a + b) / frame.length, 0
    ) / features.romSequence.length;
    
    if (avgROM < 20) baseScore -= 15;
    
    return Math.max(10, Math.min(100, baseScore + (Math.random() - 0.5) * 10));
  }

  private static calculateVelocityVariation(velocitySequence: number[][]): number {
    const flatVelocities = velocitySequence.flat();
    const mean = flatVelocities.reduce((a, b) => a + b) / flatVelocities.length;
    const variance = flatVelocities.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / flatVelocities.length;
    
    return Math.sqrt(variance) / 100; // Normalized variation
  }

  private static randomDeviceTier(): 'basic' | 'enhanced' | 'pro' | 'ultra' {
    const tiers = ['basic', 'enhanced', 'pro', 'ultra'];
    return tiers[Math.floor(Math.random() * tiers.length)] as any;
  }

  private static randomConditions(): string {
    const conditions = [
      'good_lighting_casual_clothing',
      'dim_lighting_casual_clothing', 
      'good_lighting_tight_clothing',
      'outdoor_natural_lighting',
      'indoor_artificial_lighting'
    ];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  private static encodeExerciseType(exerciseType: ExerciseType): number {
    const exerciseMap = {
      [ExerciseType.NECK_STRETCH]: 0,
      [ExerciseType.SHOULDER_ROLLS]: 1,
      [ExerciseType.ARM_CIRCLES]: 2,
      [ExerciseType.TORSO_TWIST]: 3,
      [ExerciseType.LEG_RAISES]: 4,
      [ExerciseType.ANKLE_PUMPS]: 5,
      [ExerciseType.SQUATS]: 6,
      [ExerciseType.LUNGES]: 7,
      [ExerciseType.GENERAL]: 8
    };
    
    return exerciseMap[exerciseType] || 8;
  }

  // Export data in various formats
  static exportToJSON(data: TrainingDataPoint[]): string {
    return JSON.stringify(data, null, 2);
  }

  static exportToCSV(data: TrainingDataPoint[]): string {
    if (data.length === 0) return '';
    
    const headers = [
      'exerciseId', 'userId', 'phase', 'isRepEnd', 'qualityScore', 
      'errors', 'deviceTier', 'conditions', 'timestamp'
    ];
    
    const rows = data.map(point => [
      point.exerciseId,
      point.userId,
      point.groundTruth.phase,
      point.groundTruth.isRepEnd,
      point.groundTruth.qualityScore,
      point.groundTruth.errors.join('|'),
      point.metadata.deviceTier,
      point.metadata.conditions,
      point.metadata.timestamp
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}