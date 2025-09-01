import React from 'react';
import { View, StyleSheet, ViewStyle, Dimensions, TouchableOpacity, Text, NativeModules, NativeEventEmitter, Platform } from 'react-native';
import type { CameraProps } from 'react-native-vision-camera';
import { Camera, useCameraDevice, useCameraPermission, useFrameProcessor } from 'react-native-vision-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RotateCcw, Maximize2, Minimize2 } from 'lucide-react-native';
import { poseProcessor } from '../../frameProcessors/poseProcessor';
import PoseOverlay from './PoseOverlay';

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
  onReadyChange?: (ready: boolean) => void;
}

export default function CameraSurface({ facing, isActive, cameraRef, containerStyle, children, onToggleFacing, isRecording, isFullScreen, onToggleFullScreen, onReadyChange }: CameraSurfaceProps) {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice(facing);
  const insets = useSafeAreaInsets();
  
  // Pose overlay state (throttled updates)
  type PoseLandmark = { keypoint: number; name: string; x: number; y: number; z: number; visibility: number };
  type Pose = { landmarks: PoseLandmark[] };
  const [poses, setPoses] = React.useState<Pose[]>([]);
  const [previewSize, setPreviewSize] = React.useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const lastOverlayUpdateRef = React.useRef(0);

  // Frame processor with worklet function
  // IMPORTANT: Hooks must be called unconditionally in the same order on every render.
  // This must be declared before any early returns to avoid "Rendered more hooks than during the previous render".
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    poseProcessor(frame);
  }, []);

  React.useEffect(() => {
    if (!hasPermission) {
      requestPermission().catch(() => {});
    }
  }, [hasPermission, requestPermission]);

  // Notify parent when camera readiness changes (permission + device available)
  React.useEffect(() => {
    try {
      onReadyChange && onReadyChange(hasPermission && !!device);
    } catch (e) {
      // no-op
    }
  }, [onReadyChange, hasPermission, device]);

  // Debug: log camera availability and permission changes
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[CameraSurface] hasPermission=', hasPermission, ' device=', device?.id);
  }, [hasPermission, device?.id]);

  // Stage 4: Init Pose model and subscribe to events
  React.useEffect(() => {
    let subscriptions: any[] = [];

    // Add delay to ensure native modules are fully loaded
    const timeoutId = setTimeout(() => {
      // Inspect available native modules once on mount
      try {
        const keys = Object.keys(NativeModules || {});
        // eslint-disable-next-line no-console
        console.log('[NativeModules][probe]', keys);
        
        // Check if PoseLandmarks is available via direct import
        const { PoseLandmarks } = NativeModules;
        // eslint-disable-next-line no-console
        console.log('[NativeModules][PoseLandmarks]', !!PoseLandmarks);
      } catch (error) {
        console.warn('[NativeModules][error]', error);
      }

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
        // e.poses: [{ landmarks: [{ keypoint, name, x, y, z, visibility }, ...] }]
        // eslint-disable-next-line no-console
        // console.log(`🏃‍♂️ [Pose][Detected] Wykryto ${Array.isArray(e?.poses) ? e.poses.length : 0} pozę(y)`);
        
        // Log key landmarks for first pose (if available)
        if (e?.poses?.length > 0 && e.poses[0]?.landmarks) {
          const keyLandmarks = [0, 11, 12, 23, 24, 15, 16, 25, 26]; // nose, shoulders, hips, wrists, knees
          const landmarks = e.poses[0].landmarks;
          
          // // eslint-disable-next-line no-console
          // console.log('   📍 Kluczowe punkty:');
          // keyLandmarks.forEach((idx) => {
          //   const landmark = landmarks.find((lm: any) => lm.keypoint === idx);
          //   if (landmark) {
          //     const confidence = landmark.visibility || 0;
          //     const confidenceIcon = confidence > 0.7 ? '🟢' : confidence > 0.4 ? '🟡' : '🔴';
          //     // eslint-disable-next-line no-console
          //     console.log(`     ${confidenceIcon} ${landmark.name || `point_${idx}`}: (${landmark.x.toFixed(3)}, ${landmark.y.toFixed(3)}) conf: ${confidence.toFixed(2)}`);
          //   }
          // });
        }

        // Throttle overlay updates to ~10 FPS to avoid UI thrash
        if (e?.poses && Array.isArray(e.poses)) {
          const now = Date.now();
          if (now - lastOverlayUpdateRef.current > 100) {
            lastOverlayUpdateRef.current = now;
            setPoses(e.poses as Pose[]);
          }
        }
      });
      
      subscriptions = [subStatus, subError, subDetected];
      
      try {
        PoseLandmarks.initModel();
      } catch (error) {
        console.warn('[Pose] MediaPipe initialization failed:', error);
      }
    }, 1000); // 1 second delay

    return () => {
      clearTimeout(timeoutId);
      subscriptions.forEach(sub => sub?.remove?.());
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

  const pixelFormat: CameraProps['pixelFormat'] = Platform.OS === 'ios' ? 'rgb' : 'yuv';
  
  // Compute video aspect-ratio from selected device format if available (portrait width/height)
  const videoAspectRatio = React.useMemo(() => {
    const format = device?.formats?.[0];
    // Fallback to common 3:4 if not known
    if (!format) return 3 / 4;
    // VisionCamera numbers are landscape. Convert to portrait (swap if width > height)
    const w = Math.min(format.videoWidth ?? 0, format.videoHeight ?? 0) || 720;
    const h = Math.max(format.videoWidth ?? 0, format.videoHeight ?? 0) || 1280;
    return w / h;
  }, [device?.formats]);

  return (
    <View
      style={[
        styles.container,
        isFullScreen ? styles.containerFull : styles.containerInline,
        containerStyle,
      ]}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setPreviewSize({ width, height });
      }}
    >
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive && hasPermission}
        ref={cameraRef as any}
        frameProcessor={frameProcessor}
        pixelFormat={pixelFormat}

      />

      <View style={styles.overlay}>
        {/* Skia overlay with pose points and skeleton */}
        {previewSize.width > 0 && previewSize.height > 0 && poses.length > 0 ? (
          <PoseOverlay
            poses={poses}
            frameWidth={previewSize.width}
            frameHeight={previewSize.height}
            isFrontCamera={facing === 'front'}
            showLabels={false}
            showSkeleton
            videoAspectRatio={videoAspectRatio}
            // On iOS MediaPipe and camera buffers often come landscape-based; rotate CW to align in portrait
            rotate={Platform.OS === 'ios' ? 'cw' : 'none'}
          />
        ) : null}
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
  mirrored: {
    transform: [{ scaleX: -1 }],
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
