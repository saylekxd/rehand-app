import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, NativeModules, NativeEventEmitter } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useExercise } from '@/hooks/useExercises';
import AuthWrapper from '@/components/auth/AuthWrapper';
import CameraSurface from '@/components/ai/CameraSurface';

export default function AITab() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId?: string }>();
  const { exercise } = useExercise(exerciseId ?? null);
  const [facing, setFacing] = React.useState<'front' | 'back'>('front');
  const [isFullScreen, setIsFullScreen] = React.useState(true);

  // Watchdog: restart native model if no events > 2s
  React.useEffect(() => {
    const PoseLandmarks = (NativeModules as any)?.PoseLandmarks;
    if (!PoseLandmarks) return;
    const emitter = new NativeEventEmitter(PoseLandmarks);
    const lastEventRef = { current: Date.now() };

    const subStatus = emitter.addListener('onPoseLandmarksStatus', () => {
      lastEventRef.current = Date.now();
    });
    const subError = emitter.addListener('onPoseLandmarksError', () => {
      lastEventRef.current = Date.now();
    });
    const subDetected = emitter.addListener('onPoseLandmarksDetected', () => {
      lastEventRef.current = Date.now();
    });

    // Attempt init (idempotent)
    try { PoseLandmarks.initModel?.(); } catch {}

    const intervalId = setInterval(() => {
      const now = Date.now();
      if (now - lastEventRef.current > 2000) {
        try {
          // eslint-disable-next-line no-console
          console.warn('[Pose][Watchdog] No events >2s — resetting model');
          PoseLandmarks.resetModel?.();
          lastEventRef.current = now;
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('[Pose][Watchdog] resetModel failed', err);
        }
      }
    }, 1000);

    return () => {
      subStatus.remove();
      subError.remove();
      subDetected.remove();
      clearInterval(intervalId);
    };
  }, []);

  return (
    <AuthWrapper>
      <SafeAreaView style={styles.container}>
        {!isFullScreen && (
          <View style={styles.header}> 
            <Text style={styles.title}>AI Trener</Text>
            <Text style={styles.subtitle}>Włącz kamerę, aby rozpocząć analizę ruchu</Text>
          </View>
        )}

        <CameraSurface
          facing={facing}
          isActive
          isFullScreen={isFullScreen}
          onToggleFacing={() => setFacing((prev) => (prev === 'front' ? 'back' : 'front'))}
          onToggleFullScreen={() => setIsFullScreen((v) => !v)}
          containerStyle={isFullScreen ? undefined : styles.camera}
          // activeExercise is unused for now; wired for stage 4
          // @ts-ignore
          activeExercise={exercise || undefined}
        />
      </SafeAreaView>
    </AuthWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1020',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginTop: 4,
  },
  camera: {
    marginHorizontal: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
});


