import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';
import * as ImagePicker from 'expo-image-picker';

interface ServicePhotoGalleryProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  mainPhotoIndex: number;
  onMainPhotoChange: (index: number) => void;
  maxPhotos?: number;
  error?: string;
  disabled?: boolean;
}

/**
 * A component for managing service photos with the ability to:
 * - Add photos from camera or gallery
 * - Remove photos
 * - Set a main photo for the service listing
 */
export default function ServicePhotoGallery({
  photos,
  onPhotosChange,
  mainPhotoIndex,
  onMainPhotoChange,
  maxPhotos = 5,
  error,
  disabled = false
}: ServicePhotoGalleryProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Handle adding a photo from gallery
  const handleAddPhoto = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert(
        'Maximum Photos Reached',
        `You can only upload up to ${maxPhotos} photos for your service.`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (disabled) return;
    
    setIsLoading(true);
    
    try {
      // Request permissions
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (galleryStatus.status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need permission to access your photo library to add photos.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets) {
        const newPhotos = [...photos, result.assets[0].uri];
        onPhotosChange(newPhotos);
        
        // If this is the first photo, set it as main photo
        if (photos.length === 0) {
          onMainPhotoChange(0);
        }
      }
    } catch (error) {
      console.error('Error adding photo:', error);
      Alert.alert(
        'Error',
        'Failed to add photo. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a photo from camera
  const handleTakePhoto = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert(
        'Maximum Photos Reached',
        `You can only upload up to ${maxPhotos} photos for your service.`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (disabled) return;
    
    setIsLoading(true);
    
    try {
      // Request permissions
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      
      if (cameraStatus.status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need permission to access your camera to take photos.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets) {
        const newPhotos = [...photos, result.assets[0].uri];
        onPhotosChange(newPhotos);
        
        // If this is the first photo, set it as main photo
        if (photos.length === 0) {
          onMainPhotoChange(0);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert(
        'Error',
        'Failed to take photo. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle removing a photo
  const handleRemovePhoto = (index: number) => {
    if (disabled) return;
    
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            const newPhotos = photos.filter((_, i) => i !== index);
            onPhotosChange(newPhotos);
            
            // If we're removing the main photo, update the main photo index
            if (index === mainPhotoIndex) {
              onMainPhotoChange(newPhotos.length > 0 ? 0 : -1);
            } else if (index < mainPhotoIndex) {
              // If we're removing a photo before the main photo, 
              // decrement the main photo index
              onMainPhotoChange(mainPhotoIndex - 1);
            }
          }
        }
      ]
    );
  };

  // Handle setting a photo as the main photo
  const handleSetMainPhoto = (index: number) => {
    if (disabled) return;
    onMainPhotoChange(index);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Service Photos</Text>
      <Text style={styles.description}>
        Add photos that showcase your service. The first photo will be used as the main image.
      </Text>
      
      {/* Photos Gallery */}
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.photoScrollView}
        contentContainerStyle={styles.photoScrollContent}
      >
        {/* Existing Photos */}
        {photos.map((photo, index) => (
          <View key={index} style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photo} />
            
            {/* Main Photo Badge */}
            {index === mainPhotoIndex && (
              <View style={styles.mainPhotoBadge}>
                <Text style={styles.mainPhotoText}>Main</Text>
              </View>
            )}
            
            {/* Photo Actions */}
            {!disabled && (
              <View style={styles.photoActions}>
                {/* Set as Main Button - Only show if not already main */}
                {index !== mainPhotoIndex && (
                  <TouchableOpacity
                    style={styles.photoAction}
                    onPress={() => handleSetMainPhoto(index)}
                  >
                    <MaterialCommunityIcons name="star" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
                
                {/* Remove Button */}
                <TouchableOpacity
                  style={[styles.photoAction, styles.removeAction]}
                  onPress={() => handleRemovePhoto(index)}
                >
                  <MaterialCommunityIcons name="trash-can" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
        
        {/* Add Photo Button - Only show if under max photos */}
        {photos.length < maxPhotos && !disabled && (
          <View style={styles.addPhotoContainer}>
            {/* Add from Gallery */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddPhoto}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['rgba(108, 99, 255, 0.1)', 'rgba(108, 99, 255, 0.05)']}
                style={styles.addButtonGradient}
              >
                <MaterialCommunityIcons name="image-plus" size={28} color={theme.colors.primary} />
                <Text style={styles.addButtonText}>Gallery</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            {/* Take Photo */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleTakePhoto}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['rgba(108, 99, 255, 0.1)', 'rgba(108, 99, 255, 0.05)']}
                style={styles.addButtonGradient}
              >
                <MaterialCommunityIcons name="camera" size={28} color={theme.colors.primary} />
                <Text style={styles.addButtonText}>Camera</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      
      {/* Photo Count */}
      <Text style={styles.photoCount}>
        {photos.length} of {maxPhotos} photos
      </Text>
      
      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={16} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  photoScrollView: {
    marginVertical: 8,
  },
  photoScrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  photoContainer: {
    width: 140,
    height: 140,
    borderRadius: 12,
    marginHorizontal: 8,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mainPhotoBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  mainPhotoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  photoActions: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
  },
  photoAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(108, 99, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeAction: {
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
  },
  addPhotoContainer: {
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 140,
    height: 64,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  addButtonText: {
    marginTop: 4,
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  photoCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
    alignSelf: 'flex-end',
    marginRight: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.08)',
    borderRadius: 5,
    padding: 10,
    marginTop: 4,
  },
  errorText: {
    color: theme.colors.error,
    marginLeft: 8,
    fontSize: 14,
  },
});