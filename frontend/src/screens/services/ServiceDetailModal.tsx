import React, { useRef, useEffect } from 'react';
import { Modal, Portal, Card, Title, Paragraph, Button } from 'react-native-paper';
import { Animated } from 'react-native';
import { View, StyleSheet } from 'react-native';

export default function ServiceDetailModal({ visible, onDismiss, service }: { visible: boolean; onDismiss: () => void; service: any }) {
  const animated = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) {
      Animated.timing(animated, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animated, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);
  const animatedStyle = {
    opacity: animated,
    transform: [{ translateY: animated.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
  };
  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Animated.View style={[styles.animatedCard, animatedStyle]}>
          <Card.Content>
            <Title>{service?.type} by {service?.provider}</Title>
            <Paragraph>{service?.description}</Paragraph>
            <Paragraph>Cost: {service?.cost} credits</Paragraph>
          </Card.Content>
          <Card.Actions>
            <Button onPress={onDismiss}>Close</Button>
            <Button mode="contained">Request Service</Button>
          </Card.Actions>
        </Animated.View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'rgba(24,38,63,0.22)',
  },
  animatedCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
    maxWidth: 420,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    borderWidth: 0,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 28,
    padding: 28,
    marginHorizontal: 24,
    maxWidth: 420,
    alignSelf: 'center',
    shadowColor: '#4a90e2',
    shadowOpacity: 0.18,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 8 },
    elevation: 24,
    borderWidth: 1.2,
    borderColor: 'rgba(173, 216, 255, 0.14)',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 14,
    textAlign: 'center',
    color: '#223a5f',
    letterSpacing: 0.2,
    fontFamily: 'System',
    textShadowColor: 'rgba(74,144,226,0.08)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  paragraph: {
    fontSize: 17,
    color: '#3a4664',
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    marginTop: 24,
  },
  closeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.68)',
    borderWidth: 1.2,
    borderColor: '#b4c7e7',
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#b4c7e7',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  closeText: {
    color: '#5774a6',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.1,
  },
  requestButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#1976d2',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#1976d2',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  requestText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.1,
  },
});
