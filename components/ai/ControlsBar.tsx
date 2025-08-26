import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Zap } from 'lucide-react-native';

interface ControlsBarProps {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
}

export default function ControlsBar({ isRecording, onStart, onStop }: ControlsBarProps) {
  return (
    <View style={styles.container}>
      {!isRecording ? (
        <TouchableOpacity style={styles.startButton} onPress={onStart} accessibilityRole="button" accessibilityLabel="Rozpocznij analizę">
          <Zap size={22} color="#FFFFFF" />
          <Text style={styles.startText}>Rozpocznij Analizę</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.stopButton} onPress={onStop} accessibilityRole="button" accessibilityLabel="Zatrzymaj analizę">
          <Text style={styles.stopText}>Zatrzymaj</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  startText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  stopButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  stopText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});


