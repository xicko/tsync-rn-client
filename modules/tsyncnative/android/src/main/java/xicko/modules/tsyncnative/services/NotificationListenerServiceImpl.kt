package xicko.modules.tsyncnative.services

import android.app.Notification
import android.os.Build
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import com.tencent.mmkv.MMKV
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

    notiExecutor.execute {
      MMKV.initialize(this.applicationContext)
      val mmkv = MMKV.mmkvWithID("root")

      val notificationExtras = sbn.notification.extras

      val title = notificationExtras.getCharSequence(Notification.EXTRA_TITLE)?.toString().orEmpty()

      val conversationTitle = notificationExtras.getCharSequence(Notification.EXTRA_CONVERSATION_TITLE)
        ?.toString()
        .orEmpty()

      val text = notificationExtras.getCharSequence(Notification.EXTRA_TEXT)?.toString().orEmpty()

      val bigText = notificationExtras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString()
        .orEmpty()

      val infoText = notificationExtras.getCharSequence(Notification.EXTRA_INFO_TEXT)?.toString()
        .orEmpty()

      val titleBig = notificationExtras.getCharSequence(Notification.EXTRA_TITLE_BIG)?.toString()
        .orEmpty()

      val peopleList = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
        try {
          notificationExtras.getCharSequenceArrayList(Notification.EXTRA_PEOPLE_LIST)
            ?.toString().orEmpty()
        } catch (e: ClassCastException) {
          Log.i("NotificationListenerServiceImpl", "error casting: ${e.stackTraceToString()}")
        }
      } else {
        String()
      }

      if (systemNotificationTitles.contains(title)) return@execute

      NotificationHelper.show(
        this,
        "fromservice: $title",
        text,
        null
      )
    }
  }

  override fun onDestroy() {
    notiExecutor.shutdown()

    super.onDestroy()
  }
}