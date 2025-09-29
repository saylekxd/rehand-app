import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useExercise } from '@/hooks/useExercises';
import { useAuth } from '@/contexts/AuthContext';
import CameraSurface from '@/components/ai/CameraSurface';
import { ExercisesService } from '@/services/exercises';
import AuthWrapper from '@/components/auth/AuthWrapper';

export default function AISessionScreen() {
  const { t } = useTranslation(['ai']);
  const params = useLocalSearchParams();
  const exerciseIdParam = Array.isArray((params as any).exerciseId) ? (params as any).exerciseId[0] : (params as any).exerciseId;
  const normalizedExerciseId = typeof exerciseIdParam === 'string' && exerciseIdParam.length > 0 ? exerciseIdParam : undefined;
  const { exercise } = useExercise(normalizedExerciseId ?? null);
  const { user } = useAuth();
  const router = useRouter();
  const [facing, setFacing] = React.useState<'front' | 'back'>('front');
  const insets = useSafeAreaInsets();

  const handleSessionFinish = React.useCallback(async (completedSteps: number, totalTime: number) => {
    if (!exercise || !user) return;
    try {
      const durationMinutes = Math.round(totalTime / (1000 * 60));
      const { error } = await ExercisesService.recordExerciseCompletion(
        user.id,
        exercise.id,
        durationMinutes
      );
      if (error) {
        console.error('Error recording exercise completion:', error);
      }

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
  }, [exercise, user, router, t]);

  return (
    <AuthWrapper>
      <View style={styles.container}>
        <CameraSurface
          key={exercise?.id || 'no-exercise'}
          facing={facing}
          isActive
          isFullScreen
          onToggleFacing={() => setFacing((prev) => (prev === 'front' ? 'back' : 'front'))}
          activeExercise={exercise || undefined}
          onSessionFinish={handleSessionFinish}
          showManualStart={false}
          feedbackPosition="bottom"
          feedbackBottomOffset={Math.max(16, insets.bottom + 8) + 56}
        />

        <View style={[styles.bottomOverlay, { paddingBottom: Math.max(16, insets.bottom + 8) }]}>
          <TouchableOpacity style={styles.endButton} onPress={() => router.back()}>
            <Text style={styles.endButtonText}>Zakończ ćwiczenie</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AuthWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  bottomOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: 'transparent',
  },
  endButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  endButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});


