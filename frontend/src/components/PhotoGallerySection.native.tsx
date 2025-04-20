import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface PhotoGallerySectionProps {
  photos: string[];
  onUpload: (file: any) => void;
  uploadProgress: number;
  onChange: (photos: string[]) => void;
}

const PhotoGallerySection: React.FC<PhotoGallerySectionProps> = ({ photos, onUpload, uploadProgress, onChange }) => {
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      // In Expo, asset.uri is a local file URI
      // We'll pass the URI to the upload handler
      onUpload({ uri: asset.uri, name: asset.fileName || 'photo.jpg', type: asset.type || 'image/jpeg' });
    }
  };

  const handleRemovePhoto = (idx: number) => {
    const newPhotos = photos.filter((_, i) => i !== idx);
    onChange(newPhotos);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Photo Gallery</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>
        {photos.map((photo, idx) => (
          <View key={idx} style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photo} />
            <TouchableOpacity style={styles.remove} onPress={() => handleRemovePhoto(idx)}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={handlePickImage}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </ScrollView>
      {uploadProgress > 0 && uploadProgress < 100 && (
        <View style={styles.progressRow}>
          <ActivityIndicator size="small" color="#1976d2" />
          <Text style={styles.progressText}>Uploading... {uploadProgress}%</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  gallery: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  photoContainer: {
    position: 'relative',
    marginRight: 12,
  },
  photo: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  remove: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#d32f2f',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#1976d2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: -4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  progressText: {
    marginLeft: 8,
    color: '#1976d2',
  },
});

export default PhotoGallerySection;
