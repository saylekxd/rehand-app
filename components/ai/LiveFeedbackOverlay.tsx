import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle as AlertIcon, CircleCheck as CheckIcon, Info as InfoIcon } from 'lucide-react-native';
import { LiveFeedbackPosition, LiveMessage } from './types';

interface LiveFeedbackOverlayProps {
  visible: boolean;
  position?: LiveFeedbackPosition;
  messages: LiveMessage[];
  bottomOffset?: number;
}

export default function LiveFeedbackOverlay({ visible, position = 'bottom', messages, bottomOffset = 0 }: LiveFeedbackOverlayProps) {
  if (!visible) return null;

  const lastMessages = messages.slice(-3);

  return (
    <View
      style={[
        styles.container,
        position === 'top' ? styles.top : [styles.bottom, { bottom: 20 + bottomOffset }],
      ]}
      pointerEvents="none"
    >
      {lastMessages.map((m) => (
        <View key={m.id} style={styles.message}>
          <View style={[styles.iconWrap, getLevelStyle(m.level)]}>
            {m.level === 'success' ? (
              <CheckIcon size={14} color="#FFFFFF" />
            ) : m.level === 'warning' ? (
              <AlertIcon size={14} color="#FFFFFF" />
            ) : (
              <InfoIcon size={14} color="#FFFFFF" />
            )}
          </View>
          <Text style={styles.text}>{m.text}</Text>
        </View>
      ))}
    </View>
  );
}

function getLevelStyle(level: LiveMessage['level']) {
  switch (level) {
    case 'success':
      return { backgroundColor: 'rgba(16, 185, 129, 0.9)' };
    case 'warning':
      return { backgroundColor: 'rgba(245, 158, 11, 0.9)' };
    default:
      return { backgroundColor: 'rgba(59, 130, 246, 0.9)' };
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
    gap: 8,
  },
  top: {
    top: 56,
  },
  bottom: {
    bottom: 20,
  },
  message: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    gap: 10,
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    fontSize: 13,
  },
});


