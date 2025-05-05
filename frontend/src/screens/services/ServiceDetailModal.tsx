import React, { useState } from 'react';
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
import { theme } from '../../theme';
import { AppButton, StatusBadge } from '../../components/ui';
import { supabase } from '../../supabaseClient';
import { useSelector } from 'react-redux';

interface ServiceDetailModalProps {
  visible: boolean;
  onClose: () => void;
  service: any;
}

const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({ 
  visible, 
  onClose, 
  service 
}) => {
  const [requesting, setRequesting] = useState(false);
  const user = useSelector((state: any) => state.auth.user);
  
  const handleRequestService = async () => {
    try {
      setRequesting(true);
      
      // Simple service request creation
      const { data, error } = await supabase
        .from('service_requests')
        .insert([{
          requester_id: user?.id,
          provider_id: service.provider_id,
          service_type_id: service.service_type_id,
          status: 'pending',
          notes: `Request for ${service.title}`,
          created_at: new Date().toISOString()
        }])
        .select();
        
      if (error) throw error;
      
      // Navigate to request detail or show success message
      onClose();
      // Here you could navigate to the request detail
    } catch (error) {
      console.error('Error requesting service:', error);
    } finally {
      setRequesting(false);
    }
  };
  
  const handleMessageProvider = () => {
    // Implement navigation to chat with provider
    onClose();
    // Here you would navigate to the chat screen
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
            {/* Service Header */}
            <View style={styles.serviceHeader}>
              <View style={styles.serviceTypeContainer}>
                <MaterialCommunityIcons 
                  name={service?.service_types?.icon || "paw"} 
                  size={18} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.serviceType}>{service?.service_types?.name}</Text>
                <StatusBadge status="active" size="small" style={styles.statusBadge} />
              </View>
              
              <Text style={styles.serviceTitle}>{service?.title}</Text>
            </View>
            
            {/* Provider Info */}
            <View style={styles.providerCard}>
              <View style={styles.providerImageContainer}>
                {service?.users?.profile_image_url ? (
                  <Image 
                    source={{ uri: service?.users?.profile_image_url }} 
                    style={styles.providerImage} 
                  />
                ) : (
                  <View style={styles.providerImagePlaceholder}>
                    <Text style={styles.providerInitial}>
                      {service?.users?.full_name?.charAt(0) || 'P'}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{service?.users?.full_name || 'Provider'}</Text>
                <View style={styles.ratingContainer}>
                  <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>4.8</Text>
                  <Text style={styles.reviewCount}>(24 reviews)</Text>
                </View>
              </View>
            </View>
            
            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this service</Text>
              <Text style={styles.descriptionText}>{service?.description}</Text>
            </View>
            
            {/* Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Details</Text>
              
              <View style={styles.detailRow}>
                <MaterialCommunityIcons 
                  name="calendar-range" 
                  size={20} 
                  color={theme.colors.primary} 
                  style={styles.detailIcon} 
                />
                <Text style={styles.detailText}>
                  Available: {service?.availability_schedule?.notes || 'Flexible'}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <MaterialCommunityIcons 
                  name="map-marker" 
                  size={20} 
                  color={theme.colors.primary} 
                  style={styles.detailIcon} 
                />
                <Text style={styles.detailText}>
                  Location: Within 5 miles
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <MaterialCommunityIcons 
                  name="currency-usd" 
                  size={20} 
                  color={theme.colors.primary} 
                  style={styles.detailIcon} 
                />
                <Text style={styles.detailText}>
                  Credits: 30 per session
                </Text>
              </View>
            </View>
            
            {/* Actions */}
            <View style={styles.actionButtons}>
              <AppButton
                title="Request Service"
                onPress={handleRequestService}
                loading={requesting}
                style={styles.requestButton}
              />
              
              <AppButton
                title="Message Provider"
                mode="outline"
                onPress={handleMessageProvider}
                icon={<MaterialCommunityIcons name="chat" size={16} color={theme.colors.primary} />}
                style={styles.messageButton}
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
  serviceHeader: {
    marginBottom: 24,
  },
  serviceTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceType: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  statusBadge: {
    marginLeft: 8,
  },
  serviceTitle: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.h1.fontWeight,
    color: theme.typography.h1.color,
    marginBottom: 8,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: 16,
    marginBottom: 24,
  },
  providerImageContainer: {
    marginRight: 16,
  },
  providerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  providerImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerInitial: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: '700',
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.typography.h3.color,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontWeight: '700',
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: theme.colors.textTertiary,
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.typography.h3.color,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.typography.body.fontWeight,
    color: theme.typography.body.color,
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailIcon: {
    marginRight: 12,
  },
  detailText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.typography.body.fontWeight,
    color: theme.typography.body.color,
  },
  actionButtons: {
    marginVertical: 8,
  },
  requestButton: {
    marginBottom: 12,
  },
  messageButton: {
    marginBottom: 12,
  },
});

export default ServiceDetailModal;
