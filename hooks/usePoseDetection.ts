import { useEffect, useState, useCallback } from 'react';
import { KeyPoint } from '../types/ai';

// Sprawdźmy czy możemy zaimportować pose detection plugin
let PoseDetectionPlugin: any = null;
try {
  PoseDetectionPlugin = require('react-native-vision-camera-v3-pose-detection');
} catch (error) {
  console.warn('Pose detection plugin not available, using mock data');
}

export interface UsePoseDetectionProps {
  isEnabled: boolean;
  onPoseDetected: (keyPoints: KeyPoint[]) => void;
}

export const usePoseDetection = ({ isEnabled, onPoseDetected }: UsePoseDetectionProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Inicjalizuje pose detection
   */
  useEffect(() => {
    if (!isEnabled) return;
    
    initializePoseDetection();
  }, [isEnabled]);

  const initializePoseDetection = async () => {
    try {
      if (PoseDetectionPlugin) {
        // Prawdziwy plugin pose detection
        await PoseDetectionPlugin.initialize({
          modelType: 'accurate', // lub 'fast' dla lepszej wydajności
          enabledPoses: ['full_body']
        });
        setIsInitialized(true);
        console.log('Pose detection initialized successfully');
      } else {
        // Mock implementation dla testowania
        setIsInitialized(true);
        console.log('Using mock pose detection');
      }
    } catch (err) {
      setError(`Failed to initialize pose detection: ${err}`);
      console.error('Pose detection initialization failed:', err);
    }
  };

  /**
   * Procesuje klatki z pose detection
   */
  const processPoseFrame = useCallback((frame: any) => {
    if (!isInitialized || !isEnabled) return;

    try {
      if (PoseDetectionPlugin) {
        // Prawdziwe pose detection
        const poses = PoseDetectionPlugin.detectPoses(frame);
        const keyPoints = convertPosesToKeyPoints(poses);
        onPoseDetected(keyPoints);
      } else {
        // Mock data dla testowania
        const mockKeyPoints = generateMockKeyPoints(frame);
        onPoseDetected(mockKeyPoints);
      }
    } catch (err) {
      console.error('Pose processing error:', err);
    }
  }, [isInitialized, isEnabled, onPoseDetected]);

  /**
   * Konwertuje wyniki pose detection na nasze KeyPoints
   */
  const convertPosesToKeyPoints = (poses: any[]): KeyPoint[] => {
    if (!poses || poses.length === 0) return [];

    const pose = poses[0]; // Bierzemy pierwszą wykrytą osobę
    const keyPoints: KeyPoint[] = [];

    // Mapowanie nazw joints z różnych bibliotek
    const jointMapping: Record<string, string> = {
      'nose': 'head',
      'neck': 'neck',
      'left_shoulder': 'left_shoulder',
      'right_shoulder': 'right_shoulder',
      'left_elbow': 'left_elbow',
      'right_elbow': 'right_elbow',
      'left_wrist': 'left_wrist',
      'right_wrist': 'right_wrist',
      'left_hip': 'left_hip',
      'right_hip': 'right_hip',
      'left_knee': 'left_knee',
      'right_knee': 'right_knee',
      'left_ankle': 'left_ankle',
      'right_ankle': 'right_ankle'
    };

    Object.entries(pose.landmarks || {}).forEach(([key, landmark]: [string, any]) => {
      const mappedName = jointMapping[key] || key;
      
      keyPoints.push({
        name: mappedName,
        position: {
          x: landmark.x || 0,
          y: landmark.y || 0,
          z: landmark.z || 0
        },
        confidence: landmark.confidence || 0.5
      });
    });

    return keyPoints;
  };

  /**
   * Generuje mock keypoints do testowania
   */
  const generateMockKeyPoints = (frame: any): KeyPoint[] => {
    const frameWidth = frame?.width || 400;
    const frameHeight = frame?.height || 600;
    
    // Symuluj realistyczne pozycje ciała z małymi wariacjami
    const baseTime = Date.now() / 1000;
    const wobble = Math.sin(baseTime) * 0.02; // Małe naturalne ruchy
    
    return [
      {
        name: 'head',
        position: { x: frameWidth * (0.5 + wobble), y: frameHeight * 0.15, z: 0 },
        confidence: 0.95
      },
      {
        name: 'neck', 
        position: { x: frameWidth * 0.5, y: frameHeight * 0.25, z: 0 },
        confidence: 0.9
      },
      {
        name: 'left_shoulder',
        position: { x: frameWidth * (0.35 + wobble), y: frameHeight * 0.3, z: 0 },
        confidence: 0.85
      },
      {
        name: 'right_shoulder',
        position: { x: frameWidth * (0.65 - wobble), y: frameHeight * 0.3, z: 0 },
        confidence: 0.85
      },
      {
        name: 'left_elbow',
        position: { x: frameWidth * (0.25 + wobble * 2), y: frameHeight * (0.45 + Math.sin(baseTime * 2) * 0.1), z: 0 },
        confidence: 0.8
      },
      {
        name: 'right_elbow', 
        position: { x: frameWidth * (0.75 - wobble * 2), y: frameHeight * (0.45 + Math.sin(baseTime * 2) * 0.1), z: 0 },
        confidence: 0.8
      },
      {
        name: 'spine',
        position: { x: frameWidth * 0.5, y: frameHeight * 0.4, z: 0 },
        confidence: 0.7
      },
      {
        name: 'left_hip',
        position: { x: frameWidth * 0.4, y: frameHeight * 0.6, z: 0 },
        confidence: 0.75
      },
      {
        name: 'right_hip',
        position: { x: frameWidth * 0.6, y: frameHeight * 0.6, z: 0 },
        confidence: 0.75
      }
    ];
  };

  return {
    isInitialized,
    error,
    processPoseFrame
  };
};