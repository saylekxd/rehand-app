import { 
  PipelineConfiguration,
  PipelineMetrics,
  DataPacket,
  ProcessingQueue,
  PipelineEvent,
  PipelineEventHandler,
  ThreadConfiguration,
  AdaptiveQualitySettings,
  PerformanceProfile
} from './types';
import { VisionProcessor, FeatureExtractor } from '../vision';
import { MLAnalyzer } from '../ml';
import { LocalLLMManager, LLMTriggerSystem } from '../llm';
import { CloudLLMManager, CloudTriggerSystem } from '../cloud';
import { VisualizationEngine } from '../visualization';
import { PerformanceProfileManager } from './PerformanceProfileManager';

export class HierarchicalPipeline {
  private static instance: HierarchicalPipeline;
  
  private configuration: PipelineConfiguration;
  private threadConfiguration: ThreadConfiguration;
  private adaptiveQuality: AdaptiveQualitySettings;
  private eventHandlers: PipelineEventHandler[] = [];
  
  // Pipeline components
  private visionProcessor: VisionProcessor | null = null;
  private featureExtractor: FeatureExtractor | null = null;
  private mlAnalyzer: MLAnalyzer | null = null;
  private localLLMManager: LocalLLMManager | null = null;
  private cloudLLMManager: CloudLLMManager | null = null;
  private visualizationEngine: VisualizationEngine | null = null;
  
  // Processing queues
  private queues: ProcessingQueue = {
    urgent: [],
    high: [],
    normal: [],
    low: []
  };
  
  // State management
  private isRunning = false;
  private metrics: PipelineMetrics;
  private lastMetricsUpdate = 0;
  private performanceMonitorInterval: NodeJS.Timeout | null = null;
  
  // Performance tracking
  private frameTimestamps: number[] = [];
  private processingTimes = new Map<string, number[]>();
  private thermalMonitor: any = null; // Platform-specific thermal monitoring
  
  private constructor() {
    this.configuration = this.getDefaultConfiguration();
    this.threadConfiguration = this.getDefaultThreadConfiguration();
    this.adaptiveQuality = this.getDefaultAdaptiveQuality();
    this.metrics = this.getEmptyMetrics();
  }

  static getInstance(): HierarchicalPipeline {
    if (!HierarchicalPipeline.instance) {
      HierarchicalPipeline.instance = new HierarchicalPipeline();
    }
    return HierarchicalPipeline.instance;
  }

  async initialize(components: {
    visionProcessor: VisionProcessor;
    featureExtractor: FeatureExtractor;
    mlAnalyzer: MLAnalyzer;
    localLLMManager?: LocalLLMManager;
    cloudLLMManager?: CloudLLMManager;
    visualizationEngine?: VisualizationEngine;
  }): Promise<void> {
    console.log('🔄 Initializing Hierarchical Pipeline...');

    try {
      // Store component references
      this.visionProcessor = components.visionProcessor;
      this.featureExtractor = components.featureExtractor;
      this.mlAnalyzer = components.mlAnalyzer;
      this.localLLMManager = components.localLLMManager || null;
      this.cloudLLMManager = components.cloudLLMManager || null;
      this.visualizationEngine = components.visualizationEngine || null;

      // Initialize performance monitoring
      this.initializePerformanceMonitoring();
      
      // Setup thread configurations
      await this.setupThreads();
      
      // Initialize performance monitoring
      this.initializePerformanceMonitoring();

      console.log('✅ Hierarchical Pipeline initialized successfully');
      this.emitEvent({
        type: 'stage_complete',
        timestamp: Date.now(),
        stageId: 'initialization',
        severity: 'info'
      });

    } catch (error) {
      console.error('❌ Failed to initialize pipeline:', error);
      this.emitEvent({
        type: 'stage_error',
        timestamp: Date.now(),
        stageId: 'initialization',
        data: error,
        severity: 'critical'
      });
      throw error;
    }
  }

