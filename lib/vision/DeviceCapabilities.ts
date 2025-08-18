import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

export interface DeviceCapabilities {
  // Vision capabilities
  has2DPose: boolean;
  has3DPose: boolean;
  hasLiDARDepth: boolean;
  
  // ML capabilities  
  hasCoreML: boolean;           // iOS
  hasTensorFlowLite: boolean;   // Android
  hasNeuralEngine: boolean;     // A12+ chips
  
  // LLM capabilities
  canRunLocalLLM: boolean;      // RAM/storage check
  preferredLocalModel: 'MLC' | 'ReactNativeAI' | 'none';
  
  // Device specs
  totalMemoryGB: number;
  availableStorageGB: number;
  chipset: string;
  isTablet: boolean;
  
  // Tier assignment
  tier: 'basic' | 'enhanced' | 'pro' | 'ultra';
}

export class DeviceCapabilityDetector {
  private static instance: DeviceCapabilityDetector;
  private capabilities: DeviceCapabilities | null = null;

  private constructor() {}

  static getInstance(): DeviceCapabilityDetector {
    if (!DeviceCapabilityDetector.instance) {
      DeviceCapabilityDetector.instance = new DeviceCapabilityDetector();
    }
    return DeviceCapabilityDetector.instance;
  }

  async detectCapabilities(): Promise<DeviceCapabilities> {
    if (this.capabilities) {
      return this.capabilities;
    }

    console.log('🔍 Detecting device capabilities...');

    try {
      // Get basic device info
      const totalMemory = await DeviceInfo.getTotalMemory();
      const availableStorage = await DeviceInfo.getFreeDiskStorage();
      const systemName = DeviceInfo.getSystemName();
      const model = await DeviceInfo.getModel();
      const deviceId = await DeviceInfo.getDeviceId();
      const isTablet = await DeviceInfo.isTablet();

      // Convert bytes to GB
      const totalMemoryGB = totalMemory / (1024 * 1024 * 1024);
      const availableStorageGB = availableStorage / (1024 * 1024 * 1024);

      // Detect platform-specific capabilities
      const visionCapabilities = this.detectVisionCapabilities(systemName, model);
      const mlCapabilities = this.detectMLCapabilities(systemName, model, totalMemoryGB);
      const llmCapabilities = this.detectLLMCapabilities(totalMemoryGB, availableStorageGB);
      
      this.capabilities = {
        ...visionCapabilities,
        ...mlCapabilities,
        ...llmCapabilities,
        totalMemoryGB,
        availableStorageGB,
        chipset: this.detectChipset(model, deviceId),
        isTablet,
        tier: this.calculateTier(totalMemoryGB, systemName, model)
      };

      console.log('✅ Device capabilities detected:', this.capabilities);
      return this.capabilities;

    } catch (error) {
      console.error('❌ Error detecting device capabilities:', error);
      
      // Fallback to basic capabilities
      this.capabilities = this.getBasicCapabilities();
      return this.capabilities;
    }
  }

  private detectVisionCapabilities(systemName: string, model: string) {
    // Most modern devices support 2D pose detection
    const has2DPose = true;
    
    // 3D pose detection available on most devices with decent cameras
    const has3DPose = true;
    
    // LiDAR detection (primarily iOS Pro models from 2020+)
    let hasLiDARDepth = false;
    if (Platform.OS === 'ios') {
      const lidarModels = [
        'iPhone12,3', 'iPhone12,5', // iPhone 12 Pro/Pro Max
        'iPhone13,3', 'iPhone13,4', // iPhone 13 Pro/Pro Max  
        'iPhone14,3', 'iPhone14,4', // iPhone 14 Pro/Pro Max
        'iPhone15,3', 'iPhone15,4', // iPhone 15 Pro/Pro Max
        'iPad8,11', 'iPad8,12',     // iPad Pro 2020
        'iPad13,1', 'iPad13,2',     // iPad Pro 2021
        'iPad14,3', 'iPad14,4'      // iPad Pro 2022
      ];
      hasLiDARDepth = lidarModels.some(lidarModel => model.includes(lidarModel));
    }

    return { has2DPose, has3DPose, hasLiDARDepth };
  }

  private detectMLCapabilities(systemName: string, model: string, memoryGB: number) {
    const hasCoreML = Platform.OS === 'ios';
    const hasTensorFlowLite = Platform.OS === 'android' || memoryGB >= 2;
    
    // Neural Engine detection (A12+ chips)
    let hasNeuralEngine = false;
    if (Platform.OS === 'ios') {
      // A12+ chips have Neural Engine
      const neuralEngineModels = [
        'iPhone11', 'iPhone12', 'iPhone13', 'iPhone14', 'iPhone15', 'iPhone16', // iPhone XS and newer
        'iPad8', 'iPad13', 'iPad14', // iPad Pro with A12Z/M1/M2
        'iPad11', 'iPad12', // iPad Air with A14/A15
        'iPad14' // iPad Pro 2022
      ];
      hasNeuralEngine = neuralEngineModels.some(neuralModel => 
        model.startsWith(neuralModel)
      );
    }

    return { hasCoreML, hasTensorFlowLite, hasNeuralEngine };
  }

