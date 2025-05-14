import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Platform 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../theme';

interface ServiceFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onFilterPress: () => void;
  onSearchSubmit: () => void;
  activeFilters?: {
    serviceType?: string;
    price?: [number, number];
    rating?: number;
  }
}

export default function ServiceFilterBar({
  searchValue,
  onSearchChange,
  onFilterPress,
  onSearchSubmit,
  activeFilters
}: ServiceFilterBarProps) {
  // Count active filters for badge
  const activeFilterCount = Object.values(activeFilters || {}).filter(Boolean).length;
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons 
          name="magnify" 
          size={22} 
          color={theme.colors.textSecondary} 
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Search services..."
          placeholderTextColor={theme.colors.textTertiary}
          style={styles.searchInput}
          value={searchValue}
          onChangeText={onSearchChange}
          onSubmitEditing={onSearchSubmit}
          returnKeyType="search"
        />
        {searchValue.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => onSearchChange('')}
          >
            <MaterialCommunityIcons 
              name="close-circle" 
              size={18} 
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.filterButton}
        onPress={onFilterPress}
        accessible={true}
        accessibilityLabel="Filter services"
        accessibilityRole="button"
      >
        <MaterialCommunityIcons 
          name="filter-variant" 
          size={22} 
          color={activeFilterCount > 0 ? theme.colors.primary : theme.colors.textSecondary} 
        />
        {activeFilterCount > 0 && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    ...theme.elevation.small,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    color: theme.colors.text,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    ...theme.elevation.small,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
});