  async processFrame(imageData: ImageData): Promise<any> {
    if (!this.isRunning || !this.visionProcessor) {
      return null;
    }

    const frameId = `frame_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = performance.now();
    
    try {
      // Stage 1: Vision Processing (30fps)
      const visionPacket = await this.processVisionStage(imageData, frameId, startTime);
      if (!visionPacket) return null;

      // Stage 2: Feature Extraction (30fps) 
      const featurePacket = await this.processFeatureStage(visionPacket);
      if (!featurePacket) return null;

      // Stage 3: ML Analysis (5fps, conditional)
      let mlPacket: DataPacket | null = null;
      if (this.shouldRunMLAnalysis()) {
        mlPacket = await this.processMLStage(featurePacket);
      }

      // Stage 4: Local LLM (event-driven)
      let llmPacket: DataPacket | null = null;
      if (mlPacket && this.shouldTriggerLocalLLM(mlPacket)) {
        llmPacket = await this.processLocalLLMStage(mlPacket);
      }

      // Stage 5: Cloud LLM (session-level, background)
      if (mlPacket && this.shouldTriggerCloudLLM(mlPacket)) {
        this.queueCloudLLMProcessing(mlPacket);
      }

      // Stage 6: Visualization (real-time)
      let visualizationPacket: DataPacket | null = null;
      if (this.visualizationEngine && featurePacket && mlPacket) {
        visualizationPacket = await this.processVisualizationStage(
          visionPacket, featurePacket, mlPacket
        );
      }

      // Update metrics
      this.updateFrameMetrics(startTime);
      
      // Return comprehensive result
      return {
        frameId,
        vision: visionPacket?.data,
        features: featurePacket?.data,
        mlAnalysis: mlPacket?.data,
        llmResponse: llmPacket?.data,
        visualization: visualizationPacket?.data,
        performance: {
          totalLatency: performance.now() - startTime,
          stagesCompleted: this.getCompletedStages([visionPacket, featurePacket, mlPacket, llmPacket, visualizationPacket])
        },
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('Pipeline processing error:', error);
      this.emitEvent({
        type: 'stage_error',
        timestamp: Date.now(),
        stageId: 'frame_processing',
        data: error,
        severity: 'error'
      });
      return null;
    }
  }

  private async processVisionStage(
    imageData: ImageData, 
    frameId: string, 
    startTime: number
  ): Promise<DataPacket | null> {
    if (!this.visionProcessor) return null;

    try {
      const visionOutput = await this.visionProcessor.processFrame(imageData);
      if (!visionOutput) return null;

      return {
        id: `${frameId}_vision`,
        timestamp: Date.now(),
        type: 'vision',
        data: visionOutput,
        metadata: {
          processingTime: performance.now() - startTime,
          confidence: this.calculateVisionConfidence(visionOutput),
          source: 'vision_processor',
          priority: 'high'
        }
      };
    } catch (error) {
      this.handleStageError('vision', error);
      return null;
    }
  }

  private async processFeatureStage(visionPacket: DataPacket): Promise<DataPacket | null> {
    if (!this.featureExtractor) return null;

    try {
      const startTime = performance.now();
      const features = this.featureExtractor.extractFeatures(visionPacket.data);

      return {
        id: `${visionPacket.id}_features`,
        timestamp: Date.now(),
        type: 'features',
        data: features,
        metadata: {
          processingTime: performance.now() - startTime,
          confidence: this.calculateFeatureConfidence(features),
          source: 'feature_extractor',
          priority: 'high'
        }
      };
    } catch (error) {
      this.handleStageError('features', error);
      return null;
    }
  }

  private async processMLStage(featurePacket: DataPacket): Promise<DataPacket | null> {
    if (!this.mlAnalyzer) return null;

    try {
      const startTime = performance.now();
      const mlAnalysis = await this.mlAnalyzer.analyzeMovement(featurePacket.data);
      if (!mlAnalysis) return null;

      return {
        id: `${featurePacket.id}_ml`,
        timestamp: Date.now(),
        type: 'ml_analysis',
        data: mlAnalysis,
        metadata: {
          processingTime: performance.now() - startTime,
          confidence: mlAnalysis.confidence,
          source: 'ml_analyzer',
          priority: 'normal'
        }
      };
    } catch (error) {
      this.handleStageError('ml', error);
      return null;
    }
  }

  private async processLocalLLMStage(mlPacket: DataPacket): Promise<DataPacket | null> {
    if (!this.localLLMManager) return null;

    try {
      const startTime = performance.now();
      // This would integrate with LLM trigger system
      // For now, simplified implementation
      
      return {
        id: `${mlPacket.id}_local_llm`,
        timestamp: Date.now(),
        type: 'llm_response',
        data: { message: 'Local LLM response', type: 'motivational' },
        metadata: {
          processingTime: performance.now() - startTime,
          confidence: 0.8,
          source: 'local_llm',
          priority: 'normal'
        }
      };
    } catch (error) {
      this.handleStageError('local_llm', error);
      return null;
    }
  }

  private async processVisualizationStage(
    visionPacket: DataPacket,
    featurePacket: DataPacket,
    mlPacket: DataPacket
  ): Promise<DataPacket | null> {
    if (!this.visualizationEngine) return null;

    try {
      const startTime = performance.now();
      // This would integrate with visualization engine
      // For now, return mock data
      
      return {
        id: `${mlPacket.id}_visualization`,
        timestamp: Date.now(),
        type: 'visualization',
        data: { overlayElements: [], performance: {} },
        metadata: {
          processingTime: performance.now() - startTime,
          confidence: 1.0,
          source: 'visualization_engine',
          priority: 'low'
        }
      };
    } catch (error) {
      this.handleStageError('visualization', error);
      return null;
    }
  }

  // Conditional processing logic
  private shouldRunMLAnalysis(): boolean {
    // Run ML analysis every 6th frame (5fps from 30fps)
    return this.frameTimestamps.length % 6 === 0;
  }

  private shouldTriggerLocalLLM(mlPacket: DataPacket): boolean {
    // Simplified logic - would integrate with trigger system
    const analysis = mlPacket.data;
    return analysis?.repEndProbability > 0.7 || 
           Object.values(analysis?.commonErrors || {}).some((prob: any) => prob > 0.5);
  }

  private shouldTriggerCloudLLM(mlPacket: DataPacket): boolean {
    // Less frequent, session-level triggers
    return false; // Would be implemented with CloudTriggerSystem
  }

  private queueCloudLLMProcessing(mlPacket: DataPacket): void {
    // Queue for background processing
    this.queues.low.push({
      ...mlPacket,
      type: 'llm_response',
      metadata: {
        ...mlPacket.metadata,
        priority: 'low'
      }
    });
  }

  // Performance monitoring
  private initializePerformanceMonitoring(): void {
    this.performanceMonitorInterval = setInterval(() => {
      this.updateMetrics();
      this.checkAdaptiveQuality();
    }, 1000) as unknown as NodeJS.Timeout;
  }

  private updateFrameMetrics(frameStartTime: number): void {
    const now = performance.now();
    
    // Update frame timestamps
    this.frameTimestamps.push(now);
    if (this.frameTimestamps.length > 30) {
      this.frameTimestamps.shift(); // Keep last 30 frames (1 second at 30fps)
    }

    // Track processing time
    const processingTime = now - frameStartTime;
    this.addProcessingTime('frame_total', processingTime);
  }

  private updateMetrics(): void {
    const now = Date.now();
    const timeDelta = (now - this.lastMetricsUpdate) / 1000;

    if (timeDelta > 0) {
      // Calculate FPS
      const visionFPS = this.frameTimestamps.length / Math.min(timeDelta, 1);
      
      this.metrics = {
        throughput: {
          visionFPS,
          featureFPS: visionFPS, // Same as vision
          mlInferenceFPS: visionFPS / 6, // Every 6th frame
          llmResponsesPerMinute: this.getLLMResponseRate(),
          visualizationFPS: visionFPS
        },
        latency: {
          visionToFeatures: this.getAverageProcessingTime('features'),
          featuresToML: this.getAverageProcessingTime('ml'),
          mlToLLM: this.getAverageProcessingTime('local_llm'),
          endToEndLatency: this.getAverageProcessingTime('frame_total')
        },
        resources: {
          cpuUsage: this.getCPUUsage(),
          memoryUsage: this.getMemoryUsage(),
          thermalState: this.getThermalState(),
          batteryImpact: this.getBatteryImpact()
        },
        quality: {
          droppedFrames: this.getDroppedFrameCount(),
          queueOverflows: this.getQueueOverflowCount(),
          processingErrors: this.getProcessingErrorCount(),
          averageConfidence: this.getAverageConfidence()
        },
        timestamp: now
      };

      this.lastMetricsUpdate = now;
    }
  }

  private checkAdaptiveQuality(): void {
    if (!this.adaptiveQuality.enabled) return;

    const currentMetrics = this.metrics;
    const triggers = this.adaptiveQuality.triggers;
    
    let shouldAdapt = false;
    const reasons: string[] = [];

    // Check triggers
    if (currentMetrics.resources.cpuUsage > triggers.cpuThreshold) {
      shouldAdapt = true;
      reasons.push('high_cpu');
    }
    
    if (currentMetrics.resources.memoryUsage > triggers.memoryThreshold) {
      shouldAdapt = true;
      reasons.push('high_memory');
    }
    
    if (currentMetrics.throughput.visionFPS < triggers.fpsThreshold) {
      shouldAdapt = true;
      reasons.push('low_fps');
    }

    if (shouldAdapt) {
      this.adaptQuality(reasons);
    }
  }

  private adaptQuality(reasons: string[]): void {
    console.log(`⚡ Adapting quality due to: ${reasons.join(', ')}`);
    
    const adjustments = this.adaptiveQuality.adjustments;
    
    if (adjustments.reduceFPS && reasons.includes('high_cpu')) {
      this.configuration.visionStage.targetFPS = Math.max(15, this.configuration.visionStage.targetFPS * 0.8);
    }
    
    if (adjustments.lowerMLFrequency && reasons.includes('high_memory')) {
      // Reduce ML inference frequency
    }
    
    if (adjustments.suspendCloudLLM) {
      this.configuration.cloudLLMStage.enabled = false;
    }

    this.emitEvent({
      type: 'performance_degradation',
      timestamp: Date.now(),
      stageId: 'adaptive_quality',
      data: { reasons, adjustments: Object.keys(adjustments).filter(k => (adjustments as any)[k]) },
      severity: 'warning'
    });
  }

  // Thread management
  private async setupThreads(): Promise<void> {
    // This would setup actual worker threads in a production environment
    // For now, just log the configuration
    console.log('🧵 Thread configuration:', this.threadConfiguration);
  }

  // Utility methods
  private calculateVisionConfidence(visionOutput: any): number {
    if (!visionOutput?.keyPoints) return 0;
    
    const avgConfidence = visionOutput.keyPoints.reduce((sum: number, kp: any) => 
      sum + kp.confidence, 0) / visionOutput.keyPoints.length;
    
    return avgConfidence;
  }

  private calculateFeatureConfidence(features: any): number {
    // Simplified confidence calculation
    const angleCount = Object.keys(features.jointAngles || {}).length;
    const velocityCount = features.velocities?.length || 0;
    
    return Math.min(1.0, (angleCount + velocityCount) / 10);
  }

  private addProcessingTime(stage: string, time: number): void {
    if (!this.processingTimes.has(stage)) {
      this.processingTimes.set(stage, []);
    }
    
    const times = this.processingTimes.get(stage)!;
    times.push(time);
    
    // Keep only last 10 measurements
    if (times.length > 10) {
      times.shift();
    }
  }

  private getAverageProcessingTime(stage: string): number {
    const times = this.processingTimes.get(stage);
    if (!times || times.length === 0) return 0;
    
    return times.reduce((a, b) => a + b) / times.length;
  }

  private handleStageError(stage: string, error: any): void {
    console.error(`Stage ${stage} error:`, error);
    this.emitEvent({
      type: 'stage_error',
      timestamp: Date.now(),
      stageId: stage,
      data: error,
      severity: 'error'
    });
  }

  private getCompletedStages(packets: (DataPacket | null)[]): string[] {
    return packets
      .filter((p): p is DataPacket => p !== null)
      .map(p => p.type);
  }

  // Simplified implementations for monitoring methods
  private getLLMResponseRate(): number { return 0; }
  private getCPUUsage(): number { return Math.random() * 50; }
  private getMemoryUsage(): number { return Math.random() * 30; }
  private getThermalState(): 'nominal' | 'fair' | 'serious' | 'critical' { return 'nominal'; }
  private getBatteryImpact(): number { return Math.random() * 20; }
  private getDroppedFrameCount(): number { return 0; }
  private getQueueOverflowCount(): number { return 0; }
  private getProcessingErrorCount(): number { return 0; }
  private getAverageConfidence(): number { return 0.8; }

  private emitEvent(event: PipelineEvent): void {
    this.eventHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('Event handler error:', error);
      }
    });
  }

  // Public methods
  start(): void {
    this.isRunning = true;
    console.log('▶️ Hierarchical Pipeline started');
  }

  stop(): void {
    this.isRunning = false;
    if (this.performanceMonitorInterval) {
      clearInterval(this.performanceMonitorInterval);
    }
    console.log('⏹️ Hierarchical Pipeline stopped');
  }

  addEventListener(handler: PipelineEventHandler): void {
    this.eventHandlers.push(handler);
  }

  removeEventListener(handler: PipelineEventHandler): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  getMetrics(): PipelineMetrics {
    return { ...this.metrics };
  }

  updateConfiguration(config: Partial<PipelineConfiguration>): void {
    this.configuration = { ...this.configuration, ...config };
  }

  applyPerformanceProfile(profile: PerformanceProfile): void {
    this.configuration = profile.configuration;
    this.threadConfiguration = profile.threadConfiguration;
    this.adaptiveQuality = profile.adaptiveQuality;
    
    console.log(`🎯 Applied performance profile: ${profile.name}`);
  }

  // Default configurations
  private getDefaultConfiguration(): PipelineConfiguration {
    return {
      visionStage: { name: 'vision', targetFPS: 30, maxProcessingTime: 33, priority: 'critical', enabled: true },
      featureStage: { name: 'features', targetFPS: 30, maxProcessingTime: 10, priority: 'high', enabled: true },
      mlStage: { name: 'ml', targetFPS: 5, maxProcessingTime: 200, priority: 'medium', enabled: true },
      localLLMStage: { name: 'local_llm', targetFPS: 1, maxProcessingTime: 1000, priority: 'low', enabled: true },
      cloudLLMStage: { name: 'cloud_llm', targetFPS: 0.1, maxProcessingTime: 5000, priority: 'low', enabled: true },
      visualizationStage: { name: 'visualization', targetFPS: 30, maxProcessingTime: 16, priority: 'medium', enabled: true },
      maxConcurrentTasks: 4,
      memoryLimit: 500,
      thermalThrottling: true,
      adaptiveQuality: true,
      backgroundProcessing: true
    };
  }

  private getDefaultThreadConfiguration(): ThreadConfiguration {
    return {
      mainThread: {
        responsibilities: ['UI', 'user_interaction', 'coordination'],
        maxCPUUsage: 30,
        priorityTasks: ['vision', 'visualization']
      },
      visionThread: {
        enabled: true,
        threadCount: 1,
        targetFPS: 30,
        memoryLimit: 100
      },
      mlThread: {
        enabled: true,
        threadCount: 1,
        batchSize: 1,
        inferenceTimeout: 500
      },
      llmThread: {
        enabled: true,
        threadCount: 1,
        maxConcurrentRequests: 2,
        cachingEnabled: true
      },
      backgroundThread: {
        enabled: true,
        lowPriorityTasks: ['cloud_llm', 'analytics', 'caching'],
        maxCPUUsage: 20,
        scheduleInterval: 1000
      }
    };
  }

  private getDefaultAdaptiveQuality(): AdaptiveQualitySettings {
    return {
      enabled: true,
      triggers: {
        cpuThreshold: 80,
        memoryThreshold: 70,
        thermalThreshold: 'serious',
        batteryThreshold: 20,
        fpsThreshold: 20
      },
      adjustments: {
        reduceFPS: true,
        skipFrames: true,
        lowerMLFrequency: true,
        disableAnimations: true,
        reduceOverlayElements: true,
        suspendCloudLLM: true
      },
      recovery: {
        checkInterval: 30,
        improvementThreshold: 0.8,
        restoreDelay: 60
      }
    };
  }

  private getEmptyMetrics(): PipelineMetrics {
    return {
      throughput: { visionFPS: 0, featureFPS: 0, mlInferenceFPS: 0, llmResponsesPerMinute: 0, visualizationFPS: 0 },
      latency: { visionToFeatures: 0, featuresToML: 0, mlToLLM: 0, endToEndLatency: 0 },
      resources: { cpuUsage: 0, memoryUsage: 0, thermalState: 'nominal', batteryImpact: 0 },
      quality: { droppedFrames: 0, queueOverflows: 0, processingErrors: 0, averageConfidence: 0 },
      timestamp: Date.now()
    };
  }
}
