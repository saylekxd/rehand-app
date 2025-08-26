import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, ViewStyle } from 'react-native';
import { CameraView, CameraType } from 'expo-camera';
import { RotateCcw, Maximize2, Minimize2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

interface CameraSurfaceProps {
  facing: CameraType;
  onToggleFacing: () => void;
  isRecording: boolean;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  cameraRef?: React.RefObject<CameraView | null>;
  children?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export default function CameraSurface({
  facing,
  onToggleFacing,
  isRecording,
  isFullScreen,
  onToggleFullScreen,
  cameraRef,
  children,
  containerStyle,
}: CameraSurfaceProps) {
  const insets = useSafeAreaInsets();
  const topOffset = (isFullScreen ? insets.top : 0) + 12;
  return (
    <View style={[styles.container, isFullScreen ? styles.containerFull : styles.containerInline, containerStyle]}>
      <CameraView style={StyleSheet.absoluteFill} facing={facing} ref={cameraRef} />

      <View style={styles.overlay}>
        {isRecording && (
          <View style={[styles.recordingIndicator, { top: topOffset }] }>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Analizuję...</Text>
          </View>
        )}

        {/* Top-right controls */}
        <View style={[styles.topRightControls, { top: topOffset }]}>
          <TouchableOpacity style={styles.iconButton} onPress={onToggleFacing} accessibilityRole="button" accessibilityLabel="Przełącz kamerę">
            <RotateCcw size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={onToggleFullScreen} accessibilityRole="button" accessibilityLabel={isFullScreen ? 'Wyłącz pełny ekran' : 'Włącz pełny ekran'}>
            {isFullScreen ? <Minimize2 size={22} color="#FFFFFF" /> : <Maximize2 size={22} color="#FFFFFF" />}
          </TouchableOpacity>
        </View>

        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    position: 'relative',
  },
  containerInline: {
    height: screenWidth - 48,
  },
  containerFull: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 16,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  topRightControls: {
    position: 'absolute',
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 24,
  },
});


