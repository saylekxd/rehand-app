package com.saylekxd.rehand.poselandmarksframeprocessorplugin

import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
import com.mrousavy.camera.frameprocessors.VisionCameraProxy
import com.saylekxd.rehand.pose.PoseLandmarkerHolder
import com.google.mediapipe.framework.image.MPImage

class PoseLandmarksFrameProcessorPluginPlugin(proxy: VisionCameraProxy, options: Map<String, Any>?): FrameProcessorPlugin() {
  override fun callback(frame: Frame, arguments: Map<String, Any>?): Any? {
    val landmarker = PoseLandmarkerHolder.poseLandmarker ?: return null
    val imageProxy = frame.image ?: return null
    val mediaImage = imageProxy.image ?: return null
    val mpImage = MPImage.fromMediaImage(mediaImage)
    try {
      val tsMs = (frame.timestamp / 1000L)
      landmarker.detectAsync(mpImage, tsMs)
    } catch (_: Exception) {
      // swallow
    }
    return null
  }
}