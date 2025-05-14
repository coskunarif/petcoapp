import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import AddPetForm from './forms/AddPetForm';

const { height } = Dimensions.get('window');

interface AddPetModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (petData: any) => void;
}

const AddPetModal: React.FC<AddPetModalProps> = ({ visible, onClose, onSubmit }) => {
  // Animation value for modal slide up
  const [slideAnim] = React.useState(new Animated.Value(height));
  
  // Handle animation when visibility changes
  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 9,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  // Calculate modal content height (80% of screen height)
  const modalHeight = height * 0.9;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <BlurView intensity={Platform.OS === 'ios' ? 40 : 60} style={StyleSheet.absoluteFill} tint="dark" />
          
          {/* Content container with animation */}
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.contentContainer,
                { 
                  height: modalHeight,
                  transform: [{ translateY: slideAnim }],
                }
              ]}
            >
              {/* Close button */}
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <MaterialCommunityIcons name="close" size={24} color="gray" />
              </TouchableOpacity>
              
              {/* Form content */}
              <AddPetForm 
                onSubmit={(petData) => {
                  onSubmit(petData);
                  onClose();
                }}
                onCancel={onClose}
              />
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  contentContainer: {
    backgroundColor: '#f9f9f9',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AddPetModal;