import React from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { supabase } from '../../supabaseClient';
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
  const dispatch = useDispatch();
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

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
      Alert.alert('Sign Out Error', error.message);
    } else {
      dispatch(logout());
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <ProfileHeader user={mockUser} onEditProfile={handleEditProfile} />
        <CreditSummaryCard credits={120} />
        <SettingsSections settings={settings} onChange={handleSettingsChange} />

      </ScrollView>
      <View style={{ padding: 16 }}>
        <LogoutButton onLogout={handleLogout} />
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
