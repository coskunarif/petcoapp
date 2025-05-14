import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as MailComposer from 'expo-mail-composer';

// Types
export interface TransactionData {
  transactionId: string;
  date: string | Date;
  customer: {
    name: string;
    email: string;
    address?: string;
  };
  provider: {
    name: string;
    email: string;
    address?: string;
    phone?: string;
  };
  service: {
    name: string;
    description?: string;
    duration?: string;
  };
  pet?: {
    name: string;
    type: string;
    breed?: string;
  };
  payment: {
    amount: number;
    currency: string;
    method: string;
    status: 'completed' | 'pending' | 'failed';
    cardLast4?: string;
  };
  additionalNotes?: string;
}

export interface ReceiptOptions {
  includeCompanyLogo?: boolean;
  includePetDetails?: boolean;
  includeProviderDetails?: boolean;
  color?: string;
  emailSubject?: string;
  emailBody?: string;
  receiptTitle?: string;
}

const DEFAULT_OPTIONS: ReceiptOptions = {
  includeCompanyLogo: true,
  includePetDetails: true,
  includeProviderDetails: true,
  color: '#6C63FF', // Primary color from CLAUDE.md
  emailSubject: 'Your PetCo App Receipt',
  emailBody: 'Thank you for using PetCo App! Please find your receipt attached.',
  receiptTitle: 'Payment Receipt'
};

// Helper Functions
const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

const formatDate = (date: string | Date): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Generates HTML content for a receipt
 */
export const generateReceiptHTML = (
  transaction: TransactionData,
  options: ReceiptOptions = DEFAULT_OPTIONS
): string => {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const {
    color,
    includeCompanyLogo,
    includePetDetails,
    includeProviderDetails,
    receiptTitle
  } = mergedOptions;

  const logoPlaceholder = includeCompanyLogo
    ? `<div class="logo-container">
        <img src="https://example.com/petco-logo.png" alt="PetCo App Logo" class="logo" />
      </div>`
    : '';

  const petDetailsSection = includePetDetails && transaction.pet
    ? `<div class="section">
        <h3>Pet Information</h3>
        <p><strong>Name:</strong> ${transaction.pet.name}</p>
        <p><strong>Type:</strong> ${transaction.pet.type}</p>
        ${transaction.pet.breed ? `<p><strong>Breed:</strong> ${transaction.pet.breed}</p>` : ''}
      </div>`
    : '';

  const providerDetailsSection = includeProviderDetails
    ? `<div class="section">
        <h3>Service Provider</h3>
        <p><strong>Name:</strong> ${transaction.provider.name}</p>
        <p><strong>Email:</strong> ${transaction.provider.email}</p>
        ${transaction.provider.phone ? `<p><strong>Phone:</strong> ${transaction.provider.phone}</p>` : ''}
        ${transaction.provider.address ? `<p><strong>Address:</strong> ${transaction.provider.address}</p>` : ''}
      </div>`
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${receiptTitle}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #333;
          line-height: 1.5;
          margin: 0;
          padding: 20px;
        }
        .receipt {
          max-width: 800px;
          margin: 0 auto;
          border: 1px solid #ddd;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid ${color};
          padding-bottom: 20px;
        }
        .logo-container {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo {
          max-width: 150px;
          height: auto;
        }
        h1, h2, h3 {
          color: ${color};
        }
        .section {
          margin-bottom: 25px;
        }
        .transaction-id {
          font-size: 0.9em;
          color: #666;
          margin-top: 15px;
        }
        .payment-info {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          margin-top: 20px;
        }
        .payment-status {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 15px;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 0.8em;
        }
        .status-completed {
          background-color: #d4edda;
          color: #155724;
        }
        .status-pending {
          background-color: #fff3cd;
          color: #856404;
        }
        .status-failed {
          background-color: #f8d7da;
          color: #721c24;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 0.9em;
          color: #777;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
        .amount {
          font-size: 1.2em;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          ${logoPlaceholder}
          <h1>${receiptTitle}</h1>
          <p>Date: ${formatDate(transaction.date)}</p>
          <p class="transaction-id">Transaction ID: ${transaction.transactionId}</p>
        </div>
        
        <div class="section">
          <h3>Customer Information</h3>
          <p><strong>Name:</strong> ${transaction.customer.name}</p>
          <p><strong>Email:</strong> ${transaction.customer.email}</p>
          ${transaction.customer.address ? `<p><strong>Address:</strong> ${transaction.customer.address}</p>` : ''}
        </div>
        
        ${petDetailsSection}
        
        <div class="section">
          <h3>Service Details</h3>
          <p><strong>Service:</strong> ${transaction.service.name}</p>
          ${transaction.service.description ? `<p><strong>Description:</strong> ${transaction.service.description}</p>` : ''}
          ${transaction.service.duration ? `<p><strong>Duration:</strong> ${transaction.service.duration}</p>` : ''}
        </div>
        
        ${providerDetailsSection}
        
        <div class="section payment-info">
          <h3>Payment Information</h3>
          <p><strong>Amount:</strong> <span class="amount">${formatCurrency(transaction.payment.amount, transaction.payment.currency)}</span></p>
          <p><strong>Payment Method:</strong> ${transaction.payment.method} ${transaction.payment.cardLast4 ? `(ending in ${transaction.payment.cardLast4})` : ''}</p>
          <p>
            <strong>Status:</strong> 
            <span class="payment-status status-${transaction.payment.status}">
              ${transaction.payment.status}
            </span>
          </p>
        </div>
        
        ${transaction.additionalNotes ? `
        <div class="section">
          <h3>Additional Notes</h3>
          <p>${transaction.additionalNotes}</p>
        </div>
        ` : ''}
        
        <div class="footer">
          <p>Thank you for using PetCo App!</p>
          <p>If you have any questions about this receipt, please contact support@petcoapp.com</p>
          <p>&copy; ${new Date().getFullYear()} PetCo App. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generates a PDF receipt from transaction data
 */
export const generateReceiptPDF = async (
  transaction: TransactionData,
  options: ReceiptOptions = DEFAULT_OPTIONS
): Promise<string> => {
  try {
    const html = generateReceiptHTML(transaction, options);
    const { uri } = await Print.printToFileAsync({ html });
    
    // If on web, we need to handle differently
    if (Platform.OS === 'web') {
      return uri; // On web, this might be a blob URL
    }
    
    // For mobile platforms
    return uri;
  } catch (error) {
    console.error('Error generating PDF receipt:', error);
    throw new Error('Failed to generate PDF receipt');
  }
};

/**
 * Saves the PDF receipt locally and returns the file path
 */
export const saveReceiptLocally = async (
  transaction: TransactionData,
  options: ReceiptOptions = DEFAULT_OPTIONS
): Promise<string> => {
  try {
    const pdfUri = await generateReceiptPDF(transaction, options);
    const fileName = `receipt_${transaction.transactionId}_${new Date().getTime()}.pdf`;
    
    // If on web, handle download differently
    if (Platform.OS === 'web') {
      // Web implementation would go here
      // This is a simplified version and may need adjustments
      const link = document.createElement('a');
      link.href = pdfUri;
      link.download = fileName;
      link.click();
      return pdfUri;
    }
    
    // For mobile platforms
    const directory = FileSystem.documentDirectory || FileSystem.cacheDirectory;
    if (!directory) {
      throw new Error('Could not determine file system directory');
    }
    
    const filePath = `${directory}${fileName}`;
    await FileSystem.copyAsync({
      from: pdfUri,
      to: filePath
    });
    
    return filePath;
  } catch (error) {
    console.error('Error saving receipt locally:', error);
    throw new Error('Failed to save receipt locally');
  }
};

/**
 * Shares the receipt using the device's sharing functionality
 */
export const shareReceipt = async (
  transaction: TransactionData,
  options: ReceiptOptions = DEFAULT_OPTIONS
): Promise<void> => {
  try {
    const filePath = await saveReceiptLocally(transaction, options);
    
    // If on web, we've already triggered download in saveReceiptLocally
    if (Platform.OS !== 'web') {
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error('Sharing is not available on this device');
      }
      
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Your Receipt'
      });
    }
  } catch (error) {
    console.error('Error sharing receipt:', error);
    throw new Error('Failed to share receipt');
  }
};

