import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  ActivityIndicator,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { theme, globalStyles } from '../../../theme';
import { Text, AppButton } from '../../../components/ui';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectUserId,
  selectNotificationsState
} from '../../../redux/selectors';
import {
  updateSetting,
  updateMasterToggle,
  fetchNotificationSettings,
  saveNotificationSettings,
  registerPushToken
} from '../../../redux/slices/notificationsSlice';
import { NotificationSetting } from '../../../services/notificationService';

export default function NotificationSettingsScreen({ navigation }: any) {
  // Redux setup
  const dispatch = useDispatch();
  const notificationsState = useSelector(selectNotificationsState) || {};
  const {
    settings = [],
    masterEnabled = true,
    loading = false,
    error = null,
    lastUpdated = null
  } = notificationsState;
  const userId = useSelector(selectUserId);

  // Local saved state to show success message
  const [saved, setSaved] = useState(false);

  // Load settings when component mounts
  useEffect(() => {
    if (userId) {
      // @ts-ignore - TypeScript might complain about the dispatch type
      dispatch(fetchNotificationSettings(userId));
      // @ts-ignore
      dispatch(registerPushToken());
    } else {
      console.log('[NotificationSettings] No user ID available, cannot fetch settings');
    }
  }, [dispatch, userId]);

  // Reset saved state when settings change
  useEffect(() => {
    if (saved) {
      setSaved(false);
    }
  }, [settings, masterEnabled]);

  // Show error if one occurs
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK' }]);
    }
  }, [error]);

  const toggleSetting = (id: string) => {
    try {
      const setting = settings.find(setting => setting.id === id);
      if (setting) {
        dispatch(updateSetting({
          id,
          enabled: !setting.enabled
        }));
      }
    } catch (error) {
      console.error('[NotificationSettings] Error toggling setting:', error);
    }
  };

  const toggleAll = (value: boolean) => {
    try {
      dispatch(updateMasterToggle(value));
    } catch (error) {
      console.error('[NotificationSettings] Error toggling master switch:', error);
    }
  };

  const handleSave = async () => {
    if (!userId) {
      Alert.alert('Error', 'User must be logged in to save notification settings');
      return;
    }

    try {
      // @ts-ignore - TypeScript might complain about the dispatch type
      await dispatch(saveNotificationSettings({
        userId,
        settings,
        masterEnabled
      }));

      setSaved(true);

      // Clear saved state after 3 seconds
      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      console.error('[NotificationSettings] Error saving settings:', error);
      Alert.alert('Error', 'Failed to save notification settings. Please try again later.');
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text variant="h2">Notifications</Text>
        <View style={{ width: 40 }} /> {/* Empty space for balance */}
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {!loading && (
          <>
            {/* Master toggle */}
            <BlurView intensity={80} tint="light" style={styles.masterToggleContainer}>
              <View style={styles.masterToggleContent}>
                <View>
                  <Text variant="h3">All Notifications</Text>
                  <Text variant="body2" color="textSecondary">
                    {masterEnabled ? 'Notifications are on' : 'Notifications are off'}
                  </Text>
                </View>
                <Switch
                  value={masterEnabled}
                  onValueChange={toggleAll}
                  trackColor={{ false: '#e0e0e0', true: `${theme.colors.primary}80` }}
                  thumbColor={masterEnabled ? theme.colors.primary : '#f4f4f4'}
                  ios_backgroundColor="#e0e0e0"
                />
              </View>
            </BlurView>

            {/* Individual notification settings */}
            <View style={styles.settingsContainer}>
              {(settings || []).map(setting => (
                <View key={setting?.id || Math.random().toString()} style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Text variant="body" style={styles.settingTitle}>
                      {setting?.title || 'Notification Setting'}
                    </Text>
                    <Text variant="caption" color="textSecondary" style={styles.settingDescription}>
                      {setting?.description || 'Control notification preferences'}
                    </Text>
                  </View>
                  <Switch
                    value={masterEnabled && Boolean(setting?.enabled)}
                    onValueChange={() => setting?.id && toggleSetting(setting.id)}
                    trackColor={{ false: '#e0e0e0', true: `${theme.colors.primary}80` }}
                    thumbColor={masterEnabled && Boolean(setting?.enabled) ? theme.colors.primary : '#f4f4f4'}
                    ios_backgroundColor="#e0e0e0"
                    disabled={!masterEnabled}
                  />
                </View>
              ))}
            </View>

            {lastUpdated && (
              <Text
                variant="caption"
                color="textSecondary"
                style={styles.lastUpdatedText}
              >
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </Text>
            )}

            <AppButton
              title={saved ? "✓ Saved" : "Save Changes"}
              onPress={handleSave}
              fullWidth
              style={[
                styles.saveButton,
                saved && styles.savedButton
              ]}
              loading={loading}
              disabled={loading}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#fff',
    ...theme.elevation.small,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  masterToggleContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    ...theme.elevation.small,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  masterToggleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    ...theme.elevation.small,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    lineHeight: 18,
  },
  saveButton: {
    marginTop: 8,
  },
  savedButton: {
    backgroundColor: '#4CAF50',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  lastUpdatedText: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 12,
  },
});