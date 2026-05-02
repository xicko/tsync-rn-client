package xicko.modules.tsyncnative.data

data class BatteryStatus(
  val level: Int,
  val isPlugged: Boolean,
  val timestamp: Long,
)