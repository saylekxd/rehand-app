#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(PoseLandmarks, RCTEventEmitter)

RCT_EXTERN_METHOD(initModel)
RCT_EXTERN_METHOD(resetModel)

@end


