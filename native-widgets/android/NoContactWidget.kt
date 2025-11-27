package com.nocontact.widget

import android.content.Context
import android.content.SharedPreferences
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.GlanceTheme
import androidx.glance.action.actionStartActivity
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.provideContent
import androidx.glance.appwidget.cornerRadius
import androidx.glance.background
import androidx.glance.layout.*
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextAlign
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import org.json.JSONObject
import com.nocontact.MainActivity

/**
 * Data class to hold widget data
 */
data class WidgetData(
    val currentStreak: Int = 0,
    val longestStreak: Int = 0,
    val message: String = "Open app to sync",
    val streakMessage: String = "Start your journey",
    val nextMilestone: Int = 7,
    val daysToMilestone: Int = 7
)

/**
 * NoContact Widget using Jetpack Glance
 * Displays the user's no-contact streak on the home screen
 */
class NoContactWidget : GlanceAppWidget() {

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val widgetData = loadWidgetData(context)

        provideContent {
            GlanceTheme {
                NoContactWidgetContent(widgetData = widgetData)
            }
        }
    }

    /**
     * Load widget data from SharedPreferences (AsyncStorage)
     */
    private fun loadWidgetData(context: Context): WidgetData {
        try {
            // Try to read from RN AsyncStorage SharedPreferences
            val prefs: SharedPreferences = context.getSharedPreferences(
                "RN_ASYNC_STORAGE",
                Context.MODE_PRIVATE
            )

            // AsyncStorage key
            val widgetDataString = prefs.getString("@nocontact_widget_data", null)

            if (widgetDataString != null) {
                val json = JSONObject(widgetDataString)
                return WidgetData(
                    currentStreak = json.optInt("currentStreak", 0),
                    longestStreak = json.optInt("longestStreak", 0),
                    message = json.optString("encouragementMessage", "You're doing great!"),
                    streakMessage = json.optString("streakMessage", "Keep going!"),
                    nextMilestone = json.optInt("nextMilestone", 7),
                    daysToMilestone = json.optInt("daysToMilestone", 7)
                )
            }

            // Try alternative AsyncStorage location
            val altPrefs = context.getSharedPreferences(
                "com.nocontact.app.asyncstorage",
                Context.MODE_PRIVATE
            )
            val altData = altPrefs.getString("@nocontact_widget_data", null)

            if (altData != null) {
                val json = JSONObject(altData)
                return WidgetData(
                    currentStreak = json.optInt("currentStreak", 0),
                    longestStreak = json.optInt("longestStreak", 0),
                    message = json.optString("encouragementMessage", "You're doing great!"),
                    streakMessage = json.optString("streakMessage", "Keep going!"),
                    nextMilestone = json.optInt("nextMilestone", 7),
                    daysToMilestone = json.optInt("daysToMilestone", 7)
                )
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        return WidgetData()
    }
}

/**
 * Widget content composable
 */
@Composable
fun NoContactWidgetContent(widgetData: WidgetData) {
    Box(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(
                day = Color(0xFF7C3AED), // Primary purple
                night = Color(0xFF6D28D9) // Darker purple
            )
            .cornerRadius(16.dp)
            .clickable(actionStartActivity<MainActivity>()),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalAlignment = Alignment.CenterVertically,
            modifier = GlanceModifier.padding(16.dp)
        ) {
            // Streak number
            Text(
                text = "${widgetData.currentStreak}",
                style = TextStyle(
                    fontSize = 56.sp,
                    fontWeight = FontWeight.Bold,
                    color = ColorProvider(Color.White),
                    textAlign = TextAlign.Center
                )
            )

            Spacer(modifier = GlanceModifier.height(4.dp))

            // "Days Strong" label
            Text(
                text = "Days Strong",
                style = TextStyle(
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = ColorProvider(Color.White.copy(alpha = 0.9f)),
                    textAlign = TextAlign.Center
                )
            )

            Spacer(modifier = GlanceModifier.height(8.dp))

            // Encouragement message
            Text(
                text = widgetData.message,
                style = TextStyle(
                    fontSize = 11.sp,
                    color = ColorProvider(Color.White.copy(alpha = 0.75f)),
                    textAlign = TextAlign.Center
                ),
                maxLines = 2
            )
        }
    }
}

/**
 * Widget Receiver - handles broadcast events for the widget
 */
class NoContactWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = NoContactWidget()
}
