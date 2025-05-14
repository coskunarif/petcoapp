import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface PetPhotoGalleryProps {
  photos: string[];
  onPhotoAdded: (uri: string) => void;
  onPhotoRemoved: (index: number) => void;
  mainPhotoIndex?: number;
  onSetMainPhoto?: (index: number) => void;
  maxPhotos?: number;
}

const PetPhotoGallery: React.FC<PetPhotoGalleryProps> = ({
  photos,
  onPhotoAdded,
  onPhotoRemoved,
  mainPhotoIndex = 0,
  onSetMainPhoto,
  maxPhotos = 5,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  // Request permissions and pick an image
  const handleAddPhoto = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert(
        'Maximum Photos Reached',
        `You can only upload up to ${maxPhotos} photos for your pet.`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Request permission to access the media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'You need to grant access to your photo library to add pet photos.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Set uploading state before picking image
      setIsUploading(true);
      
      // Open image picker
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      // Handle canceled picker
      if (pickerResult.canceled) {
        setIsUploading(false);
        return;
      }
      
      // Get selected image URI and add it
      const selectedUri = pickerResult.assets[0].uri;
      onPhotoAdded(selectedUri);
      
      // In a real app, you'd upload to a server here
      // Simulate upload delay
      setTimeout(() => {
        setIsUploading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error choosing photo:', error);
      Alert.alert('Error', 'There was an error selecting the photo.');
      setIsUploading(false);
    }
  };

  // Remove a photo
  const handleRemovePhoto = (index: number) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onPhotoRemoved(index) }
      ]
    );
  };

  // Set a photo as the main profile photo
  const handleSetMainPhoto = (index: number) => {
    if (onSetMainPhoto && index !== mainPhotoIndex) {
      onSetMainPhoto(index);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Pet Photos</Text>
        <Text style={styles.subtitle}>
          {photos.length}/{maxPhotos} photos
        </Text>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {photos.map((photo, index) => (
          <View key={index} style={styles.photoWrapper}>
            <TouchableOpacity
              style={[
                styles.photoContainer,
                index === mainPhotoIndex && styles.mainPhotoContainer
              ]}
              onPress={() => handleSetMainPhoto(index)}
              disabled={!onSetMainPhoto}
            >
              <Image source={{ uri: photo }} style={styles.photo} />
              {index === mainPhotoIndex && (
                <View style={styles.mainBadge}>
                  <MaterialCommunityIcons name="star" size={12} color="white" />
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemovePhoto(index)}
            >
              <MaterialCommunityIcons name="close" size={12} color="white" />
            </TouchableOpacity>
          </View>
        ))}
        
        {photos.length < maxPhotos && (
          <TouchableOpacity
            style={styles.addPhotoButton}
            onPress={handleAddPhoto}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <MaterialCommunityIcons
                name="plus"
                size={30}
                color={theme.colors.primary}
              />
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
      
      {photos.length === 0 && !isUploading && (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="image-outline"
            size={40}
            color={theme.colors.textTertiary}
          />
          <Text style={styles.emptyText}>
            Add photos of your pet
          </Text>
          <TouchableOpacity
            style={styles.addFirstPhotoButton}
            onPress={handleAddPhoto}
          >
            <Text style={styles.addFirstPhotoText}>
              Add Photo
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {onSetMainPhoto && photos.length > 1 && (
        <Text style={styles.helpText}>
          Tap a photo to set it as the profile picture
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    ...theme.typography.h3,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  scrollContent: {
    paddingVertical: theme.spacing.sm,
    paddingRight: theme.spacing.lg,
  },
  photoWrapper: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  photoContainer: {
    width: 90,
    height: 90,
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    backgroundColor: theme.colors.background,
    ...theme.elevation.small,
  },
  mainPhotoContainer: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  mainBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    paddingVertical: 2,
    alignItems: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.elevation.small,
  },
  addPhotoButton: {
    width: 90,
    height: 90,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${theme.colors.primary}10`,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.xl,
    marginTop: theme.spacing.md,
    ...theme.elevation.small,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  addFirstPhotoButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: `${theme.colors.primary}15`,
  },
  addFirstPhotoText: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
  helpText: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});

export default PetPhotoGallery;