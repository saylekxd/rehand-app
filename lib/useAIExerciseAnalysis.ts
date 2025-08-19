import { useEffect, useState, useCallback, useRef } from 'react';
import { AICoordinator, AICoordinatorConfig, AIAnalysisOutput } from './AICoordinator';
import { ExerciseType } from './ml/types';
import { LocalLLMResponse, MotivationalContext } from './llm/types';

/**
 * React Hook for AI Exercise Analysis
 * 
 * This hook provides a simple interface to integrate the hierarchical AI system
 * into React Native components.
 */

interface UseAIExerciseAnalysisProps {
  exerciseType: ExerciseType;
  userProfile?: {
    level: 'beginner' | 'intermediate' | 'advanced';
    goals: string[];
    preferences: {
      motivationStyle: 'encouraging' | 'challenging' | 'educational';
      responseLength: 'short' | 'medium' | 'detailed';
      language: 'pl' | 'en';
    };
  };
  enableLocalLLM?: boolean;
  enableCloudLLM?: boolean;
  debugMode?: boolean;
}

interface AIAnalysisState {
  isInitialized: boolean;
  isProcessing: boolean;
  currentAnalysis: AIAnalysisOutput | null;
  recentMessages: LocalLLMResponse[];
  sessionStats: {
    repsCompleted: number;
    avgQuality: number;
    sessionDuration: number;
    errorsDetected: string[];
  };
  performance: {
    visionFPS: number;
    mlFPS: number;
    averageLatency: number;
  };
  error: Error | null;
}

