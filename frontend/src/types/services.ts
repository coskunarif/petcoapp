// Service-related type definitions

/**
 * Service Type (category of services)
 */
export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  icon: string;
  credit_value: number;
  created_at: string;
}

/**
 * Service Listing
 */
export interface ServiceListing {
  id: string;
  title: string;
  description: string;
  provider_id: string;
  service_type_id: string;
  price?: number; // If different from the standard service type credit value
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  availability_schedule?: {
    days?: string[];
    hours?: string;
    notes?: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  
  // Optional joined data
  provider?: {
    id: string;
    full_name: string;
    profile_image_url?: string;
  };
  service_type?: ServiceType;
}

/**
 * Service Request
 */
export interface ServiceRequest {
  id: string;
  requester_id: string;
  provider_id: string;
  service_type_id: string;
  service_listing_id?: string; // Optional if request is related to a specific listing
  title?: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled' | 'rejected';
  scheduled_date?: string;
  created_at: string;
  updated_at?: string;
  
  // Optional joined data
  requester?: {
    id: string;
    full_name: string;
    profile_image_url?: string;
  };
  provider?: {
    id: string;
    full_name: string;
    profile_image_url?: string;
  };
  service_type?: ServiceType;
  service_listing?: ServiceListing;
}

/**
 * Service Review
 */
export interface ServiceReview {
  id: string;
  service_request_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  review_text?: string;
  created_at: string;
  
  // Optional joined data
  reviewer?: {
    id: string;
    full_name: string;
    profile_image_url?: string;
  };
  reviewee?: {
    id: string;
    full_name: string;
    profile_image_url?: string;
  };
}

/**
 * Service Payment
 */
export interface ServicePayment {
  id: string;
  service_request_id: string;
  payer_id: string;
  payee_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'refunded' | 'cancelled';
  created_at: string;
  completed_at?: string;
}