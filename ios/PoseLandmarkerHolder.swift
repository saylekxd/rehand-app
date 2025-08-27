import Foundation
#if canImport(MediaPipeTasksVision)
import MediaPipeTasksVision
#endif

class PoseLandmarkerHolder {
    static let shared = PoseLandmarkerHolder()

    #if canImport(MediaPipeTasksVision)
    private(set) var poseLandmarker: PoseLandmarker?
    #else
    private(set) var poseLandmarker: Any?
    #endif

    private init() {}

    #if canImport(MediaPipeTasksVision)
    func initialize(with options: PoseLandmarkerOptions) throws {
        self.poseLandmarker = try PoseLandmarker(options: options)
    }
    #endif

    func clear() {
        self.poseLandmarker = nil
    }
}


