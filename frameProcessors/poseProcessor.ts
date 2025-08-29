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
    // Call the native frame processor plugin
    plugin.call(frame)
  } catch (error) {
    console.log('❌ [FrameProcessor] Błąd podczas wywoływania pluginu:', error)
  }
}
