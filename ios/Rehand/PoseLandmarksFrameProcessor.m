#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

#if __has_include("Rehand/Rehand-Swift.h")
#import "Rehand/Rehand-Swift.h"
#else
#import "Rehand-Swift.h"
#endif

VISION_EXPORT_SWIFT_FRAME_PROCESSOR(PoseLandmarksFrameProcessorPlugin, PoseLandmarksFrameProcessor)