package com.saylekxd.rehand.pose

import android.content.Context
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.pose.PoseLandmarker
import com.google.mediapipe.tasks.components.containers.OutputHandler

object PoseLandmarkerHolder {
    @Volatile
    var poseLandmarker: PoseLandmarker? = null
        private set

    @Synchronized
    fun init(context: Context, modelAssetPath: String, listener: OutputHandler.ResultListener<com.google.mediapipe.tasks.vision.pose.PoseLandmarkerResult>) {
        if (poseLandmarker != null) return
        val baseOptions = BaseOptions.builder().setModelAssetPath(modelAssetPath).build()
        val options = PoseLandmarker.PoseLandmarkerOptions.builder()
            .setBaseOptions(baseOptions)
            .setRunningMode(RunningMode.LIVE_STREAM)
            .setNumPoses(1)
            .setResultListener(listener)
            .build()
        poseLandmarker = PoseLandmarker.createFromOptions(context, options)
    }

    @Synchronized
    fun clear() {
        poseLandmarker?.close()
        poseLandmarker = null
    }
}


