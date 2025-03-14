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
  private var originalDelegate: UIApplicationDelegate?

  let requests = Requests()

  var authentication = Authentication.shared
  var preferences = Preferences.shared
  var cache = Cache.shared

  override init() {
    super.init()
    UNUserNotificationCenter.current().delegate = self
  }

  @objc override public func load(webview: WKWebView) {
    super.load(webview: webview)

    if let app = UIApplication.value(forKey: "sharedApplication") as? UIApplication {
      self.originalDelegate = app.delegate
      app.delegate = self
    }
  }

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
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) {
      granted, error in
      DispatchQueue.main.async {
        if granted {
          UIApplication.shared.registerForRemoteNotifications()
        }

        let status = granted ? "granted" : "denied"
        invoke.resolve(["status": status])
      }
    }
  }
}

extension ApiPlugin: UIApplicationDelegate {
  public func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    return self.originalDelegate?.application?(
      application, didFinishLaunchingWithOptions: launchOptions) ?? true
  }

  public func application(
    _ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error
  ) {
    self.originalDelegate?.application?(
      application, didFailToRegisterForRemoteNotificationsWithError: error)
  }

  public func application(
    _ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
    requests.registerDeviceToken(token)
    self.originalDelegate?.application?(
      application, didRegisterForRemoteNotificationsWithDeviceToken: deviceToken)
  }

  public func application(
    _ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable: Any],
    fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
  ) {
    self.originalDelegate?.application?(
      application, didReceiveRemoteNotification: userInfo, fetchCompletionHandler: completionHandler
    )
  }

  public func application(
    _ application: UIApplication, open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return self.originalDelegate?.application?(application, open: url, options: options) ?? false
  }

  public func application(
    _ application: UIApplication, continue continueUserActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    return self.originalDelegate?.application?(
      application, continue: continueUserActivity, restorationHandler: restorationHandler) ?? false
  }

  public func applicationDidBecomeActive(_ application: UIApplication) {
    self.originalDelegate?.applicationDidBecomeActive?(application)
  }

  public func applicationWillResignActive(_ application: UIApplication) {
    self.originalDelegate?.applicationWillResignActive?(application)
  }

  public func applicationWillEnterForeground(_ application: UIApplication) {
    self.originalDelegate?.applicationWillEnterForeground?(application)
  }

  public func applicationDidEnterBackground(_ application: UIApplication) {
    self.originalDelegate?.applicationDidEnterBackground?(application)
  }

  public func applicationWillTerminate(_ application: UIApplication) {
    self.originalDelegate?.applicationWillTerminate?(application)
  }
}

@_cdecl("init_plugin_internal_api")
func initPlugin() -> Plugin {
  return ApiPlugin()
}
