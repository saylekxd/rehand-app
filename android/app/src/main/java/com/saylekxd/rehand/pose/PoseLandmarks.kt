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

    companion object {
        // MediaPipe Pose Landmarks mapping (33 points total)
        private val LANDMARK_NAMES = arrayOf(
            "nose",                    // 0
            "left_eye_inner",         // 1
            "left_eye",               // 2
            "left_eye_outer",         // 3
            "right_eye_inner",        // 4
            "right_eye",              // 5
            "right_eye_outer",        // 6
            "left_ear",               // 7
            "right_ear",              // 8
            "mouth_left",             // 9
            "mouth_right",            // 10
            "left_shoulder",          // 11
            "right_shoulder",         // 12
            "left_elbow",             // 13
            "right_elbow",            // 14
            "left_wrist",             // 15
            "right_wrist",            // 16
            "left_pinky",             // 17
            "right_pinky",            // 18
            "left_index",             // 19
            "right_index",            // 20
            "left_thumb",             // 21
            "right_thumb",            // 22
            "left_hip",               // 23
            "right_hip",              // 24
            "left_knee",              // 25
            "right_knee",             // 26
            "left_ankle",             // 27
            "right_ankle",            // 28
            "left_heel",              // 29
            "right_heel",             // 30
            "left_foot_index",        // 31
            "right_foot_index"        // 32
        )
        
        // Key landmarks for pose analysis
        private val KEY_LANDMARKS = arrayOf(0, 11, 12, 23, 24, 15, 16, 25, 26) // nose, shoulders, hips, wrists, knees
    }

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
                // Log pose detection
                if (result.landmarks().isNotEmpty()) {
                    Log.i("PoseLandmarks", "🏃‍♂️ [PoseDetection] Wykryto ${result.landmarks().size} pozę(y)")
                    
                    // Detailed logging for each pose
                    result.landmarks().forEachIndexed { poseIndex, landmarks ->
                        Log.i("PoseLandmarks", "   📍 Poza ${poseIndex + 1}:")
                        
                        // Log key landmarks with names (always shown)
                        KEY_LANDMARKS.forEach { landmarkIndex ->
                            if (landmarkIndex < landmarks.size) {
                                val landmark = landmarks[landmarkIndex]
                                val name = if (landmarkIndex < LANDMARK_NAMES.size) LANDMARK_NAMES[landmarkIndex] else "unknown_$landmarkIndex"
                                val confidence = landmark.visibility().orElse(0f)
                                val confidenceIcon = when {
                                    confidence > 0.7f -> "🟢"
                                    confidence > 0.4f -> "🟡"
                                    else -> "🔴"
                                }
                                Log.i("PoseLandmarks", "     $confidenceIcon $name: (x: ${"%.3f".format(landmark.x())}, y: ${"%.3f".format(landmark.y())}, z: ${"%.3f".format(landmark.z())}) conf: ${"%.2f".format(confidence)}")
                            }
                        }
                    }
                }
                
                // Prepare data for React Native
                val posesArray = Arguments.createArray()
                for (landmarks in result.landmarks()) {
                    val lmArray = Arguments.createArray()
                    landmarks.forEachIndexed { index, lm ->
                        val landmarkName = if (index < LANDMARK_NAMES.size) LANDMARK_NAMES[index] else "unknown_$index"
                        val m = Arguments.createMap()
                        m.putInt("keypoint", index)
                        m.putString("name", landmarkName)
                        m.putDouble("x", lm.x().toDouble())
                        m.putDouble("y", lm.y().toDouble())
                        m.putDouble("z", lm.z().toDouble())
                        m.putDouble("visibility", lm.visibility().orElse(0f).toDouble())
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
                Log.e("PoseLandmarks", "Pose detection error", e)
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


