import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Camera, RotateCcw, Zap, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

interface AnalysisResult {
  score: number;
  feedback: string;
  suggestions: string[];
}

export default function AITab() {
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

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
    setIsRecording(true);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    // Symulacja analizy AI (w rzeczywistej aplikacji tutaj byłaby integracja z AI)
    setTimeout(() => {
      const mockResult: AnalysisResult = {
        score: Math.floor(Math.random() * 40) + 60, // 60-100
        feedback: 'Dobra technika! Pamiętaj o równomiernym tempie ruchu.',
        suggestions: [
          'Utrzymuj prostą postawę',
          'Kontroluj oddech podczas ćwiczenia',
          'Zwiększ amplitudę ruchu'
        ]
      };
      setAnalysisResult(mockResult);
      setIsRecording(false);
      setIsAnalyzing(false);
    }, 3000);
  };

  const stopAnalysis = () => {
    setIsRecording(false);
    setIsAnalyzing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Trener</Text>
        <Text style={styles.subtitle}>Analiza ruchu w czasie rzeczywistym</Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.cameraOverlay}>
            {isRecording && (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>Analizuję...</Text>
              </View>
            )}
            
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
              <RotateCcw size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>

      <View style={styles.controlsContainer}>
        {!isRecording ? (
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

      {analysisResult && (
        <View style={styles.resultsContainer}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Wynik analizy</Text>
            <Text style={[styles.scoreValue, { color: getScoreColor(analysisResult.score) }]}>
              {analysisResult.score}%
            </Text>
          </View>

          <View style={styles.feedbackContainer}>
            <View style={styles.feedbackHeader}>
              <CheckCircle size={20} color="#10B981" />
              <Text style={styles.feedbackTitle}>Ocena</Text>
            </View>
            <Text style={styles.feedbackText}>{analysisResult.feedback}</Text>
          </View>

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
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
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
});