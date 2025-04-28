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
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 18,
    paddingHorizontal: 18,
    shadowColor: '#7B61FF',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#ede6ff', // very light purple border
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#7B61FF',
    marginTop: 18,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: isMobile ? 18 : 14,
    paddingHorizontal: 2,
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
      shadowColor: '#7B61FF',
      shadowOpacity: 0.18,
      shadowRadius: 8,
      elevation: 4,
    }),
  },
});
