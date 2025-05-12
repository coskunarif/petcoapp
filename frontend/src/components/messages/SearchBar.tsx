import React from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity,
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const SearchBar = ({ value, onChangeText, placeholder = "Search conversations..." }: SearchBarProps) => {
  const handleClear = () => {
    onChangeText('');
  };
  
  return (
    <View style={styles.container}>
      <BlurView intensity={70} tint="light" style={styles.searchContainer}>
        <MaterialCommunityIcons 
          name="magnify" 
          size={20} 
          color={theme.colors.textTertiary} 
          style={styles.searchIcon}
        />
        
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          style={styles.input}
          returnKeyType="search"
        />
        
        {value.length > 0 && (
          <TouchableOpacity 
            onPress={handleClear} 
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}  
          >
            <MaterialCommunityIcons
              name="close-circle"
              size={18}
              color={theme.colors.textTertiary}
            />
          </TouchableOpacity>
        )}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    overflow: 'hidden',
    paddingHorizontal: theme.spacing.md,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: 12,
  },
  clearButton: {
    padding: 6,
  },
});

export default SearchBar;