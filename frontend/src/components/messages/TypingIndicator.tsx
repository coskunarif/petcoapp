import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { theme } from '../../theme';

interface TypingIndicatorProps {
  color?: string;
  size?: number;
  isVisible?: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  color = theme.colors.primary,
  size = 6,
  isVisible = true
}) => {
  // Animated values for the dots
  const dot1Opacity = useRef(new Animated.Value(0)).current;
  const dot2Opacity = useRef(new Animated.Value(0)).current;
  const dot3Opacity = useRef(new Animated.Value(0)).current;

  // Animation sequence
  useEffect(() => {
    if (isVisible) {
      // Reset animation values
      dot1Opacity.setValue(0);
      dot2Opacity.setValue(0);
      dot3Opacity.setValue(0);
      
      // Start animation sequence
      Animated.sequence([
        // Animate first dot
        Animated.timing(dot1Opacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        // Animate second dot after a small delay
        Animated.timing(dot2Opacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        // Animate third dot after another small delay
        Animated.timing(dot3Opacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        // Pause with all dots showing
        Animated.delay(300),
        // Fade all dots out
        Animated.parallel([
          Animated.timing(dot1Opacity, {
            toValue: 0,
            duration: 200,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Opacity, {
            toValue: 0,
            duration: 200,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Opacity, {
            toValue: 0,
            duration: 200,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        // Restart animation when complete
        if (isVisible) {
          dot1Opacity.setValue(0);
          dot2Opacity.setValue(0);
          dot3Opacity.setValue(0);
          startAnimation();
        }
      });
    }
  }, [isVisible]);

  // Start animation sequence
  const startAnimation = () => {
    Animated.sequence([
      // Animate first dot
      Animated.timing(dot1Opacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      // Animate second dot after a small delay
      Animated.timing(dot2Opacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      // Animate third dot after another small delay
      Animated.timing(dot3Opacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      // Pause with all dots showing
      Animated.delay(300),
      // Fade all dots out
      Animated.parallel([
        Animated.timing(dot1Opacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(dot2Opacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(dot3Opacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Restart animation when complete
      if (isVisible) {
        startAnimation();
      }
    });
  };

  // If not visible, don't render
  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.dot, 
          { 
            backgroundColor: color,
            width: size,
            height: size,
            borderRadius: size / 2,
            opacity: dot1Opacity,
            marginRight: size / 2
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.dot, 
          { 
            backgroundColor: color,
            width: size,
            height: size,
            borderRadius: size / 2,
            opacity: dot2Opacity,
            marginRight: size / 2
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.dot, 
          { 
            backgroundColor: color,
            width: size,
            height: size,
            borderRadius: size / 2,
            opacity: dot3Opacity
          }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginRight: 3,
  }
});

export default TypingIndicator;