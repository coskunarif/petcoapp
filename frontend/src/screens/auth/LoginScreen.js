import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, Card, IconButton } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { supabase } from '../../supabaseClient';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../redux/slices/authSlice';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.appName}>PetConnect</Text>
        </View>
        <Card style={styles.card} elevation={4}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.title}>Login</Text>
            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={loginSchema}
              onSubmit={handleLogin}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
                <>
                  <View style={[styles.inputContainer, emailFocused && styles.focusedInput]}>
<TextInput
  label="Email"
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
  style={styles.input}
  underlineColor="transparent"
  activeUnderlineColor="transparent"
  // Removed theme prop to prevent autofill/focus background issues
/>
                  </View>
                  <Text style={styles.helperText}>Enter your registered email address</Text>
                  {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}
            <View style={[styles.passwordContainer, styles.inputContainer, passwordFocused && styles.focusedInput]}>
<TextInput
  label="Password"
  secureTextEntry={!showPassword}
  value={values.password}
  onChangeText={handleChange('password')}
  onFocus={() => setPasswordFocused(true)}
  onBlur={(e) => {
    handleBlur('password')(e);
    setPasswordFocused(false);
  }}
  error={touched.password && !!errors.password}
  style={[styles.input, { flex: 1 }]}
  underlineColor="transparent"
  activeUnderlineColor="transparent"
  // Removed theme prop to prevent autofill/focus background issues
  right={values.password ? (
    <TextInput.Icon
      icon={showPassword ? "eye-off" : "eye"}
      onPress={() => setShowPassword(!showPassword)}
    />
  ) : null}
/>
            </View>
            <Text style={styles.helperText}>Minimum 6 characters</Text>
            {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotPasswordLink}>
              <Text style={styles.forgotPassword}>Forgot password?</Text>
            </TouchableOpacity>
            {formError ? (
              <View style={styles.errorRow}>
                <IconButton icon="alert-circle" size={18} iconColor="#d32f2f" style={{ margin: 0 }} />
                <Text style={styles.error}>{formError}</Text>
              </View>
            ) : null}
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={styles.loginButton}
              contentStyle={{ paddingVertical: 6 }}
            >
              Login
            </Button>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.signupLinkContainer}>
              <Text style={styles.signupLinkText}>Don't have an account? <Text style={styles.signupLinkHighlight}>Sign up</Text></Text>
            </TouchableOpacity>
          </>
        )}
      </Formik>
          </Card.Content>
        </Card>
      </View>
    </TouchableWithoutFeedback>
  );
}

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      backgroundColor: '#F5F5F5', // Light gray background for better contrast
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    logo: {
      width: 100,
      height: 100,
      opacity: 0.9,
    },
    appName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333333', // Dark gray for app name for better readability
      marginTop: 8,
    },
    card: {
      width: '100%',
      maxWidth: 350,
      borderRadius: 20,
      paddingVertical: 16,
      backgroundColor: '#fff', // White card background
      shadowColor: '#0d47a1', // Darker blue for card shadow
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    title: {
      marginBottom: 20,
      textAlign: 'center',
      color: '#333333', // Dark gray for title for better readability
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    inputContainer: {
      marginBottom: 8,
      borderRadius: 8,
      backgroundColor: '#FFFFFF', // White input background
      borderWidth: 1,
      borderColor: '#9e9e9e', // Darker gray border for better visual hierarchy
      paddingHorizontal: 12,
      paddingVertical: 1,
    },
    input: {
      backgroundColor: '#fff', // Force white background to override autofill/focus
      color: '#212121', // Darker text color
      paddingVertical: 6,
      fontSize: 14,
      height: 40, // Reduced height
    },
    focusedInput: {
      borderColor: '#0d47a1', // Darker blue for focused border
      backgroundColor: '#e3f2fd', // Light blue for focused background
      borderWidth: 1.5,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    errorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      backgroundColor: '#ffebee', // Lighter red background
      padding: 12,
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: '#c62828', // Darker red border
      shadowColor: '#c62828', // Darker red shadow
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    error: {
      color: '#c62828', // Darker red text
      fontSize: 14,
      marginLeft: 4,
      fontWeight: '500',
    },
    loginButton: {
      marginTop: 24,
      borderRadius: 8,
      backgroundColor: '#0d47a1', // Darker blue for button background
      paddingVertical: 10, // Adjusted padding
      shadowColor: '#0d47a1', // Darker blue for button shadow
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    helperText: {
      color: '#424242', // Darker gray helper text
      fontSize: 12,
      marginLeft: 4,
      marginTop: 2,
      marginBottom: 8,
    },
    signupLinkContainer: {
      marginTop: 24,
      alignItems: 'center',
    },
    signupLinkText: {
      color: '#424242', // Darker gray signup link text
      fontSize: 15,
    },
    signupLinkHighlight: {
      color: '#1565c0', // Darker blue for signup link highlight
      fontWeight: 'bold',
      textDecorationLine: 'underline',
      fontSize: 15,
    },
    forgotPasswordLink: {
      alignSelf: 'flex-start', // Align to the left
      marginTop: 4,
      marginLeft: 4,
    },
    forgotPassword: {
      color: '#1565c0', // Darker blue for forgot password link
      fontSize: 14,
      textAlign: 'left',
    },
});
