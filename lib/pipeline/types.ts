// Data Pipeline Types for Hierarchical AI System

export interface PipelineStage {
  name: string;
  targetFPS: number;
  maxProcessingTime: number; // milliseconds
  priority: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
}

export interface PipelineConfiguration {
  visionStage: PipelineStage;
  featureStage: PipelineStage;
  mlStage: PipelineStage;
  localLLMStage: PipelineStage;
  cloudLLMStage: PipelineStage;
  visualizationStage: PipelineStage;
  
  // Global settings
  maxConcurrentTasks: number;
  memoryLimit: number; // MB
  thermalThrottling: boolean;
  adaptiveQuality: boolean;
  backgroundProcessing: boolean;
}

export interface DataPacket {
  id: string;
  timestamp: number;
  type: 'vision' | 'features' | 'ml_analysis' | 'llm_response' | 'visualization';
  data: any;
  metadata: {
    processingTime: number;
    confidence: number;
    source: string;
    priority: 'urgent' | 'high' | 'normal' | 'low';
    expiresAt?: number;
  };
}

export interface ProcessingQueue {
  urgent: DataPacket[];
  high: DataPacket[];
  normal: DataPacket[];
  low: DataPacket[];
}

export interface PipelineMetrics {
  throughput: {
    visionFPS: number;
    featureFPS: number;
    mlInferenceFPS: number;
    llmResponsesPerMinute: number;
    visualizationFPS: number;
  };
  latency: {
    visionToFeatures: number;
    featuresToML: number;
    mlToLLM: number;
    endToEndLatency: number;
  };
  resources: {
    cpuUsage: number;
    memoryUsage: number;
    thermalState: 'nominal' | 'fair' | 'serious' | 'critical';
    batteryImpact: number;
  };
  quality: {
    droppedFrames: number;
    queueOverflows: number;
    processingErrors: number;
    averageConfidence: number;
  };
  timestamp: number;
}

export interface WorkerPool {
  visionWorkers: Worker[];
  mlWorkers: Worker[];
  llmWorkers: Worker[];
  availableWorkers: number;
  busyWorkers: number;
  queuedTasks: number;
}

export interface ThreadConfiguration {
  mainThread: {
    responsibilities: string[];
    maxCPUUsage: number;
    priorityTasks: string[];
  };
  visionThread: {
    enabled: boolean;
    threadCount: number;
    targetFPS: number;
    memoryLimit: number;
  };
  mlThread: {
    enabled: boolean;
    threadCount: number;
    batchSize: number;
    inferenceTimeout: number;
  };
  llmThread: {
    enabled: boolean;
    threadCount: number;
    maxConcurrentRequests: number;
    cachingEnabled: boolean;
  };
  backgroundThread: {
    enabled: boolean;
    lowPriorityTasks: string[];
    maxCPUUsage: number;
    scheduleInterval: number;
  };
}

export interface DataFlowNode {
  id: string;
  name: string;
  type: 'source' | 'processor' | 'sink' | 'splitter' | 'merger';
  inputs: string[];
  outputs: string[];
  processingFunction: (data: any) => Promise<any>;
  configuration: any;
  metrics: {
    processedCount: number;
    averageProcessingTime: number;
    errorCount: number;
    lastProcessedAt: number;
  };
}

export interface DataFlowGraph {
  nodes: Map<string, DataFlowNode>;
  edges: Map<string, string[]>; // nodeId -> [outputNodeIds]
  executionOrder: string[];
  isValid: boolean;
}

export interface AdaptiveQualitySettings {
  enabled: boolean;
  triggers: {
    cpuThreshold: number;       // 0-100%
    memoryThreshold: number;    // 0-100%
    thermalThreshold: string;   // 'fair' | 'serious' | 'critical'
    batteryThreshold: number;   // 0-100%
    fpsThreshold: number;       // Minimum acceptable FPS
  };
  adjustments: {
    reduceFPS: boolean;
    skipFrames: boolean;
    lowerMLFrequency: boolean;
    disableAnimations: boolean;
    reduceOverlayElements: boolean;
    suspendCloudLLM: boolean;
  };
  recovery: {
    checkInterval: number;      // seconds
    improvementThreshold: number;
    restoreDelay: number;       // seconds
  };
}

export interface PipelineEvent {
  type: 'stage_complete' | 'stage_error' | 'queue_overflow' | 'thermal_throttle' | 'performance_degradation';
  timestamp: number;
  stageId: string;
  data?: any;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export type PipelineEventHandler = (event: PipelineEvent) => void;

export interface CacheConfiguration {
  visionCache: {
    enabled: boolean;
    maxSize: number;        // number of frames
    ttl: number;           // milliseconds
  };
  mlCache: {
    enabled: boolean;
    maxSize: number;        // number of results
    ttl: number;
    similarityThreshold: number;
  };
  llmCache: {
    enabled: boolean;
    maxSize: number;        // number of responses
    ttl: number;
    keyStrategy: 'exact' | 'semantic';
  };
  visualizationCache: {
    enabled: boolean;
    maxSize: number;
    ttl: number;
  };
}

export interface PerformanceProfile {
  name: string;
  description: string;
  configuration: PipelineConfiguration;
  threadConfiguration: ThreadConfiguration;
  adaptiveQuality: AdaptiveQualitySettings;
  cacheConfiguration: CacheConfiguration;
  targetDeviceTier: 'basic' | 'enhanced' | 'pro' | 'ultra';
  benchmarkResults?: {
    averageFPS: number;
    averageLatency: number;
    memoryUsage: number;
    batteryLife: number; // minutes
    qualityScore: number;
  };
}