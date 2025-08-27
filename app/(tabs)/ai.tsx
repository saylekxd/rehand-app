import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
// Using VisionCamera under the hood via CameraSurface
import { Modal, Platform } from 'react-native';
import AuthWrapper from '@/components/auth/AuthWrapper';
import CameraSurface from '@/components/ai/CameraSurface';
import LiveFeedbackOverlay from '@/components/ai/LiveFeedbackOverlay';
import ControlsBar from '@/components/ai/ControlsBar';
import AnalysisModal from '@/components/ai/AnalysisModal';
import type { AnalysisResult, LiveMessage } from '@/components/ai/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBlazePose } from '@/hooks/useBlazePose';

const { width: screenWidth } = Dimensions.get('window');

export default function AITab() {
  const insets = useSafeAreaInsets();
  // Load BlazePose models (detector + landmark)
  const { loading: modelsLoading, error: modelsError } = useBlazePose('full');
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  // Permissions handled inside CameraSurface via VisionCamera
  const [isRecording, setIsRecording] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [liveMessages, setLiveMessages] = useState<LiveMessage[]>([]);
  const [livePosition, setLivePosition] = useState<'top' | 'bottom'>('bottom');
  const cameraRef = useRef<any>(null);

  // VisionCamera will request permission when needed

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };
  const toggleFullScreen = () => setIsFullScreen(v => !v);

  const startAnalysis = async () => {
    setIsRecording(true);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setLiveMessages([]);

    // Start mock live feedback stream
    const stream: LiveMessage[] = [
      { id: '1', text: 'Ustaw barki równo', level: 'info' },
      { id: '2', text: 'Wolniej opuszczaj rękę', level: 'warning' },
      { id: '3', text: 'Świetna stabilizacja!', level: 'success' },
      { id: '4', text: 'Zachowaj stały oddech', level: 'info' },
      { id: '5', text: 'Zwiększ zakres ruchu', level: 'warning' },
    ];

    let index = 0;
    const interval = setInterval(() => {
      setLiveMessages(prev => [...prev, { ...stream[index], id: `${Date.now()}-${index}` }]);
      index += 1;
      if (index >= stream.length) {
        clearInterval(interval);
      }
    }, 700);

    // Simulate analysis completion
    setTimeout(() => {
      const mockResult: AnalysisResult = {
        score: Math.floor(Math.random() * 40) + 60,
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
    }, 3500);
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
    <AuthWrapper>
      <SafeAreaView style={styles.container}>
        {!isFullScreen && (
          <View style={styles.header}>
            <Text style={styles.title}>AI Trener</Text>
            <Text style={styles.subtitle}>Analiza ruchu w czasie rzeczywistym</Text>
          </View>
        )}

        {/* Models loading / error indicator */}
        {!isFullScreen && (
          <View style={{ paddingHorizontal: 24, marginBottom: 8 }}>
            {modelsLoading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator size="small" color="#2563EB" />
                <Text style={{ color: '#2563EB', fontFamily: 'Inter-Medium' }}>Ładowanie modeli TFLite…</Text>
              </View>
            ) : modelsError ? (
              <Text style={{ color: '#EF4444', fontFamily: 'Inter-Medium' }}>Błąd ładowania modeli: {String(modelsError)}</Text>
            ) : (
              <Text style={{ color: '#10B981', fontFamily: 'Inter-Medium' }}>Modele załadowane ✓</Text>
            )}
          </View>
        )}

        <View style={styles.cameraContainerCard}>
          <CameraSurface
            facing={facing === 'front' ? 'front' : 'back'}
            isActive={!isFullScreen}
            cameraRef={cameraRef as any}
            onToggleFacing={toggleCameraFacing}
            isRecording={isRecording}
            isFullScreen={false}
            onToggleFullScreen={toggleFullScreen}
            containerStyle={styles.cameraCard}
          >
            <LiveFeedbackOverlay visible={isRecording} position={livePosition} messages={liveMessages} />
          </CameraSurface>
        </View>

        {/* Fullscreen camera in modal to cover tabs and header */}
        <Modal visible={isFullScreen} animationType="fade" presentationStyle={Platform.OS === 'ios' ? 'fullScreen' : 'overFullScreen'}>
          <View style={styles.fullscreenRoot}>
            <CameraSurface
              facing={facing === 'front' ? 'front' : 'back'}
              isActive={isFullScreen}
              cameraRef={cameraRef as any}
              onToggleFacing={toggleCameraFacing}
              isRecording={isRecording}
              isFullScreen
              onToggleFullScreen={toggleFullScreen}
            >
              <LiveFeedbackOverlay visible={isRecording} position={livePosition} messages={liveMessages} />
            </CameraSurface>

            {/* Controls overlay for fullscreen */}
            {!isRecording && (
              <View style={[styles.fullscreenControls, { paddingBottom: insets.bottom + 12 }] }>
                <ControlsBar isRecording={false} onStart={startAnalysis} onStop={stopAnalysis} />
              </View>
            )}

            {/* Analysis modal shown within fullscreen */}
            <AnalysisModal visible={!isRecording && !!analysisResult} result={analysisResult} onClose={() => setAnalysisResult(null)} />
          </View>
        </Modal>

        {!isFullScreen && !isRecording && (
          <ControlsBar isRecording={false} onStart={startAnalysis} onStop={stopAnalysis} />
        )}

        {!isFullScreen && (
          <AnalysisModal visible={!isRecording && !!analysisResult} result={analysisResult} onClose={() => setAnalysisResult(null)} />
        )}
      </SafeAreaView>
    </AuthWrapper>
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
  cameraContainerCard: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  cameraCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  fullscreenRoot: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullscreenControls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
});