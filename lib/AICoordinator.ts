import { VisionProcessor, FeatureExtractor, DeviceCapabilityDetector } from './vision';
import { MLAnalyzer, ExerciseType } from './ml';
import { LocalLLMManager, LLMTriggerSystem, LLMTriggerEvent } from './llm';
import { FeatureFrame, VisionOutput } from './vision/types';
import { MLModelOutput } from './ml/types';
import { LocalLLMResponse, MotivationalContext } from './llm/types';

/**
 * AICoordinator - Main orchestrator for the hierarchical AI system
 * 
 * Architecture Flow:
 * Vision Layer (30fps) → Feature Extractor (30fps) → ML Analyzer (5fps) → 
 * Local LLM (per event) → Cloud LLM (per session) → 3D Visualization (real-time)
 */

export interface AICoordinatorConfig {
  exerciseType: ExerciseType;
  userContext: MotivationalContext;
  enableLocalLLM: boolean;
  enableCloudLLM: boolean;
  visualizationEnabled: boolean;
  debugMode: boolean;
}

export interface AIAnalysisOutput {
  vision: VisionOutput | null;
  features: FeatureFrame | null;
  mlAnalysis: MLModelOutput | null;
  llmResponse: LocalLLMResponse | null;
  triggers: LLMTriggerEvent[];
  performance: {
    visionFPS: number;
    mlInferenceFPS: number;
    totalLatency: number;
    memoryUsage: number;
  };
  timestamp: number;
}

export class AICoordinator {
  private static instance: AICoordinator;
  
  // Core components
  private visionProcessor: VisionProcessor | null = null;
  private featureExtractor: FeatureExtractor | null = null;
  private mlAnalyzer: MLAnalyzer | null = null;
  private localLLMManager: LocalLLMManager | null = null;
  private triggerSystem: LLMTriggerSystem | null = null;
  private capabilityDetector: DeviceCapabilityDetector | null = null;

  // State management
  private isInitialized = false;
  private currentConfig: AICoordinatorConfig | null = null;
  private processingQueue: (() => Promise<void>)[] = [];
  private isProcessing = false;
  private performanceMetrics = {
    frameCount: 0,
    mlInferenceCount: 0,
    llmResponseCount: 0,
    startTime: Date.now(),
    lastFPSUpdate: Date.now(),
    currentVisionFPS: 0,
    currentMLFPS: 0
  };

  // Event callbacks
  private onAnalysisCallback?: (output: AIAnalysisOutput) => void;
  private onLLMResponseCallback?: (response: LocalLLMResponse) => void;
  private onErrorCallback?: (error: Error) => void;

  private constructor() {}

  static getInstance(): AICoordinator {
    if (!AICoordinator.instance) {
      AICoordinator.instance = new AICoordinator();
    }
    return AICoordinator.instance;
  }

  async initialize(config: AICoordinatorConfig): Promise<void> {
    console.log('🚀 Initializing AI Coordinator with hierarchical architecture...');
    console.log('📊 Config:', config);

    try {
      this.currentConfig = config;
      const startTime = Date.now();

      // 1. Initialize Device Capabilities (Foundation)
      this.capabilityDetector = DeviceCapabilityDetector.getInstance();
      const capabilities = await this.capabilityDetector.detectCapabilities();
      console.log(`✅ Device capabilities detected: ${capabilities.tier} tier`);

      // 2. Initialize Vision Layer (30fps processing)
      this.visionProcessor = new VisionProcessor();
      this.featureExtractor = new FeatureExtractor();
      console.log('✅ Vision layer initialized');

      // 3. Initialize ML Pipeline (5fps inference)
      this.mlAnalyzer = new MLAnalyzer();
      this.mlAnalyzer.setExerciseType(config.exerciseType);
      console.log('✅ ML analyzer initialized');

      // 4. Initialize Local LLM (event-based responses)
      if (config.enableLocalLLM || capabilities.canRunLocalLLM) {
        this.localLLMManager = LocalLLMManager.getInstance();
        await this.localLLMManager.initialize();
        
        this.triggerSystem = new LLMTriggerSystem();
        console.log('✅ Local LLM system initialized');
      } else {
        console.log('⚠️ Local LLM disabled - using fallback messages only');
      }

      const initTime = Date.now() - startTime;
      this.isInitialized = true;
      
      console.log(`🎉 AI Coordinator initialized successfully in ${initTime}ms`);
      console.log('🔄 Hierarchical AI pipeline ready:');
      console.log('   📹 Vision Layer (30fps) → 🧮 Feature Extractor (30fps)');
      console.log('   🤖 ML Analyzer (5fps) → 💬 Local LLM (events) → ☁️ Cloud LLM (sessions)');

    } catch (error) {
      console.error('❌ Failed to initialize AI Coordinator:', error);
      this.onErrorCallback?.(error as Error);
      throw error;
    }
  }

