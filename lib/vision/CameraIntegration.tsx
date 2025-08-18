import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { VisionProcessor } from './VisionProcessor';
import { FeatureFrame } from './types';

interface CameraIntegrationProps {
  onFeatureFrame?: (features: FeatureFrame) => void;
  onPoseDetected?: (keyPoints: any[]) => void;
  isActive: boolean;
  exerciseType?: string;
}

export const CameraIntegration: React.FC<CameraIntegrationProps> = ({
  onFeatureFrame,
  onPoseDetected,
  isActive,
  exerciseType = 'general'
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const visionProcessor = useRef<VisionProcessor | null>(null);
  const processingRef = useRef<boolean>(false);
  const frameCountRef = useRef<number>(0);

  useEffect(() => {
    // Initialize Vision Processor
    visionProcessor.current = new VisionProcessor();
    
    return () => {
      if (visionProcessor.current) {
        visionProcessor.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const processFrame = async (imageUri: string) => {
    if (!isActive || processingRef.current || !visionProcessor.current) {
      return;
    }

    // Process every 6th frame (5fps instead of 30fps)
    frameCountRef.current++;
    if (frameCountRef.current % 6 !== 0) {
      return;
    }

    processingRef.current = true;
    setIsProcessing(true);

    try {
      // Convert image URI to ImageData (simplified approach)
      // In a real implementation, you'd use a more efficient conversion
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // This is a simplified approach - in production you'd use
      // a more efficient frame conversion method
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = async () => {
        if (!ctx || !visionProcessor.current) return;
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        try {
          const result = await visionProcessor.current.processFrame(imageData);
          if (result && onPoseDetected) {
            onPoseDetected(result.keyPoints);
          }
        } catch (error) {
          console.warn('Frame processing error:', error);
        }
        
        processingRef.current = false;
        setIsProcessing(false);
      };
      
      img.src = URL.createObjectURL(blob);
      
    } catch (error) {
      console.error('Error processing camera frame:', error);
      processingRef.current = false;
      setIsProcessing(false);
    }
  };

  if (!permission) {
    // Camera permissions are still loading
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        {/* Add permission request UI here */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera}
        facing="front"
        onCameraReady={() => {
          console.log('📸 Camera ready for pose detection');
        }}
      >
        {/* Overlay for pose visualization will go here */}
        <View style={styles.overlay}>
          {/* Processing indicator */}
          {isProcessing && (
            <View style={styles.processingIndicator} />
          )}
        </View>
      </CameraView>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    width,
    height,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  processingIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00FF00',
  },
});