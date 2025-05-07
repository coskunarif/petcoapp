import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface SearchBarProps {
  onSearch?: (text: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [searchText, setSearchText] = useState('');
  
  const handleChangeText = (text: string) => {
    setSearchText(text);
    if (onSearch) {
      onSearch(text);
    }
  };
  
  const handleClear = () => {
    setSearchText('');
    if (onSearch) {
      onSearch('');
    }
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
          placeholder="Search conversations..."
          placeholderTextColor={theme.colors.textTertiary}
          value={searchText}
          onChangeText={handleChangeText}
          style={styles.input}
          returnKeyType="search"
        />
        
        {searchText.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
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
