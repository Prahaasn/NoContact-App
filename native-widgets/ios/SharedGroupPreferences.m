#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(SharedGroupPreferences, NSObject)

RCT_EXTERN_METHOD(setItem:(NSString *)key value:(NSString *)value appGroup:(NSString *)appGroup resolve:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getItem:(NSString *)key appGroup:(NSString *)appGroup resolve:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(removeItem:(NSString *)key appGroup:(NSString *)appGroup resolve:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

@end
