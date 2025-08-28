import Foundation
import React
#if canImport(MediaPipeTasksVision)
import MediaPipeTasksVision
#endif

@objc(PoseLandmarks)
class PoseLandmarks: RCTEventEmitter {
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
        var poses: [[String: Any]] = []
        for landmarks in result.landmarks {
            var arr: [[String: Any]] = []
            for (idx, lm) in landmarks.enumerated() {
                arr.append(["keypoint": idx, "x": lm.x, "y": lm.y, "z": lm.z])
            }
            poses.append(["landmarks": arr])
        }
        sendEvent(withName: "onPoseLandmarksDetected", body: ["poses": poses])
    }
}
#endif


