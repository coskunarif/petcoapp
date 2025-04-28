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
        <Switch value={value} onValueChange={onValueChange} />
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 15,
    color: '#222',
  },
  settingArrow: {
    fontSize: 18,
    color: '#bbb',
  },
});