/**
 * Sends a receipt by email
 */
export const sendReceiptByEmail = async (
  transaction: TransactionData,
  options: ReceiptOptions = DEFAULT_OPTIONS
): Promise<void> => {
  try {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    const { emailSubject, emailBody } = mergedOptions;
    
    const pdfPath = await saveReceiptLocally(transaction, options);
    
    const available = await MailComposer.isAvailableAsync();
    if (!available) {
      throw new Error('Email is not available on this device');
    }
    
    await MailComposer.composeAsync({
      recipients: [transaction.customer.email],
      subject: emailSubject,
      body: emailBody,
      attachments: [pdfPath]
    });
  } catch (error) {
    console.error('Error sending receipt by email:', error);
    throw new Error('Failed to send receipt by email');
  }
};

/**
 * Gets a URL to a hosted receipt
 * Note: This is a placeholder implementation. In a real app, you would:
 * 1. Upload the receipt to a server/storage service
 * 2. Get a URL to that hosted file
 */
export const getReceiptURL = async (
  transaction: TransactionData,
  options: ReceiptOptions = DEFAULT_OPTIONS
): Promise<string> => {
  try {
    // This is a mock implementation
    // In a real app, you would upload the PDF to a server and get a URL
    
    // For demonstration purposes, we'll just return a fake URL
    // In a real implementation, we would:
    // 1. Generate the PDF
    // 2. Upload it to a server/cloud storage
    // 3. Return the URL to the uploaded file
    
    // Mock URL based on transaction ID
    return `https://api.petcoapp.com/receipts/${transaction.transactionId}`;
  } catch (error) {
    console.error('Error getting receipt URL:', error);
    throw new Error('Failed to get receipt URL');
  }
};

/**
 * Helper function to get receipt summary text (plain text version)
 */
export const getReceiptSummaryText = (transaction: TransactionData): string => {
  const lines = [
    '===== PetCo App Receipt =====',
    '',
    `Date: ${formatDate(transaction.date)}`,
    `Transaction ID: ${transaction.transactionId}`,
    '',
    'Customer:',
    `Name: ${transaction.customer.name}`,
    `Email: ${transaction.customer.email}`,
    '',
    'Service:',
    `Name: ${transaction.service.name}`,
    transaction.service.description ? `Description: ${transaction.service.description}` : '',
    '',
    'Payment:',
    `Amount: ${formatCurrency(transaction.payment.amount, transaction.payment.currency)}`,
    `Method: ${transaction.payment.method} ${transaction.payment.cardLast4 ? `(ending in ${transaction.payment.cardLast4})` : ''}`,
    `Status: ${transaction.payment.status.toUpperCase()}`,
    '',
    'Thank you for using PetCo App!',
    'For support: support@petcoapp.com'
  ].filter(Boolean).join('\n');

  return lines;
};