export const useAIExerciseAnalysis = ({
  exerciseType,
  userProfile,
  enableLocalLLM = true,
  enableCloudLLM = false,
  debugMode = false
}: UseAIExerciseAnalysisProps) => {
  const [state, setState] = useState<AIAnalysisState>({
    isInitialized: false,
    isProcessing: false,
    currentAnalysis: null,
    recentMessages: [],
    sessionStats: {
      repsCompleted: 0,
      avgQuality: 0,
      sessionDuration: 0,
      errorsDetected: []
    },
    performance: {
      visionFPS: 0,
      mlFPS: 0,
      averageLatency: 0
    },
    error: null
  });

  const aiCoordinator = useRef<AICoordinator | null>(null);
  const sessionStartTime = useRef<number>(Date.now());
  const analysisHistory = useRef<AIAnalysisOutput[]>([]);

  // Initialize AI system
  useEffect(() => {
    const initializeAI = async () => {
      try {
        console.log('🚀 Initializing AI Exercise Analysis...');
        
        aiCoordinator.current = AICoordinator.getInstance();
        
        // Create user context
        const userContext: MotivationalContext = {
          currentStreak: 0,
          todayProgress: 0,
          weeklyGoal: 100,
          personalBest: 0,
          strugglingArea: '',
          recentImprovement: '',
          userPreferences: {
            motivationStyle: userProfile?.preferences.motivationStyle || 'encouraging',
            responseLength: userProfile?.preferences.responseLength || 'short',
            language: userProfile?.preferences.language || 'pl'
          }
        };

        const config: AICoordinatorConfig = {
          exerciseType,
          userContext,
          enableLocalLLM,
          enableCloudLLM,
          visualizationEnabled: true,
          debugMode
        };

        // Set up callbacks
        aiCoordinator.current.setOnAnalysisCallback(handleAnalysisOutput);
        aiCoordinator.current.setOnLLMResponseCallback(handleLLMResponse);
        aiCoordinator.current.setOnErrorCallback(handleError);

        // Initialize the system
        await aiCoordinator.current.initialize(config);
        
        setState(prev => ({ 
          ...prev, 
          isInitialized: true,
          error: null
        }));

        console.log('✅ AI Exercise Analysis initialized');
        
      } catch (error) {
        console.error('❌ Failed to initialize AI:', error);
        setState(prev => ({ 
          ...prev, 
          error: error as Error,
          isInitialized: false
        }));
      }
    };

    initializeAI();

    // Cleanup on unmount
    return () => {
      if (aiCoordinator.current) {
        aiCoordinator.current.dispose();
      }
    };
  }, [exerciseType, enableLocalLLM, enableCloudLLM, debugMode]);

  // Handle analysis output from AI system
  const handleAnalysisOutput = useCallback((output: AIAnalysisOutput) => {
    analysisHistory.current.push(output);
    
    // Keep only last 100 analyses for performance
    if (analysisHistory.current.length > 100) {
      analysisHistory.current = analysisHistory.current.slice(-100);
    }

    // Update session stats
    const repsCompleted = analysisHistory.current.filter(
      a => a.mlAnalysis?.repEndProbability && a.mlAnalysis.repEndProbability > 0.7
    ).length;

    const qualityScores = analysisHistory.current
      .filter(a => a.mlAnalysis?.qualityScore)
      .map(a => a.mlAnalysis!.qualityScore);
    
    const avgQuality = qualityScores.length > 0 
      ? qualityScores.reduce((a, b) => a + b) / qualityScores.length 
      : 0;

    const allErrors = new Set<string>();
    analysisHistory.current.forEach(analysis => {
      if (analysis.mlAnalysis?.commonErrors) {
        Object.entries(analysis.mlAnalysis.commonErrors).forEach(([error, probability]) => {
          if (probability > 0.5) {
            allErrors.add(error);
          }
        });
      }
    });

    const latencies = analysisHistory.current.map(a => a.performance.totalLatency);
    const averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

    setState(prev => ({
      ...prev,
      currentAnalysis: output,
      sessionStats: {
        repsCompleted,
        avgQuality,
        sessionDuration: (Date.now() - sessionStartTime.current) / 1000,
        errorsDetected: Array.from(allErrors)
      },
      performance: {
        visionFPS: output.performance.visionFPS,
        mlFPS: output.performance.mlInferenceFPS,
        averageLatency
      }
    }));

    if (debugMode) {
      console.log('🔍 AI Analysis:', {
        quality: output.mlAnalysis?.qualityScore,
        errors: output.mlAnalysis?.commonErrors,
        triggers: output.triggers.length,
        fps: `${output.performance.visionFPS.toFixed(1)}fps vision, ${output.performance.mlInferenceFPS.toFixed(1)}fps ML`
      });
    }
  }, [debugMode]);

  // Handle LLM responses
  const handleLLMResponse = useCallback((response: LocalLLMResponse) => {
    setState(prev => ({
      ...prev,
      recentMessages: [response, ...prev.recentMessages.slice(0, 9)] // Keep last 10 messages
    }));

    if (debugMode) {
      console.log('💬 LLM Response:', {
        message: response.message,
        confidence: response.confidence,
        responseTime: `${response.responseTime.toFixed(0)}ms`,
        isFallback: response.isFallback
      });
    }
  }, [debugMode]);

  // Handle errors
  const handleError = useCallback((error: Error) => {
    console.error('🚨 AI System Error:', error);
    setState(prev => ({ ...prev, error }));
  }, []);

  // Process camera frame
  const processFrame = useCallback(async (imageData: ImageData) => {
    if (!aiCoordinator.current || !state.isInitialized) {
      return null;
    }

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const analysis = await aiCoordinator.current.processFrame(imageData);
      return analysis;
    } catch (error) {
      handleError(error as Error);
      return null;
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [state.isInitialized, handleError]);

  // Start exercise session
  const startSession = useCallback(() => {
    if (!aiCoordinator.current) return;
    
    console.log(`🎯 Starting exercise session: ${exerciseType}`);
    
    aiCoordinator.current.startSession(exerciseType);
    sessionStartTime.current = Date.now();
    analysisHistory.current = [];
    
    setState(prev => ({
      ...prev,
      recentMessages: [],
      sessionStats: {
        repsCompleted: 0,
        avgQuality: 0,
        sessionDuration: 0,
        errorsDetected: []
      }
    }));
  }, [exerciseType]);

  // End exercise session
  const endSession = useCallback(async () => {
    if (!aiCoordinator.current) return;
    
    console.log('🏁 Ending exercise session');
    await aiCoordinator.current.endSession();
  }, []);

  // Update exercise type
  const changeExercise = useCallback((newExerciseType: ExerciseType) => {
    if (!aiCoordinator.current) return;
    
    console.log(`🔄 Changing exercise to: ${newExerciseType}`);
    aiCoordinator.current.updateExerciseType(newExerciseType);
  }, []);

  // Get system diagnostics
  const getSystemStatus = useCallback(() => {
    if (!aiCoordinator.current) return null;
    return aiCoordinator.current.getSystemStatus();
  }, []);

  return {
    // State
    isInitialized: state.isInitialized,
    isProcessing: state.isProcessing,
    error: state.error,
    
    // Current analysis
    currentAnalysis: state.currentAnalysis,
    recentMessages: state.recentMessages,
    sessionStats: state.sessionStats,
    performance: state.performance,
    
    // Visualization data
    visualizationData: state.currentAnalysis?.visualization || null,
    
    // Actions
    processFrame,
    startSession,
    endSession,
    changeExercise,
    
    // Diagnostics
    getSystemStatus,
    
    // Raw data for advanced usage
    analysisHistory: analysisHistory.current,
    aiCoordinator: aiCoordinator.current
  };
};

// Helper hook for simplified integration
export const useSimpleAIFeedback = (exerciseType: ExerciseType) => {
  const ai = useAIExerciseAnalysis({
    exerciseType,
    enableLocalLLM: true,
    enableCloudLLM: false,
    debugMode: false
  });

  return {
    isReady: ai.isInitialized && !ai.error,
    currentQuality: ai.currentAnalysis?.mlAnalysis?.qualityScore || 0,
    latestMessage: ai.recentMessages[0]?.message || '',
    repsCompleted: ai.sessionStats.repsCompleted,
    avgQuality: ai.sessionStats.avgQuality,
    visualizationData: ai.visualizationData,
    processFrame: ai.processFrame,
    startSession: ai.startSession,
    endSession: ai.endSession,
    error: ai.error
  };
};