  private detectLLMCapabilities(memoryGB: number, storageGB: number) {
    // LLM requirements based on model sizes
    const canRunLocalLLM = memoryGB >= 3 && storageGB >= 10; // Minimum requirements
    
    let preferredLocalModel: 'MLC' | 'ReactNativeAI' | 'none' = 'none';
    
    if (memoryGB >= 6 && storageGB >= 20) {
      preferredLocalModel = 'MLC'; // Better for larger models
    } else if (memoryGB >= 3 && storageGB >= 10) {
      preferredLocalModel = 'ReactNativeAI'; // Lighter alternative
    }

    return { canRunLocalLLM, preferredLocalModel };
  }

  private detectChipset(model: string, deviceId: string): string {
    if (Platform.OS === 'ios') {
      // iOS chipset detection based on model
      if (model.includes('iPhone15') || model.includes('iPhone16')) return 'A17 Pro';
      if (model.includes('iPhone14')) return 'A16 Bionic';
      if (model.includes('iPhone13')) return 'A15 Bionic';
      if (model.includes('iPhone12')) return 'A14 Bionic';
      if (model.includes('iPhone11')) return 'A13 Bionic';
      return 'A-series';
    }
    
    // Android chipset detection (simplified)
    return 'Android SoC';
  }

  private calculateTier(memoryGB: number, systemName: string, model: string): 'basic' | 'enhanced' | 'pro' | 'ultra' {
    // Ultra tier: High-end devices with 8GB+ RAM
    if (memoryGB >= 8) {
      return 'ultra';
    }
    
    // Pro tier: Mid-high end devices with 6GB+ RAM
    if (memoryGB >= 6) {
      return 'pro';
    }
    
    // Enhanced tier: Modern devices with 4GB+ RAM
    if (memoryGB >= 4) {
      return 'enhanced';
    }
    
    // Basic tier: Entry-level or older devices
    return 'basic';
  }

  private getBasicCapabilities(): DeviceCapabilities {
    return {
      has2DPose: true,
      has3DPose: false,
      hasLiDARDepth: false,
      hasCoreML: Platform.OS === 'ios',
      hasTensorFlowLite: true,
      hasNeuralEngine: false,
      canRunLocalLLM: false,
      preferredLocalModel: 'none',
      totalMemoryGB: 3,
      availableStorageGB: 10,
      chipset: 'Unknown',
      isTablet: false,
      tier: 'basic'
    };
  }

  // Get current capabilities (cached)
  getCurrentCapabilities(): DeviceCapabilities | null {
    return this.capabilities;
  }

  // Check if specific capability is available
  hasCapability(capability: keyof DeviceCapabilities): boolean {
    return this.capabilities ? Boolean(this.capabilities[capability]) : false;
  }

  // Get recommended settings based on capabilities
  getRecommendedSettings() {
    if (!this.capabilities) return null;

    const settings = {
      visionProcessingFPS: 30,
      mlInferenceFPS: 5,
      useLocalLLM: false,
      visualizationQuality: 'medium',
      maxHistoryFrames: 90
    };

    switch (this.capabilities.tier) {
      case 'ultra':
        settings.visionProcessingFPS = 60;
        settings.mlInferenceFPS = 10;
        settings.useLocalLLM = true;
        settings.visualizationQuality = 'high';
        settings.maxHistoryFrames = 180;
        break;
        
      case 'pro':
        settings.visionProcessingFPS = 30;
        settings.mlInferenceFPS = 8;
        settings.useLocalLLM = this.capabilities.canRunLocalLLM;
        settings.visualizationQuality = 'high';
        settings.maxHistoryFrames = 120;
        break;
        
      case 'enhanced':
        settings.visionProcessingFPS = 30;
        settings.mlInferenceFPS = 5;
        settings.useLocalLLM = false;
        settings.visualizationQuality = 'medium';
        settings.maxHistoryFrames = 90;
        break;
        
      case 'basic':
        settings.visionProcessingFPS = 20;
        settings.mlInferenceFPS = 3;
        settings.useLocalLLM = false;
        settings.visualizationQuality = 'low';
        settings.maxHistoryFrames = 60;
        break;
    }

    return settings;
  }
}