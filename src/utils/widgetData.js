import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';

const WIDGET_DATA_KEY = '@nocontact_widget_data';
const APP_GROUP_ID = 'group.com.nocontact.app'; // iOS App Group

// Encouragement messages for widgets
const ENCOURAGEMENT_MESSAGES = [
  "You're doing great!",
  "Stay strong!",
  "Keep going!",
  "You've got this!",
  "One day at a time",
  "Progress, not perfection",
  "Your peace matters more",
  "Every day counts",
  "You're stronger than you know",
  "Healing takes time",
  "Trust the process",
  "Growth is happening",
  "You're worth it",
  "Stay focused on you",
  "Your future is bright",
];

// Get a random encouragement message
const getRandomEncouragement = () => {
  const index = Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length);
  return ENCOURAGEMENT_MESSAGES[index];
};

// Calculate next milestone based on current streak
const calculateNextMilestone = (currentStreak) => {
  const milestones = [7, 14, 30, 60, 90, 180, 365];
  for (const milestone of milestones) {
    if (currentStreak < milestone) {
      return milestone;
    }
  }
  // If past all milestones, calculate next yearly milestone
  return Math.ceil(currentStreak / 365) * 365;
};

// Get streak message based on days
const getStreakMessage = (streak) => {
  if (streak === 0) return 'Start your journey';
  if (streak === 1) return 'Day one. You got this.';
  if (streak < 7) return 'Building momentum';
  if (streak < 14) return 'One week strong!';
  if (streak < 30) return 'Two weeks! Amazing!';
  if (streak < 60) return 'One month! Incredible!';
  if (streak < 90) return 'Two months! Unstoppable!';
  return "90+ days! You're free!";
};

export const widgetDataService = {
  /**
   * Update widget data (called from main app)
   * This saves data that widgets can read
   */
  async updateWidgetData(data) {
    const widgetData = {
      currentStreak: data.currentStreak || 0,
      longestStreak: data.longestStreak || data.currentStreak || 0,
      lastUpdated: new Date().toISOString(),
      encouragementMessage: data.encouragementMessage || getRandomEncouragement(),
      streakMessage: getStreakMessage(data.currentStreak || 0),
      nextMilestone: calculateNextMilestone(data.currentStreak || 0),
      daysToMilestone: calculateNextMilestone(data.currentStreak || 0) - (data.currentStreak || 0),
    };

    try {
      // For Android - AsyncStorage (shared via SharedPreferences)
      await AsyncStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(widgetData));

      // For iOS - Use native module to write to App Group shared container
      if (Platform.OS === 'ios' && NativeModules.SharedGroupPreferences) {
        try {
          await NativeModules.SharedGroupPreferences.setItem(
            WIDGET_DATA_KEY,
            JSON.stringify(widgetData),
            APP_GROUP_ID
          );
        } catch (iosError) {
          console.warn('iOS App Group storage not available:', iosError);
        }
      }

      // Trigger widget refresh
      await this.refreshWidgets();

      return { success: true, data: widgetData };
    } catch (error) {
      console.error('Failed to update widget data:', error);
      return { success: false, error };
    }
  },

  /**
   * Get widget data
   */
  async getWidgetData() {
    try {
      const data = await AsyncStorage.getItem(WIDGET_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get widget data:', error);
      return null;
    }
  },

  /**
   * Refresh widgets (trigger re-render on both platforms)
   */
  async refreshWidgets() {
    try {
      // iOS - Use WidgetKit to reload timelines
      if (Platform.OS === 'ios' && NativeModules.WidgetKitModule) {
        try {
          NativeModules.WidgetKitModule.reloadAllTimelines();
        } catch (iosError) {
          console.warn('iOS WidgetKit not available:', iosError);
        }
      }

      // Android - Use native module to update widgets
      if (Platform.OS === 'android' && NativeModules.WidgetModule) {
        try {
          NativeModules.WidgetModule.refreshWidget();
        } catch (androidError) {
          console.warn('Android widget refresh not available:', androidError);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to refresh widgets:', error);
      return { success: false, error };
    }
  },

  /**
   * Get encouragement messages (useful for widget customization)
   */
  getEncouragementMessages() {
    return ENCOURAGEMENT_MESSAGES;
  },

  /**
   * Get a random encouragement message
   */
  getRandomEncouragement,

  /**
   * Calculate next milestone
   */
  calculateNextMilestone,

  /**
   * Get streak message
   */
  getStreakMessage,
};

export default widgetDataService;
