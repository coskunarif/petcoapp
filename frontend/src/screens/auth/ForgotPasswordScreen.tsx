import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Keyboard, 
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { TextInput, IconButton } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { resetPasswordRequest } from '../../redux/slices/authSlice';
import { theme, globalStyles } from '../../theme';
import { AppButton, AppCard, Text } from '../../components/ui';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { height, width } = Dimensions.get('window');
const isSmallDevice = height < 700;

export default function ForgotPasswordScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);

  const resetSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Required'),
  });

  const handleResetPassword = async (values: { email: string }, { setSubmitting }: any) => {
    setFormError('');
    setSuccessMessage('');
    
    try {
      await dispatch(resetPasswordRequest(values.email)).unwrap();
      setSuccessMessage(`Password reset instructions sent to ${values.email}. Please check your inbox.`);
    } catch (error: any) {
      setFormError(error || 'Failed to send reset instructions. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[globalStyles.safeArea, styles.safeArea]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={styles.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.container}>
            {/* Glassmorphism Background */}
            <View style={styles.backgroundGradient} />
            <View style={styles.backgroundBlur} />
            
            <View style={styles.contentContainer}>
              {/* Logo and app name */}
              <View style={styles.logoContainer}>
                <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
                <Text variant="h1" color="white" style={styles.appName}>PetConnect</Text>
                <Text variant="body" color="rgba(255,255,255,0.9)" style={styles.tagline}>Your community of pet lovers</Text>
              </View>
              
              {/* Reset Password form card */}
              <View style={styles.cardWrapper}>
                <AppCard style={styles.card} elevation="large">
                  <View style={styles.cardContent}>
                    <Text variant="h2" align="center" style={[styles.title, { marginBottom: isSmallDevice ? 24 : 32 }]}>
                      Reset Password
                    </Text>
                    
                    <Formik
                      initialValues={{ email: '' }}
                      validationSchema={resetSchema}
                      onSubmit={handleResetPassword}
                    >
                      {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
                        <>
                          <TextInput
                            label="Email"
                            mode="outlined"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={values.email}
                            onChangeText={handleChange('email')}
                            onFocus={() => setEmailFocused(true)}
                            onBlur={(e) => {
                              handleBlur('email')(e);
                              setEmailFocused(false);
                            }}
                            error={touched.email && !!errors.email}
                            style={styles.textInput}
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
                            left={<TextInput.Icon icon="email-outline" color={emailFocused ? theme.colors.primary : theme.colors.textTertiary} />}
                            autoComplete="email"
                          />
                          {touched.email && errors.email && (
                            <Text variant="caption" color="error" style={styles.error}>{errors.email}</Text>
                          )}
                          
                          {formError ? (
                            <View style={styles.errorContainer}>
                              <IconButton icon="alert-circle" size={18} iconColor={theme.colors.error} style={{ margin: 0 }} />
                              <Text variant="body" color="error" style={styles.errorText}>{formError}</Text>
                            </View>
                          ) : null}
                          
                          {successMessage ? (
                            <View style={styles.successContainer}>
                              <IconButton icon="check-circle" size={18} iconColor={theme.colors.success} style={{ margin: 0 }} />
                              <Text variant="body" color="success" style={styles.successText}>{successMessage}</Text>
                            </View>
                          ) : null}
                          
                          <AppButton
                            title="Send Reset Instructions"
                            onPress={handleSubmit}
                            loading={isSubmitting}
                            disabled={isSubmitting}
                            fullWidth
                            style={styles.resetButton}
                          />
                        </>
                      )}
                    </Formik>
                  </View>
                </AppCard>
              </View>
              
              {/* Bottom padding above back to login link */}
              <View style={{height: 10}} />
              
              {/* Back to login link */}
              <TouchableOpacity 
                onPress={() => navigation.navigate('Login')} 
                style={styles.loginLinkContainer}
              >
                <Text variant="body" color="white">
                  Back to <Text variant="body" weight="bold" color="white" style={styles.loginLinkHighlight}>Login</Text>
                </Text>
              </TouchableOpacity>
              
              {/* Bottom padding to ensure content doesn't get cut off */}
              <View style={styles.bottomSpacer} />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingTop: Platform.OS === 'android' ? 0 : undefined,
    paddingBottom: Platform.OS === 'android' ? 68 : 54,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
    opacity: 0.92,
  },
  backgroundBlur: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(12px)',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: isSmallDevice ? 0 : 4,
    paddingBottom: Platform.OS === 'android' ? 120 : 90,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: isSmallDevice ? 4 : 8,
    // Add subtle scale animation
    transform: [{ scale: 1.0 }],
  },
  logo: {
    width: isSmallDevice ? 70 : 90,
    height: isSmallDevice ? 70 : 90,
    opacity: 0.95,
    // Add subtle shadow
    ...theme.elevation.small,
  },
  appName: {
    marginTop: 16,
    letterSpacing: 1,
    // Typography is handled by Text component
  },
  tagline: {
    marginTop: 6,
    // Typography is handled by Text component  
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 320,
    borderRadius: theme.borderRadius.small,
    overflow: 'hidden',
    marginHorizontal: 4,
    marginBottom: 32,
  },
  card: {
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.surfaceHighlight,
    elevation: 2,
    // Add frosted glass effect
    shadowColor: 'rgba(0,0,0,0.03)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardContent: {
    padding: isSmallDevice ? 8 : 12,
  },
  title: {
    marginBottom: isSmallDevice ? 24 : 32,
    // Typography is handled by Text component
  },
  textInput: {
    backgroundColor: theme.colors.surfaceHighlight,
    marginBottom: 12,
    height: isSmallDevice ? 48 : 54,
    fontSize: isSmallDevice ? 14 : 16,
    // Override autofill background color
    WebkitBoxShadow: '0 0 0 30px #FFFFFF inset',
    WebkitTextFillColor: theme.colors.text,
    borderRadius: theme.borderRadius.medium,
  },
  error: {
    marginLeft: 12,
    marginBottom: 12,
    marginTop: -8,
    // Color handled by Text component
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 235, 238, 0.8)',
    padding: 14,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: 'rgba(211, 47, 47, 0.3)',
  },
  errorText: {
    marginLeft: 8,
    flex: 1,
    // Color handled by Text component
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(232, 245, 233, 0.8)',
    padding: 14,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  successText: {
    marginLeft: 8,
    flex: 1,
    // Color handled by Text component
  },
  resetButton: {
    marginVertical: 12,
    marginTop: 16,
    // Other styles are handled by AppButton component
  },
  loginLinkContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'android' ? 16 : 12,
    marginBottom: 0,
    // Add touch target
    paddingHorizontal: 20,
  },
  loginLinkHighlight: {
    textDecorationLine: 'underline',
    // Color is handled by Text component
  },
  bottomSpacer: {
    height: Platform.OS === 'android' ? 220 : 150,
  },
});