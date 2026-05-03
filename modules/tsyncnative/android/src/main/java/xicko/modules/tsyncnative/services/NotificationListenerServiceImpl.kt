package xicko.modules.tsyncnative.services

import android.app.Notification
import android.os.Build
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import com.tencent.mmkv.MMKV
import kotlinx.serialization.InternalSerializationApi
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import xicko.modules.tsyncnative.data.CollectedNotificationAndroid
import xicko.modules.tsyncnative.data.CollectedNotificationAndroidList
import xicko.modules.tsyncnative.helpers.JsonProvider
import xicko.modules.tsyncnative.helpers.NotificationHelper
import java.util.concurrent.Executors

fun isBlacklistedNotification(sbn: StatusBarNotification?): Boolean {
  if (sbn == null) {
    return true
  }

  if (sbn.packageName.startsWith("com.whatsapp") && sbn.key!!.contains("null")) {
    return true
  }

  if (sbn.packageName == "com.sec.android.app.clock.package") {
    return true
  }

  if (sbn.packageName.lowercase().contains("tsync")) {
    return true
  }

  if (sbn.key == "-1|android|27|null|1000") {
    return true
  }

  if (sbn.key == "charging_state") {
    return true
  }

  if (sbn.packageName == "com.android.systemui") return true

  return sbn.key == "com.sec.android.app.samsungapps|121314|null|10091"
}

class NotificationListenerServiceImpl : NotificationListenerService() {
  private val notiExecutor = Executors.newSingleThreadExecutor()

  @OptIn(InternalSerializationApi::class)
  override fun onNotificationPosted(sbn: StatusBarNotification?) {
    super.onNotificationPosted(sbn)

    if (sbn == null) return

    if (isBlacklistedNotification(sbn)) return

    val systemNotificationTitles = arrayOf<String>(
      "Choose input method",
      "Secure Folder locked.",
      "LSPosed loaded",
      ""
    )

    MMKV.initialize(this.applicationContext)
    val mmkv = MMKV.mmkvWithID("root", MMKV.MULTI_PROCESS_MODE)

    notiExecutor.execute {
      val notificationExtras = sbn.notification.extras

      val title = notificationExtras.getCharSequence(Notification.EXTRA_TITLE)?.toString().orEmpty()
      val conversationTitle = notificationExtras.getCharSequence(Notification.EXTRA_CONVERSATION_TITLE)?.toString().orEmpty()
      val text = notificationExtras.getCharSequence(Notification.EXTRA_TEXT)?.toString().orEmpty()
      val bigText = notificationExtras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString().orEmpty()
      val infoText = notificationExtras.getCharSequence(Notification.EXTRA_INFO_TEXT)?.toString().orEmpty()
      val titleBig = notificationExtras.getCharSequence(Notification.EXTRA_TITLE_BIG)?.toString().orEmpty()
      val peopleList: String = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
        try {
          notificationExtras.getCharSequenceArrayList(Notification.EXTRA_PEOPLE_LIST)
            ?.toString().orEmpty()
        } catch (e: ClassCastException) {
          Log.i("NotificationListenerServiceImpl", "error casting: ${e.stackTraceToString()}")
          String()
        }
      } else {
        String()
      }

      if (systemNotificationTitles.contains(title)) return@execute

      val collectedNotif = CollectedNotificationAndroid(
        sbn.packageName,
        sbn.postTime,
        title,
        text,
        bigText,
        infoText,
        titleBig,
        conversationTitle,
        peopleList
      )

      // TODO: Migrate to sqlite in future
      val existingRaw = mmkv.decodeString("local_notifications", null)
      val existing: CollectedNotificationAndroidList = try {
        if (existingRaw == null) throw Exception("null")
        JsonProvider.json.decodeFromString<CollectedNotificationAndroidList>(existingRaw)
      } catch (e: Exception) {
        emptyList<CollectedNotificationAndroid>()
      }
      val merged = (existing + collectedNotif).reversed()
      mmkv.encode("local_notifications", JsonProvider.json.encodeToString(merged))

      Log.i("NotificationListenerServiceImpl", "onNotificationPosted: $collectedNotif")
    }
  }

  override fun onDestroy() {
    notiExecutor.shutdown()

    super.onDestroy()
  }
}