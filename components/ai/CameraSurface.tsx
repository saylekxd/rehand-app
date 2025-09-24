import React from 'react';
import { View, StyleSheet, ViewStyle, Dimensions, TouchableOpacity, Text, NativeModules, NativeEventEmitter, Platform } from 'react-native';
import type { CameraProps } from 'react-native-vision-camera';
import { Camera, useCameraDevice, useCameraPermission, useFrameProcessor } from 'react-native-vision-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RotateCcw, Maximize2, Minimize2 } from 'lucide-react-native';
import { poseProcessor } from '../../frameProcessors/poseProcessor';
import PoseOverlay from './PoseOverlay';
import LiveFeedbackOverlay from './LiveFeedbackOverlay';
import { useExerciseSession } from '@/hooks/useExerciseSession';
import type { Exercise } from '@/types';

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
  activeExercise?: Exercise;
  onSessionFinish?: (completedSteps: number, totalTime: number) => void;
}

export default function CameraSurface({ facing, isActive, cameraRef, containerStyle, children, onToggleFacing, isRecording, isFullScreen, onToggleFullScreen, activeExercise, onSessionFinish }: CameraSurfaceProps) {
  // All hooks must be called unconditionally and in the same order every render
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice(facing);
  const insets = useSafeAreaInsets();
  
  // Frame processor - declared early to ensure consistent hook order
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    poseProcessor(frame);
  }, []);
  
  // Pose overlay state
  type PoseLandmark = { keypoint: number; name: string; x: number; y: number; z: number; visibility: number };
  type Pose = { landmarks: PoseLandmark[] };
  const [poses, setPoses] = React.useState<Pose[]>([]);
  const [previewSize, setPreviewSize] = React.useState<{ width: number; height: number }>({ width: 0, height: 0 });
  
  // Exercise session - always call with basic values, no memoization
  const exerciseSession = useExerciseSession({
    steps: activeExercise?.steps_json?.steps || [],
    durationMinutes: activeExercise?.duration_minutes || 5,
    onFinish: onSessionFinish || (() => {}),
    isFrontCamera: facing === 'front',
  });
  
  // Refs
  const activeExerciseRef = React.useRef(activeExercise);
  const exerciseSessionRef = React.useRef(exerciseSession);
  const lastOverlayUpdateRef = React.useRef(0);
  const lastExerciseValidationRef = React.useRef(0);
  
  // Effects - in consistent order
  React.useEffect(() => {
    activeExerciseRef.current = activeExercise;
    exerciseSessionRef.current = exerciseSession;
  }, [activeExercise, exerciseSession]);

  React.useEffect(() => {
    if (!hasPermission) {
      requestPermission().catch(() => {});
    }
  }, [hasPermission, requestPermission]);

  React.useEffect(() => {
    const steps = activeExercise?.steps_json?.steps || [];
    if (steps.length > 0 && !exerciseSession.state.isRunning) {
      const timer = setTimeout(() => {
        exerciseSession.start();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [activeExercise?.id, exerciseSession.state.isRunning, exerciseSession.start]);

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
        // Debug logging (only in dev and throttled)
        if (__DEV__ && Math.random() < 0.01) { // 1% chance in dev mode
          console.log(`🏃‍♂️ [Pose] Detected ${Array.isArray(e?.poses) ? e.poses.length : 0} pose(s)`);
        }

        // Throttle overlay updates and exercise validation
        if (e?.poses && Array.isArray(e.poses) && e.poses.length > 0) {
          const now = Date.now();
          
          // Update poses for visual overlay more frequently (10 FPS)
          if (now - lastOverlayUpdateRef.current > 100) {
            lastOverlayUpdateRef.current = now;
            setPoses(e.poses as Pose[]);
          }
          
          // Exercise validation with current poses (5 FPS)
          const currentActiveExercise = activeExerciseRef.current;
          const currentExerciseSession = exerciseSessionRef.current;
          
          if (currentActiveExercise && now - lastExerciseValidationRef.current > 200) {
            lastExerciseValidationRef.current = now;
            console.log('[Debug] Running exercise validation with', e.poses.length, 'poses');
            
            // Debug: log pose data when validating
            if (e.poses[0]?.landmarks) {
              const pose = e.poses[0];
              const rightWrist = pose.landmarks.find((lm: any) => lm.keypoint === 16); // RIGHT_WRIST
              const nose = pose.landmarks.find((lm: any) => lm.keypoint === 0); // NOSE
              
              if (rightWrist && nose) {
                console.log('[Debug] Pose data before validation:', {
                  rightWristY: rightWrist.y.toFixed(3),
                  noseY: nose.y.toFixed(3),
                  wristHigherThanNose: rightWrist.y < nose.y,
                  rightWristVisibility: rightWrist.visibility.toFixed(2),
                  noseVisibility: nose.visibility.toFixed(2)
                });
              }
            }
            
            // Always pass current poses to session
            currentExerciseSession.onPose(e.poses as Pose[]);
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
  const format = device?.formats?.[0];
  const videoAspectRatio = !format ? 3 / 4 : 
    (Math.min(format.videoWidth ?? 0, format.videoHeight ?? 0) || 720) / 
    (Math.max(format.videoWidth ?? 0, format.videoHeight ?? 0) || 1280);

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

        {/* Live feedback overlay for exercise guidance */}
        {activeExercise && (
          <>
            {console.log('[Debug] LiveFeedbackOverlay render:', {
              isRunning: exerciseSession.state.isRunning,
              messagesCount: exerciseSession.messages.length,
              messages: exerciseSession.messages.map(m => m.text)
            })}
            <LiveFeedbackOverlay
              visible={exerciseSession.state.isRunning}
              position="bottom"
              messages={exerciseSession.messages}
            />
          </>
        )}

        {/* Session info overlay */}
        {activeExercise && exerciseSession.state.isRunning && (
          <View style={[styles.sessionInfo, { top: topOffset + 60 }]}>
            <Text style={styles.sessionText}>
              Krok {exerciseSession.state.currentStepIndex + 1}/{exerciseSession.state.totalSteps}
            </Text>
            <Text style={styles.sessionText}>
              {Math.ceil(exerciseSession.state.remainingMs / 1000)}s
            </Text>
            {exerciseSession.state.currentStepProgress > 0 && (
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${exerciseSession.state.currentStepProgress * 100}%` }
                  ]} 
                />
              </View>
            )}
          </View>
        )}

        {/* Manual start button (if auto-start fails) */}
        {activeExercise && !exerciseSession.state.isRunning && (activeExercise.steps_json?.steps?.length || 0) > 0 && (
          <TouchableOpacity 
            style={styles.manualStartButton}
            onPress={() => {
              console.log('[Debug] Manual start triggered');
              exerciseSession.start();
            }}
          >
            <Text style={styles.manualStartText}>Rozpocznij ćwiczenie</Text>
          </TouchableOpacity>
        )}

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
  sessionInfo: {
    position: 'absolute',
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  sessionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  manualStartButton: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    left: 20,
    right: 20,
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  manualStartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});




