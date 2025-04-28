import React, { useRef, useEffect } from 'react';
import { Animated, View, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function AnimatedServiceCard({ item, index, styles }) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 400 + index * 100,
      useNativeDriver: true,
    }).start();
  }, [animatedValue, index]);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });
  const opacity = animatedValue;

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        opacity,
        marginBottom: 24,
      }}
    >
      <View style={styles.cardContainer}>
        <View style={[styles.iconCircle, { backgroundColor: item.color + '55' }]}>  
          <Icon name={item.icon} size={32} color={item.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardDesc}>{item.description}</Text>
        </View>
        <TouchableOpacity style={styles.cardAction}>
          <Icon name="chevron-right" size={28} color="#888" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
