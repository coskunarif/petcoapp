import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform, Share, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Button, Portal, Dialog, Text } from 'react-native-paper';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';

import { transactionService } from '../../services/transactionService';
import { generateReceiptHTML, generateReceiptPDF, sendReceiptByEmail } from '../../utils/receiptGenerator';
import { Transaction } from '../../types/payments';

type ReceiptViewScreenParams = {
  transactionId?: string;
  transaction?: Transaction;
};

const ReceiptViewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { transactionId, transaction: initialTransaction } = route.params as ReceiptViewScreenParams;
  
  const [transaction, setTransaction] = useState<Transaction | undefined>(initialTransaction);
  const [loading, setLoading] = useState<boolean>(!initialTransaction);
  const [receiptHtml, setReceiptHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [emailDialogVisible, setEmailDialogVisible] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);
  
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Receipt',
      headerRight: () => (
        <View style={styles.headerButtons}>
          <Button
            icon="download"
            mode="text"
            onPress={handleDownload}
            disabled={loading || !!error}
          >
            Save
          </Button>
          <Button
            icon="printer"
            mode="text"
            onPress={handlePrint}
            disabled={loading || !!error}
          >
            Print
          </Button>
          <Button
            icon="share"
            mode="text"
            onPress={handleShare}
            disabled={loading || !!error}
          >
            Share
          </Button>
        </View>
      ),
    });
  }, [loading, error, transaction]);

  // Fetch transaction if only ID was provided
  useEffect(() => {
    const fetchTransaction = async () => {
      if (!transactionId) return;
      
      try {
        setLoading(true);
        const result = await transactionService.getTransactionDetails(transactionId);
        setTransaction(result);
      } catch (err: any) {
        setError(err.message || 'Failed to load transaction');
        Alert.alert('Error', 'Could not load transaction details');
      } finally {
        setLoading(false);
      }
    };

    if (!initialTransaction && transactionId) {
      fetchTransaction();
    }
  }, [transactionId, initialTransaction]);

  // Generate receipt HTML when transaction is available
  useEffect(() => {
    const generateReceipt = async () => {
      if (!transaction) return;
      
      try {
        setLoading(true);
        const html = await generateReceiptHTML(transaction);
        setReceiptHtml(html);
      } catch (err: any) {
        setError(err.message || 'Failed to generate receipt');
        Alert.alert('Error', 'Could not generate receipt');
      } finally {
        setLoading(false);
      }
    };

    if (transaction) {
      generateReceipt();
    }
  }, [transaction]);

  const handleDownload = async () => {
    if (!transaction) return;
    
    try {
      const pdfFile = await generateReceiptPDF(transaction);
      
      if (Platform.OS === 'web') {
        // For web, create a download link
        const link = document.createElement('a');
        link.href = pdfFile;
        link.download = `Receipt-${transaction.reference}.pdf`;
        link.click();
      } else {
        // For mobile, save to file system
        const fileName = `Receipt-${transaction.reference}.pdf`;
        const fileUri = FileSystem.documentDirectory + fileName;
        
        await FileSystem.writeAsStringAsync(fileUri, pdfFile, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        Alert.alert(
          'Success',
          `Receipt saved as ${fileName}`,
          [{ text: 'OK' }]
        );
      }
    } catch (err: any) {
      Alert.alert('Error', 'Could not download receipt');
    }
  };

  const handlePrint = async () => {
    if (!transaction) return;
    
    try {
      if (Platform.OS === 'web') {
        // For web, use browser's print functionality
        webViewRef.current?.injectJavaScript('window.print();');
      } else {
        // For mobile, use Expo Print
        await Print.printAsync({
          html: receiptHtml,
        });
      }
    } catch (err: any) {
      Alert.alert('Error', 'Could not print receipt');
    }
  };

  const handleShare = async () => {
    if (!transaction) return;
    
    try {
      if (Platform.OS === 'web') {
        // For web, show email dialog
        setEmailDialogVisible(true);
      } else {
        // For mobile, use native sharing
        const pdfFile = await generateReceiptPDF(transaction);
        const fileName = `Receipt-${transaction.reference}.pdf`;
        const fileUri = FileSystem.documentDirectory + fileName;
        
        await FileSystem.writeAsStringAsync(fileUri, pdfFile, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Receipt',
        });
      }
    } catch (err: any) {
      Alert.alert('Error', 'Could not share receipt');
    }
  };

  const handleSendEmail = async () => {
    if (!transaction || !email) return;
    
    try {
      setSendingEmail(true);
      await sendReceiptByEmail(transaction, email);
      setEmailDialogVisible(false);
      Alert.alert('Success', 'Receipt has been sent to your email');
    } catch (err: any) {
      Alert.alert('Error', 'Could not send receipt via email');
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Generating receipt...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <MaterialIcons name="error-outline" size={48} color="red" />
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {receiptHtml ? (
        <WebView
          ref={webViewRef}
          source={{ html: receiptHtml }}
          style={styles.webView}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color="#6C63FF" />
            </View>
          )}
        />
      ) : (
        <View style={styles.centeredContainer}>
          <Text>No receipt data available</Text>
        </View>
      )}

      <Portal>
        <Dialog
          visible={emailDialogVisible}
          onDismiss={() => setEmailDialogVisible(false)}
        >
          <Dialog.Title>Send Receipt by Email</Dialog.Title>
          <Dialog.Content>
            <Text>Enter the email address to send this receipt to:</Text>
            {/* TODO: Replace with a proper TextInput component */}
            <View style={styles.emailInput}>
              <Text>Email input placeholder</Text>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEmailDialogVisible(false)}>Cancel</Button>
            <Button
              onPress={handleSendEmail}
              loading={sendingEmail}
              disabled={sendingEmail || !email}
            >
              Send
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
  },
  emailInput: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },
});

export default ReceiptViewScreen;