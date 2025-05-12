import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  Animated,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';

interface User {
  id?: string;
  profile_image_url?: string;
  full_name?: string;
  email?: string;
  credit_balance?: number;
  rating?: number;
  service_count?: number;
}

interface ProfileHeaderProps {
  user: User;
  onEditProfile: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onEditProfile }) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  // Entrance animations
  useEffect(() => {
    Animated.sequence([
      // First animate the profile image
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Then animate the content
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Button animation
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={60} tint="light" style={styles.blurContainer}>
        <LinearGradient
          colors={[theme.colors.primaryLight + '40', theme.colors.primary + '10']}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Profile Image */}
          <Animated.View style={[
            styles.profileImageContainer,
            { opacity: imageOpacity }
          ]}>
            {user?.profile_image_url ? (
              <Image 
                source={{ uri: user.profile_image_url }} 
                style={styles.profileImage} 
              />
            ) : (
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.profileImagePlaceholder}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.profileInitial}>
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </Text>
              </LinearGradient>
            )}
          </Animated.View>
          
          {/* Profile Info */}
          <Animated.View 
            style={[
              styles.profileInfoContainer,
              { opacity: contentOpacity }
            ]}
          >
            <Text style={styles.profileName}>
              {user?.full_name || 'User'}
            </Text>
            
            <Text style={styles.profileEmail}>
              {user?.email || ''}
            </Text>
          </Animated.View>
          
          {/* Stats Row */}
          <Animated.View
            style={[
              styles.statsRow,
              { opacity: contentOpacity }
            ]}
          >
            <BlurView intensity={40} tint="light" style={styles.statItem}>
              <Text style={styles.statValue}>{user?.rating ? user.rating.toFixed(1) : '-'}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </BlurView>

            <BlurView intensity={40} tint="light" style={styles.statItem}>
              <Text style={styles.statValue}>{user?.service_count || 0}</Text>
              <Text style={styles.statLabel}>Services</Text>
            </BlurView>

            <BlurView intensity={40} tint="light" style={styles.statItem}>
              <Text style={styles.statValue}>${user?.credit_balance?.toFixed(0) || 0}</Text>
              <Text style={styles.statLabel}>Credits</Text>
            </BlurView>
          </Animated.View>
          
          {/* Edit Button */}
          <Animated.View style={[
            styles.editButtonContainer,
            { 
              opacity: contentOpacity,
              transform: [{ scale: scaleAnim }]
            }
          ]}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={onEditProfile}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.editButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons
                  name="pencil"
                  size={16}
                  color="#FFFFFF"
                  style={styles.editButtonIcon}
                />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </LinearGradient>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      default: {},
    }),
  },
  blurContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  gradientBackground: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  profileImageContainer: {
    marginBottom: theme.spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  profileInitial: {
    color: 'white',
    fontSize: 36,
    fontWeight: '700',
  },
  profileInfoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  editButtonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  editButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  editButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  editButtonIcon: {
    marginRight: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ProfileHeader;