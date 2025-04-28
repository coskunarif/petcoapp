import React, { useState, useRef } from 'react';
import { Card, Title, Paragraph } from 'react-native-paper';
import { StyleSheet, Animated, Pressable, View } from 'react-native';
import ServiceDetailModal from '../ServiceDetailModal';

export default function ServiceCard({ service }: { service: any }) {
  const [modalVisible, setModalVisible] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const elevation = useRef(new Animated.Value(7)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1.025, useNativeDriver: true }),
      Animated.timing(elevation, { toValue: 14, duration: 120, useNativeDriver: false })
    ]).start();
  };
  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.timing(elevation, { toValue: 7, duration: 120, useNativeDriver: false })
    ]).start();
  };

  return (
    <>
      <Pressable
        onPress={() => setModalVisible(true)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ borderRadius: 24 }}
      >
        <Animated.View
          style={[
            styles.card,
            {
              elevation: elevation,
              shadowRadius: elevation.interpolate({ inputRange: [7, 14], outputRange: [14, 24] }),
            }
          ]}
        >
          <Animated.View
            style={{ transform: [{ scale }] }}
          >
          <View style={styles.accentBorder}>
            <View style={styles.gradientBg}>
              <Card.Content>
                <Title>{service.type} by {service.provider}</Title>
                <Paragraph>{service.description}</Paragraph>
                <Paragraph>Cost: {service.cost} credits</Paragraph>
              </Card.Content>
            </View>
          </View>
          </Animated.View>
        </Animated.View>
      </Pressable>
      <ServiceDetailModal visible={modalVisible} onDismiss={() => setModalVisible(false)} service={service} />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 18,
    borderRadius: 24,
    shadowColor: '#1A244099',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.17,
    shadowRadius: 24,
    elevation: 7,
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  accentBorder: {
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(44, 62, 80, 0.08)', // subtle premium accent
    overflow: 'hidden',
  },
  gradientBg: {
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.97)',
  },
});
