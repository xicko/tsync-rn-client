package xicko.modules.tsyncnative.data

import kotlinx.serialization.InternalSerializationApi
import kotlinx.serialization.Serializable

@InternalSerializationApi @Serializable
data class CollectedNotificationAndroid(
  val packageName: String,
  val timestamp: Long,
  val title: String,
  val text: String,
  val bigText: String,
  val infoText: String,
  val titleBig: String,
  val conversationTitle: String,
  val peopleList: String
)

@OptIn(InternalSerializationApi::class)
typealias CollectedNotificationAndroidList = List<CollectedNotificationAndroid>