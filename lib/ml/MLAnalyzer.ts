import { Platform } from 'react-native';
import { MLModelInput, MLModelOutput, ExerciseType, ExerciseConfig } from './types';
import { FeatureFrame } from '../vision/types';
import { ExerciseConfigs } from './ExerciseConfigs';

export class MLAnalyzer {
  private model: any = null; // Core ML or TensorFlow Lite model
  private sequenceBuffer: FeatureFrame[] = [];
  private readonly SEQUENCE_LENGTH = 60; // 2 seconds at 30fps
  private isInitialized = false;
  private currentExercise: ExerciseType = ExerciseType.GENERAL;
  private frameCount = 0;
  private previousPrediction: MLModelOutput | null = null;

  constructor() {
    this.initializeModel();
  }

  private async initializeModel() {
    try {
      console.log('🧠 Initializing ML models...');
      
      if (Platform.OS === 'ios') {
        // Initialize Core ML model for iOS
        await this.initializeCoreML();
      } else {
        // Initialize TensorFlow Lite for Android
        await this.initializeTensorFlowLite();
      }
      
      this.isInitialized = true;
      console.log('✅ ML Analyzer initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize ML Analyzer:', error);
      // Fallback to rule-based analysis
      this.isInitialized = true;
    }
  }

  private async initializeCoreML() {
    // TODO: Load Core ML model from app bundle
    // For now, use mock implementation
    console.log('📱 Core ML model loaded (iOS)');
    this.model = {
      predict: this.mockPrediction.bind(this)
    };
  }

  private async initializeTensorFlowLite() {
    // TODO: Load TensorFlow Lite model
    // For now, use mock implementation  
    console.log('🤖 TensorFlow Lite model loaded (Android)');
    this.model = {
      predict: this.mockPrediction.bind(this)
    };
  }

  async analyzeMovement(features: FeatureFrame): Promise<MLModelOutput | null> {
    if (!this.isInitialized) {
      console.warn('ML Analyzer not initialized yet');
      return null;
    }

    // Add to rolling buffer
    this.sequenceBuffer.push(features);
    if (this.sequenceBuffer.length > this.SEQUENCE_LENGTH) {
      this.sequenceBuffer.shift();
    }

    // Run inference every N frames (not every frame for efficiency)
    this.frameCount++;
    if (this.shouldRunInference()) {
      return await this.runInference();
    }

    // Return previous prediction with updated timestamp
    return this.previousPrediction ? {
      ...this.previousPrediction,
      timestamp: features.timestamp
    } : null;
  }

  private shouldRunInference(): boolean {
    // Run at 5fps instead of 30fps for efficiency (every 6th frame)
    return this.frameCount % 6 === 0 && this.sequenceBuffer.length >= 30; // Min 1 second of data
  }

  private async runInference(): Promise<MLModelOutput> {
    try {
      if (!this.model) {
        return this.createFallbackPrediction();
      }

      // Prepare input data
      const modelInput = this.prepareModelInput();
      
      // Run model prediction
      const prediction = await this.model.predict(modelInput);
      
      // Post-process results
      const processedOutput = this.postProcessPrediction(prediction);
      
      this.previousPrediction = processedOutput;
      return processedOutput;
      
    } catch (error) {
      console.warn('Error during ML inference:', error);
      return this.createFallbackPrediction();
    }
  }

  private prepareModelInput(): MLModelInput {
    const exerciseConfig = ExerciseConfigs[this.currentExercise];
    
    // Extract sequences from buffer
    const angleSequence = this.sequenceBuffer.map(frame => 
      Object.values(frame.jointAngles)
    );
    
    const velocitySequence = this.sequenceBuffer.map(frame => 
      frame.velocities
    );
    
    const romSequence = this.sequenceBuffer.map(frame =>
      Object.values(frame.rom)
    );

    return {
      angleSequence,
      velocitySequence, 
      romSequence,
      exerciseType: this.getExerciseTypeEncoding(this.currentExercise)
    };
  }

  private postProcessPrediction(rawPrediction: any): MLModelOutput {
    // Apply temporal smoothing and confidence thresholds
    const smoothedPrediction = this.applyTemporalSmoothing(rawPrediction);
    
    return {
      movementPhase: smoothedPrediction.movementPhase,
      repEndProbability: Math.max(0, Math.min(1, smoothedPrediction.repEndProbability)),
      commonErrors: smoothedPrediction.commonErrors,
      qualityScore: Math.max(0, Math.min(100, smoothedPrediction.qualityScore)),
      confidence: Math.max(0, Math.min(1, smoothedPrediction.confidence)),
      timestamp: Date.now()
    };
  }

  private applyTemporalSmoothing(prediction: any): any {
    if (!this.previousPrediction) {
      return prediction;
    }

    const alpha = 0.3; // Smoothing factor
    
    return {
      movementPhase: {
        eccentric: alpha * prediction.movementPhase.eccentric + (1 - alpha) * this.previousPrediction.movementPhase.eccentric,
        concentric: alpha * prediction.movementPhase.concentric + (1 - alpha) * this.previousPrediction.movementPhase.concentric,
        isometric: alpha * prediction.movementPhase.isometric + (1 - alpha) * this.previousPrediction.movementPhase.isometric,
        transition: alpha * prediction.movementPhase.transition + (1 - alpha) * this.previousPrediction.movementPhase.transition
      },
      repEndProbability: alpha * prediction.repEndProbability + (1 - alpha) * this.previousPrediction.repEndProbability,
      commonErrors: Object.keys(prediction.commonErrors).reduce((acc, key) => {
        acc[key] = alpha * prediction.commonErrors[key] + (1 - alpha) * (this.previousPrediction!.commonErrors as any)[key];
        return acc;
      }, {} as any),
      qualityScore: alpha * prediction.qualityScore + (1 - alpha) * this.previousPrediction.qualityScore,
      confidence: alpha * prediction.confidence + (1 - alpha) * this.previousPrediction.confidence
    };
  }

