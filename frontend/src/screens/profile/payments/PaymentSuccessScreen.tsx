import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Card, Button, Text, Title } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Types
type RouteParams = {
  cardLast4: string;
  isDefault: boolean;
};

type NavigationProp = StackNavigationProp<any, 'PaymentSuccess'>;
type ScreenRouteProp = RouteProp<Record<string, RouteParams>, 'PaymentSuccess'>;

const PaymentSuccessScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { cardLast4, isDefault } = route.params;
  
  // Redirect to payment methods after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('PaymentMethods');
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="check-circle" size={80} color="#4CAF50" />
        </View>
        
        <Title style={styles.title}>Payment Method Added</Title>
        
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.message}>
              Your card ending in {cardLast4} has been successfully added to your account.
              {isDefault ? ' This card has been set as your default payment method.' : ''}
            </Text>
            
            <Text style={styles.additionalInfo}>
              You can manage your payment methods in the Payment Methods section.
            </Text>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={() => navigation.navigate('PaymentMethods')}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Done
        </Button>
        
        <Text style={styles.redirectText}>
          You will be redirected to Payment Methods in a few seconds...
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  additionalInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  button: {
    marginBottom: 16,
    backgroundColor: '#6C63FF',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  redirectText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default PaymentSuccessScreen;