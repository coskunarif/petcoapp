import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { theme, globalStyles } from '../../../theme';
import { Text, AppButton } from '../../../components/ui';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export default function NotificationSettingsScreen({ navigation }: any) {
  const [settings, setSettings] = useState<NotificationSetting[]>([
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
  ]);

  const [masterToggle, setMasterToggle] = useState(true);

  const toggleSetting = (id: string) => {
    setSettings(
      settings.map(setting => 
        setting.id === id 
          ? { ...setting, enabled: !setting.enabled } 
          : setting
      )
    );
    
    // Update master toggle if all are enabled or disabled
    const updatedSettings = settings.map(setting => 
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    );
    
    const allEnabled = updatedSettings.every(setting => setting.enabled);
    const allDisabled = updatedSettings.every(setting => !setting.enabled);
    
    if (allEnabled) setMasterToggle(true);
    if (allDisabled) setMasterToggle(false);
  };

  const toggleAll = (value: boolean) => {
    setMasterToggle(value);
    setSettings(
      settings.map(setting => ({ ...setting, enabled: value }))
    );
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

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Master toggle */}
        <BlurView intensity={80} tint="light" style={styles.masterToggleContainer}>
          <View style={styles.masterToggleContent}>
            <View>
              <Text variant="h3">All Notifications</Text>
              <Text variant="body2" color="textSecondary">
                {masterToggle ? 'Notifications are on' : 'Notifications are off'}
              </Text>
            </View>
            <Switch
              value={masterToggle}
              onValueChange={toggleAll}
              trackColor={{ false: '#e0e0e0', true: `${theme.colors.primary}80` }}
              thumbColor={masterToggle ? theme.colors.primary : '#f4f4f4'}
              ios_backgroundColor="#e0e0e0"
            />
          </View>
        </BlurView>

        {/* Individual notification settings */}
        <View style={styles.settingsContainer}>
          {settings.map(setting => (
            <View key={setting.id} style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text variant="body" style={styles.settingTitle}>
                  {setting.title}
                </Text>
                <Text variant="caption" color="textSecondary" style={styles.settingDescription}>
                  {setting.description}
                </Text>
              </View>
              <Switch
                value={masterToggle && setting.enabled}
                onValueChange={() => toggleSetting(setting.id)}
                trackColor={{ false: '#e0e0e0', true: `${theme.colors.primary}80` }}
                thumbColor={masterToggle && setting.enabled ? theme.colors.primary : '#f4f4f4'}
                ios_backgroundColor="#e0e0e0"
                disabled={!masterToggle}
              />
            </View>
          ))}
        </View>

        <AppButton
          title="Save Changes"
          onPress={() => console.log('Save notification settings')}
          fullWidth
          style={styles.saveButton}
        />
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
});