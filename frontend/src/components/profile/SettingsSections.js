import React from 'react';
import { View, Text, Switch, Pressable, StyleSheet } from 'react-native';

function SectionHeader({ title }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function SettingItem({ label, value, onValueChange, type = 'switch', onPress }) {
  if (type === 'switch') {
    return (
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Switch
          value={value}
          onValueChange={onValueChange}
          thumbColor={value ? '#6C63FF' : '#fff'}
          trackColor={{ false: '#e0e7ef', true: '#b5b3fa' }}
          ios_backgroundColor="#e0e7ef"
          style={styles.settingSwitch}
        />
      </View>
    );
  }
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingItem,
        pressed && { backgroundColor: '#f3f7fd', transform: [{ scale: 0.98 }], opacity: 0.85 },
      ]}
      onPress={onPress}
      accessibilityLabel={label}
    >
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingArrow}>{'>'}</Text>
    </Pressable>
  );
}

export default function SettingsSections({ settings, onChange }) {
  return (
    <View style={styles.container}>
      <SectionHeader title="Preferences" />
      <SettingItem
        label="Enable Notifications"
        value={settings.notifications}
        onValueChange={val => onChange('notifications', val)}
      />
      <SettingItem
        label="Location Access"
        value={settings.location}
        onValueChange={val => onChange('location', val)}
      />
      <SectionHeader title="Privacy" />
      <SettingItem
        label="Private Account"
        value={settings.privateAccount}
        onValueChange={val => onChange('privateAccount', val)}
      />
      <SectionHeader title="Account" />
      <SettingItem
        label="Change Password"
        type="button"
        onPress={() => onChange('changePassword')}
      />
    </View>
  );
}

import { Platform, Dimensions } from 'react-native';
const isMobile = Dimensions.get('window').width < 600;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#444',
    marginTop: 12,
    marginBottom: 6,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: isMobile ? 16 : 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderRadius: isMobile ? 24 : 12,
    marginVertical: isMobile ? 6 : 0,
    backgroundColor: isMobile ? 'rgba(255,255,255,0.82)' : '#fff',
    shadowColor: isMobile ? '#6C63FF' : undefined,
    shadowOpacity: isMobile ? 0.08 : 0,
    shadowRadius: isMobile ? 8 : 0,
    elevation: isMobile ? 3 : 1,
  },
  settingLabel: {
    fontSize: 15,
    color: '#222',
  },
  settingArrow: {
    fontSize: 18,
    color: '#bbb',
  },
  settingSwitch: {
    ...(isMobile && {
      transform: [{ scaleX: 1.12 }, { scaleY: 1.12 }],
      shadowColor: '#6C63FF',
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    }),
  },
});
