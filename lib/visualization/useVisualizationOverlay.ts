import { useState, useEffect, useRef, useCallback } from 'react';
import { Dimensions } from 'react-native';
import { VisualizationEngine } from './VisualizationEngine';
import { 
  OverlayConfiguration, 
  OverlayPreferences, 
  OverlayState,
  OverlayMetrics
} from './types';
import { VisionOutput, FeatureFrame } from '../vision/types';
import { MLModelOutput, ExerciseType } from '../ml/types';

interface UseVisualizationOverlayProps {
  exerciseType: ExerciseType;
  configuration?: Partial<OverlayConfiguration>;
  preferences?: Partial<OverlayPreferences>;
  enabled?: boolean;
  debugMode?: boolean;
}

interface VisualizationState {
  isInitialized: boolean;
  currentOverlay: OverlayState | null;
  metrics: OverlayMetrics | null;
  error: Error | null;
  performance: {
    averageRenderTime: number;
    droppedFrames: number;
    memoryUsage: number;
    elementCount: number;
  };
}

export const useVisualizationOverlay = ({
  exerciseType,
  configuration,
  preferences,
  enabled = true,
  debugMode = false
}: UseVisualizationOverlayProps) => {
  const [state, setState] = useState<VisualizationState>({
    isInitialized: false,
    currentOverlay: null,
    metrics: null,
    error: null,
    performance: {
      averageRenderTime: 0,
      droppedFrames: 0,
      memoryUsage: 0,
      elementCount: 0
    }
  });

  const visualizationEngine = useRef<VisualizationEngine | null>(null);
  const renderTimeHistory = useRef<number[]>([]);
  const lastUpdateTime = useRef<number>(0);
  const frameSkipCount = useRef<number>(0);

  // Initialize visualization engine
  useEffect(() => {
    if (!enabled) return;

    try {
      const { width, height } = Dimensions.get('window');
      
      visualizationEngine.current = new VisualizationEngine(
        {
          ...configuration,
          debugMode
        },
        preferences
      );

      setState(prev => ({
        ...prev,
        isInitialized: true,
        error: null
      }));

      console.log('🎨 Visualization overlay initialized');
    } catch (error) {
      console.error('Failed to initialize visualization overlay:', error);
      setState(prev => ({
        ...prev,
        error: error as Error,
        isInitialized: false
      }));
    }

    return () => {
      if (visualizationEngine.current) {
        visualizationEngine.current = null;
      }
    };
  }, [enabled, configuration, preferences, debugMode]);

  // Update visualization based on AI analysis
  const updateVisualization = useCallback(async (
    visionOutput: VisionOutput,
    features: FeatureFrame,
    mlAnalysis: MLModelOutput
  ): Promise<OverlayState | null> => {
    if (!visualizationEngine.current || !enabled || !state.isInitialized) {
      return null;
    }

    const now = performance.now();
    
    // Frame rate limiting - skip frames if we're falling behind
    const minFrameInterval = 1000 / 30; // 30 FPS max
    if (now - lastUpdateTime.current < minFrameInterval) {
      frameSkipCount.current++;
      return state.currentOverlay;
    }

    try {
      const overlayState = await visualizationEngine.current.updateVisualization(
        visionOutput,
        features,
        mlAnalysis,
        exerciseType
      );

      // Update performance metrics
      const renderTime = performance.now() - now;
      updatePerformanceMetrics(renderTime);

      // Update state
      setState(prev => ({
        ...prev,
        currentOverlay: overlayState,
        metrics: visualizationEngine.current?.getMetrics() || null,
        error: null
      }));

      lastUpdateTime.current = now;
      return overlayState;

    } catch (error) {
      console.error('Error updating visualization:', error);
      setState(prev => ({
        ...prev,
        error: error as Error
      }));
      return null;
    }
  }, [enabled, state.isInitialized, exerciseType]);

  // Update performance metrics
  const updatePerformanceMetrics = useCallback((renderTime: number) => {
    renderTimeHistory.current.push(renderTime);
    
    // Keep only last 30 measurements
    if (renderTimeHistory.current.length > 30) {
      renderTimeHistory.current.shift();
    }

    const averageRenderTime = renderTimeHistory.current.reduce((a, b) => a + b, 0) / 
                             renderTimeHistory.current.length;

    const elementCount = state.currentOverlay ? 
      (state.currentOverlay.angles.length + 
       state.currentOverlay.qualityIndicators.length + 
       state.currentOverlay.movementGuides.length + 
       state.currentOverlay.errorHighlights.length) : 0;

    setState(prev => ({
      ...prev,
      performance: {
        averageRenderTime,
        droppedFrames: frameSkipCount.current,
        memoryUsage: visualizationEngine.current?.getMetrics().memoryUsage || 0,
        elementCount
      }
    }));
  }, [state.currentOverlay]);

  // Configuration updates
  const updateConfiguration = useCallback((
    newConfig: Partial<OverlayConfiguration>
  ) => {
    if (visualizationEngine.current) {
      visualizationEngine.current.updateConfiguration(newConfig);
      console.log('🔧 Overlay configuration updated');
    }
  }, []);

  const updatePreferences = useCallback((
    newPreferences: Partial<OverlayPreferences>
  ) => {
    if (visualizationEngine.current) {
      visualizationEngine.current.updatePreferences(newPreferences);
      console.log('⚙️ Overlay preferences updated');
    }
  }, []);

  // Preset configurations
  const applyPreset = useCallback((preset: 'minimal' | 'standard' | 'detailed' | 'expert') => {
    const presetConfigs = {
      minimal: {
        configuration: {
          showAngles: false,
          showQualityIndicators: true,
          showMovementGuides: false,
          showErrorHighlights: true,
          maxOverlayElements: 5
        },
        preferences: {
          detailLevel: 'minimal' as const,
          showLabels: false,
          showValues: false,
          animationLevel: 'subtle' as const
        }
      },
      standard: {
        configuration: {
          showAngles: true,
          showQualityIndicators: true,
          showMovementGuides: false,
          showErrorHighlights: true,
          maxOverlayElements: 10
        },
        preferences: {
          detailLevel: 'standard' as const,
          showLabels: true,
          showValues: false,
          animationLevel: 'normal' as const
        }
      },
      detailed: {
        configuration: {
          showAngles: true,
          showQualityIndicators: true,
          showMovementGuides: true,
          showErrorHighlights: true,
          maxOverlayElements: 15
        },
        preferences: {
          detailLevel: 'detailed' as const,
          showLabels: true,
          showValues: true,
          animationLevel: 'normal' as const
        }
      },
      expert: {
        configuration: {
          showAngles: true,
          showQualityIndicators: true,
          showMovementGuides: true,
          showErrorHighlights: true,
          maxOverlayElements: 20,
          debugMode: true
        },
        preferences: {
          detailLevel: 'expert' as const,
          showLabels: true,
          showValues: true,
          animationLevel: 'enhanced' as const,
          opacity: 0.9
        }
      }
    };

    const config = presetConfigs[preset];
    updateConfiguration(config.configuration);
    updatePreferences(config.preferences);
    
    console.log(`🎯 Applied ${preset} visualization preset`);
  }, [updateConfiguration, updatePreferences]);

  // Toggle specific overlay elements
  const toggleElement = useCallback((elementType: 'angles' | 'quality' | 'guides' | 'errors') => {
    if (!visualizationEngine.current) return;

    const currentConfig = visualizationEngine.current.getConfiguration();
    const updates: Partial<OverlayConfiguration> = {};

    switch (elementType) {
      case 'angles':
        updates.showAngles = !currentConfig.showAngles;
        break;
      case 'quality':
        updates.showQualityIndicators = !currentConfig.showQualityIndicators;
        break;
      case 'guides':
        updates.showMovementGuides = !currentConfig.showMovementGuides;
        break;
      case 'errors':
        updates.showErrorHighlights = !currentConfig.showErrorHighlights;
        break;
    }

    updateConfiguration(updates);
  }, [updateConfiguration]);

  // Performance optimization
  const optimizeForDevice = useCallback((deviceTier: 'basic' | 'enhanced' | 'pro' | 'ultra') => {
    const optimizations = {
      basic: {
        configuration: {
          maxOverlayElements: 5,
          updateFrequency: 15,
          animationEnabled: false
        },
        preferences: {
          detailLevel: 'minimal' as const,
          animationLevel: 'none' as const,
          opacity: 0.6
        }
      },
      enhanced: {
        configuration: {
          maxOverlayElements: 10,
          updateFrequency: 20,
          animationEnabled: true
        },
        preferences: {
          detailLevel: 'standard' as const,
          animationLevel: 'subtle' as const,
          opacity: 0.7
        }
      },
      pro: {
        configuration: {
          maxOverlayElements: 15,
          updateFrequency: 30,
          animationEnabled: true
        },
        preferences: {
          detailLevel: 'detailed' as const,
          animationLevel: 'normal' as const,
          opacity: 0.8
        }
      },
      ultra: {
        configuration: {
          maxOverlayElements: 20,
          updateFrequency: 30,
          animationEnabled: true
        },
        preferences: {
          detailLevel: 'expert' as const,
          animationLevel: 'enhanced' as const,
          opacity: 0.9
        }
      }
    };

    const config = optimizations[deviceTier];
    updateConfiguration(config.configuration);
    updatePreferences(config.preferences);

    console.log(`⚡ Optimized visualization for ${deviceTier} device`);
  }, [updateConfiguration, updatePreferences]);

  // Clear overlay
  const clearOverlay = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentOverlay: null
    }));
  }, []);

  // Get current configuration
  const getCurrentConfig = useCallback(() => {
    if (!visualizationEngine.current) return null;
    
    return {
      configuration: visualizationEngine.current.getConfiguration(),
      preferences: visualizationEngine.current.getPreferences()
    };
  }, []);

  return {
    // State
    isInitialized: state.isInitialized,
    currentOverlay: state.currentOverlay,
    metrics: state.metrics,
    performance: state.performance,
    error: state.error,
    
    // Actions
    updateVisualization,
    updateConfiguration,
    updatePreferences,
    applyPreset,
    toggleElement,
    optimizeForDevice,
    clearOverlay,
    
    // Utilities
    getCurrentConfig,
    
    // Direct access to engine for advanced usage
    visualizationEngine: visualizationEngine.current
  };
};
