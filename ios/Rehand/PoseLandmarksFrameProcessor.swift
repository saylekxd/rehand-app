import VisionCamera
#if canImport(MediaPipeTasksVision)
import MediaPipeTasksVision
#endif

@objc(PoseLandmarksFrameProcessorPlugin)
public class PoseLandmarksFrameProcessorPlugin: FrameProcessorPlugin {
  public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable: Any]! = [:]) {
    super.init(proxy: proxy, options: options)
  }

  public override func callback(_ frame: Frame, withArguments arguments: [AnyHashable: Any]?) -> Any? {
    #if canImport(MediaPipeTasksVision)
    guard let landmarker = PoseLandmarkerHolder.shared.poseLandmarker else { return nil }
    // Use a monotonically increasing timestamp in ms to avoid duplicates/regressions
    // frame.timestamp is in nanoseconds (monotonic). Convert to ms and ensure strictly increasing.
    let tsMs = Int(frame.timestamp / 1_000_000)
    let last = UserDefaults.standard.integer(forKey: "pose_last_ts_ms")
    let timestampMs = tsMs > last ? tsMs : (last + 1)
    UserDefaults.standard.set(timestampMs, forKey: "pose_last_ts_ms")
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