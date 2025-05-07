import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { TextInput, IconButton } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile } from '../../redux/slices/authSlice';
import { uploadProfileImage } from '../../services/authService';
import { theme, globalStyles } from '../../theme';
import { AppButton, Text } from '../../components/ui';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export default function EditProfileScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');
  const user = useSelector((state: any) => state.auth.user);
  
  const profileSchema = Yup.object().shape({
    full_name: Yup.string().required('Full name is required'),
    bio: Yup.string().max(200, 'Bio must be less than 200 characters'),
  });
  
  useEffect(() => {
    // Request media library permissions
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Sorry, we need camera roll permissions to change your profile photo!');
        }
      }
    })();
  }, []);
  
  const handleUpdateProfile = async (values: any, { setSubmitting }: any) => {
    setFormError('');
    
    try {
      if (!user?.id) {
        throw new Error('User ID not found');
      }
      
      await dispatch(updateUserProfile({ 
        userId: user.id,
        updates: {
          full_name: values.full_name,
          bio: values.bio
        }
      })).unwrap();
      
      // Show success and navigate back
      Alert.alert('Success', 'Your profile has been updated successfully');
      navigation.goBack();
    } catch (error: any) {
      setFormError(error.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };
  
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets[0].uri) {
        uploadUserImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Unable to choose image. Please try again.');
    }
  };
  
  const uploadUserImage = async (uri: string) => {
    if (!user?.id) {
      Alert.alert('Error', 'User ID not found');
      return;
    }
    
    setUploading(true);
    setFormError('');
    
    try {
      // Convert URI to file
      const filename = uri.split('/').pop() || 'profile-image';
      const match = /\\.([\\w\\d]+)$/i.exec(filename);
      const type = match ? `image/${match[1]}` : 'image';
      
      // Create file object from URI
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: filename,
        type,
      } as any);
      
      // Upload to Supabase Storage
      // Note: This is a simplification - you'll need to handle the actual upload logic
      // based on your implementation in the authService
      const imageUrl = await uploadProfileImage(user.id, formData as any);
      
      // Update user profile with new image URL
      await dispatch(updateUserProfile({
        userId: user.id,
        updates: { profile_image_url: imageUrl }
      })).unwrap();
      
      Alert.alert('Success', 'Profile picture updated successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setFormError(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text variant="h2">Edit Profile</Text>
        <View style={{width: 40}} /> {/* Empty space for balance */}
      </View>
      
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <BlurView intensity={60} tint="light" style={styles.profileImageContainer}>
          <LinearGradient
            colors={[theme.colors.primaryLight, 'rgba(255, 255, 255, 0.8)']}
            style={styles.imageGradient}
          >
            {user?.profile_image_url ? (
              <Image 
                source={{ uri: user.profile_image_url }} 
                style={styles.profileImage} 
              />
            ) : (
              <MaterialCommunityIcons 
                name="account" 
                size={80} 
                color={theme.colors.primary} 
              />
            )}
            
            {uploading ? (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.editImageButton}
                onPress={pickImage}
                disabled={uploading}
              >
                <BlurView intensity={80} tint="light" style={styles.editImageBlur}>
                  <MaterialCommunityIcons name="camera" size={22} color={theme.colors.primary} />
                </BlurView>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </BlurView>
        
        <Formik
          initialValues={{
            full_name: user?.full_name || '',
            bio: user?.bio || '',
          }}
          validationSchema={profileSchema}
          onSubmit={handleUpdateProfile}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
            <View style={styles.formContainer}>
              <Text variant="label" color="textSecondary" style={styles.inputLabel}>
                Full Name
              </Text>
              <TextInput
                mode="outlined"
                value={values.full_name}
                onChangeText={handleChange('full_name')}
                onBlur={handleBlur('full_name')}
                error={touched.full_name && !!errors.full_name}
                style={styles.input}
                outlineColor="rgba(230, 230, 230, 0.9)"
                activeOutlineColor={theme.colors.primary}
                theme={{ 
                  colors: { 
                    text: theme.colors.text,
                    placeholder: theme.colors.textSecondary,
                    background: theme.colors.surfaceHighlight,
                    primary: theme.colors.primary
                  } 
                }}
                left={<TextInput.Icon icon="account-outline" color={theme.colors.primary} />}
              />
              {touched.full_name && errors.full_name && (
                <Text variant="caption" color="error" style={styles.errorText}>
                  {errors.full_name}
                </Text>
              )}
              
              <Text variant="label" color="textSecondary" style={styles.inputLabel}>
                Bio
              </Text>
              <TextInput
                mode="outlined"
                value={values.bio}
                onChangeText={handleChange('bio')}
                onBlur={handleBlur('bio')}
                error={touched.bio && !!errors.bio}
                style={styles.bioInput}
                multiline
                numberOfLines={4}
                outlineColor="rgba(230, 230, 230, 0.9)"
                activeOutlineColor={theme.colors.primary}
                theme={{ 
                  colors: { 
                    text: theme.colors.text,
                    placeholder: theme.colors.textSecondary,
                    background: theme.colors.surfaceHighlight,
                    primary: theme.colors.primary
                  } 
                }}
                left={<TextInput.Icon icon="text-box-outline" color={theme.colors.primary} />}
              />
              {touched.bio && errors.bio && (
                <Text variant="caption" color="error" style={styles.errorText}>
                  {errors.bio}
                </Text>
              )}
              
              {formError ? (
                <View style={styles.errorContainer}>
                  <IconButton icon="alert-circle" size={18} iconColor={theme.colors.error} style={{ margin: 0 }} />
                  <Text variant="body" color="error" style={styles.errorMessage}>
                    {formError}
                  </Text>
                </View>
              ) : null}
              
              <AppButton
                title="Save Changes"
                onPress={handleSubmit}
                loading={isSubmitting}
                disabled={isSubmitting || uploading}
                fullWidth
                style={styles.saveButton}
              />
            </View>
          )}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#fff',
    ...theme.elevation.small,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  profileImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 32,
    borderRadius: 100,
    overflow: 'hidden',
    width: 180,
    height: 180,
    alignSelf: 'center',
    ...theme.elevation.medium,
  },
  imageGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    borderRadius: 20,
    overflow: 'hidden',
    ...theme.elevation.small,
  },
  editImageBlur: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputLabel: {
    marginBottom: 8,
    marginLeft: 12,
  },
  input: {
    marginBottom: 16,
  },
  bioInput: {
    marginBottom: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  errorText: {
    marginLeft: 12,
    marginBottom: 16,
    marginTop: -12,
  },
  errorContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 235, 238, 0.8)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  errorMessage: {
    marginLeft: 8,
    flex: 1,
  },
  saveButton: {
    marginTop: 16,
  },
});