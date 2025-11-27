package com.nocontact.widget

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap
import androidx.glance.appwidget.GlanceAppWidgetManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * React Native module for widget operations
 * Allows the React Native app to trigger widget updates
 */
class WidgetModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "WidgetModule"

    /**
     * Refresh all widgets of this type
     */
    @ReactMethod
    fun refreshWidget() {
        try {
            val context = reactContext.applicationContext

            // Send broadcast to update widgets
            val intent = Intent(context, NoContactWidgetReceiver::class.java).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
            }

            // Get all widget IDs
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val componentName = ComponentName(context, NoContactWidgetReceiver::class.java)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)

            intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetIds)
            context.sendBroadcast(intent)

            // Also update using Glance API
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val glanceManager = GlanceAppWidgetManager(context)
                    val glanceIds = glanceManager.getGlanceIds(NoContactWidget::class.java)
                    glanceIds.forEach { glanceId ->
                        NoContactWidget().update(context, glanceId)
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    /**
     * Update widget data in SharedPreferences
     * This makes data accessible to the widget
     */
    @ReactMethod
    fun updateWidgetData(data: ReadableMap, promise: Promise) {
        try {
            val context = reactContext.applicationContext

            // Save to SharedPreferences that widget can access
            val prefs: SharedPreferences = context.getSharedPreferences(
                "RN_ASYNC_STORAGE",
                Context.MODE_PRIVATE
            )

            val jsonData = StringBuilder("{")
            var first = true

            data.toHashMap().forEach { (key, value) ->
                if (!first) jsonData.append(",")
                first = false

                when (value) {
                    is String -> jsonData.append("\"$key\":\"$value\"")
                    is Number -> jsonData.append("\"$key\":$value")
                    is Boolean -> jsonData.append("\"$key\":$value")
                    else -> jsonData.append("\"$key\":\"$value\"")
                }
            }
            jsonData.append("}")

            prefs.edit()
                .putString("@nocontact_widget_data", jsonData.toString())
                .apply()

            // Refresh widgets after data update
            refreshWidget()

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message, e)
        }
    }

    /**
     * Check if widgets are installed on the home screen
     */
    @ReactMethod
    fun hasInstalledWidgets(promise: Promise) {
        try {
            val context = reactContext.applicationContext
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val componentName = ComponentName(context, NoContactWidgetReceiver::class.java)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)

            promise.resolve(appWidgetIds.isNotEmpty())
        } catch (e: Exception) {
            promise.reject("ERROR", e.message, e)
        }
    }

    /**
     * Get the count of installed widgets
     */
    @ReactMethod
    fun getWidgetCount(promise: Promise) {
        try {
            val context = reactContext.applicationContext
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val componentName = ComponentName(context, NoContactWidgetReceiver::class.java)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)

            promise.resolve(appWidgetIds.size)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message, e)
        }
    }
}
