import React from 'react';
import { View, StyleSheet, ViewStyle, Dimensions, TouchableOpacity, Text, NativeModules, NativeEventEmitter, Platform } from 'react-native';
import type { CameraProps } from 'react-native-vision-camera';
import { Camera, useCameraDevice, useCameraPermission, useFrameProcessor } from 'react-native-vision-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RotateCcw, Maximize2, Minimize2 } from 'lucide-react-native';
import { poseProcessor } from '../../frameProcessors/poseProcessor';

const { width: screenWidth } = Dimensions.get('window');

interface CameraSurfaceProps {
  facing: 'front' | 'back';
  isActive: boolean;
  onToggleFacing?: () => void;
  isRecording?: boolean;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
  cameraRef?: React.RefObject<Camera> | React.Ref<any>;
  containerStyle?: ViewStyle;
  children?: React.ReactNode;
}

export default function CameraSurface({ facing, isActive, cameraRef, containerStyle, children, onToggleFacing, isRecording, isFullScreen, onToggleFullScreen }: CameraSurfaceProps) {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice(facing);
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    if (!hasPermission) {
      requestPermission().catch(() => {});
    }
  }, [hasPermission, requestPermission]);

  // Debug: log camera availability and permission changes
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[CameraSurface] hasPermission=', hasPermission, ' device=', device?.id);
  }, [hasPermission, device?.id]);

  // Stage 4: Init Pose model and subscribe to events
  React.useEffect(() => {
    // Inspect available native modules once on mount
    try {
      const keys = Object.keys(NativeModules || {});
      // eslint-disable-next-line no-console
      console.log('[NativeModules][probe]', keys);
    } catch {}

    const PoseLandmarks = (NativeModules as any).PoseLandmarks;
    if (!PoseLandmarks) {
      // eslint-disable-next-line no-console
      console.warn('[Pose] Native module not found (NativeModules.PoseLandmarks)');
      return;
    }
    const emitter = new NativeEventEmitter(PoseLandmarks);
    const subStatus = emitter.addListener('onPoseLandmarksStatus', (e) => {
      // eslint-disable-next-line no-console
      console.log('[Pose][Status]', e);
    });
    const subError = emitter.addListener('onPoseLandmarksError', (e) => {
      console.warn('[Pose][Error]', e?.error || e);
    });
    const subDetected = emitter.addListener('onPoseLandmarksDetected', (e) => {
      // e.poses: [{ landmarks: [{ keypoint, x, y, z }, ...] }]
      // eslint-disable-next-line no-console
      console.log('[Pose][Detected] poses=', Array.isArray(e?.poses) ? e.poses.length : 0);
    });
    try {
      PoseLandmarks.initModel();
    } catch {}
    return () => {
      subStatus.remove();
      subError.remove();
      subDetected.remove();
    };
  }, []);

  if (!hasPermission) {
    return (
      <View style={[styles.container, styles.containerInline, styles.black, containerStyle, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: '#fff' }}>Brak uprawnień do kamery</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={[styles.container, styles.containerInline, styles.black, containerStyle, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: '#fff' }}>Nie znaleziono kamery</Text>
      </View>
    );
  }

  const topOffset = (isFullScreen ? insets.top : 0) + 12;

  // Frame processor with worklet function
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    poseProcessor(frame);
  }, []);

  const pixelFormat: CameraProps['pixelFormat'] = Platform.OS === 'ios' ? 'rgb' : 'yuv';

  return (
    <View style={[styles.container, isFullScreen ? styles.containerFull : styles.containerInline, containerStyle]}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive && hasPermission}
        ref={cameraRef as any}
        frameProcessor={frameProcessor}
        pixelFormat={pixelFormat}

      />

      <View style={styles.overlay}>
        {isRecording ? (
          <View style={[styles.recordingIndicator, { top: topOffset }] }>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Analizuję...</Text>
          </View>
        ) : null}

        <View style={[styles.topRightControls, { top: topOffset }]}>
          {onToggleFacing ? (
            <TouchableOpacity style={styles.iconButton} onPress={onToggleFacing} accessibilityRole="button" accessibilityLabel="Przełącz kamerę">
              <RotateCcw size={22} color="#FFFFFF" />
            </TouchableOpacity>
          ) : null}
          {onToggleFullScreen ? (
            <TouchableOpacity style={styles.iconButton} onPress={onToggleFullScreen} accessibilityRole="button" accessibilityLabel={isFullScreen ? 'Wyłącz pełny ekran' : 'Włącz pełny ekran'}>
              {isFullScreen ? <Minimize2 size={22} color="#FFFFFF" /> : <Maximize2 size={22} color="#FFFFFF" />}
            </TouchableOpacity>
          ) : null}
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
  black: {
    backgroundColor: '#000',
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
