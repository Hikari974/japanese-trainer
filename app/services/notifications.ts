import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Notification content for different languages
 */
const NOTIFICATION_CONTENT = {
  fr: {
    title: 'Japanese Trainer',
    body: "C'est l'heure de ton entrainement quotidien !",
  },
  en: {
    title: 'Japanese Trainer',
    body: 'Time for your daily training session!',
  },
} as const;

/**
 * Notification channel ID for Android
 */
const CHANNEL_ID = 'daily-reminder';

/**
 * Configure notification handler behavior
 * Must be called at app startup
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions from the user
 * Handles Android 13+ runtime permission requirements
 * @returns boolean - true if permission granted, false otherwise
 */
export async function requestPermissions(): Promise<boolean> {
  try {
    // Check current permission status first
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    if (existingStatus === 'granted') {
      return true;
    }

    // Request permission if not already granted
    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== 'granted') {
      if (__DEV__) {
        console.log('Notification permissions denied');
      }
      return false;
    }

    // Set up Android notification channel (required for Android 8+)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Rappels quotidiens',
        description: 'Notifications de rappel pour votre entrainement quotidien',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4A90A4',
        sound: 'default',
      });
    }

    return true;
  } catch (error) {
    if (__DEV__) {
      console.error('Error requesting notification permissions:', error);
    }
    return false;
  }
}

/**
 * Schedule a daily reminder notification at the specified time
 * @param time - Time in "HH:mm" format (e.g., "19:00")
 * @param language - Language for notification content ('fr' or 'en')
 */
export async function scheduleDailyReminder(
  time: string,
  language: 'fr' | 'en'
): Promise<void> {
  try {
    // Parse time string
    const [hoursStr, minutesStr] = time.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    // Validate time format
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error(`Invalid time format: ${time}. Expected "HH:mm" format.`);
    }

    // Cancel existing notifications before scheduling new one
    await cancelAllReminders();

    // Get notification content based on language
    const content = NOTIFICATION_CONTENT[language];

    // Schedule the daily notification
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: content.title,
        body: content.body,
        sound: 'default',
        ...(Platform.OS === 'android' && { channelId: CHANNEL_ID }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      },
    });

    if (__DEV__) {
      console.log(`Daily reminder scheduled at ${time} (${language}) with identifier: ${identifier}`);
    }
  } catch (error) {
    if (__DEV__) {
      console.error('Error scheduling daily reminder:', error);
    }
    throw error;
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (__DEV__) {
      console.log('All scheduled notifications cancelled');
    }
  } catch (error) {
    if (__DEV__) {
      console.error('Error cancelling notifications:', error);
    }
    throw error;
  }
}

/**
 * Get all currently scheduled notifications (for debugging)
 * @returns Array of scheduled notification requests
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();

    if (__DEV__) {
      console.log('Scheduled notifications:', JSON.stringify(scheduled, null, 2));
    }

    return scheduled;
  } catch (error) {
    if (__DEV__) {
      console.error('Error getting scheduled notifications:', error);
    }
    return [];
  }
}
