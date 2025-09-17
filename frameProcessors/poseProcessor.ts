import { VisionCameraProxy, type Frame } from 'react-native-vision-camera'

// Initialize the frame processor plugin using the new VisionCamera 4.x API
const plugin = VisionCameraProxy.initFrameProcessorPlugin('PoseLandmarksFrameProcessor', {})

export function poseProcessor(frame: Frame) {
  'worklet'
  
  if (plugin == null) {
    // Show debug info if plugin is not loaded
    if (Math.random() < 0.01) { // 1% chance to log for debugging
      console.log('📱 [FrameProcessor] Plugin nie został załadowany - PoseLandmarksFrameProcessor')
    }
    return
  }

  try {
    // Throttle by frame count (process every 2nd frame ~30 FPS on 60 FPS camera)
    // @ts-expect-error worklet global cache
    globalThis.__pose_frame_counter = (globalThis.__pose_frame_counter ?? 0) + 1
    // @ts-expect-error worklet global cache
    const c = globalThis.__pose_frame_counter as number
    if (c % 2 !== 0) return

    plugin.call(frame)
  } catch (error) {
    console.log('❌ [FrameProcessor] Błąd podczas wywoływania pluginu:', error)
  }
}
