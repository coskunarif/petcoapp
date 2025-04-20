// Data types for Home Dashboard
export interface ServiceRequest {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  users?: {
    full_name: string;
    profile_image_url: string;
  };
  pets?: {
    name: string;
    image_url: string;
  };
  service_types?: {
    name: string;
    icon: string;
  }[];
}

export interface Provider {
  userId: string;
  name: string;
  profile_image_url?: string;
  distance: number;
  rating: number;
  serviceTypes: string[];
  availability: string[];
}

export interface HomeDashboardData {
  userCredits: number;
  upcomingServices: {
    asProvider: ServiceRequest[];
    asRequester: ServiceRequest[];
  };
  nearbyProviders: Provider[];
}
