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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        {/* Logo Placeholder */}
        <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
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
            <View style={styles.passwordContainer}>
              <TextInput
                label="Password"
                secureTextEntry={!showPassword}
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                error={touched.password && !!errors.password}
                style={[styles.input, { flex: 1 }]}
                right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
              />
            </View>
            {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}
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
    backgroundColor: '#f0f4f8',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
    alignSelf: 'center',
    opacity: 0.9,
  },
  card: {
    width: '100%',
    maxWidth: 350,
    borderRadius: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    shadowColor: '#1e88e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
    color: '#1e88e5',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#f5f7fa',
    borderRadius: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  error: {
    color: '#d32f2f',
    fontSize: 14,
    marginLeft: 2,
  },
  loginButton: {
    marginTop: 16,
    borderRadius: 10,
    backgroundColor: '#1e88e5',
    shadowColor: '#1e88e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  signupLinkContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  signupLinkText: {
    color: '#333',
    fontSize: 15,
  },
  signupLinkHighlight: {
    color: '#1e88e5',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});


