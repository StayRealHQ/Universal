import SwiftRs
import Tauri
import UIKit
import UserNotifications
import WebKit

class SetAuthDetailsArgs: Decodable {
  let deviceId: String
  let accessToken: String
  let refreshToken: String
}

class SetRegionArgs: Decodable {
  let region: String
}

class ApiPlugin: Plugin, UNUserNotificationCenterDelegate {
  let requests = Requests()

  var authentication = Authentication.shared
  var preferences = Preferences.shared
  var cache = Cache.shared

  @objc public func setAuthDetails(_ invoke: Invoke) throws {
    let args = try invoke.parseArgs(SetAuthDetailsArgs.self)

    authentication.details = AuthenticationDetails(
      deviceId: args.deviceId,
      accessToken: args.accessToken,
      refreshToken: args.refreshToken
    )

    invoke.resolve()
  }

  @objc public func getAuthDetails(_ invoke: Invoke) {
    invoke.resolve([
      "deviceId": authentication.details.deviceId,
      "accessToken": authentication.details.accessToken,
      "refreshToken": authentication.details.refreshToken,
    ])
  }

  @objc public func clearAuthDetails(_ invoke: Invoke) {
    authentication.clear()
    invoke.resolve()
  }

  @objc public func refreshToken(_ invoke: Invoke) {
    DispatchQueue.main.async {
      self.requests.refreshToken(
        completion: { result in
          switch result {
          case .success():
            invoke.resolve()
          case .failure(let error):
            invoke.reject(error.localizedDescription)
          }
        }
      )
    }
  }

  @objc public func setRegion(_ invoke: Invoke) throws {
    let args = try invoke.parseArgs(SetRegionArgs.self)
    preferences.region = args.region
    invoke.resolve()
  }

  @objc public func fetchLastMoment(_ invoke: Invoke) {
    DispatchQueue.main.async {
      self.requests.fetchLastMoment(
        completion: { result in
          switch result {
          case .success(let moment):
            self.cache.lastMomentId = moment.id
            invoke.resolve([
              "id": moment.id,
              "region": moment.region,
              "startDate": moment.startDate,
              "endDate": moment.endDate,
            ])
          case .failure(let error):
            invoke.reject(error.localizedDescription)
          }
        }
      )
    }
  }

  @objc override public func requestPermissions(_ invoke: Invoke) {
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
      DispatchQueue.main.async {
        let status = granted ? "granted" : "denied"
        invoke.resolve(["status": status])
      }
    }
  }
}

@_cdecl("init_plugin_internal_api")
func initPlugin() -> Plugin {
  return ApiPlugin()
}
