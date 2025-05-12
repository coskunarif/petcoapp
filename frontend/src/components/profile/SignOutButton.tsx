import React, { useRef } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Animated,
  View,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { theme } from '../../theme';

interface SignOutButtonProps {
  onSignOut: () => void;
}

const SignOutButton: React.FC<SignOutButtonProps> = ({ onSignOut }) => {
  // Animation value for button scaling
  const scale = useRef(new Animated.Value(1)).current;
  
  // Handle press animations
  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };
  
  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.buttonAnimatedContainer,
          { transform: [{ scale }] }
        ]}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={onSignOut}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.85}
        >
          <BlurView intensity={40} tint="light" style={styles.blurContainer}>
            <LinearGradient
              colors={['#FF6B6B', '#FF4757']}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons
                name="logout"
                size={22}
                color="#FFFFFF"
                style={styles.icon}
              />
              <Text style={styles.text}>Sign Out</Text>
            </LinearGradient>
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
      
      <Text style={styles.versionText}>
        Version 1.2.0
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  buttonAnimatedContainer: {
    borderRadius: 22,
    overflow: 'hidden',
    width: '80%',
    maxWidth: 280,
    ...Platform.select({
      ios: {
        shadowColor: '#FF4757',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
      default: {},
    }),
  },
  button: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  blurContainer: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 100, 100, 0.3)',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  versionText: {
    color: theme.colors.textTertiary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
});

export default SignOutButton;