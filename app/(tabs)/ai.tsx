import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';
import { Camera, useCameraDevices, useCameraPermission, useFrameProcessor } from 'react-native-vision-camera';
import { runOnJS } from 'react-native-reanimated';
import { Camera as CameraIcon, RotateCcw, Zap, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react-native';

// Import naszych komponentów i serwisów
import { ExerciseSelector } from '../../components/ai/ExerciseSelector';
import { AnalysisManager } from '../../components/ai/AnalysisManager';
import { CloudAnalysisResponse, KeyPoint } from '../../types/ai';
import { deviceCapabilitiesService } from '../../services/deviceCapabilities';
import { usePoseDetection } from '../../hooks/usePoseDetection';

const { width: screenWidth } = Dimensions.get('window');

// Zaktualizowany interface dla wyników analizy
interface AnalysisResult {
  score: number;
  feedback: string;
  suggestions: string[];
  overallAssessment?: string;
  technicalFeedback?: string;
  motivationalMessage?: string;
}

export default function AITab() {
  const [selectedExercise, setSelectedExercise] = useState('neck_stretch');
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('front');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isRecording, setIsRecording] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentRepCount, setCurrentRepCount] = useState(0);
  const [currentQuality, setCurrentQuality] = useState(0);
  const [deviceSupported, setDeviceSupported] = useState(true);
  const [keyPoints, setKeyPoints] = useState<KeyPoint[]>([]);
  
  const devices = useCameraDevices();
  const device = cameraPosition === 'front' ? devices.front : devices.back;

  // Hook do pose detection
  const { processPoseFrame } = usePoseDetection({
    isEnabled: deviceSupported && isAnalyzing,
    onPoseDetected: setKeyPoints
  });

  // Sprawdź możliwości urządzenia przy starcie
  useEffect(() => {
    checkDeviceCapabilities();
  }, []);

  /**
   * Sprawdza czy urządzenie obsługuje pose detection
   */
  const checkDeviceCapabilities = async () => {
    try {
      const capabilities = await deviceCapabilitiesService.detectCapabilities();
      console.log('Device capabilities:', capabilities);
      
      if (!capabilities.hasVisionCamera) {
        setDeviceSupported(false);
        Alert.alert(
          'Nieobsługiwane urządzenie',
          'Twoje urządzenie nie obsługuje zaawansowanej analizy ruchu. Używamy podstawowego trybu.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Device capability check failed:', error);
    }
  };

  // Frame processor do pose detection
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    
    try {
      // Użyj prawdziwego pose detection hook
      runOnJS(processPoseFrame)(frame);
    } catch (error) {
      console.error('Frame processing error:', error);
    }
  }, [processPoseFrame]);

  // Usunięto handlePoseDetectionData - teraz korzystamy z usePoseDetection hook

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Sprawdzam uprawnienia kamery...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <CameraIcon size={64} color="#6B7280" />
          <Text style={styles.permissionTitle}>Dostęp do kamery</Text>
          <Text style={styles.permissionText}>
            Potrzebujemy dostępu do kamery, aby analizować Twoje ćwiczenia w czasie rzeczywistym
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Udziel dostępu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Ładowanie kamery...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const toggleCameraFacing = () => {
    setCameraPosition(current => (current === 'back' ? 'front' : 'back'));
  };

  const startAnalysis = async () => {
    if (!deviceSupported) {
      // Fallback do starego zachowania dla nieobsługiwanych urządzeń
      setIsRecording(true);
      setIsAnalyzing(true);
      setAnalysisResult(null);
      
      setTimeout(() => {
        const mockResult: AnalysisResult = {
          score: Math.floor(Math.random() * 40) + 60,
          feedback: 'Podstawowa analiza. Upgrade urządzenia dla lepszych funkcji.',
          suggestions: [
            'Utrzymuj równomierne tempo',
            'Skup się na poprawnej postawie',
            'Kontroluj oddech'
          ]
        };
        setAnalysisResult(mockResult);
        setIsRecording(false);
        setIsAnalyzing(false);
      }, 3000);
      return;
    }

    setIsRecording(true);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setCurrentRepCount(0);
    setCurrentQuality(0);
    setShowExerciseSelector(false);
  };

  const stopAnalysis = () => {
    setIsRecording(false);
    setIsAnalyzing(false);
  };

  const handleAnalysisComplete = (result: CloudAnalysisResponse) => {
    const analysisResult: AnalysisResult = {
      score: result.score,
      feedback: result.overallAssessment,
      suggestions: result.suggestions,
      overallAssessment: result.overallAssessment,
      technicalFeedback: result.technicalFeedback,
      motivationalMessage: result.motivationalMessage
    };
    
    setAnalysisResult(analysisResult);
    setIsRecording(false);
    setIsAnalyzing(false);
  };

  const handleRepDetected = (repCount: number) => {
    setCurrentRepCount(repCount);
  };

  const handleQualityUpdate = (score: number) => {
    setCurrentQuality(score);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const toggleExerciseSelector = () => {
    if (!isAnalyzing) {
      setShowExerciseSelector(!showExerciseSelector);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Trener</Text>
        <Text style={styles.subtitle}>Analiza ruchu w czasie rzeczywistym</Text>
        
        {/* Przycisk wyboru ćwiczenia */}
        <TouchableOpacity 
          style={styles.exerciseButton} 
          onPress={toggleExerciseSelector}
          disabled={isAnalyzing}
        >
          <Text style={styles.exerciseButtonText}>
            Ćwiczenie: {getExerciseName(selectedExercise)}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cameraContainer}>
        <Camera
          style={styles.camera}
          device={device}
          isActive={true}
          frameProcessor={deviceSupported ? frameProcessor : undefined}
        />
        
        <View style={styles.cameraOverlay}>
          {/* Wskaźnik nagrywania */}
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>
                Analizuję {selectedExercise.replace('_', ' ')}...
              </Text>
            </View>
          )}
          
          {/* Przycisk odwracania kamery */}
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <RotateCcw size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
                     {/* Manager analizy AI */}
           {deviceSupported && (
             <AnalysisManager
               exerciseType={selectedExercise}
               isAnalyzing={isAnalyzing}
               keyPoints={keyPoints}
               onAnalysisComplete={handleAnalysisComplete}
               onRepDetected={handleRepDetected}
               onQualityUpdate={handleQualityUpdate}
             />
           )}
        </View>
      </View>

      {/* Selektor ćwiczeń */}
      <ExerciseSelector
        selectedExercise={selectedExercise}
        onExerciseSelect={setSelectedExercise}
        isVisible={showExerciseSelector}
      />

      {/* Kontrolki */}
      <View style={styles.controlsContainer}>
        {!isRecording ? (
          <TouchableOpacity style={styles.startButton} onPress={startAnalysis}>
            <Zap size={24} color="#FFFFFF" />
            <Text style={styles.startButtonText}>
              Rozpocznij Analizę {getExerciseName(selectedExercise)}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={stopAnalysis}>
            <Text style={styles.stopButtonText}>Zatrzymaj</Text>
          </TouchableOpacity>
        )}
        
        {/* Informacje w czasie rzeczywistym */}
        {isAnalyzing && (
          <View style={styles.realtimeInfo}>
            <Text style={styles.realtimeText}>
              Powtórzenia: {currentRepCount} | Jakość: {Math.round(currentQuality)}%
            </Text>
          </View>
        )}
      </View>

      {/* Wyniki analizy */}
      {analysisResult && (
        <View style={styles.resultsContainer}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Wynik analizy</Text>
            <Text style={[styles.scoreValue, { color: getScoreColor(analysisResult.score) }]}>
              {analysisResult.score}%
            </Text>
          </View>

          {/* Motywacyjny komunikat */}
          {analysisResult.motivationalMessage && (
            <View style={styles.motivationContainer}>
              <Text style={styles.motivationText}>
                {analysisResult.motivationalMessage}
              </Text>
            </View>
          )}

          {/* Ocena ogólna */}
          <View style={styles.feedbackContainer}>
            <View style={styles.feedbackHeader}>
              <CheckCircle size={20} color="#10B981" />
              <Text style={styles.feedbackTitle}>Ocena</Text>
            </View>
            <Text style={styles.feedbackText}>
              {analysisResult.overallAssessment || analysisResult.feedback}
            </Text>
          </View>

          {/* Feedback techniczny */}
          {analysisResult.technicalFeedback && (
            <View style={styles.technicalContainer}>
              <View style={styles.feedbackHeader}>
                <AlertCircle size={20} color="#2563EB" />
                <Text style={styles.feedbackTitle}>Wskazówki techniczne</Text>
              </View>
              <Text style={styles.feedbackText}>{analysisResult.technicalFeedback}</Text>
            </View>
          )}

          {/* Sugestie */}
          <View style={styles.suggestionsContainer}>
            <View style={styles.suggestionsHeader}>
              <AlertCircle size={20} color="#F59E0B" />
              <Text style={styles.suggestionsTitle}>Sugestie</Text>
            </View>
            {analysisResult.suggestions.map((suggestion, index) => (
              <Text key={index} style={styles.suggestionText}>
                • {suggestion}
              </Text>
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

/**
 * Zwraca czytelną nazwę ćwiczenia
 */
const getExerciseName = (exerciseId: string): string => {
  const names: Record<string, string> = {
    'neck_stretch': 'Rozciąganie szyi',
    'shoulder_raise': 'Podnoszenie ramion',
    'arm_raise': 'Unoszenie rąk',
    'squat': 'Przysiady',
    'lunge': 'Wykroki'
  };
  
  return names[exerciseId] || 'Nieznane ćwiczenie';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 12,
  },
  exerciseButton: {
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  exerciseButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  cameraContainer: {
    marginHorizontal: 24,
    borderRadius: 16,
    overflow: 'hidden',
    height: screenWidth - 48,
    backgroundColor: '#000',
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 20,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  recordingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  flipButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 24,
  },
  controlsContainer: {
    padding: 24,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  stopButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  stopButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  realtimeInfo: {
    marginTop: 12,
    backgroundColor: '#E0E7FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  realtimeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3730A3',
  },
  resultsContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 36,
    fontFamily: 'Inter-SemiBold',
  },
  motivationContainer: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  motivationText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#166534',
    textAlign: 'center',
  },
  feedbackContainer: {
    marginBottom: 16,
  },
  technicalContainer: {
    marginBottom: 16,
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  feedbackTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  feedbackText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  suggestionsContainer: {
    marginBottom: 0,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 4,
  },
});