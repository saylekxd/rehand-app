import type { Frame } from 'react-native-vision-camera'

export function poseProcessor(frame: Frame) {
  'worklet'
  // Call native VisionCamera Frame Processor plugin registered name
  // The builder usually registers the plugin under its exported name
  // Try both possible global names to be safe.
  // @ts-ignore - injected by VisionCamera at runtime in the Worklet context
  const fn = (globalThis as any).PoseLandmarksFrameProcessor ?? (globalThis as any).PoseLandmarks
  if (typeof fn === 'function') {
    fn(frame)
  }
}
