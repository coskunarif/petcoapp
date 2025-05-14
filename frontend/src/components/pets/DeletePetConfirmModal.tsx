import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

const { height } = Dimensions.get('window');

interface DeletePetConfirmModalProps {
  visible: boolean;
  petName: string;
  petPhotoUri?: string;
  petIcon?: string;
  petColor?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeletePetConfirmModal: React.FC<DeletePetConfirmModalProps> = ({
  visible,
  petName,
  petPhotoUri,
  petIcon = 'paw',
  petColor = theme.colors.primary,
  onCancel,
  onConfirm,
}) => {
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

  // Calculate modal content height
  const modalHeight = height * 0.5;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <BlurView intensity={Platform.OS === 'ios' ? 40 : 60} style={StyleSheet.absoluteFill} tint="dark" />
        
        {/* Modal content with animation */}
        <Animated.View 
          style={[
            styles.contentContainer,
            { 
              height: modalHeight,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.warningHeader}>
            <MaterialCommunityIcons name="alert-circle" size={32} color="white" />
            <Text style={styles.warningText}>Delete Pet</Text>
          </View>
          
          <View style={styles.contentBody}>
            <View style={styles.petInfoContainer}>
              <View style={[styles.petPhotoContainer, { backgroundColor: `${petColor}20` }]}>
                {petPhotoUri ? (
                  <Image source={{ uri: petPhotoUri }} style={styles.petPhoto} />
                ) : (
                  <MaterialCommunityIcons
                    name={petIcon as any}
                    size={40}
                    color={petColor}
                  />
                )}
              </View>
              
              <Text style={styles.message}>
                Are you sure you want to delete{' '}
                <Text style={styles.petName}>{petName}</Text>?
                This action cannot be undone.
              </Text>
            </View>
            
            <Text style={styles.warningNote}>
              All of {petName}'s information, photos, and service history will be permanently deleted.
            </Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={onConfirm}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
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
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
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
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.error,
    padding: theme.spacing.md,
  },
  warningText: {
    ...theme.typography.h3,
    color: 'white',
    marginLeft: theme.spacing.sm,
  },
  contentBody: {
    padding: theme.spacing.lg,
    flex: 1,
  },
  petInfoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  petPhotoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    ...theme.elevation.small,
  },
  petPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  message: {
    ...theme.typography.body,
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.text,
    lineHeight: 24,
  },
  petName: {
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  warningNote: {
    ...theme.typography.body,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  cancelButtonText: {
    ...theme.typography.button,
    color: theme.colors.textSecondary,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    ...theme.typography.button,
    color: 'white',
  },
});

export default DeletePetConfirmModal;