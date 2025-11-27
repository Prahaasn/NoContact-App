import Foundation
import WidgetKit
import React

@objc(WidgetKitModule)
class WidgetKitModule: NSObject {

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }

    @objc
    func reloadAllTimelines() {
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }
    }

    @objc
    func reloadTimelines(_ kind: String) {
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadTimelines(ofKind: kind)
        }
    }

    @objc
    func getCurrentConfigurations(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.getCurrentConfigurations { result in
                switch result {
                case .success(let widgets):
                    let widgetInfo = widgets.map { widget -> [String: Any] in
                        return [
                            "kind": widget.kind,
                            "family": self.familyToString(widget.family)
                        ]
                    }
                    resolve(widgetInfo)
                case .failure(let error):
                    reject("ERROR", error.localizedDescription, error)
                }
            }
        } else {
            resolve([])
        }
    }

    @available(iOS 14.0, *)
    private func familyToString(_ family: WidgetFamily) -> String {
        switch family {
        case .systemSmall:
            return "small"
        case .systemMedium:
            return "medium"
        case .systemLarge:
            return "large"
        case .systemExtraLarge:
            return "extraLarge"
        @unknown default:
            return "unknown"
        }
    }
}
