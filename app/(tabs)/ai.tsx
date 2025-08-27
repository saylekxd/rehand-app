import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import AuthWrapper from '@/components/auth/AuthWrapper';
import CameraSurface from '@/components/ai/CameraSurface';

export default function AITab() {
  const [facing, setFacing] = React.useState<'front' | 'back'>('front');
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  return (
    <AuthWrapper>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}> 
          <Text style={styles.title}>AI Trener</Text>
          <Text style={styles.subtitle}>Włącz kamerę, aby rozpocząć analizę ruchu</Text>
        </View>

        <CameraSurface
          facing={facing}
          isActive
          isFullScreen={isFullScreen}
          onToggleFacing={() => setFacing((prev) => (prev === 'front' ? 'back' : 'front'))}
          onToggleFullScreen={() => setIsFullScreen((v) => !v)}
          containerStyle={styles.camera}
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


