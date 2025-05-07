import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { signUpUser } from '../../redux/slices/authSlice';

export default function SignupScreen({ navigation }) {
  const dispatch = useDispatch();
  const [formError, setFormError] = useState('');
  const loading = useSelector(state => state.auth.loading);

  const signupSchema = Yup.object().shape({
    fullName: Yup.string().required('Full name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
  });

  const handleSignup = async (values, { setSubmitting }) => {
    setFormError('');
    
    try {
      const resultAction = await dispatch(signUpUser({
        email: values.email,
        password: values.password,
        fullName: values.fullName
      }));
      
      // Check if the action was fulfilled
      if (signUpUser.fulfilled.match(resultAction)) {
        // On success, navigate to verify email screen
        navigation.navigate('VerifyEmail', { email: values.email });
      } else if (signUpUser.rejected.match(resultAction)) {
        // If rejected, set the error
        setFormError(resultAction.payload || 'Signup failed. Please try again.');
      }
    } catch (error) {
      setFormError(typeof error === 'string' ? error : 'Signup failed. Please try again.');
      console.error('Signup error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.header}>Create an Account</Text>
        <Text style={styles.subheader}>Join PetCoApp today and connect with pet care services</Text>
        
        <Formik
          initialValues={{ fullName: '', email: '', password: '', confirmPassword: '' }}
          validationSchema={signupSchema}
          onSubmit={handleSignup}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
            <View style={styles.form}>
              <TextInput
                label="Full Name"
                value={values.fullName}
                onChangeText={handleChange('fullName')}
                onBlur={handleBlur('fullName')}
                error={touched.fullName && !!errors.fullName}
                style={styles.input}
                mode="outlined"
                disabled={loading}
              />
              {touched.fullName && errors.fullName && <Text style={styles.error}>{errors.fullName}</Text>}
              
              <TextInput
                label="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                error={touched.email && !!errors.email}
                style={styles.input}
                mode="outlined"
                disabled={loading}
              />
              {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}
              
              <TextInput
                label="Password"
                secureTextEntry
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                error={touched.password && !!errors.password}
                style={styles.input}
                mode="outlined"
                disabled={loading}
              />
              {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}
              
              <TextInput
                label="Confirm Password"
                secureTextEntry
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                error={touched.confirmPassword && !!errors.confirmPassword}
                style={styles.input}
                mode="outlined"
                disabled={loading}
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <Text style={styles.error}>{errors.confirmPassword}</Text>
              )}
              
              {formError ? <Text style={styles.errorMessage}>{formError}</Text> : null}
              
              <Button 
                mode="contained" 
                onPress={handleSubmit}
                loading={isSubmitting || loading}
                disabled={isSubmitting || loading}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                Sign Up
              </Button>
              
              <View style={styles.loginLinkContainer}>
                <Text>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Formik>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subheader: {
    marginBottom: 32,
    color: '#666666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 320,
  },
  input: {
    width: '100%',
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  error: {
    color: '#d32f2f',
    marginBottom: 12,
    fontSize: 12,
    marginLeft: 4,
  },
  errorMessage: {
    color: '#d32f2f',
    marginBottom: 16,
    fontSize: 14,
    textAlign: 'center',
    padding: 8,
    backgroundColor: '#ffebee',
    borderRadius: 4,
  },
  button: {
    marginTop: 24,
    width: '100%',
    backgroundColor: '#6C63FF',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginLink: {
    color: '#6C63FF',
    fontWeight: 'bold',
  },
});
