import { Frame } from 'react-native-vision-camera';
import { poseLandmarker } from 'expo-pose-landmarks';

/**
 * Stage 1: Plugin-backed frame processor with minimal logging
 * 
 * This processor:
 * - Calls expo-pose-landmarks landmarker on each frame (worklet)
 * - Leaves performance throttling to VisionCamera for now
 */
export function poseProcessor(frame: Frame): void {
  'worklet';

  try {
    // poseLandmarker posts results via JS listeners; it does not return data
    poseLandmarker(frame);
  } catch (e) {
    // Swallow errors in worklet to avoid crashing the frame processor
    // console.log('[PoseProcessor] error running landmarker');
  }
}