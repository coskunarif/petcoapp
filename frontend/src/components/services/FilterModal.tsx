import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ServiceType } from '../../types/services';
import Slider from '@react-native-community/slider';

const { height } = Dimensions.get('window');

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  serviceTypes: ServiceType[];
  initialFilters: {
    serviceType?: string;
    priceRange?: [number, number];
    rating?: number;
    distance?: number;
  };
  onApplyFilters: (filters: {
    serviceType?: string;
    priceRange?: [number, number];
    rating?: number;
    distance?: number;
  }) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  serviceTypes,
  initialFilters,
  onApplyFilters,
}) => {
  // Animation value for modal slide up
  const [slideAnim] = useState(new Animated.Value(height));
  
  // Filter states
  const [selectedServiceType, setSelectedServiceType] = useState<string | undefined>(
    initialFilters.serviceType
  );
  
  const [priceRange, setPriceRange] = useState<[number, number]>(
    initialFilters.priceRange || [0, 100]
  );
  
  const [rating, setRating] = useState<number>(
    initialFilters.rating || 0
  );
  
  const [distance, setDistance] = useState<number>(
    initialFilters.distance || 10
  );
  
  // Reset filters when modal becomes visible with initial filters
  useEffect(() => {
    if (visible) {
      setSelectedServiceType(initialFilters.serviceType);
      setPriceRange(initialFilters.priceRange || [0, 100]);
      setRating(initialFilters.rating || 0);
      setDistance(initialFilters.distance || 10);
    }
  }, [visible, initialFilters]);
  
  // Handle animation when visibility changes
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 9,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);
  
  // Calculate modal content height
  const modalHeight = height * 0.8;
  
  // Apply filters
  const handleApplyFilters = () => {
    onApplyFilters({
      serviceType: selectedServiceType,
      priceRange,
      rating: rating > 0 ? rating : undefined,
      distance: distance !== 10 ? distance : undefined,
    });
    onClose();
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    setSelectedServiceType(undefined);
    setPriceRange([0, 100]);
    setRating(0);
    setDistance(10);
  };
  
  // Handle selecting a rating
  const renderRatingOptions = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity
        key={star}
        style={[
          styles.ratingOption,
          rating === star && styles.ratingOptionSelected,
        ]}
        onPress={() => setRating(star === rating ? 0 : star)}
      >
        <MaterialCommunityIcons
          name={rating >= star ? 'star' : 'star-outline'}
          size={24}
          color={rating >= star ? theme.colors.primary : theme.colors.textSecondary}
        />
        <Text
          style={[
            styles.ratingText,
            rating === star && styles.ratingTextSelected,
          ]}
        >
          {star}+
        </Text>
      </TouchableOpacity>
    ));
  };
  
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <BlurView intensity={Platform.OS === 'ios' ? 40 : 60} style={StyleSheet.absoluteFill} tint="dark" />
          
          {/* Content container with animation */}
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.contentContainer,
                { 
                  height: modalHeight,
                  transform: [{ translateY: slideAnim }],
                }
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleResetFilters}
                >
                  <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>
                
                <Text style={styles.headerTitle}>Filter Services</Text>
                
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                >
                  <MaterialCommunityIcons name="close" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              {/* Filter content */}
              <ScrollView style={styles.scrollContent}>
                {/* Service Type Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Service Type</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.serviceTypeContainer}
                  >
                    <TouchableOpacity
                      style={[
                        styles.serviceTypeChip,
                        selectedServiceType === undefined && styles.serviceTypeChipSelected,
                      ]}
                      onPress={() => setSelectedServiceType(undefined)}
                    >
                      <MaterialCommunityIcons
                        name="apps"
                        size={20}
                        color={selectedServiceType === undefined ? 'white' : theme.colors.primary}
                      />
                      <Text
                        style={[
                          styles.serviceTypeText,
                          selectedServiceType === undefined && styles.serviceTypeTextSelected,
                        ]}
                      >
                        All Types
                      </Text>
                    </TouchableOpacity>
                    
                    {serviceTypes.map(type => (
                      <TouchableOpacity
                        key={type.id}
                        style={[
                          styles.serviceTypeChip,
                          selectedServiceType === type.id && styles.serviceTypeChipSelected,
                        ]}
                        onPress={() => setSelectedServiceType(
                          selectedServiceType === type.id ? undefined : type.id
                        )}
                      >
                        <MaterialCommunityIcons
                          name={type.icon as any}
                          size={20}
                          color={selectedServiceType === type.id ? 'white' : theme.colors.primary}
                        />
                        <Text
                          style={[
                            styles.serviceTypeText,
                            selectedServiceType === type.id && styles.serviceTypeTextSelected,
                          ]}
                        >
                          {type.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                {/* Price Range Filter */}
                <View style={styles.filterSection}>
                  <View style={styles.filterSectionHeader}>
                    <Text style={styles.filterSectionTitle}>Price Range (Credits)</Text>
                    <Text style={styles.priceRangeText}>
                      {priceRange[0]} - {priceRange[1]}
                    </Text>
                  </View>
                  
                  <View style={styles.sliderContainer}>
                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={100}
                      step={5}
                      value={priceRange[0]}
                      onValueChange={(value) => setPriceRange([value, Math.max(value, priceRange[1])])}
                      minimumTrackTintColor={theme.colors.primaryLight}
                      maximumTrackTintColor={theme.colors.textTertiary}
                      thumbTintColor={theme.colors.primary}
                    />
                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={100}
                      step={5}
                      value={priceRange[1]}
                      onValueChange={(value) => setPriceRange([Math.min(value, priceRange[0]), value])}
                      minimumTrackTintColor={theme.colors.primaryLight}
                      maximumTrackTintColor={theme.colors.textTertiary}
                      thumbTintColor={theme.colors.primary}
                    />
                    
                    <View style={styles.sliderLabels}>
                      <Text style={styles.sliderLabel}>0</Text>
                      <Text style={styles.sliderLabel}>50</Text>
                      <Text style={styles.sliderLabel}>100</Text>
                    </View>
                  </View>
                </View>
                
                {/* Rating Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Minimum Rating</Text>
                  <View style={styles.ratingContainer}>
                    {renderRatingOptions()}
                  </View>
                </View>
                
                {/* Distance Filter */}
                <View style={styles.filterSection}>
                  <View style={styles.filterSectionHeader}>
                    <Text style={styles.filterSectionTitle}>Maximum Distance</Text>
                    <Text style={styles.distanceText}>{distance} miles</Text>
                  </View>
                  
                  <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={50}
                    step={1}
                    value={distance}
                    onValueChange={setDistance}
                    minimumTrackTintColor={theme.colors.primaryLight}
                    maximumTrackTintColor={theme.colors.textTertiary}
                    thumbTintColor={theme.colors.primary}
                  />
                  
                  <View style={styles.sliderLabels}>
                    <Text style={styles.sliderLabel}>1 mi</Text>
                    <Text style={styles.sliderLabel}>25 mi</Text>
                    <Text style={styles.sliderLabel}>50 mi</Text>
                  </View>
                </View>
              </ScrollView>
              
              {/* Apply button */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={handleApplyFilters}
                >
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  contentContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerTitle: {
    ...theme.typography.h2,
    fontSize: 20,
  },
  resetButton: {
    padding: theme.spacing.sm,
  },
  resetText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  scrollContent: {
    flex: 1,
  },
  filterSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  filterSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  filterSectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
  },
  serviceTypeContainer: {
    flexDirection: 'row',
    paddingBottom: theme.spacing.sm,
  },
  serviceTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderRadius: 20,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
  },
  serviceTypeChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: 'transparent',
  },
  serviceTypeText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  serviceTypeTextSelected: {
    color: 'white',
  },
  sliderContainer: {
    marginBottom: theme.spacing.md,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
  },
  sliderLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  priceRangeText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  distanceText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
  },
  ratingOption: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.medium,
  },
  ratingOptionSelected: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
  },
  ratingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  ratingTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  applyButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default FilterModal;