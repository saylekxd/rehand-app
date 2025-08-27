package com.saylekxd.rehand.pose

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.mediapipe.framework.image.MPImage
import com.google.mediapipe.tasks.components.containers.OutputHandler
import com.google.mediapipe.tasks.vision.pose.PoseLandmarkerResult

class PoseLandmarks(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "PoseLandmarks"

    private fun sendEvent(event: String, params: com.facebook.react.bridge.WritableMap?) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit(event, params)
    }

    @ReactMethod
    fun initModel() {
        if (PoseLandmarkerHolder.poseLandmarker != null) {
            val map = Arguments.createMap()
            map.putString("status", "Model already initialized")
            sendEvent("onPoseLandmarksStatus", map)
            return
        }

        val listener = OutputHandler.ResultListener { result: PoseLandmarkerResult, input: MPImage ->
            try {
                val posesArray = Arguments.createArray()
                for (landmarks in result.landmarks()) {
                    val lmArray = Arguments.createArray()
                    landmarks.forEachIndexed { index, lm ->
                        val m = Arguments.createMap()
                        m.putInt("keypoint", index)
                        m.putDouble("x", lm.x().toDouble())
                        m.putDouble("y", lm.y().toDouble())
                        m.putDouble("z", lm.z().toDouble())
                        lmArray.pushMap(m)
                    }
                    val poseMap = Arguments.createMap()
                    poseMap.putArray("landmarks", lmArray)
                    posesArray.pushMap(poseMap)
                }
                val params = Arguments.createMap()
                params.putArray("poses", posesArray)
                sendEvent("onPoseLandmarksDetected", params)
            } catch (e: Exception) {
                val err = Arguments.createMap()
                err.putString("error", e.message)
                sendEvent("onPoseLandmarksError", err)
            }
        }

        try {
            PoseLandmarkerHolder.init(reactContext, "pose_landmarker_full.task", listener)
            val ok = Arguments.createMap()
            ok.putString("status", "Model initialized successfully")
            sendEvent("onPoseLandmarksStatus", ok)
        } catch (e: Exception) {
            Log.e("PoseLandmarks", "initModel error", e)
            val err = Arguments.createMap()
            err.putString("error", e.message)
            sendEvent("onPoseLandmarksError", err)
        }
    }
}


