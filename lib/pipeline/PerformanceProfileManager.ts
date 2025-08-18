import { PerformanceProfile, PipelineConfiguration, ThreadConfiguration, AdaptiveQualitySettings, CacheConfiguration } from './types';
import { DeviceCapabilityDetector } from '../vision/DeviceCapabilities';

export class PerformanceProfileManager {
  private static instance: PerformanceProfileManager;
  private profiles: Map<string, PerformanceProfile> = new Map();
  private activeProfile: PerformanceProfile | null = null;
  private deviceTier: 'basic' | 'enhanced' | 'pro' | 'ultra' = 'enhanced';

  private constructor() {
    this.initializeDefaultProfiles();
  }

  static getInstance(): PerformanceProfileManager {
    if (!PerformanceProfileManager.instance) {
      PerformanceProfileManager.instance = new PerformanceProfileManager();
    }
    return PerformanceProfileManager.instance;
  }

  async initialize(): Promise<void> {
    console.log('🎯 Initializing Performance Profile Manager...');

    try {
      // Detect device capabilities
      const capabilityDetector = DeviceCapabilityDetector.getInstance();
      const capabilities = await capabilityDetector.detectCapabilities();
      this.deviceTier = capabilities.tier;

      // Select optimal profile for device
      const optimalProfile = this.selectOptimalProfile();
      this.setActiveProfile(optimalProfile.name);

      console.log(`✅ Performance profile manager initialized with ${optimalProfile.name} profile for ${this.deviceTier} device`);
    } catch (error) {
      console.error('Failed to initialize performance profile manager:', error);
      // Fallback to basic profile
      this.setActiveProfile('basic');
    }
  }

