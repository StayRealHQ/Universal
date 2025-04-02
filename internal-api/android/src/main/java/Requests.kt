package com.vexcited.stayreal.api

import android.content.Context
import java.io.IOException
import java.util.Locale
import java.util.TimeZone
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.Headers
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

class Requests(private val context: Context) {
  val authentication = Authentication(context)
  val preferences = Preferences(context)

  private val appIOSBundleId = "AlexisBarreyat.BeReal"
  private val appIOSVersion = "4.15.3"
  private val appIOSBuild = "19999"
  private val clientSecret = "962D357B-B134-4AB6-8F53-BEA2B7255420"

  private fun defaultHeaders(deviceId: String): Headers {
    return Headers.Builder()
            .add("bereal-platform", "iOS")
            .add("bereal-os-version", "18.5")
            .add("bereal-app-version", appIOSVersion)
            .add("bereal-app-version-code", appIOSBuild)
            .add("bereal-device-language", "en")
            .add("bereal-app-language", "en-US")
            .add("bereal-device-id", deviceId)
            .add("bereal-timezone", TimeZone.getDefault().id) // e.g. "Europe/Paris"
            .add("bereal-signature", BeRealSignature.create(deviceId))
            .add(
                    "user-agent",
                    "BeReal/$appIOSVersion ($appIOSBundleId; build:$appIOSBuild; iOS 18.5.0)"
            )
            .build()
  }

  suspend fun refreshToken() {
    val auth = authentication.get()

    val json =
            JSONObject().apply {
              put("client_id", "ios")
              put("grant_type", "refresh_token")
              put("client_secret", clientSecret)
              put("refresh_token", auth.refreshToken)
            }

    val client = OkHttpClient()

    val request =
            Request.Builder()
                    .url("https://auth-l7.bereal.com/token")
                    .headers(defaultHeaders(auth.deviceId!!))
                    .post(json.toString().toRequestBody("application/json".toMediaType()))
                    .build()

    val response = withContext(Dispatchers.IO) { client.newCall(request).execute() }

    if (response.code != 201) {
      throw IOException("refresh token failed with status code ${response.code}")
    }

    val body = response.body?.string() ?: throw IOException("empty response body")

    val jsonBody = JSONObject(body)

    authentication.set(
            AuthenticationDetails(
                    deviceId = auth.deviceId,
                    accessToken = jsonBody.getString("access_token"),
                    refreshToken = jsonBody.getString("refresh_token")
            )
    )
  }

  suspend fun fetchLastMoment(): Moment {
    val region = preferences.getRegion()
    val client = OkHttpClient()

    val request =
            Request.Builder()
                    .url("https://mobile-l7.bereal.com/api/bereal/moments/last/$region")
                    .build()

    val response = withContext(Dispatchers.IO) { client.newCall(request).execute() }

    val body = response.body?.string() ?: throw IOException("empty response body")

    val jsonBody = JSONObject(body)

    return Moment(
            id = jsonBody.getString("id"),
            startDate = jsonBody.getString("startDate"),
            endDate = jsonBody.getString("endDate"),
            region = jsonBody.getString("region")
    )
  }
}
