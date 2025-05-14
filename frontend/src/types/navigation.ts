import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

// Main Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  Pets: undefined;
  Services: undefined;
  Messages: undefined;
  Profile: undefined;
};

// Services Stack Navigator
export type ServicesStackParamList = {
  ServicesList: undefined;
  ServiceDetail: { service: any };
  RequestService: { serviceId?: string };
};

// Services Navigation Param List (expanded for new Request Management screens)
export type ServicesNavigationParamList = {
  ServicesList: undefined;
  ServiceDetail: { service: any };
  RequestService: { serviceId?: string };
  RequestList: undefined;
  RequestDetail: { requestId: string; backScreen?: string };
  ModifyRequest: { requestId: string };
  RequestHistory: undefined;
};

// Pets Stack Navigator
export type PetsStackParamList = {
  PetList: undefined;
  PetDetail: { pet: any };
  AddPet: undefined;
  EditPet: { pet: any };
};

// Messages Stack Navigator
export type MessagesStackParamList = {
  MessagesList: undefined;
  ChatDetail: { partnerId: string; partnerName: string };
};

// Profile Stack Navigator
export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Settings: undefined;
};

// Export navigation types
export type ServicesNavigationProp = StackNavigationProp<ServicesStackParamList>;
export type PetsNavigationProp = StackNavigationProp<PetsStackParamList>;
export type MessagesNavigationProp = StackNavigationProp<MessagesStackParamList>;
export type ProfileNavigationProp = StackNavigationProp<ProfileStackParamList>;
