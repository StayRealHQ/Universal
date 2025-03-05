package com.vexcited.stayreal

import android.annotation.SuppressLint
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

@SuppressLint("MissingFirebaseInstanceTokenRefresh")
class FCM : FirebaseMessagingService() {
  override fun onMessageReceived(remoteMessage: RemoteMessage) {
    if (remoteMessage.data.isNotEmpty()) {
//      val startDate = remoteMessage.data["startDate"]
//      val timezone = remoteMessage.data["timezone"]
//      val endDate = remoteMessage.data["endDate"]
//      val region = remoteMessage.data["region"]
//      val id = remoteMessage.data["id"]
      
      sendNotification("You have 2 minutes to capture a moment")
    }
  }

  private fun sendNotification(messageBody: String) {
    val intent = Intent(this, MainActivity::class.java)
    intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
    
    val pendingIntent = PendingIntent.getActivity(this, 0, intent,  PendingIntent.FLAG_IMMUTABLE)

    val channelId = "stayreal_moments"
    val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel = NotificationChannel(
        channelId,
        "Moments",
        NotificationManager.IMPORTANCE_HIGH,
      ).apply { 
        description = "Notifications for StayReal moments"
      }
      
      notificationManager.createNotificationChannel(channel)
    }
    
    val notificationBuilder = NotificationCompat.Builder(this, channelId)
      .setSmallIcon(R.drawable.ic_stayreal)
      .setContentTitle("It's time for the moment !")
      .setContentText(messageBody)
      .setAutoCancel(true)
      .setContentIntent(pendingIntent)
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .setCategory(NotificationCompat.CATEGORY_EVENT)
      .setFullScreenIntent(pendingIntent, true)

    notificationManager.notify(1000, notificationBuilder.build())
  }
}