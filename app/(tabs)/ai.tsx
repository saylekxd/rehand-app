import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, Modal } from 'react-native';
import AuthWrapper from '@/components/auth/AuthWrapper';
import CameraSurface from '@/components/ai/CameraSurface';

export default function AITab() {
  const [facing, setFacing] = React.useState<'front' | 'back'>('front');
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const [cameraReady, setCameraReady] = React.useState(false);

  return (
    <AuthWrapper>
      <SafeAreaView style={styles.container}>
        {!isFullScreen && (
          <View style={styles.header}> 
            <Text style={styles.title}>Analiza ruchu</Text>
            <Text style={styles.subtitle}>
              {cameraReady
                ? 'Zacznij poruszać się, a wykryję Twoją pozę'
                : 'Włącz kamerę, aby rozpocząć analizę ruchu'}
            </Text>
          </View>
        )}

        <CameraSurface
          facing={facing}
          isActive={!isFullScreen}
          isFullScreen={isFullScreen}
          onToggleFacing={() => setFacing((prev) => (prev === 'front' ? 'back' : 'front'))}
          onToggleFullScreen={() => setIsFullScreen((v) => !v)}
          containerStyle={isFullScreen ? styles.cameraFull : styles.camera}
          onReadyChange={setCameraReady}
        />
        {/* Full-screen camera overlay to cover tabs */}
        <Modal
          visible={isFullScreen}
          animationType="fade"
          presentationStyle="fullScreen"
          onRequestClose={() => setIsFullScreen(false)}
        >
          <View style={styles.modalFullScreen}>
            <CameraSurface
              facing={facing}
              isActive
              isFullScreen
              onToggleFacing={() => setFacing((prev) => (prev === 'front' ? 'back' : 'front'))}
              onToggleFullScreen={() => setIsFullScreen(false)}
              containerStyle={styles.cameraFull}
              onReadyChange={setCameraReady}
            />
          </View>
        </Modal>
      </SafeAreaView>
    </AuthWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
  camera: {
    marginHorizontal: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cameraFull: {
    marginHorizontal: 0,
    borderRadius: 0,
  },
  modalFullScreen: {
    flex: 1,
    backgroundColor: '#000',
  },
});


