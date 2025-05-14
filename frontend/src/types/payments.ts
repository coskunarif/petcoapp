/**
 * Type definitions for payment functionality
 */

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal';
  created: number;
  isDefault: boolean;
  billingDetails: {
    name: string;
    email?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
  };
  card?: {
    brand: 'visa' | 'mastercard' | 'amex' | 'discover' | 'jcb' | 'diners' | 'unionpay';
    last4: string;
    expMonth: number;
    expYear: number;
  };
  bankAccount?: {
    bankName: string;
    last4: string;
    accountType: 'checking' | 'savings';
  };
}

export interface StripeAccount {
  id: string;
  object: 'account';
  businessType: 'individual' | 'company';
  capabilities: {
    cardPayments: 'active' | 'inactive' | 'pending';
    transfers: 'active' | 'inactive' | 'pending';
  };
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  email: string;
  metadata: Record<string, string>;
  settings?: {
    payouts: {
      schedule: {
        interval: 'manual' | 'daily' | 'weekly' | 'monthly';
        weeklyAnchor?: string;
        monthlyAnchor?: number;
      };
    };
  };
}

export interface PaymentIntent {
  id: string;
  amount: number;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded';
  clientSecret: string;
  currency: string;
  created: number;
  paymentMethodId?: string;
  receiptEmail?: string;
  metadata?: Record<string, string>;
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created: number;
  serviceId?: string;
  paymentIntentId: string;
  payerId: string;
  payeeId: string;
  description: string;
  fee?: number;
}

export interface PayoutMethod {
  id: string;
  type: 'bank_account';
  bankAccount: {
    bankName: string;
    last4: string;
    routingNumber?: string;
    accountType: 'checking' | 'savings';
  };
  default: boolean;
  created: number;
}

export interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'in_transit' | 'paid' | 'failed' | 'canceled';
  created: number;
  arrivalDate: number;
  method: 'standard' | 'instant';
  description?: string;
  sourceType: 'card' | 'bank_account';
}

export interface PriceRange {
  min: number;
  max: number;
  currency: string;
}

export interface BalanceTransaction {
  id: string;
  amount: number;
  currency: string;
  type: 'payment' | 'payout' | 'refund' | 'adjustment' | 'fee';
  status: 'available' | 'pending';
  created: number;
  description?: string;
  source: string;
}

export interface Balance {
  available: {
    amount: number;
    currency: string;
  };
  pending: {
    amount: number;
    currency: string;
  };
  reserved?: {
    amount: number;
    currency: string;
  };
  lastUpdated: number;
}

export type PaymentErrorCode = 
  | 'card_declined'
  | 'expired_card'
  | 'incorrect_cvc'
  | 'processing_error'
  | 'insufficient_funds'
  | 'invalid_account'
  | 'authentication_required'
  | 'rate_limit'
  | 'network_error';

export interface PaymentError {
  code: PaymentErrorCode;
  message: string;
  declineCode?: string;
  param?: string;
}