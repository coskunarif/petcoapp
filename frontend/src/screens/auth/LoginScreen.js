import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Keyboard, 
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { 
  TextInput, 
  IconButton
} from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { supabase } from '../../supabaseClient';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../redux/slices/authSlice';
import { theme, globalStyles } from '../../theme';
import { AppButton, AppCard, Text } from '../../components/ui';

const { height, width } = Dimensions.get('window');
const isSmallDevice = height < 700;

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  // Add CSS to fix autofill background color on web
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Insert style to override autofill background
      const style = document.createElement('style');
      style.innerHTML = `
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px white inset !important;
          -webkit-text-fill-color: #333333 !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        // Clean up
        document.head.removeChild(style);
      };
    }
  }, []);
  
  const loginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().min(6, 'Too short').required('Required'),
  });

  const handleLogin = async (values, { setSubmitting }) => {
    setFormError('');
    dispatch(loginStart());
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      setFormError(error.message);
      dispatch(loginFailure(error.message));
    } else {
      dispatch(loginSuccess(data.user));
    }
    setSubmitting(false);
  };

  return (
    <SafeAreaView style={[globalStyles.safeArea, styles.safeArea]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.container}>
            {/* Glassmorphism Background */}
            <View style={styles.backgroundGradient} />
            <View style={styles.backgroundBlur} />
            
            <ScrollView 
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              bounces={false}
              keyboardShouldPersistTaps="handled"
              overScrollMode="never"
            >
              {/* Logo and app name */}
              <View style={styles.logoContainer}>
                <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
                <Text variant="h1" color="white" style={styles.appName}>PetConnect</Text>
                <Text variant="body" color="rgba(255,255,255,0.9)" style={styles.tagline}>Your community of pet lovers</Text>
              </View>
              
              {/* Login form card */}
              <View style={styles.cardWrapper}>
                <AppCard style={styles.card} elevation="medium">
                  <View style={styles.cardContent}>
                    <Text variant="h2" align="center" style={styles.title}>Welcome back</Text>
                    
                    <Formik
                      initialValues={{ email: '', password: '' }}
                      validationSchema={loginSchema}
                      onSubmit={handleLogin}
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
                          
                          <TextInput
                            label="Password"
                            mode="outlined"
                            secureTextEntry={!showPassword}
                            value={values.password}
                            onChangeText={handleChange('password')}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={(e) => {
                              handleBlur('password')(e);
                              setPasswordFocused(false);
                            }}
                            error={touched.password && !!errors.password}
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
                            left={<TextInput.Icon icon="lock-outline" color={passwordFocused ? theme.colors.primary : theme.colors.textTertiary} />}
                            right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} color={theme.colors.textTertiary} onPress={() => setShowPassword(!showPassword)} />}
                            autoComplete="password"
                          />
                          {touched.password && errors.password && (
                            <Text variant="caption" color="error" style={styles.error}>{errors.password}</Text>
                          )}
                          
                          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotPasswordLink}>
                            <Text variant="body" color="primary" weight="medium">Forgot password?</Text>
                          </TouchableOpacity>
                          
                          {formError ? (
                            <View style={styles.errorContainer}>
                              <IconButton icon="alert-circle" size={18} iconColor={theme.colors.error} style={{ margin: 0 }} />
                              <Text variant="body" color="error" style={styles.errorText}>{formError}</Text>
                            </View>
                          ) : null}
                          
                          <AppButton
                            title="Sign In"
                            onPress={handleSubmit}
                            loading={isSubmitting}
                            disabled={isSubmitting}
                            fullWidth
                            style={styles.loginButton}
                          />
                          
                          <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Text variant="caption" color="textTertiary" style={styles.dividerText}>or</Text>
                            <View style={styles.divider} />
                          </View>
                          
                          <View style={styles.socialButtonsContainer}>
                            <TouchableOpacity style={styles.socialButton}>
                              <IconButton icon="google" size={24} iconColor="#DB4437" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialButton}>
                              <IconButton icon="apple" size={24} iconColor="#000000" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialButton}>
                              <IconButton icon="facebook" size={24} iconColor="#4267B2" />
                            </TouchableOpacity>
                          </View>
                        </>
                      )}
                    </Formik>
                  </View>
                </AppCard>
              </View>
              
              {/* Bottom padding above sign up link */}
              <View style={{height: 10}} />
              
              {/* Sign up link - moved outside of card for better spacing */}
              <TouchableOpacity 
                onPress={() => navigation.navigate('Signup')} 
                style={styles.signupLinkContainer}
              >
                <Text variant="body" color="white">
                  Don't have an account? <Text variant="body" weight="bold" color="white" style={styles.signupLinkHighlight}>Sign up</Text>
                </Text>
              </TouchableOpacity>
              
              {/* Bottom padding to ensure content doesn't get cut off */}
              <View style={styles.bottomSpacer} />
            </ScrollView>
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
  },
  backgroundBlur: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: isSmallDevice ? 20 : 40,
    paddingBottom: Platform.OS === 'android' ? 60 : 30,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: isSmallDevice ? 16 : 30,
    // Add subtle scale animation
    transform: [{ scale: 1.0 }],
  },
  logo: {
    width: isSmallDevice ? 85 : 110,
    height: isSmallDevice ? 85 : 110,
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
    maxWidth: 380,
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
  },
  card: {
    borderRadius: theme.borderRadius.large,
    backgroundColor: theme.colors.surfaceHighlight,
    elevation: 5,
    // Add frosted glass effect
    shadowColor: 'rgba(255,255,255,0.5)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
  },
  cardContent: {
    padding: isSmallDevice ? 20 : 28,
  },
  title: {
    marginBottom: isSmallDevice ? 24 : 32,
    // Typography is handled by Text component
  },
  textInput: {
    backgroundColor: theme.colors.surfaceHighlight,
    marginBottom: 16,
    height: isSmallDevice ? 52 : 58,
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
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginTop: 6,
    marginBottom: 20,
    paddingVertical: 6, // Larger touch target
    paddingHorizontal: 8,
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
  loginButton: {
    marginVertical: 16,
    marginTop: 20,
    // Other styles are handled by AppButton component
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: isSmallDevice ? 20 : 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  dividerText: {
    marginHorizontal: 16,
    // Color is handled by Text component
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: isSmallDevice ? 14 : 20,
  },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 14,
    ...theme.elevation.small,
    // Add subtle animation
    transform: [{ scale: 1.0 }],
  },
  signupLinkContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'android' ? 24 : 16,
    marginBottom: 10,
    // Add touch target
    paddingHorizontal: 20,
  },
  signupLinkHighlight: {
    textDecorationLine: 'underline',
    // Color is handled by Text component
  },
  bottomSpacer: {
    height: Platform.OS === 'android' ? 70 : 40,
  }
});
