package xicko.modules.tsyncnative

import android.content.Intent
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.tencent.mmkv.MMKV
import com.topjohnwu.superuser.Shell
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import xicko.modules.tsyncnative.helpers.*
import java.util.concurrent.TimeUnit

















class tsyncnativeModule : Module() {
  private companion object {
    var isShellInit = false
  }

  override fun definition() = ModuleDefinition {
    Name("tsyncnative")

    OnCreate {
      if (!isShellInit) {
        Shell.enableVerboseLogging = BuildConfig.DEBUG
        Shell.setDefaultBuilder(
          Shell.Builder.create()
            .setFlags(Shell.FLAG_MOUNT_MASTER)
            .setInitializers(Shell.Initializer::class.java)
            .setTimeout(10)
        )
        isShellInit = true
      }

      appContext.reactContext?.let { MMKV.initialize(it) }
    }

    AsyncFunction("reloadApp") {
      val ctx = appContext.reactContext

      val pm = ctx?.packageManager
      val launchIntent = pm?.getLaunchIntentForPackage(ctx.packageName)
      val comp = launchIntent?.component
      val mainIntent = Intent.makeRestartActivityTask(comp)
      mainIntent.setPackage(ctx?.packageName);

      ctx?.startActivity(mainIntent)

      Runtime.getRuntime().exit(0);
    }

    Function("isIgnoringBatteryOptimizations") {
      val ctx = appContext.reactContext
      if (ctx != null) return@Function isIgnoringBatteryOptimizations(ctx)
      return@Function false
    }

    Function("disableBatteryOptimizations") { packageName: String? ->
      val ctx = appContext.reactContext
      if (ctx != null) disableBatteryOptimizations(ctx, packageName)
    }

    Function("startService") {
      val ctx = appContext.reactContext

      val periodicRequest = PeriodicWorkRequestBuilder<ConnectionWorker>(
        15,
        TimeUnit.MINUTES,
      )
        .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
        .build()
      if (ctx != null) WorkManager.getInstance(ctx).enqueueUniquePeriodicWork(
        "sync_worker",
        ExistingPeriodicWorkPolicy.UPDATE,
        periodicRequest,
      )

      val oneTimeRequest = OneTimeWorkRequestBuilder<ConnectionWorker>()
        // .setInitialDelay(30, TimeUnit.SECONDS)
        .build()
      if (ctx != null) WorkManager.getInstance(ctx)
        .enqueue(oneTimeRequest)
    }

    Function("openTS") {
      val ctx = appContext.reactContext
      if (ctx != null) openTS(ctx)
    }

    Function("connectTS") {
      val ctx = appContext.reactContext
      if (ctx != null) connectTS(ctx)
    }

    Function("disconnectTS") {
      val ctx = appContext.reactContext
      if (ctx != null) disconnectTS(ctx)
    }

    Function("isRooted") {
      isRooted()
    }

    Function("openTSRoot") {
      openTSRoot()
    }

    Function("connectTSRoot") {
      connectTSRoot()
    }

    Function("disableOptimizationsRoot") { packageName: String? ->
      val ctx = appContext.reactContext
      val res = if (ctx != null) disableOptimizationsRoot(ctx, packageName) else false
      return@Function res
    }

    Function("blockNotificationsRoot") { packageName: String? ->
      val ctx = appContext.reactContext
      val res = if (ctx != null) blockNotificationsRoot(ctx, packageName) else false
      return@Function res
    }

    AsyncFunction("retrieveBatteryStatusRoot") Coroutine { ->
      val result = retrieveBatteryStatusRoot()
      "${result?.level}:${result?.isPlugged}:${result?.timestamp}"
    }
  }
}
