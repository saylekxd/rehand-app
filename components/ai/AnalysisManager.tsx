import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { KeyPoint, FeatureFrame, AnalysisSession, CloudAnalysisResponse } from '../../types/ai';
import { featureExtractor } from '../../services/featureExtractor';
import { cloudLLMService } from '../../services/cloudLLM';
import { deviceCapabilitiesService } from '../../services/deviceCapabilities';
import { PoseOverlay } from './PoseOverlay';

interface AnalysisManagerProps {
  exerciseType: string;
  isAnalyzing: boolean;
  keyPoints: KeyPoint[];
  onAnalysisComplete: (result: CloudAnalysisResponse) => void;
  onRepDetected: (repCount: number) => void;
  onQualityUpdate: (score: number) => void;
}

export const AnalysisManager: React.FC<AnalysisManagerProps> = ({
  exerciseType,
  isAnalyzing,
  keyPoints,
  onAnalysisComplete,
  onRepDetected,
  onQualityUpdate
}) => {
  // KeyPoints są teraz przekazywane przez props z parent component
  const [currentAngles, setCurrentAngles] = useState<Record<string, number>>({});
  const [currentQuality, setCurrentQuality] = useState<number>(0);
  const [session, setSession] = useState<AnalysisSession | null>(null);
  const [deviceSettings, setDeviceSettings] = useState({
    enablePoseDetection: false,
    analysisInterval: 1000,
    enableRealTimeOverlay: false
  });

  // Inicjalizacja sesji i wykrywanie możliwości urządzenia
  useEffect(() => {
    initializeSession();
    detectDeviceCapabilities();
  }, [exerciseType]); // eslint-disable-line react-hooks/exhaustive-deps

  // Obsługa analizy w czasie rzeczywistym
  useEffect(() => {
    if (!isAnalyzing) {
      if (session) {
        finalizeSession();
      }
      return;
    }

    const interval = setInterval(() => {
      if (deviceSettings.enablePoseDetection && keyPoints.length > 0) {
        performRealtimeAnalysis();
      }
    }, deviceSettings.analysisInterval);

    return () => clearInterval(interval);
  }, [isAnalyzing, keyPoints, deviceSettings.analysisInterval]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Inicjalizuje nową sesję analizy
   */
  const initializeSession = () => {
    const newSession: AnalysisSession = {
      sessionId: `session_${Date.now()}`,
      exerciseType,
      startTime: Date.now(),
      frames: [],
      detectedReps: 0,
      averageQuality: 0
    };
    
    setSession(newSession);
    featureExtractor.resetSession();
  };

  /**
   * Wykrywa możliwości urządzenia i ustawia konfigurację
   */
  const detectDeviceCapabilities = async () => {
    try {
      const settings = await deviceCapabilitiesService.getRecommendedSettings();
      setDeviceSettings(settings);
    } catch (error) {
      console.error('Failed to detect device capabilities:', error);
      // Fallback do podstawowych ustawień
      setDeviceSettings({
        enablePoseDetection: false,
        analysisInterval: 1000,
        enableRealTimeOverlay: false
      });
    }
  };

  // KeyPoints są teraz otrzymywane przez props, więc usuwamy handlePoseDetection

  /**
   * Wykonuje analizę w czasie rzeczywistym
   */
  const performRealtimeAnalysis = () => {
    if (!session || keyPoints.length === 0) return;

    try {
      // Ekstraktuj cechy z aktualnych keypoints
      const features = featureExtractor.extractFeatures(keyPoints, exerciseType);
      setCurrentAngles(features.jointAngles);
      
      // Oblicz jakość ruchu
      const quality = featureExtractor.calculateMovementQuality(features.jointAngles, exerciseType);
      setCurrentQuality(quality);
      onQualityUpdate(quality);
      
      // Wykryj powtórzenie
      const isRep = featureExtractor.detectRepetition(features.jointAngles, exerciseType);
      if (isRep) {
        const newRepCount = session.detectedReps + 1;
        setSession(prev => prev ? { ...prev, detectedReps: newRepCount } : null);
        onRepDetected(newRepCount);
      }
      
      // Dodaj frame do sesji
      setSession(prev => {
        if (!prev) return null;
        
        const updatedFrames = [...prev.frames, features];
        // Zachowaj tylko ostatnie 900 klatek (30 sekund przy 30fps)
        const trimmedFrames = updatedFrames.slice(-900);
        
        // Oblicz średnią jakość
        const qualitySum = trimmedFrames.reduce((sum, frame) => {
          const frameQuality = featureExtractor.calculateMovementQuality(frame.jointAngles, exerciseType);
          return sum + frameQuality;
        }, 0);
        const avgQuality = trimmedFrames.length > 0 ? qualitySum / trimmedFrames.length : 0;
        
        return {
          ...prev,
          frames: trimmedFrames,
          averageQuality: avgQuality
        };
      });
      
    } catch (error) {
      console.error('Realtime analysis error:', error);
    }
  };

  /**
   * Finalizuje sesję i wysyła do Cloud LLM
   */
  const finalizeSession = async () => {
    if (!session) return;

    try {
      const endTime = Date.now();
      const duration = (endTime - session.startTime) / 1000; // w sekundach
      
      // Przygotuj dane do analizy
      const analysisInput = {
        sessionId: session.sessionId,
        exerciseType: session.exerciseType,
        movementData: {
          jointAngles: extractJointAnglesTimeSeries(session.frames),
          repCount: session.detectedReps,
          movementQuality: session.frames.map(frame => 
            featureExtractor.calculateMovementQuality(frame.jointAngles, exerciseType)
          ),
          detectedErrors: detectSessionErrors(session.frames),
          symmetryScores: session.frames.map(frame => frame.symmetryScore),
          rangeOfMotion: calculateSessionROM(session.frames)
        },
        sessionMetrics: {
          totalDuration: duration,
          avgQuality: session.averageQuality,
          completionRate: session.detectedReps > 0 ? 100 : 50
        }
      };

      // Wyślij do Cloud LLM
      const analysis = await cloudLLMService.analyzeExerciseSession(analysisInput);
      onAnalysisComplete(analysis);
      
    } catch (error) {
      console.error('Session finalization error:', error);
      
      // Fallback analysis
      const fallbackAnalysis = await cloudLLMService.quickAnalysis(
        session.averageQuality,
        session.detectedReps,
        []
      );
      
      onAnalysisComplete({
        overallAssessment: 'Sesja zakończona',
        technicalFeedback: fallbackAnalysis.feedback,
        motivationalMessage: 'Świetna robota! 💪',
        nextSessionTips: 'Kontynuuj regularnie ćwiczenia',
        score: Math.round(session.averageQuality),
        suggestions: fallbackAnalysis.suggestions
      });
    }
  };

  /**
   * Ekstraktuj time series kątów stawów z ramek sesji
   */
  const extractJointAnglesTimeSeries = (frames: FeatureFrame[]): Record<string, number[]> => {
    const timeSeries: Record<string, number[]> = {};
    
    frames.forEach(frame => {
      Object.entries(frame.jointAngles).forEach(([joint, angle]) => {
        if (!timeSeries[joint]) {
          timeSeries[joint] = [];
        }
        timeSeries[joint].push(angle);
      });
    });
    
    return timeSeries;
  };

  /**
   * Wykrywa błędy w całej sesji
   */
  const detectSessionErrors = (frames: FeatureFrame[]): string[] => {
    const errors: string[] = [];
    
    // Sprawdź asymetrię
    const avgSymmetry = frames.reduce((sum, frame) => sum + frame.symmetryScore, 0) / frames.length;
    if (avgSymmetry < 70) {
      errors.push('asymmetric');
    }
    
    // Sprawdź ograniczony ROM
    const romValues = Object.values(calculateSessionROM(frames));
    const avgROM = romValues.reduce((sum, rom) => sum + rom, 0) / romValues.length;
    if (avgROM < 30) {
      errors.push('limited_rom');
    }
    
    return errors;
  };

  /**
   * Oblicza ROM dla całej sesji
   */
  const calculateSessionROM = (frames: FeatureFrame[]): Record<string, number> => {
    const sessionROM: Record<string, number> = {};
    
    // Zbierz wszystkie kąty dla każdego stawu
    const allAngles: Record<string, number[]> = {};
    frames.forEach(frame => {
      Object.entries(frame.jointAngles).forEach(([joint, angle]) => {
        if (!allAngles[joint]) {
          allAngles[joint] = [];
        }
        allAngles[joint].push(angle);
      });
    });
    
    // Oblicz ROM dla każdego stawu
    Object.entries(allAngles).forEach(([joint, angles]) => {
      sessionROM[joint] = featureExtractor.calculateROM(angles, joint);
    });
    
    return sessionROM;
  };

  return (
    <View style={styles.analysisContainer}>
      {/* Overlay z analizą w czasie rzeczywistym */}
      {deviceSettings.enableRealTimeOverlay && keyPoints.length > 0 && (
        <PoseOverlay
          keyPoints={keyPoints}
          jointAngles={currentAngles}
          qualityScore={currentQuality}
          frameSize={{ width: 400, height: 600 }} // Będzie dostosowane do rzeczywistego rozmiaru
          exerciseType={exerciseType}
        />
      )}
      
      {/* Informacje o sesji w lewym dolnym rogu */}
      {session && isAnalyzing && (
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionText}>Reps: {session.detectedReps}</Text>
          <Text style={styles.sessionText}>Jakość: {Math.round(currentQuality)}%</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  analysisContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sessionInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 12,
  },
  sessionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    marginBottom: 2,
  },
});