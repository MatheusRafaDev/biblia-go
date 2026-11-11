import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export class ReadingNotificationService {
  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  static async scheduleDailyReminder(hour = 8, minute = 0): Promise<string | null> {
    if (Platform.OS === 'web') return null;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    // Cancel existing reminder first
    await this.cancelDailyReminder();

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📖 Hora da Leitura - Bíblia Go',
        body: 'Mantenha sua sequência diária! Leia a passagem de hoje do seu plano.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    return id;
  }

  static async cancelDailyReminder(): Promise<void> {
    if (Platform.OS === 'web') return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

