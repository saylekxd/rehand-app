import VisionCamera
#if canImport(MediaPipeTasksVision)
import MediaPipeTasksVision

// Define holder here to ensure visibility in this target
class PoseLandmarkerHolder {
  static let shared = PoseLandmarkerHolder()
  var poseLandmarker: PoseLandmarker?
  private init() {}
}
#endif

@objc(PoseLandmarksFrameProcessorPlugin)
public class PoseLandmarksFrameProcessorPlugin: FrameProcessorPlugin {
  public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable: Any]! = [:]) {
    super.init(proxy: proxy, options: options)
  }

  public override func callback(_ frame: Frame, withArguments arguments: [AnyHashable: Any]?) -> Any? {
    #if canImport(MediaPipeTasksVision)
    guard let landmarker = PoseLandmarkerHolder.shared.poseLandmarker else { return nil }
    let timestampMs = Int(frame.timestamp) / 1000
    do {
      let image = try MPImage(sampleBuffer: frame.buffer, orientation: frame.orientation)
      try landmarker.detectAsync(image: image, timestampInMilliseconds: timestampMs)
    } catch {
      return nil
    }
    #endif
    return nil
  }
}