  private initializeDefaultProfiles(): void {
    // Basic Profile - for entry-level devices
    this.profiles.set('basic', {
      name: 'basic',
      description: 'Optimized for basic devices with limited resources',
      targetDeviceTier: 'basic',
      configuration: {
        visionStage: { name: 'vision', targetFPS: 15, maxProcessingTime: 66, priority: 'critical', enabled: true },
        featureStage: { name: 'features', targetFPS: 15, maxProcessingTime: 20, priority: 'high', enabled: true },
        mlStage: { name: 'ml', targetFPS: 2, maxProcessingTime: 500, priority: 'medium', enabled: true },
        localLLMStage: { name: 'local_llm', targetFPS: 0.5, maxProcessingTime: 2000, priority: 'low', enabled: false },
        cloudLLMStage: { name: 'cloud_llm', targetFPS: 0.05, maxProcessingTime: 10000, priority: 'low', enabled: true },
        visualizationStage: { name: 'visualization', targetFPS: 15, maxProcessingTime: 33, priority: 'medium', enabled: true },
        maxConcurrentTasks: 2,
        memoryLimit: 200,
        thermalThrottling: true,
        adaptiveQuality: true,
        backgroundProcessing: false
      },
      threadConfiguration: {
        mainThread: { responsibilities: ['UI', 'coordination'], maxCPUUsage: 40, priorityTasks: ['vision'] },
        visionThread: { enabled: true, threadCount: 1, targetFPS: 15, memoryLimit: 50 },
        mlThread: { enabled: true, threadCount: 1, batchSize: 1, inferenceTimeout: 1000 },
        llmThread: { enabled: false, threadCount: 0, maxConcurrentRequests: 0, cachingEnabled: true },
        backgroundThread: { enabled: false, lowPriorityTasks: [], maxCPUUsage: 10, scheduleInterval: 2000 }
      },
      adaptiveQuality: {
        enabled: true,
        triggers: { cpuThreshold: 60, memoryThreshold: 50, thermalThreshold: 'fair', batteryThreshold: 30, fpsThreshold: 10 },
        adjustments: { reduceFPS: true, skipFrames: true, lowerMLFrequency: true, disableAnimations: true, reduceOverlayElements: true, suspendCloudLLM: true },
        recovery: { checkInterval: 60, improvementThreshold: 0.7, restoreDelay: 120 }
      },
      cacheConfiguration: {
        visionCache: { enabled: false, maxSize: 10, ttl: 1000 },
        mlCache: { enabled: true, maxSize: 20, ttl: 5000, similarityThreshold: 0.9 },
        llmCache: { enabled: true, maxSize: 50, ttl: 300000, keyStrategy: 'exact' },
        visualizationCache: { enabled: false, maxSize: 5, ttl: 1000 }
      }
    });

    // Enhanced Profile - for mid-range devices
    this.profiles.set('enhanced', {
      name: 'enhanced',
      description: 'Balanced performance for enhanced devices',
      targetDeviceTier: 'enhanced',
      configuration: {
        visionStage: { name: 'vision', targetFPS: 20, maxProcessingTime: 50, priority: 'critical', enabled: true },
        featureStage: { name: 'features', targetFPS: 20, maxProcessingTime: 15, priority: 'high', enabled: true },
        mlStage: { name: 'ml', targetFPS: 3, maxProcessingTime: 333, priority: 'medium', enabled: true },
        localLLMStage: { name: 'local_llm', targetFPS: 0.8, maxProcessingTime: 1250, priority: 'low', enabled: false },
        cloudLLMStage: { name: 'cloud_llm', targetFPS: 0.1, maxProcessingTime: 8000, priority: 'low', enabled: true },
        visualizationStage: { name: 'visualization', targetFPS: 20, maxProcessingTime: 25, priority: 'medium', enabled: true },
        maxConcurrentTasks: 3,
        memoryLimit: 300,
        thermalThrottling: true,
        adaptiveQuality: true,
        backgroundProcessing: true
      },
      threadConfiguration: {
        mainThread: { responsibilities: ['UI', 'coordination'], maxCPUUsage: 35, priorityTasks: ['vision', 'visualization'] },
        visionThread: { enabled: true, threadCount: 1, targetFPS: 20, memoryLimit: 75 },
        mlThread: { enabled: true, threadCount: 1, batchSize: 1, inferenceTimeout: 750 },
        llmThread: { enabled: false, threadCount: 0, maxConcurrentRequests: 1, cachingEnabled: true },
        backgroundThread: { enabled: true, lowPriorityTasks: ['cloud_llm', 'analytics'], maxCPUUsage: 15, scheduleInterval: 1500 }
      },
      adaptiveQuality: {
        enabled: true,
        triggers: { cpuThreshold: 70, memoryThreshold: 60, thermalThreshold: 'serious', batteryThreshold: 25, fpsThreshold: 15 },
        adjustments: { reduceFPS: true, skipFrames: true, lowerMLFrequency: true, disableAnimations: false, reduceOverlayElements: true, suspendCloudLLM: false },
        recovery: { checkInterval: 45, improvementThreshold: 0.75, restoreDelay: 90 }
      },
      cacheConfiguration: {
        visionCache: { enabled: true, maxSize: 15, ttl: 2000 },
        mlCache: { enabled: true, maxSize: 30, ttl: 10000, similarityThreshold: 0.85 },
        llmCache: { enabled: true, maxSize: 100, ttl: 600000, keyStrategy: 'exact' },
        visualizationCache: { enabled: true, maxSize: 10, ttl: 2000 }
      }
    });

    // Pro Profile - for high-end devices  
    this.profiles.set('pro', {
      name: 'pro',
      description: 'High performance for pro devices',
      targetDeviceTier: 'pro',
      configuration: {
        visionStage: { name: 'vision', targetFPS: 30, maxProcessingTime: 33, priority: 'critical', enabled: true },
        featureStage: { name: 'features', targetFPS: 30, maxProcessingTime: 10, priority: 'high', enabled: true },
        mlStage: { name: 'ml', targetFPS: 5, maxProcessingTime: 200, priority: 'medium', enabled: true },
        localLLMStage: { name: 'local_llm', targetFPS: 1, maxProcessingTime: 1000, priority: 'low', enabled: true },
        cloudLLMStage: { name: 'cloud_llm', targetFPS: 0.2, maxProcessingTime: 5000, priority: 'low', enabled: true },
        visualizationStage: { name: 'visualization', targetFPS: 30, maxProcessingTime: 16, priority: 'medium', enabled: true },
        maxConcurrentTasks: 4,
        memoryLimit: 500,
        thermalThrottling: true,
        adaptiveQuality: true,
        backgroundProcessing: true
      },
      threadConfiguration: {
        mainThread: { responsibilities: ['UI', 'coordination'], maxCPUUsage: 30, priorityTasks: ['vision', 'visualization'] },
        visionThread: { enabled: true, threadCount: 1, targetFPS: 30, memoryLimit: 100 },
        mlThread: { enabled: true, threadCount: 1, batchSize: 1, inferenceTimeout: 500 },
        llmThread: { enabled: true, threadCount: 1, maxConcurrentRequests: 2, cachingEnabled: true },
        backgroundThread: { enabled: true, lowPriorityTasks: ['cloud_llm', 'analytics', 'caching'], maxCPUUsage: 20, scheduleInterval: 1000 }
      },
      adaptiveQuality: {
        enabled: true,
        triggers: { cpuThreshold: 80, memoryThreshold: 70, thermalThreshold: 'serious', batteryThreshold: 20, fpsThreshold: 20 },
        adjustments: { reduceFPS: false, skipFrames: false, lowerMLFrequency: true, disableAnimations: false, reduceOverlayElements: false, suspendCloudLLM: false },
        recovery: { checkInterval: 30, improvementThreshold: 0.8, restoreDelay: 60 }
      },
      cacheConfiguration: {
        visionCache: { enabled: true, maxSize: 30, ttl: 3000 },
        mlCache: { enabled: true, maxSize: 50, ttl: 15000, similarityThreshold: 0.8 },
        llmCache: { enabled: true, maxSize: 200, ttl: 900000, keyStrategy: 'semantic' },
        visualizationCache: { enabled: true, maxSize: 20, ttl: 3000 }
      }
    });

    // Ultra Profile - for flagship devices
    this.profiles.set('ultra', {
      name: 'ultra',
      description: 'Maximum performance for ultra devices',
      targetDeviceTier: 'ultra',
      configuration: {
        visionStage: { name: 'vision', targetFPS: 60, maxProcessingTime: 16, priority: 'critical', enabled: true },
        featureStage: { name: 'features', targetFPS: 60, maxProcessingTime: 8, priority: 'high', enabled: true },
        mlStage: { name: 'ml', targetFPS: 10, maxProcessingTime: 100, priority: 'medium', enabled: true },
        localLLMStage: { name: 'local_llm', targetFPS: 2, maxProcessingTime: 500, priority: 'low', enabled: true },
        cloudLLMStage: { name: 'cloud_llm', targetFPS: 0.3, maxProcessingTime: 3000, priority: 'low', enabled: true },
        visualizationStage: { name: 'visualization', targetFPS: 60, maxProcessingTime: 8, priority: 'medium', enabled: true },
        maxConcurrentTasks: 6,
        memoryLimit: 800,
        thermalThrottling: true,
        adaptiveQuality: false, // Disable for maximum performance
        backgroundProcessing: true
      },
      threadConfiguration: {
        mainThread: { responsibilities: ['UI', 'coordination'], maxCPUUsage: 25, priorityTasks: ['vision', 'visualization'] },
        visionThread: { enabled: true, threadCount: 2, targetFPS: 60, memoryLimit: 150 },
        mlThread: { enabled: true, threadCount: 2, batchSize: 2, inferenceTimeout: 300 },
        llmThread: { enabled: true, threadCount: 2, maxConcurrentRequests: 4, cachingEnabled: true },
        backgroundThread: { enabled: true, lowPriorityTasks: ['cloud_llm', 'analytics', 'caching', 'training'], maxCPUUsage: 25, scheduleInterval: 500 }
      },
      adaptiveQuality: {
        enabled: false, // Ultra devices should maintain maximum quality
        triggers: { cpuThreshold: 90, memoryThreshold: 80, thermalThreshold: 'critical', batteryThreshold: 15, fpsThreshold: 30 },
        adjustments: { reduceFPS: false, skipFrames: false, lowerMLFrequency: false, disableAnimations: false, reduceOverlayElements: false, suspendCloudLLM: false },
        recovery: { checkInterval: 15, improvementThreshold: 0.9, restoreDelay: 30 }
      },
      cacheConfiguration: {
        visionCache: { enabled: true, maxSize: 60, ttl: 5000 },
        mlCache: { enabled: true, maxSize: 100, ttl: 30000, similarityThreshold: 0.75 },
        llmCache: { enabled: true, maxSize: 500, ttl: 1800000, keyStrategy: 'semantic' },
        visualizationCache: { enabled: true, maxSize: 50, ttl: 5000 }
      }
    });

    // Battery Saver Profile - for low battery situations
    this.profiles.set('battery_saver', {
      name: 'battery_saver',
      description: 'Optimized for maximum battery life',
      targetDeviceTier: 'basic', // Works on any device
      configuration: {
        visionStage: { name: 'vision', targetFPS: 10, maxProcessingTime: 100, priority: 'critical', enabled: true },
        featureStage: { name: 'features', targetFPS: 10, maxProcessingTime: 30, priority: 'high', enabled: true },
        mlStage: { name: 'ml', targetFPS: 1, maxProcessingTime: 1000, priority: 'medium', enabled: true },
        localLLMStage: { name: 'local_llm', targetFPS: 0, maxProcessingTime: 0, priority: 'low', enabled: false },
        cloudLLMStage: { name: 'cloud_llm', targetFPS: 0.02, maxProcessingTime: 15000, priority: 'low', enabled: false },
        visualizationStage: { name: 'visualization', targetFPS: 10, maxProcessingTime: 50, priority: 'low', enabled: true },
        maxConcurrentTasks: 1,
        memoryLimit: 150,
        thermalThrottling: true,
        adaptiveQuality: true,
        backgroundProcessing: false
      },
      threadConfiguration: {
        mainThread: { responsibilities: ['UI', 'coordination', 'processing'], maxCPUUsage: 20, priorityTasks: ['vision'] },
        visionThread: { enabled: false, threadCount: 0, targetFPS: 0, memoryLimit: 0 },
        mlThread: { enabled: false, threadCount: 0, batchSize: 0, inferenceTimeout: 0 },
        llmThread: { enabled: false, threadCount: 0, maxConcurrentRequests: 0, cachingEnabled: false },
        backgroundThread: { enabled: false, lowPriorityTasks: [], maxCPUUsage: 0, scheduleInterval: 0 }
      },
      adaptiveQuality: {
        enabled: true,
        triggers: { cpuThreshold: 30, memoryThreshold: 40, thermalThreshold: 'fair', batteryThreshold: 50, fpsThreshold: 5 },
        adjustments: { reduceFPS: true, skipFrames: true, lowerMLFrequency: true, disableAnimations: true, reduceOverlayElements: true, suspendCloudLLM: true },
        recovery: { checkInterval: 120, improvementThreshold: 0.6, restoreDelay: 300 }
      },
      cacheConfiguration: {
        visionCache: { enabled: false, maxSize: 0, ttl: 0 },
        mlCache: { enabled: true, maxSize: 10, ttl: 60000, similarityThreshold: 0.95 },
        llmCache: { enabled: false, maxSize: 0, ttl: 0, keyStrategy: 'exact' },
        visualizationCache: { enabled: false, maxSize: 0, ttl: 0 }
      }
    });

    // Performance Testing Profile - for benchmarking
    this.profiles.set('performance_test', {
      name: 'performance_test',
      description: 'Maximum performance for benchmarking and testing',
      targetDeviceTier: 'ultra',
      configuration: {
        visionStage: { name: 'vision', targetFPS: 120, maxProcessingTime: 8, priority: 'critical', enabled: true },
        featureStage: { name: 'features', targetFPS: 120, maxProcessingTime: 4, priority: 'critical', enabled: true },
        mlStage: { name: 'ml', targetFPS: 20, maxProcessingTime: 50, priority: 'high', enabled: true },
        localLLMStage: { name: 'local_llm', targetFPS: 5, maxProcessingTime: 200, priority: 'medium', enabled: true },
        cloudLLMStage: { name: 'cloud_llm', targetFPS: 1, maxProcessingTime: 1000, priority: 'low', enabled: true },
        visualizationStage: { name: 'visualization', targetFPS: 120, maxProcessingTime: 4, priority: 'high', enabled: true },
        maxConcurrentTasks: 10,
        memoryLimit: 1000,
        thermalThrottling: false,
        adaptiveQuality: false,
        backgroundProcessing: true
      },
      threadConfiguration: {
        mainThread: { responsibilities: ['coordination'], maxCPUUsage: 20, priorityTasks: [] },
        visionThread: { enabled: true, threadCount: 4, targetFPS: 120, memoryLimit: 250 },
        mlThread: { enabled: true, threadCount: 4, batchSize: 4, inferenceTimeout: 100 },
        llmThread: { enabled: true, threadCount: 4, maxConcurrentRequests: 10, cachingEnabled: true },
        backgroundThread: { enabled: true, lowPriorityTasks: ['analytics', 'training'], maxCPUUsage: 40, scheduleInterval: 100 }
      },
      adaptiveQuality: {
        enabled: false,
        triggers: { cpuThreshold: 100, memoryThreshold: 100, thermalThreshold: 'critical', batteryThreshold: 0, fpsThreshold: 60 },
        adjustments: { reduceFPS: false, skipFrames: false, lowerMLFrequency: false, disableAnimations: false, reduceOverlayElements: false, suspendCloudLLM: false },
        recovery: { checkInterval: 5, improvementThreshold: 1.0, restoreDelay: 5 }
      },
      cacheConfiguration: {
        visionCache: { enabled: true, maxSize: 120, ttl: 10000 },
        mlCache: { enabled: true, maxSize: 200, ttl: 60000, similarityThreshold: 0.5 },
        llmCache: { enabled: true, maxSize: 1000, ttl: 3600000, keyStrategy: 'semantic' },
        visualizationCache: { enabled: true, maxSize: 100, ttl: 10000 }
      }
    });

    console.log(`📊 Initialized ${this.profiles.size} performance profiles`);
  }

