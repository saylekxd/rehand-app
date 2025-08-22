import DeviceInfo from 'react-native-device-info';
import { DeviceCapabilities } from '../types/ai';

export class DeviceCapabilitiesService {
  private capabilities: DeviceCapabilities | null = null;

  /**
   * Wykrywa możliwości urządzenia
   */
  async detectCapabilities(): Promise<DeviceCapabilities> {
    if (this.capabilities) {
      return this.capabilities;
    }

    try {
      const deviceModel = await DeviceInfo.getModel();
      const systemVersion = await DeviceInfo.getSystemVersion();
      const totalMemory = await DeviceInfo.getTotalMemory();
      
      // Sprawdź dostępność vision camera
      let hasVisionCamera = false;
      try {
        // Dynamiczny import żeby sprawdzić czy pakiet jest dostępny
        await import('react-native-vision-camera');
        hasVisionCamera = true;
      } catch {
        hasVisionCamera = false;
      }

      // Sprawdź dostępność pose detection
      let hasPoseDetection = false;
      try {
        await import('react-native-vision-camera-v3-pose-detection');
        hasPoseDetection = hasVisionCamera; // Pose detection wymaga vision camera
      } catch {
        hasPoseDetection = false;
      }

      // Sprawdź czy urządzenie ma MLKit (Android) lub Vision Framework (iOS)
      const hasMLKit = this.checkMLKitSupport(deviceModel, systemVersion);
      
      // Sprawdź czy może uruchomić lokalną analizę
      const canRunLocalAnalysis = totalMemory > 2 * 1024 * 1024 * 1024; // 2GB RAM minimum
      
      // Określ tier urządzenia
      const tier = this.determineTier(deviceModel, systemVersion, totalMemory);

      this.capabilities = {
        hasVisionCamera,
        hasPoseDetection,
        hasMLKit,
        canRunLocalAnalysis,
        tier
      };

      return this.capabilities;
      
    } catch (error) {
      console.error('Error detecting device capabilities:', error);
      
      // Fallback do podstawowych capabilities
      this.capabilities = {
        hasVisionCamera: false,
        hasPoseDetection: false,
        hasMLKit: false,
        canRunLocalAnalysis: false,
        tier: 'basic'
      };
      
      return this.capabilities;
    }
  }

  /**
   * Sprawdza wsparcie MLKit na podstawie modelu i wersji systemu
   */
  private checkMLKitSupport(deviceModel: string, systemVersion: string): boolean {
    // iOS: Vision Framework dostępny od iOS 13+
    if (deviceModel.includes('iPhone') || deviceModel.includes('iPad')) {
      const iosVersion = parseFloat(systemVersion);
      return iosVersion >= 13.0;
    }
    
    // Android: MLKit dostępny na większości nowoczesnych urządzeń
    if (deviceModel.includes('Android')) {
      const androidVersion = parseInt(systemVersion);
      return androidVersion >= 21; // Android 5.0+
    }
    
    return false;
  }

  /**
   * Określa tier urządzenia na podstawie specyfikacji
   */
  private determineTier(
    deviceModel: string, 
    systemVersion: string, 
    totalMemory: number
  ): 'basic' | 'enhanced' | 'pro' {
    
    // High-end devices (Pro tier)
    const proDevices = [
      'iPhone 13', 'iPhone 14', 'iPhone 15', 'iPhone 16',
      'iPad Pro', 'iPad Air'
    ];
    
    const isProDevice = proDevices.some(device => deviceModel.includes(device));
    const hasHighRAM = totalMemory > 6 * 1024 * 1024 * 1024; // 6GB+
    
    if (isProDevice && hasHighRAM) {
      return 'pro';
    }
    
    // Mid-range devices (Enhanced tier)
    const enhancedDevices = [
      'iPhone 11', 'iPhone 12', 'iPhone SE',
      'iPad'
    ];
    
    const isEnhancedDevice = enhancedDevices.some(device => deviceModel.includes(device));
    const hasMediumRAM = totalMemory > 3 * 1024 * 1024 * 1024; // 3GB+
    
    if (isEnhancedDevice || hasMediumRAM) {
      return 'enhanced';
    }
    
    // Basic tier dla starszych urządzeń
    return 'basic';
  }

  /**
   * Sprawdza czy urządzenie może uruchomić daną funkcję
   */
  async canRunFeature(feature: keyof DeviceCapabilities): Promise<boolean> {
    const capabilities = await this.detectCapabilities();
    return capabilities[feature] === true;
  }

  /**
   * Zwraca rekomendowane ustawienia dla danego urządzenia
   */
  async getRecommendedSettings(): Promise<{
    cameraFPS: number;
    analysisInterval: number;
    enableRealTimeOverlay: boolean;
    enablePoseDetection: boolean;
  }> {
    const capabilities = await this.detectCapabilities();
    
    switch (capabilities.tier) {
      case 'pro':
        return {
          cameraFPS: 30,
          analysisInterval: 200, // 5fps analysis
          enableRealTimeOverlay: true,
          enablePoseDetection: true
        };
        
      case 'enhanced':
        return {
          cameraFPS: 30,
          analysisInterval: 500, // 2fps analysis
          enableRealTimeOverlay: true,
          enablePoseDetection: true
        };
        
      case 'basic':
      default:
        return {
          cameraFPS: 24,
          analysisInterval: 1000, // 1fps analysis
          enableRealTimeOverlay: false,
          enablePoseDetection: false
        };
    }
  }

  /**
   * Loguje możliwości urządzenia dla debugowania
   */
  async logCapabilities(): Promise<void> {
    const capabilities = await this.detectCapabilities();
    console.log('Device Capabilities:', capabilities);
    
    const settings = await this.getRecommendedSettings();
    console.log('Recommended Settings:', settings);
  }
}

export const deviceCapabilitiesService = new DeviceCapabilitiesService();