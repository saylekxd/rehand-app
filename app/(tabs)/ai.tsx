import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, NativeModules, NativeEventEmitter, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useExercise } from '@/hooks/useExercises';
import { ExercisesService } from '@/services/exercises';
import { useAuth } from '@/contexts/AuthContext';
import AuthWrapper from '@/components/auth/AuthWrapper';
import CameraSurface from '@/components/ai/CameraSurface';

export default function AITab() {
  const { t } = useTranslation(['ai']);
  const { exerciseId } = useLocalSearchParams<{ exerciseId?: string }>();
  const { exercise } = useExercise(exerciseId ?? null);
  const { user } = useAuth();
  const router = useRouter();
  const [facing, setFacing] = React.useState<'front' | 'back'>('front');
  const [isFullScreen, setIsFullScreen] = React.useState(true);

  // Debug exercise loading
  React.useEffect(() => {
    console.log('[Debug] ai.tsx exercise data:', {
      exerciseId,
      hasExercise: !!exercise,
      exerciseTitle: exercise?.title,
      hasSteps: !!exercise?.steps_json?.steps,
      stepCount: exercise?.steps_json?.steps?.length
    });
  }, [exerciseId, exercise]);

  // Handle exercise session completion
  const handleSessionFinish = React.useCallback(async (completedSteps: number, totalTime: number) => {
    if (!exercise || !user) return;

    try {
      // Record completion in database
      const durationMinutes = Math.round(totalTime / (1000 * 60));
      const { error } = await ExercisesService.recordExerciseCompletion(
        user.id,
        exercise.id,
        durationMinutes
      );

      if (error) {
        console.error('Error recording exercise completion:', error);
      }

      // Show completion summary
      Alert.alert(
        t('ai:sessionDoneTitle'),
        `Ukończono ${completedSteps}/${exercise.steps_json?.steps?.length || 0} kroków\nCzas: ${Math.round(totalTime / 1000)}s`,
        [
          {
            text: t('ai:sessionDoneBack'),
            onPress: () => router.back(),
          },
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
    } catch (error) {
      console.error('Error in handleSessionFinish:', error);
    }
  }, [exercise, user, router]);

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
            <Text style={styles.title}>{t('ai:title')}</Text>
            <Text style={styles.subtitle}>{t('ai:subtitle')}</Text>
          </View>
        )}

        <CameraSurface
          facing={facing}
          isActive
          isFullScreen={isFullScreen}
          onToggleFacing={() => setFacing((prev) => (prev === 'front' ? 'back' : 'front'))}
          onToggleFullScreen={() => setIsFullScreen((v) => !v)}
          containerStyle={isFullScreen ? undefined : styles.camera}
          activeExercise={exercise || undefined}
          onSessionFinish={handleSessionFinish}
        />
        
        {/* Debug exercise data - moved to effect */}
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


