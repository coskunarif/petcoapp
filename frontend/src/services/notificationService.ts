import { supabase } from '../supabaseClient';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Types for notification settings
export interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export interface UserNotificationSettings {
  userId: string;
  settings: {
    [key: string]: boolean;  // Map of setting ID to enabled status
  };
  pushToken?: string;
  masterEnabled: boolean;
  updatedAt: string;
}

/**
 * Retrieves notification settings for a user
 */
export async function getNotificationSettings(userId: string): Promise<UserNotificationSettings> {
  console.log(`[notificationService] Getting notification settings for user ${userId}`);
  try {
    // First check if settings exist for this user
    const { data, error } = await supabase
      .from('user_notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      // If not found, we'll create default settings
      if (error.code === 'PGRST116') {
        console.log(`[notificationService] No settings found for user ${userId}, creating defaults`);
        return createDefaultSettings(userId);
      }
      throw error;
    }
    
    // Transform data to expected format
    const result: UserNotificationSettings = {
      userId,
      settings: data.settings || getDefaultSettingsMap(),
      pushToken: data.push_token,
      masterEnabled: data.master_enabled,
      updatedAt: data.updated_at
    };
    
    console.log(`[notificationService] Retrieved settings:`, result);
    return result;
  } catch (error) {
    console.error(`[notificationService] Error getting notification settings:`, error);
    throw error;
  }
}

/**
 * Saves notification settings for a user
 */
export async function saveNotificationSettings(
  userId: string, 
  settings: { [key: string]: boolean }, 
  masterEnabled: boolean
): Promise<UserNotificationSettings> {
  console.log(`[notificationService] Saving notification settings for user ${userId}`);
  
  try {
    // Get current push token if any
    const pushToken = await getStoredPushToken();
    
    // Try to upsert the settings (update if exists, insert if not)
    const { data, error } = await supabase
      .from('user_notification_settings')
      .upsert({
        user_id: userId,
        settings,
        master_enabled: masterEnabled,
        push_token: pushToken,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error(`[notificationService] Error saving notification settings:`, error);
      throw error;
    }
    
    // Apply these settings to the device notification permissions if needed
    if (pushToken) {
      await applyNotificationPermissions(masterEnabled);
    }
    
    // Return in our format
    const result: UserNotificationSettings = {
      userId,
      settings: data.settings,
      pushToken: data.push_token,
      masterEnabled: data.master_enabled,
      updatedAt: data.updated_at
    };
    
    console.log(`[notificationService] Settings saved successfully:`, result);
    return result;
  } catch (error) {
    console.error(`[notificationService] Error saving notification settings:`, error);
    throw error;
  }
}

/**
 * Creates default notification settings for a new user
 */
async function createDefaultSettings(userId: string): Promise<UserNotificationSettings> {
  const defaultSettings = getDefaultSettingsMap();
  const defaultEnabled = true;
  
  try {
    await saveNotificationSettings(userId, defaultSettings, defaultEnabled);
    return {
      userId,
      settings: defaultSettings,
      masterEnabled: defaultEnabled,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error(`[notificationService] Error creating default settings:`, error);
    
    // Return defaults even if save failed
    return {
      userId,
      settings: defaultSettings,
      masterEnabled: defaultEnabled,
      updatedAt: new Date().toISOString()
    };
  }
}

/**
 * Get default notification settings map
 */
export function getDefaultSettingsMap(): { [key: string]: boolean } {
  return {
    messages: true,
    service_requests: true,
    service_updates: true,
    promotions: false,
    payment: true,
    system: true
  };
}

/**
 * Get default notification settings array
 */
export function getDefaultSettings(): NotificationSetting[] {
  return [
    {
      id: 'messages',
      title: 'Messages',
      description: 'Notifications when you receive a new message',
      enabled: true,
    },
    {
      id: 'service_requests',
      title: 'Service Requests',
      description: 'Notifications for new service requests',
      enabled: true,
    },
    {
      id: 'service_updates',
      title: 'Service Updates',
      description: 'Updates about your booked services',
      enabled: true,
    },
    {
      id: 'promotions',
      title: 'Promotions',
      description: 'Special offers and promotions',
      enabled: false,
    },
    {
      id: 'payment',
      title: 'Payment',
      description: 'Payment receipts and notifications',
      enabled: true,
    },
    {
      id: 'system',
      title: 'System',
      description: 'System updates and announcements',
      enabled: true,
    },
  ];
}

/**
 * Get device push token
 */
export async function registerForPushNotifications(): Promise<string | null> {
  // Check if we're in Expo Go with SDK 53+ (which doesn't support push in Expo Go)
  if (Constants.appOwnership === 'expo') {
    console.log('[notificationService] Push notifications are not available in Expo Go with SDK 53+');
    return null;
  }

  if (!Device.isDevice) {
    console.log('[notificationService] Push notifications are not available on emulator');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Only ask if permissions have not already been determined
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // If no permission, cannot get push token
    if (finalStatus !== 'granted') {
      console.log('[notificationService] Failed to get push token for push notification!');
      return null;
    }

    // Get project ID safely
    const projectId = Constants.expoConfig?.extra?.EXPO_PUBLIC_EAS_PROJECT_ID;

    // Validate project ID
    if (!projectId) {
      console.log('[notificationService] Missing projectId for push notifications');
      return null;
    }

    try {
      // Get the token
      const token = (await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      })).data;

      // Configure notification behavior
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6C63FF',
        });
      }

      console.log('[notificationService] Push token:', token);

      // Store the token
      await storeExpoPushToken(token);

      return token;
    } catch (tokenError) {
      // Handle token-specific errors (invalid projectId, etc)
      console.log('[notificationService] Could not get push token:', tokenError);
      return null;
    }
  } catch (error) {
    console.error('[notificationService] Error registering for push notifications:', error);
    return null;
  }
}

/**
 * Store Expo push token in async storage
 */
async function storeExpoPushToken(token: string): Promise<void> {
  try {
    // Use supabase session storage for simplicity
    await supabase.auth.setSession({
      access_token: (await supabase.auth.getSession()).data.session?.access_token || '',
      refresh_token: (await supabase.auth.getSession()).data.session?.refresh_token || '',
      push_token: token,
    });
  } catch (error) {
    console.error('[notificationService] Error storing push token:', error);
  }
}

/**
 * Get stored push token
 */
async function getStoredPushToken(): Promise<string | null> {
  try {
    // For simplicity, we'll try to get a new token each time
    return await registerForPushNotifications();
  } catch (error) {
    console.error('[notificationService] Error getting stored push token:', error);
    return null;
  }
}

/**
 * Apply notification permissions based on master toggle
 */
async function applyNotificationPermissions(enabled: boolean): Promise<void> {
  if (!Device.isDevice) {
    return;
  }

  try {
    if (enabled) {
      // If master toggle is on, request permissions if needed
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    } else {
      // If master toggle is off, we can't programmatically remove permissions
      // Just notify the user they should disable permissions in system settings
      console.log('[notificationService] User should disable permissions in system settings');
    }
  } catch (error) {
    console.error('[notificationService] Error applying notification permissions:', error);
  }
}