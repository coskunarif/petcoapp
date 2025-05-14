import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';

// Interface for route params
interface CareInstructionsParams {
  pet: {
    id: string;
    name: string;
    careInstructions?: string;
  };
  onSave: (careInstructions: string) => void;
}

// Types for navigation
type CareInstructionsNavigationProp = StackNavigationProp<any, 'CareInstructions'>;
type CareInstructionsRouteProp = RouteProp<{ CareInstructions: CareInstructionsParams }, 'CareInstructions'>;

interface CareInstructionsScreenProps {
  navigation: CareInstructionsNavigationProp;
  route: CareInstructionsRouteProp;
}

const CareInstructionsScreen: React.FC<CareInstructionsScreenProps> = ({ navigation, route }) => {
  const { pet, onSave } = route.params;
  
  // State for care instructions
  const [careInstructions, setCareInstructions] = useState(pet.careInstructions || '');
  
  // Count characters
  const charCount = careInstructions.length;
  const maxLength = 1000;
  
  // Handle saving instructions
  const handleSave = () => {
    // Validate if needed
    if (charCount > maxLength) {
      Alert.alert(
        'Too Long',
        `Care instructions cannot exceed ${maxLength} characters.`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Call the onSave callback
    onSave(careInstructions);
    
    // Navigate back
    navigation.goBack();
  };
  
  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['rgba(236, 240, 253, 0.8)', 'rgba(252, 252, 252, 0.8)']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Content */}
      <SafeAreaView style={styles.safeArea}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{pet.name}'s Care Instructions</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Instructions Form */}
          <View style={styles.formContainer}>
            <Text style={styles.label}>Care Instructions</Text>
            <Text style={styles.subtitle}>
              Add special care requirements, feeding instructions, allergies, medication details, or other important information.
            </Text>
            
            <TextInput
              style={styles.textArea}
              value={careInstructions}
              onChangeText={setCareInstructions}
              placeholder="Enter care instructions here..."
              placeholderTextColor={theme.colors.textTertiary}
              multiline
              numberOfLines={Platform.OS === 'ios' ? undefined : 10}
              textAlignVertical="top"
              maxLength={maxLength}
            />
            
            <Text style={[
              styles.charCounter,
              charCount > maxLength && styles.charCounterError
            ]}>
              {charCount}/{maxLength}
            </Text>
          </View>
          
          {/* Care Instruction Templates */}
          <View style={styles.templatesContainer}>
            <Text style={styles.sectionTitle}>Suggested Templates</Text>
            
            {careTemplates.map((template, index) => (
              <TouchableOpacity
                key={index}
                style={styles.templateItem}
                onPress={() => setCareInstructions(current => 
                  current ? `${current}\n\n${template.content}` : template.content
                )}
              >
                <View style={styles.templateHeader}>
                  <MaterialCommunityIcons name={template.icon} size={20} color={theme.colors.primary} />
                  <Text style={styles.templateTitle}>{template.title}</Text>
                </View>
                <Text style={styles.templatePreview} numberOfLines={2}>
                  {template.content}
                </Text>
                <Text style={styles.templateAddText}>Tap to add</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        
        {/* Save Button */}
        <View style={styles.footerContainer}>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              style={styles.saveButtonGradient}
            >
              <Text style={styles.saveButtonText}>Save Instructions</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

// Template care instructions
const careTemplates = [
  {
    title: 'Feeding Schedule',
    icon: 'food' as const,
    content: '- Morning: 1/2 cup dry food at 8am\n- Evening: 1/2 cup dry food at 6pm\n- Fresh water available at all times\n- Treats limited to two per day'
  },
  {
    title: 'Medication',
    icon: 'medical-bag' as const,
    content: '- Heartguard: Once monthly, with food\n- Allergy medication: 1/2 tablet daily with breakfast\n- Joint supplement: One chewable tablet with dinner'
  },
  {
    title: 'Allergies',
    icon: 'alert-circle-outline' as const,
    content: '- Food allergies: Chicken, wheat, corn\n- Environmental allergies: Grass, pollen\n- Avoid treats containing chicken or wheat products'
  },
  {
    title: 'Exercise Needs',
    icon: 'run-fast' as const,
    content: '- Daily walks: 30 minutes, morning and evening\n- Playtime: 15-20 minutes of fetch or tug-of-war\n- Avoid exercising during hot parts of the day'
  },
  {
    title: 'Special Needs',
    icon: 'heart-pulse' as const,
    content: '- Separation anxiety: Leave TV or radio on when away\n- Prefers quieter environments\n- Needs 10-15 minutes to warm up to new people\n- Afraid of loud noises, especially thunderstorms'
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  headerTitle: {
    ...theme.typography.h2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.lg,
    ...theme.elevation.small,
  },
  label: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  textArea: {
    minHeight: 200,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: theme.borderRadius.small,
    padding: theme.spacing.md,
    ...theme.typography.body,
    textAlignVertical: 'top',
  },
  charCounter: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
  charCounterError: {
    color: theme.colors.error,
  },
  templatesContainer: {
    marginTop: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
  },
  templateItem: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.elevation.small,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  templateTitle: {
    ...theme.typography.h4,
    marginLeft: theme.spacing.sm,
  },
  templatePreview: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  templateAddText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    textAlign: 'right',
    fontWeight: '600',
  },
  footerContainer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  saveButton: {
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    ...theme.elevation.small,
  },
  saveButtonGradient: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    ...theme.typography.button,
    color: 'white',
    fontWeight: '700',
  },
});

export default CareInstructionsScreen;