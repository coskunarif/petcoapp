import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback
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
  const scrollViewRef = useRef<ScrollView>(null);
  
  const profileSchema = Yup.object().shape({
    full_name: Yup.string().required('Full name is required'),
    email: Yup.string().email('Invalid email format'),
    phone: Yup.string()
      .matches(/^[0-9+\-\s()]*$/, 'Invalid phone number format')
      .min(7, 'Phone number is too short')
      .max(20, 'Phone number is too long'),
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
    console.log('Starting profile update with values:', values);

    try {
      if (!user?.id) {
        throw new Error('User ID not found');
      }

      console.log('Updating profile for user ID:', user.id);
      const updates = {
        full_name: values.full_name,
        phone: values.phone,
        bio: values.bio
      };

      console.log('Profile updates to be sent:', updates);

      const result = await dispatch(updateUserProfile({
        userId: user.id,
        updates
      })).unwrap();

      console.log('Profile update successful, result:', result);

      // Show success and navigate back
      Alert.alert('Success', 'Your profile has been updated successfully');
      navigation.goBack();
    } catch (error: any) {
      console.error('Profile update failed:', error);
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
      // Convert URI to file for mobile environment
      const filename = uri.split('/').pop() || 'profile-image';
      const fileExtension = filename.split('.').pop() || 'jpg';
      const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';

      // Create a file blob from URI
      const response = await fetch(uri);
      const blob = await response.blob();

      // Create a file object compatible with Supabase Storage
      const file = new File([blob], filename, { type: mimeType });

      // Upload directly to Supabase Storage
      console.log(`[EditProfileScreen] Uploading profile image for user ${user.id}`);
      const imageUrl = await uploadProfileImage(user.id, file);
      console.log(`[EditProfileScreen] Upload successful, URL: ${imageUrl}`);

      // Update user profile with new image URL
      await dispatch(updateUserProfile({
        userId: user.id,
        updates: { profile_image_url: imageUrl }
      })).unwrap();

      Alert.alert('Success', 'Profile picture updated successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setFormError(error.message || 'Failed to upload image. Please try again.');
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >

          <ScrollView
            ref={scrollViewRef}
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            scrollEventThrottle={16}
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
            email: user?.email || '',
            phone: user?.phone || '',
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
                Email Address
              </Text>
              <TextInput
                mode="outlined"
                value={values.email}
                style={styles.input}
                outlineColor="rgba(230, 230, 230, 0.9)"
                activeOutlineColor={theme.colors.primary}
                disabled={true}
                theme={{
                  colors: {
                    text: theme.colors.textSecondary,
                    placeholder: theme.colors.textSecondary,
                    background: 'rgba(0, 0, 0, 0.03)',
                    primary: theme.colors.primary
                  }
                }}
                left={<TextInput.Icon icon="email-outline" color={theme.colors.textSecondary} />}
              />
              <Text variant="caption" color="textSecondary" style={styles.helperText}>
                Email address cannot be changed as it is used for account verification
              </Text>

              <Text variant="label" color="textSecondary" style={styles.inputLabel}>
                Phone Number
              </Text>
              <TextInput
                mode="outlined"
                value={values.phone}
                onChangeText={handleChange('phone')}
                onBlur={handleBlur('phone')}
                error={touched.phone && !!errors.phone}
                style={styles.input}
                keyboardType="phone-pad"
                outlineColor="rgba(230, 230, 230, 0.9)"
                activeOutlineColor={theme.colors.primary}
                placeholder="Enter your phone number"
                theme={{
                  colors: {
                    text: theme.colors.text,
                    placeholder: theme.colors.textSecondary,
                    background: theme.colors.surfaceHighlight,
                    primary: theme.colors.primary
                  }
                }}
                left={<TextInput.Icon icon="phone-outline" color={theme.colors.primary} />}
              />
              {touched.phone && errors.phone && (
                <Text variant="caption" color="error" style={styles.errorText}>
                  {errors.phone}
                </Text>
              )}
              <Text variant="caption" color="textSecondary" style={styles.helperText}>
                Phone number for emergency contact
              </Text>

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
                textAlignVertical="top"
                placeholder="Tell us about yourself"
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
                onFocus={() => {
                  // Auto-scroll to show this field when focused
                  setTimeout(() => {
                    // Use fixed scroll position based on testing
                    const scrollPosition = Platform.OS === 'ios' ? 450 : 600;

                    // Scroll to fixed position to ensure Bio field is visible with keyboard
                    scrollViewRef.current?.scrollTo({
                      y: scrollPosition,
                      animated: true
                    });
                  }, Platform.OS === 'ios' ? 300 : 600);
                }}
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
              
              <View style={{ paddingBottom: 80 }}>
                <AppButton
                  title="Save Changes"
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  disabled={isSubmitting || uploading}
                  fullWidth
                  style={styles.saveButton}
                />
              </View>
            </View>
          )}
        </Formik>
      </ScrollView>
      </KeyboardAvoidingView>
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
    paddingBottom: 200, // Add significant padding at the bottom for keyboard
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
    marginBottom: 24, // Increased bottom margin
    minHeight: 150, // Increased height for better visibility
    textAlignVertical: 'top',
    paddingTop: 12, // Add some padding for better text display
    paddingBottom: 8, // Add bottom padding for text
  },
  errorText: {
    marginLeft: 12,
    marginBottom: 16,
    marginTop: -12,
  },
  helperText: {
    marginLeft: 12,
    marginBottom: 16,
    marginTop: -12,
    fontSize: 12,
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