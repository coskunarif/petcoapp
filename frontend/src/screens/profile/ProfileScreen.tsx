import React, { useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity,
  Animated,
  Platform,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { supabase } from '../../supabaseClient';
import { theme, globalStyles } from '../../theme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { AppButton } from '../../components/ui';
import ProfileHeader from '../../components/profile/ProfileHeader';
import SettingsSection from '../../components/profile/SettingsSection';
import SignOutButton from '../../components/profile/SignOutButton';
import { createShadow, getBlurIntensity } from '../../utils/platformUtils';
import { StackNavigationProp } from '@react-navigation/stack';

// Types for navigation
type ProfileScreenNavigationProp = StackNavigationProp<any, 'Profile'>;

interface ProfileScreenProps {
  navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0, 0.3, 1],
    extrapolate: 'clamp',
  });
  
  // Sign out button animation
  const signOutScale = useRef(new Animated.Value(1)).current;
  
  // Redux
  const user = useSelector((state: any) => state.auth.user);
  const dispatch = useDispatch();
  
  // Handle scroll events
  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    scrollY.setValue(scrollPosition);
  };
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      dispatch(logout());
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Button press animations
  const handlePressIn = () => {
    Animated.spring(signOutScale, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(signOutScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  // We'll use direct navigation now since we don't need the separate functions

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={['rgba(236, 240, 253, 0.8)', 'rgba(252, 252, 252, 0.8)']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Fixed Header - appears on scroll */}
      <Animated.View style={[styles.fixedHeader, { opacity: headerOpacity }]}>
        <View style={styles.fixedHeaderInner}>
          <BlurView intensity={80} style={styles.blurHeader} tint="light">
            <SafeAreaView style={styles.headerContent}>
              <Text style={styles.headerTitle}>Profile</Text>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => console.log('Settings pressed')}
              >
                <MaterialCommunityIcons 
                  name="cog-outline" 
                  size={22} 
                  color={theme.colors.text} 
                />
              </TouchableOpacity>
            </SafeAreaView>
          </BlurView>
        </View>
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Main title that shows at top initially */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>Profile</Text>
        </View>

        {/* Profile header with user info and stats */}
        <ProfileHeader
          user={user}
          onEditProfile={() => navigation.navigate('EditProfile')}
        />

        {/* Account Settings Section */}
        <SettingsSection
          title="Account Settings"
          items={[
            { icon: 'account-outline', title: 'Personal Information', onPress: () => navigation.navigate('PersonalInfo') },
            { icon: 'credit-card-outline', title: 'Payment Methods', onPress: () => navigation.navigate('PaymentMethods') },
            { icon: 'bell-outline', title: 'Notifications', onPress: () => navigation.navigate('NotificationSettings') },
            { icon: 'shield-outline', title: 'Privacy & Security', onPress: () => navigation.navigate('PrivacySettings') }
          ]}
        />

        {/* Preferences Section */}
        <SettingsSection
          title="Preferences"
          items={[
            { icon: 'map-marker-outline', title: 'Location Settings', onPress: () => navigation.navigate('LocationSettings') },
            { icon: 'translate', title: 'Language', onPress: () => navigation.navigate('LanguageSettings') },
            { icon: 'theme-light-dark', title: 'Appearance', onPress: () => navigation.navigate('AppearanceSettings') }
          ]}
        />

        {/* Support Section */}
        <SettingsSection
          title="Support"
          items={[
            { icon: 'help-circle-outline', title: 'Help Center', onPress: () => navigation.navigate('HelpCenter') },
            { icon: 'information-outline', title: 'About', onPress: () => navigation.navigate('About') }
          ]}
        />

        {/* Sign Out Button with version info */}
        <SignOutButton onSignOut={handleLogout} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Fixed header styles (appears on scroll)
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  fixedHeaderInner: {
    ...createShadow(theme.colors.primary, 4, 0.15, 10),
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  blurHeader: {
    overflow: 'hidden',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: StatusBar.currentHeight || 0,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text,
    letterSpacing: 0.3,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Main title that shows at top initially
  titleContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + theme.spacing.md : theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: 0.3,
  }
});

export default ProfileScreen;