  selectOptimalProfile(): PerformanceProfile {
    // Select based on device tier
    const profileMap = {
      'basic': 'basic',
      'enhanced': 'enhanced', 
      'pro': 'pro',
      'ultra': 'ultra'
    };

    const profileName = profileMap[this.deviceTier] || 'enhanced';
    return this.profiles.get(profileName)!;
  }

  setActiveProfile(profileName: string): boolean {
    const profile = this.profiles.get(profileName);
    if (!profile) {
      console.warn(`Profile ${profileName} not found`);
      return false;
    }

    this.activeProfile = profile;
    console.log(`🎯 Activated performance profile: ${profile.name}`);
    return true;
  }

  getActiveProfile(): PerformanceProfile | null {
    return this.activeProfile;
  }

  getAllProfiles(): PerformanceProfile[] {
    return Array.from(this.profiles.values());
  }

  getProfilesForDevice(deviceTier: 'basic' | 'enhanced' | 'pro' | 'ultra'): PerformanceProfile[] {
    return Array.from(this.profiles.values())
      .filter(profile => 
        profile.targetDeviceTier === deviceTier || 
        profile.name === 'battery_saver' // Battery saver works on all devices
      );
  }

  createCustomProfile(
    name: string,
    baseProfile: string,
    customizations: Partial<PerformanceProfile>
  ): boolean {
    const base = this.profiles.get(baseProfile);
    if (!base) {
      console.error(`Base profile ${baseProfile} not found`);
      return false;
    }

    const customProfile: PerformanceProfile = {
      ...base,
      name,
      description: `Custom profile based on ${baseProfile}`,
      ...customizations
    };

    this.profiles.set(name, customProfile);
    console.log(`✅ Created custom profile: ${name}`);
    return true;
  }

