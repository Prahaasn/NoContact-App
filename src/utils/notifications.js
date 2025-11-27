import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getSettings, saveSettings } from './storage';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Request notification permissions
export const requestPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    // Android specific channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'NoContact Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#7C3AED',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

// Schedule daily check-in reminder
export const scheduleDailyReminder = async (hour = 9, minute = 0) => {
  try {
    // Cancel existing reminders first
    await cancelDailyReminder();

    const trigger = {
      hour,
      minute,
      repeats: true,
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time for your daily check-in',
        body: "How are you feeling today? Take a moment to reflect.",
        data: { type: 'daily_checkin' },
      },
      trigger,
    });

    return true;
  } catch (error) {
    console.error('Error scheduling daily reminder:', error);
    return false;
  }
};

// Cancel daily reminder
export const cancelDailyReminder = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return true;
  } catch (error) {
    console.error('Error canceling daily reminder:', error);
    return false;
  }
};

// Schedule milestone notification
export const scheduleMilestoneNotification = async (days) => {
  try {
    const messages = {
      7: "One week strong! You're doing amazing.",
      14: "Two weeks of no contact! Your strength is inspiring.",
      30: "One month milestone! You should be so proud.",
      60: "60 days! You're proving how strong you are.",
      90: "90 days of healing! You've come so far.",
    };

    if (!messages[days]) return false;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${days} Day Milestone!`,
        body: messages[days],
        data: { type: 'milestone', days },
      },
      trigger: null, // Immediate
    });

    return true;
  } catch (error) {
    console.error('Error scheduling milestone notification:', error);
    return false;
  }
};

// Send emergency support notification
export const sendSupportNotification = async () => {
  try {
    const supportMessages = [
      "You're stronger than you think. This feeling will pass.",
      "Take a deep breath. You've got this.",
      "Remember why you started. Stay strong.",
      "Every moment of strength builds a stronger you.",
      "The urge is temporary. Your growth is permanent.",
    ];

    const randomMessage = supportMessages[Math.floor(Math.random() * supportMessages.length)];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Stay Strong',
        body: randomMessage,
        data: { type: 'support' },
      },
      trigger: null, // Immediate
    });

    return true;
  } catch (error) {
    console.error('Error sending support notification:', error);
    return false;
  }
};

// Enable notifications with settings
export const enableNotifications = async (time = '09:00') => {
  try {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return false;

    const [hour, minute] = time.split(':').map(Number);
    await scheduleDailyReminder(hour, minute);

    // Update settings
    const settings = await getSettings();
    await saveSettings({
      ...settings,
      notificationsEnabled: true,
      notificationTime: time,
    });

    return true;
  } catch (error) {
    console.error('Error enabling notifications:', error);
    return false;
  }
};

// Disable notifications
export const disableNotifications = async () => {
  try {
    await cancelDailyReminder();

    // Update settings
    const settings = await getSettings();
    await saveSettings({
      ...settings,
      notificationsEnabled: false,
    });

    return true;
  } catch (error) {
    console.error('Error disabling notifications:', error);
    return false;
  }
};

// Listen for notification responses
export const addNotificationResponseListener = (callback) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

// Listen for notifications received while app is foregrounded
export const addNotificationReceivedListener = (callback) => {
  return Notifications.addNotificationReceivedListener(callback);
};

export default {
  requestPermissions,
  scheduleDailyReminder,
  cancelDailyReminder,
  scheduleMilestoneNotification,
  sendSupportNotification,
  enableNotifications,
  disableNotifications,
  addNotificationResponseListener,
  addNotificationReceivedListener,
};
