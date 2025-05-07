import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { AppButton } from '../../components/ui';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface VerifyEmailScreenProps {
  navigation: any;
  route: {
    params: {
      email: string;
    };
  };
}

export default function VerifyEmailScreen({ navigation, route }: VerifyEmailScreenProps) {
  const { email } = route.params || { email: '' };
  
  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Image 
            source={require('../../../assets/logo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />

          <Text variant="headlineLarge" style={styles.title}>
            Verify Your Email
          </Text>

          <View style={styles.card}>
            <Text style={styles.message}>
              We've sent a verification email to:
            </Text>
            
            <Text style={styles.email}>
              {email}
            </Text>
            
            <Text style={styles.instructions}>
              Please check your inbox and click the verification link to activate your account. If you don't see the email, please check your spam folder.
            </Text>
          </View>

          <AppButton
            title="Back to Login"
            onPress={handleBackToLogin}
            mode="outlined"
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 32,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: theme.colors.primary,
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    width: '100%',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 32,
  },
  message: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  email: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
    minWidth: 200,
  }
});