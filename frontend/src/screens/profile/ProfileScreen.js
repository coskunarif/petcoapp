import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import ProfileHeader from '../../components/profile/ProfileHeader';
import CreditSummaryCard from '../../components/profile/CreditSummaryCard';
import SettingsSections from '../../components/profile/SettingsSections';
import ProfileTabView from '../../components/profile/ProfileTabView';
import LogoutButton from '../../components/profile/LogoutButton';

const mockUser = {
  fullName: 'Jane Doe',
  email: 'jane.doe@example.com',
  profilePicture: 'https://randomuser.me/api/portraits/women/44.jpg',
  bio: 'Pet lover & dog walker',
};

export default function ProfileScreen() {
  const [settings, setSettings] = React.useState({
    notifications: true,
    location: false,
    privateAccount: false,
  });

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Edit profile button pressed!');
  };

  const handleSettingsChange = (key, value) => {
    if (key === 'changePassword') {
      Alert.alert('Change Password', 'Change password pressed!');
      return;
    }
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <View style={styles.container}>
      <ProfileHeader user={mockUser} onEditProfile={handleEditProfile} />
      <CreditSummaryCard credits={120} />
      <SettingsSections settings={settings} onChange={handleSettingsChange} />
      <View style={{ flex: 1, minHeight: 300 }}>
        <ProfileTabView user={mockUser} />
      </View>
      <View style={{ flex: 0 }}>
        <LogoutButton onLogout={() => Alert.alert('Sign Out', 'Sign out pressed!')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
});