  deleteProfile(profileName: string): boolean {
    // Prevent deletion of default profiles
    const protectedProfiles = ['basic', 'enhanced', 'pro', 'ultra', 'battery_saver', 'performance_test'];
    if (protectedProfiles.includes(profileName)) {
      console.warn(`Cannot delete protected profile: ${profileName}`);
      return false;
    }

    if (!this.profiles.has(profileName)) {
      console.warn(`Profile ${profileName} not found`);
      return false;
    }

    // If deleting active profile, switch to optimal profile
    if (this.activeProfile?.name === profileName) {
      const optimalProfile = this.selectOptimalProfile();
      this.setActiveProfile(optimalProfile.name);
    }

    this.profiles.delete(profileName);
    console.log(`🗑️ Deleted profile: ${profileName}`);
    return true;
  }

  benchmarkProfile(profileName: string): Promise<any> {
    // This would run actual benchmarks on the profile
    // For now, return mock benchmark results
    const profile = this.profiles.get(profileName);
    if (!profile) {
      throw new Error(`Profile ${profileName} not found`);
    }

    return Promise.resolve({
      profileName,
      averageFPS: profile.configuration.visionStage.targetFPS * 0.95,
      averageLatency: profile.configuration.visionStage.maxProcessingTime * 1.1,
      memoryUsage: profile.configuration.memoryLimit * 0.8,
      batteryLife: this.estimateBatteryLife(profile),
      qualityScore: this.calculateQualityScore(profile)
    });
  }

