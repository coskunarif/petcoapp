import { Platform } from 'react-native';

/**
 * Creates platform-specific shadow styles
 */
export const createShadow = (
  color: string = '#000000',
  elevation: number = 4,
  opacity: number = 0.15,
  radius: number = 12,
  offset: { width: number; height: number } = { width: 0, height: 4 }
) => {
  return Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: offset,
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: {
      elevation: elevation,
    },
    default: {},
  });
};

/**
 * Blur intensity adjustment for different platforms
 * On Android, BlurView requires higher intensity to achieve similar effect as iOS
 */
export const getBlurIntensity = (baseIntensity: number) => {
  if (Platform.OS === 'android') {
    // Android usually needs higher intensity values
    return Math.min(baseIntensity * 1.5, 100);
  }
  return baseIntensity;
};

/**
 * Helper to check if device is using iOS
 */
export const isIOS = Platform.OS === 'ios';

/**
 * Helper to check if device is using Android
 */
export const isAndroid = Platform.OS === 'android';