  async processFrame(imageData: ImageData): Promise<AIAnalysisOutput> {
    if (!this.isInitialized || !this.currentConfig) {
      throw new Error('AICoordinator not initialized');
    }

    const processingStartTime = performance.now();
    let visionOutput: VisionOutput | null = null;
    let features: FeatureFrame | null = null;
    let mlAnalysis: MLModelOutput | null = null;
    let llmResponse: LocalLLMResponse | null = null;
    let triggers: LLMTriggerEvent[] = [];

    try {
      // 1. Vision Processing (30fps) - Always run
      if (this.visionProcessor) {
        visionOutput = await this.visionProcessor.processFrame(imageData);
        this.updateFPSMetrics('vision');
      }

      // 2. Feature Extraction (30fps) - If vision successful
      if (visionOutput && this.featureExtractor) {
        features = this.featureExtractor.extractFeatures(visionOutput);
      }

      // 3. ML Analysis (5fps) - Selective processing
      if (features && this.mlAnalyzer) {
        mlAnalysis = await this.mlAnalyzer.analyzeMovement(features);
        if (mlAnalysis) {
          this.updateFPSMetrics('ml');
        }
      }

      // 4. LLM Triggering (Event-based) - If ML analysis available
      if (mlAnalysis && this.triggerSystem && this.currentConfig.userContext) {
        triggers = this.triggerSystem.analyzeForTriggers(
          mlAnalysis,
          this.currentConfig.exerciseType,
          this.currentConfig.userContext
        );

        // Process high priority triggers immediately
        const urgentTrigger = triggers.find(t => t.priority === 'urgent' || t.priority === 'high');
        if (urgentTrigger && this.localLLMManager) {
          llmResponse = await this.localLLMManager.generateResponse(urgentTrigger);
          this.performanceMetrics.llmResponseCount++;
          
          // Notify callback
          if (llmResponse && this.onLLMResponseCallback) {
            this.onLLMResponseCallback(llmResponse);
          }
        }

        // Queue other triggers for background processing
        const backgroundTriggers = triggers.filter(t => t.priority === 'medium' || t.priority === 'low');
        backgroundTriggers.forEach(trigger => {
          this.queueBackgroundProcessing(async () => {
            if (this.localLLMManager) {
              const response = await this.localLLMManager.generateResponse(trigger);
              this.onLLMResponseCallback?.(response);
            }
          });
        });
      }

      // 5. Create analysis output
      const analysisOutput: AIAnalysisOutput = {
        vision: visionOutput,
        features,
        mlAnalysis,
        llmResponse,
        triggers,
        performance: {
          visionFPS: this.performanceMetrics.currentVisionFPS,
          mlInferenceFPS: this.performanceMetrics.currentMLFPS,
          totalLatency: performance.now() - processingStartTime,
          memoryUsage: this.getMemoryUsage()
        },
        timestamp: Date.now()
      };

      // Notify main callback
      if (this.onAnalysisCallback) {
        this.onAnalysisCallback(analysisOutput);
      }

      return analysisOutput;

    } catch (error) {
      console.error('Error in AI processing pipeline:', error);
      this.onErrorCallback?.(error as Error);
      
      // Return partial results on error
      return {
        vision: visionOutput,
        features,
        mlAnalysis,
        llmResponse,
        triggers,
        performance: {
          visionFPS: 0,
          mlInferenceFPS: 0,
          totalLatency: performance.now() - processingStartTime,
          memoryUsage: 0
        },
        timestamp: Date.now()
      };
    }
  }

  // Background processing for low-priority tasks
  private queueBackgroundProcessing(task: () => Promise<void>): void {
    this.processingQueue.push(task);
    
    if (!this.isProcessing) {
      this.processBackgroundQueue();
    }
  }

  private async processBackgroundQueue(): Promise<void> {
    this.isProcessing = true;
    
    while (this.processingQueue.length > 0) {
      const task = this.processingQueue.shift();
      if (task) {
        try {
          await task();
        } catch (error) {
          console.warn('Background task failed:', error);
        }
      }
    }
    
    this.isProcessing = false;
  }

