import { supabaseClient } from '../supabaseClient';
import stripeService from './stripeService';
import { 
  PaymentIntent, 
  PaymentTransaction, 
  PaymentError,
  ServiceResponse 
} from '../types/payments';
import { ServiceListing, ServiceRequest } from '../types/services';

/**
 * Parameters for service payment processing
 */
interface ServicePaymentParams {
  serviceId: string;
  providerId: string;
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, string>;
}

/**
 * Parameters for calculating service fees
 */
interface ServiceFeeParams {
  baseAmount: number;
  serviceType?: string;
  isRush?: boolean;
}

/**
 * Response structure for service fee calculation
 */
interface ServiceFeeCalculation {
  baseAmount: number;
  platformFee: number;
  processingFee: number;
  totalAmount: number;
  currency: string;
}

/**
 * Payment status response
 */
interface PaymentStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  amount: number;
  createdAt: number;
  updatedAt: number;
  serviceId?: string;
  metadata?: Record<string, string>;
}

/**
 * Service for processing payments for pet services
 */
const paymentProcessingService = {
  /**
   * Creates a payment intent for a pet service
   * 
   * @param params Payment parameters including service information
   * @returns ServiceResponse with PaymentIntent or error
   */
  createPaymentIntent: async (params: ServicePaymentParams): Promise<ServiceResponse<PaymentIntent>> => {
    try {
      // First calculate the fees to get the final amount
      const { data: feeCalculation } = await paymentProcessingService.calculateServiceFees({
        baseAmount: params.amount
      });
      
      if (!feeCalculation) {
        throw new Error('Failed to calculate service fees');
      }

      // Use the stripe service to create the payment intent
      const { data, error } = await stripeService.createPaymentIntent({
        amount: feeCalculation.totalAmount,
        currency: params.currency || 'usd',
        serviceId: params.serviceId,
        providerId: params.providerId,
        description: params.description || 'Pet service payment',
        metadata: {
          ...params.metadata,
          service_id: params.serviceId,
          base_amount: params.amount.toString(),
          platform_fee: feeCalculation.platformFee.toString(),
          processing_fee: feeCalculation.processingFee.toString()
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating payment intent for service:', error);
      return { 
        data: null, 
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to create payment intent'
        }
      };
    }
  },

  /**
   * Processes payment for a service
   * 
   * @param serviceRequestId The service request ID to process payment for
   * @param paymentMethodId Optional payment method ID (uses default if not provided)
   * @returns ServiceResponse with PaymentTransaction or error
   */
  processServicePayment: async (
    serviceRequestId: string, 
    paymentMethodId?: string
  ): Promise<ServiceResponse<PaymentTransaction>> => {
    try {
      const { data: user } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get service request details
      const { data: serviceRequest, error: serviceError } = await supabaseClient
        .from('service_requests')
        .select('*, service_type(*)')
        .eq('id', serviceRequestId)
        .single();

      if (serviceError) throw new Error(serviceError.message);
      if (!serviceRequest) throw new Error('Service request not found');

      // Calculate fees
      const { data: feeCalculation } = await paymentProcessingService.calculateServiceFees({
        baseAmount: serviceRequest.service_type.credit_value,
        serviceType: serviceRequest.service_type.id,
        isRush: false // TODO: Determine if this is a rush service
      });
      
      if (!feeCalculation) {
        throw new Error('Failed to calculate service fees');
      }

      // Process the payment through Supabase function
      const { data, error } = await supabaseClient.functions.invoke('process-service-payment', {
        body: { 
          service_request_id: serviceRequestId,
          payment_method_id: paymentMethodId,
          amount: feeCalculation.totalAmount,
          base_amount: feeCalculation.baseAmount,
          platform_fee: feeCalculation.platformFee,
          user_id: user.user.id
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error processing service payment:', error);
      return { 
        data: null, 
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to process service payment'
        }
      };
    }
  },

  /**
   * Confirms a payment for a service
   * 
   * @param paymentIntentId The payment intent ID to confirm
   * @returns ServiceResponse with PaymentTransaction or error
   */
  confirmPayment: async (paymentIntentId: string): Promise<ServiceResponse<PaymentTransaction>> => {
    try {
      return await stripeService.confirmPayment(paymentIntentId);
    } catch (error) {
      console.error('Error confirming payment:', error);
      return { 
        data: null, 
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to confirm payment'
        }
      };
    }
  },

  /**
   * Captures an authorized payment (for payments that require capture)
   * 
   * @param paymentIntentId The payment intent ID to capture
   * @param amount Optional amount to capture (defaults to full amount if not specified)
   * @returns ServiceResponse with PaymentTransaction or error
   */
  capturePayment: async (
    paymentIntentId: string, 
    amount?: number
  ): Promise<ServiceResponse<PaymentTransaction>> => {
    try {
      const { data, error } = await supabaseClient.functions.invoke('capture-payment', {
        body: { 
          payment_intent_id: paymentIntentId,
          amount
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error capturing payment:', error);
      return { 
        data: null, 
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to capture payment'
        }
      };
    }
  },

  /**
   * Gets the status of a payment
   * 
   * @param paymentIntentId The payment intent ID to check
   * @returns ServiceResponse with PaymentStatus or error
   */
  getPaymentStatus: async (paymentIntentId: string): Promise<ServiceResponse<PaymentStatus>> => {
    try {
      const { data, error } = await supabaseClient.functions.invoke('get-payment-status', {
        body: { payment_intent_id: paymentIntentId }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting payment status:', error);
      return { 
        data: null, 
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to get payment status'
        }
      };
    }
  },

  /**
   * Calculates fees for a service payment
   * 
   * @param params Parameters for fee calculation
   * @returns ServiceResponse with calculated fees or error
   */
  calculateServiceFees: async (params: ServiceFeeParams): Promise<ServiceResponse<ServiceFeeCalculation>> => {
    try {
      // Platform fee is 10% of the base amount
      const platformFee = Math.round(params.baseAmount * 0.10);
      
      // Processing fee is 2.9% + $0.30 (stripe standard)
      const processingFee = Math.round((params.baseAmount + platformFee) * 0.029 + 30);
      
      // Rush services have an additional 15% fee if applicable
      const rushFee = params.isRush ? Math.round(params.baseAmount * 0.15) : 0;
      
      // Calculate total
      const totalAmount = params.baseAmount + platformFee + processingFee + rushFee;
      
      return {
        data: {
          baseAmount: params.baseAmount,
          platformFee,
          processingFee,
          totalAmount,
          currency: 'usd'
        },
        error: null
      };
    } catch (error) {
      console.error('Error calculating service fees:', error);
      return { 
        data: null, 
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to calculate service fees'
        }
      };
    }
  }
};

export default paymentProcessingService;