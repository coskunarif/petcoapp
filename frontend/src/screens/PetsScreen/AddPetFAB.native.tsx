import React from 'react';
import { Pressable, StyleSheet, Text, Animated } from 'react-native';

interface AddPetFABProps {
  onPress: () => void;
}

const AddPetFAB: React.FC<AddPetFABProps> = ({ onPress }) => {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.93,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  return (
    <Animated.View style={[styles.fabWrapper, { transform: [{ scale }] }]}> 
      <Pressable
        style={styles.fab}
        onPress={onPress}
        accessibilityLabel="Add a new pet"
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_ripple={{ color: '#a3c9f7', borderless: true }}
      >
        <Text style={styles.plus} accessibilityLabel="Add a new pet">＋</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fabWrapper: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    zIndex: 10,
    shadowColor: '#4a90e2',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  fab: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.85)', // glassy
    borderWidth: 2,
    borderColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  plus: {
    color: '#1976d2',
    fontSize: 40,
    fontWeight: 'bold',
    marginTop: -2,
    textShadowColor: '#a3c9f7',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});

export default AddPetFAB;
