import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { supabase } from '../../supabaseClient';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../redux/slices/authSlice';

export default function SignupScreen({ navigation }) {
  const dispatch = useDispatch();
  const [formError, setFormError] = useState('');

  const signupSchema = Yup.object().shape({
    fullName: Yup.string().required('Full name is required'),
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().min(6, 'Min 6 characters').required('Required'),
  });

  const handleSignup = async (values, { setSubmitting }) => {
    setFormError('');
    dispatch(loginStart());
    // 1. Create auth user
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    });
    if (error) {
      setFormError(error.message);
      dispatch(loginFailure(error.message));
      setSubmitting(false);
      return;
    }
    // 2. Insert user profile
    const user = data.user || (data.session && data.session.user);
    if (user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: user.id,
            email: values.email,
            full_name: values.fullName,
            credit_balance: 10,
          },
        ]);
      if (profileError) {
        setFormError(profileError.message);
        dispatch(loginFailure(profileError.message));
        setSubmitting(false);
        return;
      }
      dispatch(loginSuccess(user));
      navigation.replace('Onboarding'); // Or 'Main' if you want to skip onboarding
    } else {
      setFormError('Signup failed: No user returned');
      dispatch(loginFailure('Signup failed: No user returned'));
    }
    setSubmitting(false);
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={{ marginBottom: 24 }}>Sign Up</Text>
      <Formik
        initialValues={{ fullName: '', email: '', password: '' }}
        validationSchema={signupSchema}
        onSubmit={handleSignup}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
          <>
            <TextInput
              label="Full Name"
              value={values.fullName}
              onChangeText={handleChange('fullName')}
              onBlur={handleBlur('fullName')}
              error={touched.fullName && !!errors.fullName}
              style={styles.input}
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
            />
            {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}
            {formError ? <Text style={styles.error}>{formError}</Text> : null}
            <Button mode="contained" onPress={handleSubmit} loading={isSubmitting} disabled={isSubmitting} style={{ marginTop: 16 }}>
              Sign Up
            </Button>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 24 }}>
              <Text style={{ color: '#1e88e5' }}>Already have an account? Login</Text>
            </TouchableOpacity>
          </>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fafafa',
  },
  input: {
    width: 280,
    marginBottom: 8,
  },
  error: {
    color: '#d32f2f',
    marginBottom: 8,
    fontSize: 14,
  },
});

