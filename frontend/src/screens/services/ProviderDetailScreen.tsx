import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';
import ServiceCard from './BrowseServicesTab/ServiceCard';

// Mock services for this provider
const mockProviderServices = [
  {
    id: 'service1',
    title: 'Professional Dog Walking',
    description: 'Regular walks for your dog, providing exercise and companionship while you're busy.',
    provider_id: 'provider1',
    service_type_id: 'type1',
    is_active: true,
    created_at: new Date().toISOString(),
    provider: { id: 'provider1', full_name: 'Sarah Johnson', profile_image_url: null },
    service_type: { id: 'type1', name: 'Dog Walking', icon: 'dog', credit_value: 30 },
  },
  {
    id: 'service2',
    title: 'In-home Pet Sitting',
    description: 'I'll take care of your pets in your home, providing feeding, walks, and companionship.',
    provider_id: 'provider1',
    service_type_id: 'type2',
    is_active: true,
    created_at: new Date().toISOString(),
    provider: { id: 'provider1', full_name: 'Sarah Johnson', profile_image_url: null },
    service_type: { id: 'type2', name: 'Pet Sitting', icon: 'home', credit_value: 50 },
  },
  {
    id: 'service3',
    title: 'Medication Administration',
    description: 'I can administer medications to pets with special needs or health issues.',
    provider_id: 'provider1',
    service_type_id: 'type3',
    is_active: true,
    created_at: new Date().toISOString(),
    provider: { id: 'provider1', full_name: 'Sarah Johnson', profile_image_url: null },
    service_type: { id: 'type3', name: 'Medication', icon: 'medical-bag', credit_value: 40 },
  },
];

// Mock reviews for this provider
const mockReviews = [
  {
    id: 'review1',
    user_id: 'user1',
    user_name: 'John D.',
    rating: 5,
    date: '2023-04-15T14:22:00Z',
    content: 'Sarah is amazing with my dog! Very professional and always on time. My dog loves her walks.',
    service_type: { id: 'type1', name: 'Dog Walking', icon: 'dog' },
  },
  {
    id: 'review2',
    user_id: 'user2',
    user_name: 'Lisa M.',
    rating: 4,
    date: '2023-03-20T11:15:00Z',
    content: 'Great pet sitter, my cats were well taken care of while I was away.',
    service_type: { id: 'type2', name: 'Pet Sitting', icon: 'home' },
  },
  {
    id: 'review3',
    user_id: 'user3',
    user_name: 'Robert T.',
    rating: 5,
    date: '2023-03-05T16:40:00Z',
    content: 'Sarah was really good at giving my dog his medication. She's patient and gentle.',
    service_type: { id: 'type3', name: 'Medication', icon: 'medical-bag' },
  },
];

// Route params interface
type ProviderDetailParams = {
  provider: {
    id: string;
    full_name: string;
    profile_image_url?: string | null;
    rating?: number;
    services_count?: number;
    description?: string;
    distance?: number;
    specialties?: { id: string; name: string; icon: string }[];
    is_available?: boolean;
    total_reviews?: number;
    bio?: string;
    experience?: string;
    qualifications?: string[];
  };
};

type ProviderDetailRouteProp = RouteProp<{ ProviderDetail: ProviderDetailParams }, 'ProviderDetail'>;

// Tab content interface
interface TabContentProps {
  services: any[];
  reviews: any[];
  provider: any;
  onServicePress: (service: any) => void;
}

const ProviderDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<ProviderDetailRouteProp>();
  const { width } = useWindowDimensions();
  
  // Get provider from route params
  const { provider } = route.params;
  
  // Add additional provider details that might not be in the route params
  const enhancedProvider = {
    ...provider,
    bio: provider.bio || 'Professional pet caretaker with 5+ years of experience. I specialize in dog walking, pet sitting, and administering medication. I love working with animals and ensuring they receive the best care possible.',
    experience: provider.experience || '5+ years',
    qualifications: provider.qualifications || ['Pet First Aid Certified', 'Dog Training Basics', 'Animal Medication Administration'],
  };
  
  // State
  const [activeTab, setActiveTab] = useState<'services' | 'reviews' | 'about'>('services');
  const [services, setServices] = useState(mockProviderServices);
  const [reviews, setReviews] = useState(mockReviews);
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = 300; // Height of the header section
  
  // Animations
  const headerScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.1, 1],
    extrapolate: 'clamp',
  });
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight / 2, headerHeight],
    outputRange: [1, 0.6, 0],
    extrapolate: 'clamp',
  });
  
  const tabBarTranslateY = scrollY.interpolate({
    inputRange: [0, headerHeight - 50],
    outputRange: [0, -headerHeight + 50],
    extrapolate: 'clamp',
  });
  
  // Generate initials if no profile image
  const initials = enhancedProvider.full_name
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  // Handle service card press
  const handleServicePress = (service: any) => {
    navigation.navigate('ServiceDetail', { service });
  };
  
  // Handle contact provider
  const handleContactProvider = () => {
    navigation.navigate('Messages', {
      screen: 'ChatDetail',
      params: {
        contactId: enhancedProvider.id,
        contactName: enhancedProvider.full_name,
      },
    });
  };
  
  // Render star rating
  const renderStarRating = (rating: number) => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <MaterialCommunityIcons
            key={star}
            name={rating >= star ? 'star' : star - rating < 1 ? 'star-half-full' : 'star-outline'}
            size={18}
            color="#FFB400"
            style={{ marginRight: 2 }}
          />
        ))}
      </View>
    );
  };
  
  // Render reviews
  const renderReview = (review: any, index: number) => (
    <View key={review.id} style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewUser}>
          <View style={styles.reviewUserAvatar}>
            <Text style={styles.reviewUserInitial}>
              {review.user_name.charAt(0)}
            </Text>
          </View>
          <View>
            <Text style={styles.reviewUserName}>{review.user_name}</Text>
            <Text style={styles.reviewDate}>
              {new Date(review.date).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={styles.reviewServiceType}>
          <MaterialCommunityIcons
            name={review.service_type.icon}
            size={14}
            color={theme.colors.primary}
          />
          <Text style={styles.reviewServiceTypeName}>
            {review.service_type.name}
          </Text>
        </View>
      </View>
      <View style={styles.reviewRating}>
        {renderStarRating(review.rating)}
      </View>
      <Text style={styles.reviewContent}>{review.content}</Text>
      
      {index < reviews.length - 1 && <View style={styles.reviewDivider} />}
    </View>
  );
  
  // Tab content components
  const ServiceTabContent: React.FC<TabContentProps> = ({ services, onServicePress }) => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Available Services</Text>
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onPress={() => onServicePress(service)}
        />
      ))}
    </View>
  );
  
  const ReviewsTabContent: React.FC<TabContentProps> = ({ reviews, provider }) => (
    <View style={styles.tabContent}>
      <View style={styles.ratingOverviewCard}>
        <View style={styles.ratingOverviewHeader}>
          <Text style={styles.ratingOverviewTitle}>Rating Overview</Text>
          <View style={styles.ratingOverviewValue}>
            <Text style={styles.ratingValue}>{provider.rating?.toFixed(1) || '5.0'}</Text>
            <View style={styles.ratingStarsSmall}>
              {renderStarRating(provider.rating || 5)}
            </View>
          </View>
        </View>
        <Text style={styles.totalReviews}>
          Based on {provider.total_reviews || reviews.length} reviews
        </Text>
      </View>
      
      <Text style={styles.sectionTitle}>Client Reviews</Text>
      {reviews.map((review, index) => renderReview(review, index))}
    </View>
  );
  
  const AboutTabContent: React.FC<TabContentProps> = ({ provider }) => (
    <View style={styles.tabContent}>
      <View style={styles.aboutSection}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bioText}>{provider.bio}</Text>
      </View>
      
      <View style={styles.aboutSection}>
        <Text style={styles.sectionTitle}>Experience</Text>
        <Text style={styles.experienceText}>{provider.experience}</Text>
      </View>
      
      <View style={styles.aboutSection}>
        <Text style={styles.sectionTitle}>Qualifications</Text>
        {provider.qualifications?.map((qualification: string, index: number) => (
          <View key={index} style={styles.qualificationItem}>
            <MaterialCommunityIcons name="check-circle" size={18} color={theme.colors.primary} />
            <Text style={styles.qualificationText}>{qualification}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.aboutSection}>
        <Text style={styles.sectionTitle}>Specialties</Text>
        <View style={styles.specialtiesContainer}>
          {provider.specialties?.map((specialty) => (
            <View key={specialty.id} style={styles.specialtyBadge}>
              <MaterialCommunityIcons name={specialty.icon as any} size={16} color={theme.colors.primary} />
              <Text style={styles.specialtyText}>{specialty.name}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.aboutSection}>
        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.locationInfo}>
          <MaterialCommunityIcons name="map-marker" size={18} color={theme.colors.primary} />
          <Text style={styles.locationText}>
            {provider.distance ? `${provider.distance.toFixed(1)} miles from your location` : 'Distance information not available'}
          </Text>
        </View>
      </View>
    </View>
  );
  
  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'services':
        return (
          <ServiceTabContent
            services={services}
            reviews={reviews}
            provider={enhancedProvider}
            onServicePress={handleServicePress}
          />
        );
      case 'reviews':
        return (
          <ReviewsTabContent
            services={services}
            reviews={reviews}
            provider={enhancedProvider}
            onServicePress={handleServicePress}
          />
        );
      case 'about':
        return (
          <AboutTabContent
            services={services}
            reviews={reviews}
            provider={enhancedProvider}
            onServicePress={handleServicePress}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ scale: headerScale }],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(108, 99, 255, 0.1)', 'rgba(108, 99, 255, 0.05)']}
          style={styles.headerGradient}
        >
          <View style={styles.profileImageContainer}>
            {enhancedProvider.profile_image_url ? (
              <Image
                source={{ uri: enhancedProvider.profile_image_url }}
                style={styles.profileImage}
              />
            ) : (
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.initialsContainer}
              >
                <Text style={styles.initials}>{initials}</Text>
              </LinearGradient>
            )}
          </View>
          
          <Text style={styles.providerName}>{enhancedProvider.full_name}</Text>
          
          <View style={styles.ratingContainer}>
            {renderStarRating(enhancedProvider.rating || 5)}
            <Text style={styles.ratingText}>
              {enhancedProvider.rating?.toFixed(1) || '5.0'} ({enhancedProvider.total_reviews || reviews.length})
            </Text>
          </View>
          
          <View style={styles.badgesContainer}>
            {enhancedProvider.is_available && (
              <View style={styles.availableBadge}>
                <MaterialCommunityIcons name="clock-outline" size={14} color="#4CAF50" />
                <Text style={styles.availableText}>Available Now</Text>
              </View>
            )}
            
            {enhancedProvider.specialties && enhancedProvider.specialties.length > 0 && (
              <View style={styles.specialtiesBadge}>
                <MaterialCommunityIcons name="briefcase-check-outline" size={14} color={theme.colors.primary} />
                <Text style={styles.specialtiesText}>
                  {enhancedProvider.specialties.length} Specialties
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </Animated.View>
      
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      
      {/* Animated Tab Bar */}
      <Animated.View
        style={[
          styles.tabBar,
          {
            width,
            transform: [{ translateY: tabBarTranslateY }],
          },
        ]}
      >
        <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.tabBarContent}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'services' && styles.activeTab]}
            onPress={() => setActiveTab('services')}
          >
            <MaterialCommunityIcons
              name="briefcase-outline"
              size={20}
              color={activeTab === 'services' ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'services' && styles.activeTabText,
              ]}
            >
              Services
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
            onPress={() => setActiveTab('reviews')}
          >
            <MaterialCommunityIcons
              name="star-outline"
              size={20}
              color={activeTab === 'reviews' ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'reviews' && styles.activeTabText,
              ]}
            >
              Reviews
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'about' && styles.activeTab]}
            onPress={() => setActiveTab('about')}
          >
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color={activeTab === 'about' ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'about' && styles.activeTabText,
              ]}
            >
              About
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      {/* Main Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Spacer for header */}
        <View style={{ height: headerHeight }} />
        
        {/* Tab Content */}
        {renderTabContent()}
        
        {/* Bottom Padding for Contact Button */}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>
      
      {/* Contact Provider Button */}
      <View style={styles.contactButtonContainer}>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleContactProvider}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            style={styles.contactButtonGradient}
          >
            <MaterialCommunityIcons name="message" size={20} color="white" />
            <Text style={styles.contactButtonText}>Contact Provider</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    zIndex: 10,
    overflow: 'hidden',
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'white',
  },
  initialsContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  initials: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  providerName: {
    ...theme.typography.h1,
    fontSize: 28,
    marginBottom: 8,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  starContainer: {
    flexDirection: 'row',
  },
  ratingText: {
    ...theme.typography.body,
    marginLeft: 8,
    color: theme.colors.textSecondary,
  },
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  availableText: {
    ...theme.typography.caption,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 4,
  },
  specialtiesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  specialtiesText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 16,
    left: 16,
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.elevation.small,
  },
  tabBar: {
    position: 'absolute',
    top: 300, // Start position at the bottom of the header
    left: 0,
    height: 60,
    zIndex: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  tabBarContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    ...theme.typography.body,
    marginLeft: 4,
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    fontWeight: '600',
    color: theme.colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 32,
  },
  tabContent: {
    padding: 16,
    paddingTop: 32,
  },
  sectionTitle: {
    ...theme.typography.h2,
    marginBottom: 16,
  },
  contactButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  contactButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  contactButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  contactButtonText: {
    ...theme.typography.button,
    color: 'white',
    marginLeft: 8,
  },
  ratingOverviewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    ...theme.elevation.small,
  },
  ratingOverviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingOverviewTitle: {
    ...theme.typography.h3,
  },
  ratingOverviewValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    ...theme.typography.h2,
    marginRight: 8,
    color: theme.colors.text,
  },
  ratingStarsSmall: {
    flexDirection: 'row',
  },
  totalReviews: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  reviewItem: {
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewUserInitial: {
    ...theme.typography.body,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  reviewUserName: {
    ...theme.typography.body,
    fontWeight: '600',
  },
  reviewDate: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
  },
  reviewServiceType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  reviewServiceTypeName: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    marginLeft: 4,
  },
  reviewRating: {
    marginBottom: 8,
  },
  reviewContent: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 20,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginTop: 16,
  },
  aboutSection: {
    marginBottom: 24,
  },
  bioText: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 22,
  },
  experienceText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  qualificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  qualificationText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginLeft: 8,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specialtyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  specialtyText: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.primary,
    marginLeft: 4,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    ...theme.typography.body,
    marginLeft: 8,
    color: theme.colors.text,
  },
});

export default ProviderDetailScreen;