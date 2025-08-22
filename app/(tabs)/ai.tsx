import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Camera, RotateCcw, Zap, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Activity, Target } from 'lucide-react-native';
import { useAIExerciseAnalysis } from '../../lib/useAIExerciseAnalysis';
import { ExerciseType } from '../../lib/ml/types';
import { OverlayRenderer } from '../../lib/visualization/OverlayRenderer';
import { MockFrameGenerator } from '../../lib/test/MockFrameGenerator';

const { width: screenWidth } = Dimensions.get('window');

// Available exercise types for selection
const EXERCISE_OPTIONS = [
  { type: ExerciseType.NECK_STRETCH, name: 'Rozciąganie szyi', icon: 'Activity' },
  { type: ExerciseType.SHOULDER_ROLLS, name: 'Krążenia ramionami', icon: 'Target' },
  { type: ExerciseType.ARM_CIRCLES, name: 'Krążenia ramionami', icon: 'Activity' },
];

export default function AITab() {
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>(ExerciseType.NECK_STRETCH);
  const cameraRef = useRef<CameraView>(null);
  const mockFrameGenerator = useRef<MockFrameGenerator>(new MockFrameGenerator(5)); // 5fps for testing
  
  // Initialize AI system
  const aiAnalysis = useAIExerciseAnalysis({
    exerciseType: selectedExercise,
    userProfile: {
      level: 'beginner',
      goals: ['rehabilitation'],
      preferences: {
        motivationStyle: 'encouraging',
        responseLength: 'short',
        language: 'pl'
      }
    },
    enableLocalLLM: true,
    enableCloudLLM: false,
    debugMode: false
  });

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Ładowanie kamery...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Camera size={64} color="#6B7280" />
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

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };



  const startAnalysis = async () => {
    try {
      // Setup mock frame processing for testing
      mockFrameGenerator.current.addCallback(async (visionOutput) => {
        // Convert VisionOutput to ImageData format (simplified for testing)
        const mockImageData = new ImageData(640, 480);
        await aiAnalysis.processFrame(mockImageData);
      });
      
      aiAnalysis.startSession();
      mockFrameGenerator.current.start();
      
      console.log('🚀 AI Analysis started with mock frame processing at 5fps');
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się uruchomić analizy AI. Sprawdź połączenie i spróbuj ponownie.');
      console.error('AI Analysis error:', error);
    }
  };

  const stopAnalysis = async () => {
    try {
      mockFrameGenerator.current.stop();
      await aiAnalysis.endSession();
      console.log('🛑 AI Analysis stopped');
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  // Map hook properties to UI expectations
  const isAnalyzing = aiAnalysis.isProcessing;
  const currentQuality = aiAnalysis.currentAnalysis?.mlAnalysis?.qualityScore ?? null;
  const latestMessage = aiAnalysis.recentMessages[0]?.message ?? null;
  
  // Transform sessionStats to match expected sessionSummary structure
  const sessionSummary = aiAnalysis.sessionStats ? {
    averageQuality: aiAnalysis.sessionStats.avgQuality / 100, // Convert to 0-1 range
    totalReps: aiAnalysis.sessionStats.repsCompleted,
    duration: aiAnalysis.sessionStats.sessionDuration * 1000, // Convert to milliseconds
    errors: aiAnalysis.sessionStats.errorsDetected.map((errorType: string) => ({
      type: errorType,
      description: `Wykryto błąd: ${errorType}`
    }))
  } : null;

  // Placeholder for cloud insights - this would need to be implemented in the AI system
  const cloudInsights = null; // TODO: Implement cloud insights

  // Visualization data from AI system
  const visualizationData = aiAnalysis.visualizationData;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Trener</Text>
          <Text style={styles.subtitle}>Analiza ruchu w czasie rzeczywistym</Text>
        </View>

        {/* Exercise Selection */}
        <View style={styles.exerciseSelection}>
          <Text style={styles.exerciseSelectionTitle}>Wybierz ćwiczenie:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exerciseScrollView}>
            {EXERCISE_OPTIONS.map((exercise) => (
              <TouchableOpacity
                key={exercise.type}
                style={[
                  styles.exerciseButton,
                  selectedExercise === exercise.type && styles.exerciseButtonActive
                ]}
                onPress={() => setSelectedExercise(exercise.type)}
              >
                <Activity size={20} color={selectedExercise === exercise.type ? '#FFFFFF' : '#6B7280'} />
                <Text style={[
                  styles.exerciseButtonText,
                  selectedExercise === exercise.type && styles.exerciseButtonTextActive
                ]}>
                  {exercise.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.cameraContainer}>
          <CameraView 
            style={styles.camera} 
            facing={facing} 
            ref={cameraRef}
            onCameraReady={() => {
              console.log('📸 Camera ready for AI analysis');
            }}
          />
          
          {/* 3D Visualization Overlay */}
          {isAnalyzing && visualizationData && (
            <OverlayRenderer
              overlayState={visualizationData}
              preferences={{
                showLabels: true,
                showValues: true,
                detailLevel: 'standard',
                animationLevel: 'normal',
                opacity: 0.8,
                colorScheme: 'default',
                autoHide: false
              }}
            />
          )}
          
          <View style={styles.cameraOverlay}>
            {isAnalyzing && (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>
                  {isAnalyzing ? 'Analizuję...' : 'Gotowy'}
                </Text>
              </View>
            )}
            
            {/* Real-time quality indicator */}
            {currentQuality !== null && isAnalyzing && (
              <View style={styles.qualityIndicator}>
                <Text style={styles.qualityText}>
                  Jakość: {Math.round(currentQuality)}%
                </Text>
              </View>
            )}
            
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
              <RotateCcw size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.controlsContainer}>
          {!isAnalyzing ? (
            <TouchableOpacity style={styles.startButton} onPress={startAnalysis}>
              <Zap size={24} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Rozpocznij Analizę</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopButton} onPress={stopAnalysis}>
              <Text style={styles.stopButtonText}>Zatrzymaj</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Real-time AI feedback */}
        {latestMessage && (
          <View style={styles.messageContainer}>
            <View style={styles.messageHeader}>
              <CheckCircle size={20} color="#10B981" />
              <Text style={styles.messageTitle}>Motywacja AI</Text>
            </View>
            <Text style={styles.messageText}>{latestMessage}</Text>
          </View>
        )}

        {/* Session results */}
        {sessionSummary && (
          <View style={styles.resultsContainer}>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Wynik sesji</Text>
              <Text style={[styles.scoreValue, { color: getScoreColor(sessionSummary.averageQuality * 100) }]}>
                {Math.round(sessionSummary.averageQuality * 100)}%
              </Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Powtórzenia</Text>
                <Text style={styles.statValue}>{sessionSummary.totalReps}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Czas</Text>
                <Text style={styles.statValue}>{Math.round(sessionSummary.duration / 1000)}s</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Błędy</Text>
                <Text style={styles.statValue}>{sessionSummary.errors.length}</Text>
              </View>
            </View>

            {sessionSummary.errors.length > 0 && (
              <View style={styles.errorsContainer}>
                <View style={styles.errorsHeader}>
                  <AlertCircle size={20} color="#EF4444" />
                  <Text style={styles.errorsTitle}>Wykryte błędy</Text>
                </View>
                {sessionSummary.errors.slice(0, 3).map((error: any, index: number) => (
                  <Text key={index} style={styles.errorText}>
                    • {error.type}: {error.description}
                  </Text>
                ))}
              </View>
            )}

            {cloudInsights && (
              <View style={styles.insightsContainer}>
                <View style={styles.insightsHeader}>
                  <Target size={20} color="#2563EB" />
                  <Text style={styles.insightsTitle}>Analiza strategiczna</Text>
                </View>
                <Text style={styles.insightsText}>{cloudInsights}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
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
    fontSize: 18,
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
  feedbackContainer: {
    marginBottom: 20,
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
  // New styles for AI integration
  exerciseSelection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  exerciseSelectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  exerciseScrollView: {
    flexDirection: 'row',
  },
  exerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    gap: 8,
  },
  exerciseButtonActive: {
    backgroundColor: '#2563EB',
  },
  exerciseButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  exerciseButtonTextActive: {
    color: '#FFFFFF',
  },
  visualizationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  qualityIndicator: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 60,
  },
  qualityText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  messageContainer: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  messageTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  errorsContainer: {
    marginBottom: 20,
  },
  errorsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  errorsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#EF4444',
    lineHeight: 20,
    marginBottom: 4,
  },
  insightsContainer: {
    backgroundColor: '#F0F7FF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  insightsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  insightsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
  },
});