  private estimateBatteryLife(profile: PerformanceProfile): number {
    // Simplified battery life estimation based on profile settings
    let baseLifeMinutes = 240; // 4 hours base
    
    // Reduce based on FPS
    const visionFPS = profile.configuration.visionStage.targetFPS;
    baseLifeMinutes *= Math.max(0.3, 1 - (visionFPS - 15) / 60);
    
    // Reduce based on ML frequency
    const mlFPS = profile.configuration.mlStage.targetFPS;
    baseLifeMinutes *= Math.max(0.5, 1 - mlFPS / 10);
    
    // Reduce if local LLM enabled
    if (profile.configuration.localLLMStage.enabled) {
      baseLifeMinutes *= 0.7;
    }
    
    // Increase for battery saver profile
    if (profile.name === 'battery_saver') {
      baseLifeMinutes *= 2;
    }
    
    return Math.round(baseLifeMinutes);
  }

  private calculateQualityScore(profile: PerformanceProfile): number {
    let score = 50; // Base score
    
    // Higher FPS = higher quality
    score += Math.min(30, profile.configuration.visionStage.targetFPS / 2);
    
    // ML enabled = higher quality
    if (profile.configuration.mlStage.enabled) {
      score += 10;
    }
    
    // Local LLM enabled = higher quality
    if (profile.configuration.localLLMStage.enabled) {
      score += 10;
    }
    
    // Visualization enabled = higher quality
    if (profile.configuration.visualizationStage.enabled) {
      score += 5;
    }
    
    // Adaptive quality can reduce score
    if (profile.adaptiveQuality.enabled) {
      score -= 5;
    }
    
    return Math.min(100, Math.max(0, score));
  }

