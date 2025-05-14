import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { theme } from '../../theme';
import { ServiceType } from '../../types/services';

interface ServiceTypeSelectorProps {
  serviceTypes: ServiceType[];
  selectedTypeId: string | undefined;
  onSelectType: (typeId: string) => void;
  error?: string;
}

/**
 * A visually appealing service type selector component with grid layout
 * and animated cards for each service type
 */
export default function ServiceTypeSelector({
  serviceTypes,
  selectedTypeId,
  onSelectType,
  error
}: ServiceTypeSelectorProps) {
  // Define how many columns based on screen width
  const screenWidth = Dimensions.get('window').width;
  const numColumns = screenWidth > 500 ? 3 : 2;
  
  // If no service types, show empty state
  if (!serviceTypes || serviceTypes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No service types available</Text>
      </View>
    );
  }

  // Get icon name from service type or a default
  const getIconName = (serviceType: ServiceType): string => {
    // Return the service type icon if it exists, or a default icon
    return serviceType.icon || 'paw';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Service Type</Text>
      
      <ScrollView 
        horizontal={false} 
        showsVerticalScrollIndicator={false}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.typesGrid}>
          {serviceTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeCard,
                selectedTypeId === type.id && styles.selectedTypeCard
              ]}
              onPress={() => onSelectType(type.id)}
              activeOpacity={0.7}
            >
              <BlurView 
                intensity={75} 
                tint="light" 
                style={styles.cardBlur}
              >
                <LinearGradient
                  colors={
                    selectedTypeId === type.id
                      ? [theme.colors.primary, theme.colors.primaryDark]
                      : ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.8)']
                  }
                  style={styles.cardGradient}
                >
                  <View style={styles.iconContainer}>
                    <LinearGradient
                      colors={
                        selectedTypeId === type.id
                          ? ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']
                          : ['rgba(108, 99, 255, 0.2)', 'rgba(108, 99, 255, 0.05)']
                      }
                      style={styles.iconGradient}
                    >
                      <MaterialCommunityIcons
                        name={getIconName(type) as keyof typeof MaterialCommunityIcons.glyphMap}
                        size={26}
                        color={selectedTypeId === type.id ? '#FFFFFF' : theme.colors.primary}
                      />
                    </LinearGradient>
                  </View>
                  
                  <Text 
                    style={[
                      styles.typeName,
                      selectedTypeId === type.id && styles.selectedTypeName
                    ]}
                    numberOfLines={2}
                  >
                    {type.name}
                  </Text>
                  
                  <View style={styles.priceContainer}>
                    <MaterialCommunityIcons
                      name="currency-usd"
                      size={14}
                      color={selectedTypeId === type.id ? 'rgba(255,255,255,0.9)' : theme.colors.textSecondary}
                    />
                    <Text 
                      style={[
                        styles.priceText,
                        selectedTypeId === type.id && styles.selectedPriceText
                      ]}
                    >
                      {type.credit_value || '30'} credits
                    </Text>
                  </View>
                  
                  {selectedTypeId === type.id && (
                    <View style={styles.selectedCheck}>
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={20}
                        color="#FFFFFF"
                      />
                    </View>
                  )}
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      {error && (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={16} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  scrollContainer: {
    maxHeight: 260,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -6,
  },
  typeCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    ...theme.elevation.small,
  },
  selectedTypeCard: {
    ...theme.elevation.medium,
  },
  cardBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  cardGradient: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    height: 140,
    justifyContent: 'space-between',
  },
  iconContainer: {
    marginBottom: 8,
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.elevation.small,
  },
  typeName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    height: 40,
    maxWidth: '100%',
  },
  selectedTypeName: {
    color: '#FFFFFF',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  selectedPriceText: {
    color: 'rgba(255,255,255,0.9)',
  },
  selectedCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  emptyContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.08)',
    borderRadius: 5,
    padding: 10,
    marginTop: 4,
  },
  errorText: {
    color: theme.colors.error,
    marginLeft: 8,
    fontSize: 14,
  },
});