  // Mock prediction for development/fallback
  private mockPrediction(input: MLModelInput): MLModelOutput {
    return this.createRuleBasedPrediction();
  }

  private createRuleBasedPrediction(): MLModelOutput {
    if (this.sequenceBuffer.length === 0) {
      return this.createFallbackPrediction();
    }

    const currentFrame = this.sequenceBuffer[this.sequenceBuffer.length - 1];
    const exerciseConfig = ExerciseConfigs[this.currentExercise];
    
    // Simple rule-based analysis
    const kneeAngles = [
      currentFrame.jointAngles.left_knee, 
      currentFrame.jointAngles.right_knee
    ].filter(angle => angle !== undefined);

    const avgKneeAngle = kneeAngles.length > 0 ? 
      kneeAngles.reduce((a, b) => a + b) / kneeAngles.length : 90;

    // Movement phase detection
    let dominantPhase: keyof MLModelOutput['movementPhase'] = 'isometric';
    if (avgKneeAngle > 120) dominantPhase = 'eccentric';
    else if (avgKneeAngle < 90) dominantPhase = 'concentric';
    else dominantPhase = 'transition';

    const movementPhase = {
      eccentric: dominantPhase === 'eccentric' ? 0.8 : 0.1,
      concentric: dominantPhase === 'concentric' ? 0.8 : 0.1,
      isometric: dominantPhase === 'isometric' ? 0.8 : 0.1,
      transition: dominantPhase === 'transition' ? 0.8 : 0.1
    };

    // Simple rep detection - look for knee angle cycles
    const repEndProbability = this.detectRepEnd(avgKneeAngle);
    
    // Basic error detection
    const commonErrors = this.detectCommonErrors(currentFrame, exerciseConfig);
    
    // Quality scoring based on symmetry, ROM, tempo
    const qualityScore = this.calculateQualityScore(currentFrame, exerciseConfig);

    return {
      movementPhase,
      repEndProbability,
      commonErrors,
      qualityScore,
      confidence: 0.7, // Moderate confidence for rule-based analysis
      timestamp: currentFrame.timestamp
    };
  }

  private detectRepEnd(currentAngle: number): number {
    // Simple rep end detection - return to starting position
    const NEUTRAL_ANGLE = 90;
    const THRESHOLD = 5;
    
    return Math.abs(currentAngle - NEUTRAL_ANGLE) < THRESHOLD ? 0.8 : 0.1;
  }

  private detectCommonErrors(frame: FeatureFrame, config: ExerciseConfig): MLModelOutput['commonErrors'] {
    return {
      valgusKnee: frame.symmetry < 0.7 ? 0.6 : 0.1,
      excessiveForwardLean: 0.1, // Would need torso angle calculation
      asymmetricMovement: frame.symmetry < 0.8 ? 0.7 : 0.1,
      limitedROM: Object.values(frame.rom).some(rom => rom < 30) ? 0.5 : 0.1,
      improperTempo: frame.tempo < 0.5 || frame.tempo > 2.0 ? 0.4 : 0.1,
      insufficientDepth: 0.1, // Exercise-specific
      headForwardPosture: 0.1 // Exercise-specific
    };
  }

  private calculateQualityScore(frame: FeatureFrame, config: ExerciseConfig): number {
    const symmetryScore = frame.symmetry * 100;
    const romScore = Math.min(100, Math.max(...Object.values(frame.rom)));
    const tempoScore = (frame.tempo > 0.5 && frame.tempo < 2.0) ? 90 : 60;
    
    // Weighted average based on exercise config
    const score = 
      symmetryScore * config.qualityFactors.symmetry +
      romScore * config.qualityFactors.rangeOfMotion +
      tempoScore * config.qualityFactors.tempo +
      80 * config.qualityFactors.alignment; // Default alignment score
    
    return Math.max(0, Math.min(100, score));
  }

  private createFallbackPrediction(): MLModelOutput {
    return {
      movementPhase: {
        eccentric: 0.25,
        concentric: 0.25,
        isometric: 0.25,
        transition: 0.25
      },
      repEndProbability: 0.1,
      commonErrors: {
        valgusKnee: 0.1,
        excessiveForwardLean: 0.1,
        asymmetricMovement: 0.1,
        limitedROM: 0.1,
        improperTempo: 0.1,
        insufficientDepth: 0.1,
        headForwardPosture: 0.1
      },
      qualityScore: 75,
      confidence: 0.3,
      timestamp: Date.now()
    };
  }

  private getExerciseTypeEncoding(exerciseType: ExerciseType): number {
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

  // Public methods
  setExerciseType(exerciseType: ExerciseType) {
    this.currentExercise = exerciseType;
    this.clearSequenceBuffer(); // Reset buffer when exercise changes
    console.log(`🎯 Exercise type set to: ${exerciseType}`);
  }

  clearSequenceBuffer() {
    this.sequenceBuffer = [];
    this.previousPrediction = null;
    this.frameCount = 0;
  }

  getSequenceBufferLength(): number {
    return this.sequenceBuffer.length;
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  dispose() {
    this.model = null;
    this.sequenceBuffer = [];
    this.previousPrediction = null;
    this.isInitialized = false;
  }
}
