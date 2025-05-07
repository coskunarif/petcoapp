import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Platform,
  Animated
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';

interface SettingsItemProps {
  icon: string;
  title: string;
  onPress: () => void;
  index?: number;
}

interface SettingsSectionProps {
  title: string;
  items: Omit<SettingsItemProps, 'index'>[];
}

const SettingsItem: React.FC<SettingsItemProps> = ({ icon, title, onPress, index = 0 }) => {
  // Animation values for staggered entrance
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  
  // Entrance animation with staggered effect based on index
  useEffect(() => {
    const delay = 100 + (index * 70); // Stagger based on index
    
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 450,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  // Handle press animations for visual feedback
  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
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
    <Animated.View
      style={[
        styles.itemContainer,
        {
          opacity,
          transform: [
            { translateY },
            { scale },
          ],
        },
      ]}
    >
      <TouchableOpacity 
        style={styles.settingItem} 
        onPress={onPress}
        activeOpacity={0.7}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={[`${theme.colors.primary}40`, `${theme.colors.primary}15`]}
            style={styles.iconBackground}
          >
            <MaterialCommunityIcons 
              name={icon as keyof typeof MaterialCommunityIcons.glyphMap} 
              size={22} 
              color={theme.colors.primary} 
            />
          </LinearGradient>
        </View>
        
        <Text style={styles.settingText}>{title}</Text>
        
        <MaterialCommunityIcons 
          name="chevron-right" 
          size={22} 
          color={theme.colors.textTertiary} 
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, items }) => {
  return (
    <View style={styles.container}>
      <BlurView intensity={60} tint="light" style={styles.blurContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        
        <View style={styles.itemsContainer}>
          {items.map((item, index) => (
            <SettingsItem
              key={item.title}
              icon={item.icon}
              title={item.title}
              onPress={item.onPress}
              index={index}
            />
          ))}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
  },
  blurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  headerContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.03)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: 0.2,
  },
  itemsContainer: {
    paddingBottom: theme.spacing.sm,
  },
  itemContainer: {
    // This is the animated container
    width: '100%',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.03)',
  },
  iconContainer: {
    marginRight: 16,
  },
  iconBackground: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
});

export default SettingsSection;