import { Frame } from 'react-native-vision-camera';

/**
 * Stage 1: No-op frame processor with FPS logging and frame dimension tracking
 * 
 * This processor:
 * - Logs frame dimensions and FPS every 2 seconds
 * - Does no actual ML processing yet
 * - Serves as a foundation for future TensorFlow Lite integration
 */
export function poseProcessor(frame: Frame): void {
  'worklet';
  
  // Simple frame logging without FPS calculation for now
  // VisionCamera already handles throttling internally
  //console.log(`[PoseProcessor] Frame: ${frame.width}x${frame.height}`);
  
  // No-op: just return without processing
  // Future stages will add TensorFlow Lite inference here
}