#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WidgetKitModule, NSObject)

RCT_EXTERN_METHOD(reloadAllTimelines)
RCT_EXTERN_METHOD(reloadTimelines:(NSString *)kind)
RCT_EXTERN_METHOD(getCurrentConfigurations:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

@end
