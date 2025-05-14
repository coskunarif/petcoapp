import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Linking,
  Platform,
} from 'react-native';
import {
  Button,
  Card,
  Title,
  Paragraph,
  List,
  Divider,
  Chip,
  useTheme,
  IconButton,
} from 'react-native-paper';
import { ErrorCode, PaymentErrorHandlerProps } from './types';

const errorMessages: Record<ErrorCode, string> = {
  'insufficient-funds': 'Your payment could not be processed due to insufficient funds.',
  'card-declined': 'Your card was declined by the issuing bank.',
  'invalid-card': 'The card information provided is invalid.',
  'expired-card': 'The card has expired.',
  'processing-error': 'There was an error processing your payment.',
  'network-error': 'A network error occurred. Please check your connection.',
  'invalid-details': 'Some payment details are missing or invalid.',
  'payment-cancelled': 'The payment was cancelled.',
  'unknown': 'An unknown error occurred while processing your payment.',
};

const errorSuggestions: Record<ErrorCode, string> = {
  'insufficient-funds': 'Please try another card or add funds to your account.',
  'card-declined': 'Contact your bank or try another payment method.',
  'invalid-card': 'Double-check your card information and try again.',
  'expired-card': 'Please update your card information or use a different card.',
  'processing-error': 'Wait a moment and try again, or use a different payment method.',
  'network-error': 'Check your internet connection and try again.',
  'invalid-details': 'Please review and correct your payment information.',
  'payment-cancelled': 'You can restart the payment process when ready.',
  'unknown': 'Please try again or contact support if the issue persists.',
};

const PaymentErrorHandler: React.FC<PaymentErrorHandlerProps> = ({
  errorCode = 'unknown',
  onRetry,
  onAlternativeMethod,
  onDismiss,
  errorDetails,
  onReport,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  // Animation effect on mount
  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1.05,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const contactSupport = () => {
    const supportEmail = 'support@petcoapp.com';
    const subject = `Payment Error: ${errorCode}`;
    const body = `Error Details:\n${errorDetails || 'No additional details'}\n\nPlease help me resolve this payment issue.`;

    if (Platform.OS === 'web') {
      Linking.openURL(`mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    } else {
      Linking.openURL(`mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: animation }],
        },
      ]}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.headerContainer}>
            <IconButton
              icon="alert-circle"
              size={32}
              color={theme.colors.error}
              style={styles.icon}
            />
            <Title style={styles.title}>Payment Failed</Title>
          </View>
          
          <Paragraph style={styles.message}>{errorMessages[errorCode]}</Paragraph>
          <Chip icon="lightbulb" style={styles.suggestionChip}>
            {errorSuggestions[errorCode]}
          </Chip>

          <View style={styles.buttonContainer}>
            {onRetry && (
              <Button
                mode="contained"
                onPress={onRetry}
                style={styles.retryButton}
                icon="refresh"
              >
                Try Again
              </Button>
            )}
            
            {onAlternativeMethod && (
              <Button
                mode="outlined"
                onPress={onAlternativeMethod}
                style={styles.alternativeButton}
                icon="credit-card-multiple"
              >
                Try Another Method
              </Button>
            )}
          </View>

          <Divider style={styles.divider} />

          <List.Accordion
            title="Error Details"
            expanded={expanded}
            onPress={() => setExpanded(!expanded)}
            left={props => <List.Icon {...props} icon="information-outline" />}
          >
            <List.Item 
              title="Error Code" 
              description={errorCode} 
              descriptionStyle={styles.codeText}
            />
            {errorDetails && (
              <List.Item
                title="Technical Details"
                description={errorDetails}
                descriptionStyle={styles.codeText}
                descriptionNumberOfLines={4}
              />
            )}
          </List.Accordion>

          <View style={styles.footerContainer}>
            <Button
              mode="text"
              onPress={contactSupport}
              icon="headset"
              style={styles.supportButton}
            >
              Contact Support
            </Button>
            
            {onReport && (
              <Button
                mode="text"
                onPress={onReport}
                icon="flag"
                style={styles.reportButton}
              >
                Report Issue
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>

      {onDismiss && (
        <IconButton
          icon="close"
          size={24}
          onPress={onDismiss}
          style={styles.dismissButton}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  card: {
    borderRadius: 12,
    elevation: 4,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontWeight: 'bold',
  },
  message: {
    fontSize: 16,
    marginBottom: 16,
  },
  suggestionChip: {
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'column',
    marginBottom: 16,
  },
  retryButton: {
    marginBottom: 8,
  },
  alternativeButton: {
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  supportButton: {
    flex: 1,
  },
  reportButton: {
    flex: 1,
  },
  dismissButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});

export default PaymentErrorHandler;