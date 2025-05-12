import React from 'react';
import { 
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

// Filter types with icons for different categories
const FILTER_TYPES = [
  { id: null, label: 'All', icon: 'chat-outline' },
  { id: 'pet_sitting', label: 'Pet Sitting', icon: 'dog-side' },
  { id: 'grooming', label: 'Grooming', icon: 'scissors-cutting' },
  { id: 'walking', label: 'Walking', icon: 'walk' },
  { id: 'training', label: 'Training', icon: 'school-outline' },
  { id: 'veterinary', label: 'Veterinary', icon: 'medical-bag' },
  { id: 'service_request', label: 'Requests', icon: 'handshake' },
];

interface ConversationFiltersProps {
  showArchived?: boolean;
  serviceFilter: string | null;
  onFilterChange: (filterType: 'showArchived' | 'serviceRequestFilter', value: boolean | string | null) => void;
}

const ConversationFilters = ({ 
  showArchived = false, 
  serviceFilter = null, 
  onFilterChange 
}: ConversationFiltersProps) => {
  
  const handleServiceFilterPress = (filterId: string | null) => {
    onFilterChange('serviceRequestFilter', filterId);
  };
  
  const handleArchivedToggle = () => {
    onFilterChange('showArchived', !showArchived);
  };
  
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTER_TYPES.map((filter) => {
          const isSelected = serviceFilter === filter.id;
          
          return (
            <TouchableOpacity
              key={filter.id || 'all'}
              onPress={() => handleServiceFilterPress(filter.id)}
              style={styles.filterButton}
              activeOpacity={0.8}
            >
              {isSelected ? (
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryDark]}
                  style={styles.selectedFilter}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialCommunityIcons
                    name={filter.icon as any}
                    size={16}
                    color="#fff"
                    style={styles.filterIcon}
                  />
                  <Text style={styles.selectedFilterText}>{filter.label}</Text>
                </LinearGradient>
              ) : (
                <BlurView intensity={60} tint="light" style={styles.filter}>
                  <MaterialCommunityIcons
                    name={filter.icon as any}
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
        
        {/* Archive Toggle */}
        <TouchableOpacity
          onPress={handleArchivedToggle}
          style={[styles.filterButton, styles.archiveButton]}
          activeOpacity={0.8}
        >
          <BlurView 
            intensity={60} 
            tint="light" 
            style={[
              styles.filter, 
              showArchived && styles.archiveActive
            ]}
          >
            <MaterialCommunityIcons
              name="archive-outline"
              size={16}
              color={showArchived ? "#fff" : theme.colors.textSecondary}
              style={styles.filterIcon}
            />
            <Text 
              style={[
                styles.filterText,
                showArchived && styles.archiveActiveText
              ]}
            >
              Archived
            </Text>
          </BlurView>
        </TouchableOpacity>
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
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
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
  archiveButton: {
    marginLeft: 2,
  },
  archiveActive: {
    backgroundColor: 'rgba(108, 99, 255, 0.9)',
    borderColor: 'rgba(108, 99, 255, 0.9)',
  },
  archiveActiveText: {
    color: '#fff',
    fontWeight: '700',
  }
});

export default ConversationFilters;