import React from 'react';
import { StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import { theme, globalStyles } from '../../theme';

interface AddPetFABProps {
  onPress: () => void;
}

const AddPetFAB: React.FC<AddPetFABProps> = ({ onPress }) => {
  try {
    return (
      <FAB
        style={[globalStyles.fab, styles.fab]}
        icon="plus"
        onPress={onPress}
        color="white"
        accessibilityLabel="Add a new pet"
      />
    );
  } catch (error) {
    console.error('[AddPetFAB] Error rendering FAB:', error);
    return null;
  }
};

const styles = StyleSheet.create({
  fab: {
    backgroundColor: theme.colors.primary,
    position: 'absolute',
    right: 24,
    bottom: 24,
  },
});

export default AddPetFAB;
