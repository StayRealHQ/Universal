import Foundation
import UIKit

class Requests {
  private var preferences = Preferences.shared
  private var authentication = Authentication.shared

  private let appIOSBundleId = "AlexisBarreyat.BeReal"
  private let appIOSVersion = "4.10.0"
  private let appIOSBuild = "19846"
  private let clientSecret = "962D357B-B134-4AB6-8F53-BEA2B7255420"

  private func defaultHeaders(deviceId: String) -> [String: String] {
    return [
      "bereal-platform": "iOS",
      "bereal-os-version": "18.3",
      "bereal-app-version": appIOSVersion,
      "bereal-app-version-code": appIOSBuild,
      "bereal-device-language": "en",
      "bereal-app-language": "en-US",
      "bereal-device-id": deviceId,
      "bereal-experiment-new-design": "false",
      "bereal-experiment-ranking": "false",
      "bereal-experiment-new-profile": "false",
      "bereal-experiment-unlimited-bereals": "false",
      "bereal-timezone": TimeZone.current.identifier,
      "bereal-signature": BeRealSignature.create(deviceId: deviceId),
      "user-agent": "BeReal/\(appIOSVersion) (\(appIOSBundleId); build:\(appIOSBuild); iOS 18.3.0)",
    ]
  }

  func refreshToken(completion: @escaping (Result<Void, Error>) -> Void) {
    let json: [String: String] = [
      "client_id": "ios",
      "grant_type": "refresh_token",
      "client_secret": clientSecret,
      "refresh_token": authentication.details.refreshToken ?? "",
    ]

    guard let url = URL(string: "https://auth-l7.bereal.com/token") else {
      completion(.failure(URLError(.badURL)))
      return
    }

    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.allHTTPHeaderFields = defaultHeaders(deviceId: authentication.details.deviceId ?? "")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")

    do {
      let jsonData = try JSONSerialization.data(withJSONObject: json)
      request.httpBody = jsonData
    } catch {
      completion(.failure(error))
      return
    }

    let task = URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
      if let error = error {
        completion(.failure(error))
        return
      }

      guard let httpResponse = response as? HTTPURLResponse else {
        completion(.failure(URLError(.badServerResponse)))
        return
      }

      guard httpResponse.statusCode == 201 else {
        let err = NSError(
          domain: "",
          code: httpResponse.statusCode,
          userInfo: [
            NSLocalizedDescriptionKey:
              "Refresh token failed with status code \(httpResponse.statusCode)"
          ]
        )
        completion(.failure(err))
        return
      }

      guard let data = data else {
        let err = NSError(
          domain: "",
          code: 0,
          userInfo: [NSLocalizedDescriptionKey: "No data received"]
        )
        completion(.failure(err))
        return
      }

      do {
        guard
          let jsonResponse = try JSONSerialization.jsonObject(with: data) as? [String: Any],
          let accessToken = jsonResponse["access_token"] as? String,
          let refreshToken = jsonResponse["refresh_token"] as? String
        else {
          let err = NSError(
            domain: "",
            code: 0,
            userInfo: [NSLocalizedDescriptionKey: "Invalid response format"]
          )
          completion(.failure(err))
          return
        }

        // Update authentication details
        self?.authentication.details = AuthenticationDetails(
          deviceId: self?.authentication.details.deviceId,
          accessToken: accessToken,
          refreshToken: refreshToken
        )

        // Indicate success by passing an empty tuple
        completion(.success(()))
      } catch {
        let err = NSError(
          domain: "",
          code: 0,
          userInfo: [
            NSLocalizedDescriptionKey: "Failed to parse response: \(error.localizedDescription)"
          ]
        )
        completion(.failure(err))
      }
    }

    task.resume()
  }

  func fetchLastMoment(completion: @escaping (Result<Moment, Error>) -> Void) {
    let region = preferences.region

    guard let url = URL(string: "https://mobile-l7.bereal.com/api/bereal/moments/last/\(region)")
    else {
      completion(.failure(URLError(.badURL)))
      return
    }

    var request = URLRequest(url: url)
    request.httpMethod = "GET"

    let task = URLSession.shared.dataTask(with: request) { data, response, error in
      if let error = error {
        completion(.failure(error))
        return
      }

      guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
        let statusCode = (response as? HTTPURLResponse)?.statusCode ?? 0
        let err = NSError(
          domain: "", code: statusCode,
          userInfo: [NSLocalizedDescriptionKey: "Failed to fetch last moment"])
        completion(.failure(err))
        return
      }

      guard let data = data else {
        let err = NSError(
          domain: "", code: 0, userInfo: [NSLocalizedDescriptionKey: "No data received"])
        completion(.failure(err))
        return
      }

      do {
        let moment = try JSONDecoder().decode(Moment.self, from: data)
        completion(.success(moment))
      } catch {
        let err = NSError(
          domain: "", code: 0, userInfo: [NSLocalizedDescriptionKey: "Invalid response format"])
        completion(.failure(err))
      }
    }

    task.resume()
  }

  func registerDeviceToken(token: String) {
    let deviceId = authentication.details.deviceId ?? ""
    if deviceId.isEmpty {
      return
    }

    let environment = UIDevice.current.pushEnvironment.rawValue
    if UIDevice.current.pushEnvironment == .unknown {
      return
    }

    let debug = UIDevice.current.pushEnvironment == .development ? "1" : "0"
    let region = preferences.region

    guard
      let url = URL(
        string:
          "https://api-stayreal.vexcited.com/ios/register/\(deviceId)/\(region)/\(token)/\(debug)")
    else {
      return
    }

    var request = URLRequest(url: url)
    request.httpMethod = "GET"

    let task = URLSession.shared.dataTask(with: request) { data, response, error in
      if let error = error {
        return
      }

      guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
        return
      }
    }

    task.resume()
  }
}

public extension UIDevice {
  enum PushEnvironment: String {
    case unknown
    case development
    case production
  }

  var pushEnvironment: PushEnvironment {
    guard let provisioningProfile = try? provisioningProfile(),
        let entitlements = provisioningProfile["Entitlements"] as? [String: Any],
        let environment = entitlements["aps-environment"] as? String
    else {
      return .unknown
    }

    return PushEnvironment(rawValue: environment) ?? .unknown
  }

  private func provisioningProfile() throws -> [String: Any]? {
    guard let url = Bundle.main.url(forResource: "embedded", withExtension: "mobileprovision") else {
      return nil
    }

    let binaryString = try String(contentsOf: url, encoding: .isoLatin1)

    let scanner = Scanner(string: binaryString)
    guard scanner.scanUpToString("<plist") != nil, let plistString = scanner.scanUpToString("</plist>"),
      let data = (plistString + "</plist>").data(using: .isoLatin1)
    else {
      return nil
    }

    return try PropertyListSerialization.propertyList(from: data, options: [], format: nil) as? [String: Any]
  }
}
