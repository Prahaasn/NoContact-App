import Foundation
import React

@objc(SharedGroupPreferences)
class SharedGroupPreferences: NSObject {

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }

    @objc
    func setItem(_ key: String, value: String, appGroup: String, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let sharedDefaults = UserDefaults(suiteName: appGroup) else {
            reject("ERROR", "Could not access App Group: \(appGroup)", nil)
            return
        }

        sharedDefaults.set(value, forKey: key)
        sharedDefaults.synchronize()
        resolve(true)
    }

    @objc
    func getItem(_ key: String, appGroup: String, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let sharedDefaults = UserDefaults(suiteName: appGroup) else {
            reject("ERROR", "Could not access App Group: \(appGroup)", nil)
            return
        }

        let value = sharedDefaults.string(forKey: key)
        resolve(value)
    }

    @objc
    func removeItem(_ key: String, appGroup: String, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let sharedDefaults = UserDefaults(suiteName: appGroup) else {
            reject("ERROR", "Could not access App Group: \(appGroup)", nil)
            return
        }

        sharedDefaults.removeObject(forKey: key)
        sharedDefaults.synchronize()
        resolve(true)
    }
}