  // Performance monitoring
  private updateFPSMetrics(type: 'vision' | 'ml'): void {
    const now = Date.now();
    
    if (type === 'vision') {
      this.performanceMetrics.frameCount++;
    } else {
      this.performanceMetrics.mlInferenceCount++;
    }

    // Update FPS every second
    if (now - this.performanceMetrics.lastFPSUpdate >= 1000) {
      const timeDelta = (now - this.performanceMetrics.lastFPSUpdate) / 1000;
      
      this.performanceMetrics.currentVisionFPS = this.performanceMetrics.frameCount / timeDelta;
      this.performanceMetrics.currentMLFPS = this.performanceMetrics.mlInferenceCount / timeDelta;
      
      this.performanceMetrics.frameCount = 0;
      this.performanceMetrics.mlInferenceCount = 0;
      this.performanceMetrics.lastFPSUpdate = now;
    }
  }

  private getMemoryUsage(): number {
    // Simplified memory usage estimation
    if (typeof (global as any).performance?.memory !== 'undefined') {
      return (global as any).performance.memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  // Public configuration methods
  updateExerciseType(exerciseType: ExerciseType): void {
    if (this.mlAnalyzer) {
      this.mlAnalyzer.setExerciseType(exerciseType);
    }
    
    if (this.currentConfig) {
      this.currentConfig.exerciseType = exerciseType;
    }
    
    // Clear ML analyzer sequence buffer for new exercise
    if (this.mlAnalyzer) {
      this.mlAnalyzer.clearSequenceBuffer();
    }
    
    // Reset trigger system for new session
    if (this.triggerSystem) {
      this.triggerSystem.startNewSession();
    }
  }

  updateUserContext(userContext: MotivationalContext): void {
    if (this.currentConfig) {
      this.currentConfig.userContext = userContext;
    }
  }

  // Event handlers
  setOnAnalysisCallback(callback: (output: AIAnalysisOutput) => void): void {
    this.onAnalysisCallback = callback;
  }

  setOnLLMResponseCallback(callback: (response: LocalLLMResponse) => void): void {
    this.onLLMResponseCallback = callback;
  }

  setOnErrorCallback(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }

  // Session management
  startSession(exerciseType: ExerciseType): void {
    console.log(`🎯 Starting AI analysis session for ${exerciseType}`);
    
    this.updateExerciseType(exerciseType);
    this.performanceMetrics = {
      frameCount: 0,
      mlInferenceCount: 0,
      llmResponseCount: 0,
      startTime: Date.now(),
      lastFPSUpdate: Date.now(),
      currentVisionFPS: 0,
      currentMLFPS: 0
    };
  }

  async endSession(): Promise<void> {
    console.log('🏁 Ending AI analysis session');
    
    if (this.triggerSystem) {
      const sessionEndTrigger = this.triggerSystem.endSession();
      
      if (sessionEndTrigger && this.localLLMManager) {
        const finalResponse = await this.localLLMManager.generateResponse(sessionEndTrigger);
        this.onLLMResponseCallback?.(finalResponse);
      }
    }
  }

  // Diagnostics and monitoring
  getSystemStatus() {
    const capabilities = this.capabilityDetector?.getCurrentCapabilities();
    const llmStats = this.localLLMManager?.getStats();
    const sessionStats = this.triggerSystem?.getSessionStats();
    
    return {
      isInitialized: this.isInitialized,
      deviceCapabilities: capabilities,
      llmSystem: llmStats,
      sessionStats: sessionStats,
      performance: {
        ...this.performanceMetrics,
        uptime: Date.now() - this.performanceMetrics.startTime,
        backgroundQueueSize: this.processingQueue.length
      },
      components: {
        vision: !!this.visionProcessor,
        ml: !!this.mlAnalyzer,
        localLLM: !!this.localLLMManager,
        triggers: !!this.triggerSystem
      }
    };
  }

  // Cleanup
  dispose(): void {
    console.log('🧹 Disposing AI Coordinator...');
    
    this.visionProcessor?.dispose();
    this.mlAnalyzer?.dispose();
    this.localLLMManager?.dispose();
    
    this.processingQueue = [];
    this.isInitialized = false;
    this.currentConfig = null;
    
    console.log('✅ AI Coordinator disposed');
  }
}