  // Automatic profile switching based on conditions
  autoSelectProfile(conditions: {
    batteryLevel?: number;
    thermalState?: 'nominal' | 'fair' | 'serious' | 'critical';
    cpuUsage?: number;
    memoryUsage?: number;
    userPreference?: 'performance' | 'balanced' | 'battery';
  }): boolean {
    let targetProfile = this.selectOptimalProfile().name;

    // Battery level considerations
    if (conditions.batteryLevel !== undefined && conditions.batteryLevel < 20) {
      targetProfile = 'battery_saver';
    }

    // Thermal considerations
    if (conditions.thermalState === 'critical') {
      targetProfile = 'battery_saver';
    } else if (conditions.thermalState === 'serious' && this.deviceTier !== 'ultra') {
      targetProfile = 'basic';
    }

    // Resource usage considerations
    if (conditions.cpuUsage !== undefined && conditions.cpuUsage > 80) {
      // Downgrade profile
      const downgrades = { 'ultra': 'pro', 'pro': 'enhanced', 'enhanced': 'basic' };
      targetProfile = (downgrades as any)[targetProfile] || targetProfile;
    }

    // User preference
    if (conditions.userPreference === 'battery') {
      targetProfile = 'battery_saver';
    } else if (conditions.userPreference === 'performance' && this.deviceTier === 'ultra') {
      targetProfile = 'ultra';
    }

    // Only switch if different from current
    if (this.activeProfile?.name !== targetProfile) {
      return this.setActiveProfile(targetProfile);
    }

    return false; // No change needed
  }

  getStats(): any {
    return {
      totalProfiles: this.profiles.size,
      activeProfile: this.activeProfile?.name || 'none',
      deviceTier: this.deviceTier,
      profileNames: Array.from(this.profiles.keys())
    };
  }
}