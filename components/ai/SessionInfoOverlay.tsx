import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

interface SessionInfoOverlayProps {
  visible: boolean;
  currentStep: number;
  totalSteps: number;
  remainingSeconds: number;
  currentRound: number;
  totalRounds: number;
  progress: number; // 0-1
  topOffset?: number;
}

export default function SessionInfoOverlay({
  visible,
  currentStep,
  totalSteps,
  remainingSeconds,
  currentRound,
  totalRounds,
  progress,
  topOffset = 48,
}: SessionInfoOverlayProps) {
  const { t } = useTranslation(['ai']);
  
  if (!visible) return null;

  return (
    <View style={[styles.container, { top: topOffset }]} pointerEvents="none">
      {/* Main card */}
      <View style={styles.card}>
        {/* Top row: Step and Timer */}
        <View style={styles.topRow}>
          <View style={styles.stepContainer}>
            <Text style={styles.label}>{t('sessionInfo.step')}</Text>
            <Text style={styles.stepValue}>
              {currentStep}/{totalSteps}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.timerContainer}>
            <Text style={styles.label}>{t('sessionInfo.time')}</Text>
            <Text style={styles.timerValue}>{t('sessionInfo.seconds', { count: remainingSeconds })}</Text>
          </View>

          {totalRounds > 1 && (
            <>
              <View style={styles.divider} />
              
              <View style={styles.roundContainer}>
                <Text style={styles.label}>{t('sessionInfo.round')}</Text>
                <Text style={styles.roundValue}>
                  {currentRound}/{totalRounds}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Progress bar */}
        {progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min(100, progress * 100)}%` }
                ]} 
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'stretch',
    zIndex: 100,
  },
  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  stepContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  timerContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  roundContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  stepValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  timerValue: {
    color: '#10B981',
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  roundValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressContainer: {
    marginTop: 10,
    width: '100%',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
});
