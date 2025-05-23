import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Pressable } from 'react-native';
import { ButtonStyles2025 } from './ButtonStyles2025.native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ConfirmationModalProps {
  visible: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  iconName?: string;
  iconColor?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Yes',
  cancelText = 'Cancel',
  iconName = 'help-circle-outline',
  iconColor = '#1976d2',
}) => {
  // Animation for scale in
  const scaleAnim = React.useRef(new Animated.Value(0.92)).current;
  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 24,
        bounciness: 6,
      }).start();
    } else {
      scaleAnim.setValue(0.92);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.animatedModal, { opacity: scaleAnim, transform: [{ translateY: scaleAnim.interpolate({ inputRange: [0.92, 1], outputRange: [40, 0] }) }] }]}>  
          <MaterialCommunityIcons name={iconName as any} size={48} color={iconColor} style={styles.icon} />
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonRow}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                ButtonStyles2025.secondary,
                pressed && { opacity: 0.75, transform: [{ scale: 0.97 }] },
              ]}
              accessibilityLabel="Cancel"
            >
              <Text style={ButtonStyles2025.secondaryText}>{cancelText}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                ButtonStyles2025.primary,
                pressed && { opacity: 0.82, transform: [{ scale: 0.97 }] },
              ]}
              accessibilityLabel="Confirm"
            >
              <Text style={ButtonStyles2025.primaryText}>{confirmText}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(24,38,63,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animatedModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
    minWidth: 280,
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    borderWidth: 0,
  },
  modal: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 28,
    padding: 32,
    minWidth: 280,
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#4a90e2',
    shadowOpacity: 0.14,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 8 },
    elevation: 18,
    borderWidth: 1.1,
    borderColor: 'rgba(173, 216, 255, 0.12)',
  },
  icon: {
    marginBottom: 8,
    opacity: 0.85,
  },
  message: {
    fontSize: 18,
    color: '#223a5f',
    textAlign: 'center',
    marginBottom: 22,
    fontWeight: '600',
    letterSpacing: 0.08,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1.1,
    borderColor: '#b4c7e7',
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#b4c7e7',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  cancelText: {
    color: '#5774a6',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.07,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: '#1976d2',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#1976d2',
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 2,
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.07,
  },
});

export default ConfirmationModal;
