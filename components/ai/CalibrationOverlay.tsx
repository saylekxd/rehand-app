import React from 'react';
import { View, StyleSheet, Image, Text, ImageSourcePropType } from 'react-native';

interface CalibrationOverlayProps {
  visible: boolean;
  imageSource: ImageSourcePropType;
  instruction?: string;
  topOffset?: number;
  bottomReserved?: number;
  calibrationProgress?: number; // 0-1
}

export default function CalibrationOverlay({ visible, imageSource, instruction, topOffset = 48, bottomReserved = 0, calibrationProgress = 0 }: CalibrationOverlayProps) {
  if (!visible) return null;

  return (
    <View style={[styles.container, { paddingTop: topOffset + 54, paddingBottom: bottomReserved + 8 }]} pointerEvents="none">
      <Image source={imageSource} style={styles.image} resizeMode="contain" />

      {instruction ? (
        <View style={[styles.toast, { bottom: 100 }]}>
          <Text style={styles.toastText}>{instruction}</Text>
          {calibrationProgress > 0 && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${calibrationProgress * 100}%` }]} />
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.32 }],
  },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
});


