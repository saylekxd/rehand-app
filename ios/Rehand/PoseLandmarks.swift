import Foundation
import React
#if canImport(MediaPipeTasksVision)
import MediaPipeTasksVision
#endif

@objc(PoseLandmarks)
class PoseLandmarks: RCTEventEmitter {
    
    // MediaPipe Pose Landmarks mapping (33 points total)
    private static let landmarkNames: [String] = [
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
    ]
    
    // Key landmarks for pose analysis
    private static let keyLandmarks = [0, 11, 12, 23, 24, 15, 16, 25, 26] // nose, shoulders, hips, wrists, knees
    
    // Helper function to log all landmarks (for debugging)
    private func logAllLandmarks(_ landmarks: [NormalizedLandmark], poseIndex: Int) {
        print("   📋 Wszystkie punkty dla pozy \(poseIndex + 1):")
        for (idx, landmark) in landmarks.enumerated() {
            let name = idx < Self.landmarkNames.count ? Self.landmarkNames[idx] : "unknown_\(idx)"
            let confidence = landmark.visibility ?? 0.0
            let confidenceIcon = confidence > 0.7 ? "🟢" : confidence > 0.4 ? "🟡" : "🔴"
            print("     \(String(format: "%2d", idx)). \(confidenceIcon) \(name): (x: \(String(format: "%.3f", landmark.x)), y: \(String(format: "%.3f", landmark.y)), z: \(String(format: "%.3f", landmark.z))) conf: \(String(format: "%.2f", confidence))")
        }
    }
    override static func moduleName() -> String! { "PoseLandmarks" }
    @objc override static func requiresMainQueueSetup() -> Bool { true }
    override func supportedEvents() -> [String]! {
        ["onPoseLandmarksStatus", "onPoseLandmarksError", "onPoseLandmarksDetected"]
    }

    @objc
    func initModel() {
        #if canImport(MediaPipeTasksVision)
        if PoseLandmarkerHolder.shared.poseLandmarker != nil {
            sendEvent(withName: "onPoseLandmarksStatus", body: ["status": "Model already initialized"]) 
            return
        }
        do {
            guard let modelPath = Bundle.main.path(forResource: "pose_landmarker_full", ofType: "task") else {
                sendEvent(withName: "onPoseLandmarksError", body: ["error": "Model not found in bundle"]) 
                return
            }
            let baseOptions = BaseOptions()
            baseOptions.modelAssetPath = modelPath
            var options = PoseLandmarkerOptions()
            options.baseOptions = baseOptions
            options.runningMode = RunningMode.liveStream
            options.numPoses = 1
            options.poseLandmarkerLiveStreamDelegate = self
            try PoseLandmarkerHolder.shared.initialize(with: options)
            sendEvent(withName: "onPoseLandmarksStatus", body: ["status": "Model initialized successfully"]) 
        } catch {
            sendEvent(withName: "onPoseLandmarksError", body: ["error": error.localizedDescription])
        }
        #else
        sendEvent(withName: "onPoseLandmarksError", body: ["error": "MediaPipeTasksVision not available"]) 
        #endif
    }
}

#if canImport(MediaPipeTasksVision)
extension PoseLandmarks: PoseLandmarkerLiveStreamDelegate {
    func poseLandmarker(_ poseLandmarker: PoseLandmarker, didFinishDetection result: PoseLandmarkerResult?, timestampInMilliseconds: Int, error: Error?) {
        if let error {
            sendEvent(withName: "onPoseLandmarksError", body: ["error": error.localizedDescription])
            return
        }
        guard let result else { return }
        
        // Log pose detection
        if !result.landmarks.isEmpty {
            print("🏃‍♂️ [PoseDetection] Wykryto \(result.landmarks.count) pozę(y)")
            
            // Detailed logging for each pose
            for (poseIndex, landmarks) in result.landmarks.enumerated() {
                print("   📍 Poza \(poseIndex + 1):")
                
                // Log key landmarks with names (always shown)
                for landmarkIndex in Self.keyLandmarks {
                    if landmarkIndex < landmarks.count {
                        let landmark = landmarks[landmarkIndex]
                        let name = landmarkIndex < Self.landmarkNames.count ? Self.landmarkNames[landmarkIndex] : "unknown_\(landmarkIndex)"
                        let confidence = landmark.visibility ?? 0.0
                        let confidenceIcon = confidence > 0.7 ? "🟢" : confidence > 0.4 ? "🟡" : "🔴"
                        print("     \(confidenceIcon) \(name): (x: \(String(format: "%.3f", landmark.x)), y: \(String(format: "%.3f", landmark.y)), z: \(String(format: "%.3f", landmark.z))) conf: \(String(format: "%.2f", confidence))")
                    }
                }
                
                // Uncomment the line below to log ALL landmarks (for detailed debugging)
                //logAllLandmarks(landmarks, poseIndex: poseIndex)
            }
        }
        
        // Prepare data for React Native
        var poses: [[String: Any]] = []
        for landmarks in result.landmarks {
            var arr: [[String: Any]] = []
            for (idx, lm) in landmarks.enumerated() {
                let landmarkName = idx < Self.landmarkNames.count ? Self.landmarkNames[idx] : "unknown_\(idx)"
                arr.append([
                    "keypoint": idx,
                    "name": landmarkName,
                    "x": lm.x,
                    "y": lm.y,
                    "z": lm.z,
                    "visibility": lm.visibility ?? 0.0
                ])
            }
            poses.append(["landmarks": arr])
        }
        sendEvent(withName: "onPoseLandmarksDetected", body: ["poses": poses])
    }
}
#endif


