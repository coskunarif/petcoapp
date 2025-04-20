import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { supabase } from '../../api/supabaseClient';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../redux/slices/authSlice';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const [formError, setFormError] = useState('');

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
      navigation.replace('Main');
    }
    setSubmitting(false);
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={{ marginBottom: 24 }}>Login</Text>
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={loginSchema}
        onSubmit={handleLogin}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
          <>
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
              Login
            </Button>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={{ marginTop: 24 }}>
              <Text style={{ color: '#1e88e5' }}>Don't have an account? Sign up</Text>
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

