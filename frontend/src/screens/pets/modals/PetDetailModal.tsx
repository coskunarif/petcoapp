import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  Image
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../theme';
import { AppButton } from '../../../components/ui';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  care_instructions: string;
  image_url: string;
}

interface PetDetailModalProps {
  visible: boolean;
  onClose: () => void;
  pet: Pet;
  onEdit: () => void;
}

const PetDetailModal: React.FC<PetDetailModalProps> = ({ 
  visible, 
  onClose, 
  pet,
  onEdit
}) => {
  const getSpeciesIcon = (species: string) => {
    switch(species.toLowerCase()) {
      case 'dog': return 'dog';
      case 'cat': return 'cat';
      case 'bird': return 'bird';
      case 'fish': return 'fish';
      case 'rabbit': return 'rabbit';
      case 'hamster':
      case 'guinea pig':
      case 'rodent': return 'rodent';
      default: return 'paw';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color={theme.colors.textTertiary} />
          </TouchableOpacity>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Pet Image */}
            <View style={styles.imageContainer}>
              {pet.image_url ? (
                <Image source={{ uri: pet.image_url }} style={styles.petImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <MaterialCommunityIcons 
                    name={getSpeciesIcon(pet.species)} 
                    size={80} 
                    color={theme.colors.primary} 
                  />
                </View>
              )}
            </View>
            
            {/* Pet Header */}
            <View style={styles.petHeader}>
              <Text style={styles.petName}>{pet.name}</Text>
              
              <View style={styles.speciesContainer}>
                <MaterialCommunityIcons 
                  name={getSpeciesIcon(pet.species)} 
                  size={20} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.speciesText}>
                  {pet.species} • {pet.breed || 'Mixed'}
                </Text>
              </View>
            </View>
            
            {/* Pet Details */}
            <View style={styles.detailsCard}>
              <Text style={styles.sectionTitle}>Details</Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Age</Text>
                <Text style={styles.detailValue}>
                  {pet.age ? `${pet.age} ${pet.age === 1 ? 'year' : 'years'}` : 'Not specified'}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Weight</Text>
                <Text style={styles.detailValue}>
                  {pet.weight ? `${pet.weight} kg` : 'Not specified'}
                </Text>
              </View>
            </View>
            
            {/* Care Instructions */}
            {pet.care_instructions ? (
              <View style={styles.careCard}>
                <Text style={styles.sectionTitle}>Care Instructions</Text>
                <Text style={styles.careInstructions}>{pet.care_instructions}</Text>
              </View>
            ) : null}
            
            {/* Actions */}
            <View style={styles.actionButtons}>
              <AppButton
                title="Edit Pet Profile"
                mode="primary"
                icon={<MaterialCommunityIcons name="pencil" size={16} color="white" />}
                onPress={onEdit}
                style={styles.editButton}
              />
              
              <AppButton
                title="Request Service for This Pet"
                mode="outline"
                onPress={() => {
                  onClose();
                  // Navigate to request service with this pet pre-selected
                }}
                style={styles.requestButton}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  closeButton: {
    position: 'absolute',
    right: 24,
    top: 24,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  petImage: {
    width: 200,
    height: 200,
    borderRadius: 20,
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  petName: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.h1.fontWeight,
    color: theme.typography.h1.color,
    marginBottom: 8,
  },
  speciesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speciesText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  detailsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.typography.h3.color,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailLabel: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  detailValue: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  careCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: 16,
    marginBottom: 16,
  },
  careInstructions: {
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 24,
    backgroundColor: theme.colors.primaryLight,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  actionButtons: {
    marginTop: 8,
  },
  editButton: {
    marginBottom: 12,
  },
  requestButton: {
    marginBottom: 12,
  },
});

export default PetDetailModal;
