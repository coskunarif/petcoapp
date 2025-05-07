import React, { useState } from 'react';
import { 
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

// Filter types with icons for different categories
const FILTER_TYPES = [
  { id: 'all', label: 'All', icon: 'chat-outline' },
  { id: 'unread', label: 'Unread', icon: 'alert-circle-outline' },
  { id: 'walking', label: 'Walking', icon: 'walk' },
  { id: 'sitting', label: 'Pet Sitting', icon: 'home-outline' },
  { id: 'grooming', label: 'Grooming', icon: 'scissors-cutting' },
  { id: 'training', label: 'Training', icon: 'school-outline' },
  { id: 'veterinary', label: 'Veterinary', icon: 'medical-bag' },
];

interface ConversationFiltersProps {
  onFilterChange?: (filterId: string) => void;
}

const ConversationFilters = ({ onFilterChange }: ConversationFiltersProps) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  const handleFilterPress = (filterId: string) => {
    setSelectedFilter(filterId);
    if (onFilterChange) {
      onFilterChange(filterId);
    }
  };
  
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTER_TYPES.map((filter) => {
          const isSelected = selectedFilter === filter.id;
          
          return (
            <TouchableOpacity
              key={filter.id}
              onPress={() => handleFilterPress(filter.id)}
              style={styles.filterButton}
            >
              {isSelected ? (
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryDark]}
                  style={styles.selectedFilter}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialCommunityIcons
                    name={filter.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                    size={16}
                    color="#fff"
                    style={styles.filterIcon}
                  />
                  <Text style={styles.selectedFilterText}>{filter.label}</Text>
                </LinearGradient>
              ) : (
                <BlurView intensity={60} tint="light" style={styles.filter}>
                  <MaterialCommunityIcons
                    name={filter.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                    size={16}
                    color={theme.colors.primary}
                    style={styles.filterIcon}
                  />
                  <Text style={styles.filterText}>{filter.label}</Text>
                </BlurView>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  filterButton: {
    marginRight: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  filter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  selectedFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  filterIcon: {
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  selectedFilterText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});

export default ConversationFilters;
