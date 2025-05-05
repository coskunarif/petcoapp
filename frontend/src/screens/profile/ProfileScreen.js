import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { supabase } from '../../supabaseClient';
import { theme, globalStyles } from '../../theme';
import { AppCard, AppButton } from '../../components/ui';

const ProfileScreen = ({ navigation }) => {
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      dispatch(logout());
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderSettingsItem = (icon, title, onPress) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={24} color={theme.colors.primary} style={styles.settingIcon} />
      <Text style={styles.settingText}>{title}</Text>
      <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <View style={[globalStyles.safeArea, { paddingTop: 30 }]}>
      <ScrollView>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            {user?.profile_image_url ? (
              <Image source={{ uri: user.profile_image_url }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileInitial}>
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </Text>
              </View>
            )}
          </View>
          
          <Text style={styles.profileName}>
            {user?.full_name || 'User'}
          </Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Services</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>$120</Text>
              <Text style={styles.statLabel}>Credits</Text>
            </View>
          </View>

          <AppButton
            title="Edit Profile"
            mode="outline"
            icon={<MaterialCommunityIcons name="pencil" size={16} color={theme.colors.primary} />}
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.editButton}
          />
        </View>

        <AppCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          {renderSettingsItem('account-outline', 'Personal Information', () => navigation.navigate('PersonalInfo'))}
          {renderSettingsItem('credit-card-outline', 'Payment Methods', () => navigation.navigate('PaymentMethods'))}
          {renderSettingsItem('bell-outline', 'Notifications', () => navigation.navigate('NotificationSettings'))}
          {renderSettingsItem('shield-outline', 'Privacy & Security', () => navigation.navigate('PrivacySettings'))}
        </AppCard>

        <AppCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          {renderSettingsItem('map-marker-outline', 'Location Settings', () => navigation.navigate('LocationSettings'))}
          {renderSettingsItem('translate', 'Language', () => navigation.navigate('LanguageSettings'))}
          {renderSettingsItem('theme-light-dark', 'Appearance', () => navigation.navigate('AppearanceSettings'))}
        </AppCard>

        <AppCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          {renderSettingsItem('help-circle-outline', 'Help Center', () => navigation.navigate('HelpCenter'))}
          {renderSettingsItem('information-outline', 'About', () => navigation.navigate('About'))}
        </AppCard>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>
          Version 1.0.0
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    backgroundColor: theme.colors.primary,
    paddingTop: 30,
    paddingBottom: 30,
    alignItems: 'center',
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'white',
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  profileInitial: {
    color: 'white',
    fontSize: 40,
    fontWeight: '700',
  },
  profileName: {
    color: 'white',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  editButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sectionCard: {
    marginVertical: 12,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingIcon: {
    marginRight: 16,
  },
  settingText: {
    flex: 1,
    ...theme.typography.body,
  },
  logoutButton: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.medium,
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  logoutText: {
    color: theme.colors.error,
    fontWeight: '700',
    fontSize: 16,
  },
  versionText: {
    color: theme.colors.textTertiary,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 8,
  },
});

export default ProfileScreen;
