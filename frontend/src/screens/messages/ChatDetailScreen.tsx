import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  BackHandler,
  Alert,
  Image
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import {
  TextMessage,
  ImageMessage,
  ServiceRequestMessage,
  SystemMessage,
  ServiceStatusUpdate,
  MessageInputBar,
  TypingStatus,
  ServiceDetailsCard
} from '../../components/messages';
import { theme } from '../../theme';
import { ChatDetailScreenProps, Message } from '../../components/messages/types';
import { fetchMessages, sendMessage, setupMessageSubscription } from '../../services/messagesService';
import { addMessage } from '../../redux/messagingSlice';
import { selectServiceRequests } from '../../redux/slices/serviceSlice';

const ChatDetailScreen = ({ route, navigation }: ChatDetailScreenProps) => {
  const { conversationId, otherUserId, otherUserName } = route.params;
  const userId = useSelector((state: any) => state.auth.user?.id);
  const messages = useSelector((state: any) => state.messaging.activeConversation.messages);
  const loading = useSelector((state: any) => state.messaging.activeConversation.loading);
  const error = useSelector((state: any) => state.messaging.activeConversation.error);
  const serviceRequests = useSelector(selectServiceRequests);
  
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [relatedService, setRelatedService] = useState<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const dispatch = useDispatch();
  const messageSubscription = useRef<any>(null);

  // Handle back button press on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  // Animation for header
  const headerHeight = headerOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 70], // Adjust as needed
  });

  // Fetch messages and set up subscription
  useEffect(() => {
    const loadMessages = async () => {
      try {
        await fetchMessages(conversationId);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    loadMessages();

    // Set up real-time subscription
    if (userId) {
      messageSubscription.current = setupMessageSubscription(otherUserId, (newMessage) => {
        dispatch(addMessage(newMessage));
        
        // If it's a message from the other user, simulate them stopping typing
        if (newMessage.senderId === otherUserId) {
          setIsOtherUserTyping(false);
        }
      });
    }
    
    // Set up a timer to randomly show typing indicator for demo purposes
    const simulateTypingInterval = setInterval(() => {
      // 20% chance to show typing indicator if not already shown
      if (!isOtherUserTyping && Math.random() < 0.2) {
        setIsOtherUserTyping(true);
        
        // Show typing for 2-5 seconds
        const typingDuration = 2000 + Math.random() * 3000;
        
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
          setIsOtherUserTyping(false);
        }, typingDuration);
      }
    }, 10000);  // Check every 10 seconds

    return () => {
      if (messageSubscription.current) {
        messageSubscription.current.unsubscribe();
      }
      
      clearInterval(simulateTypingInterval);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversationId, otherUserId, userId, dispatch, isOtherUserTyping]);

  // Find related service requests for this conversation
  useEffect(() => {
    // Check if there are any service requests between the current user and the other user
    const findRelatedServiceRequest = () => {
      // First look for service-type messages in the conversation
      const serviceMessages = messages.filter(message => 
        message.type === 'service' && message.serviceInfo
      );
      
      if (serviceMessages.length > 0) {
        // Use the service ID from the message to find the full service details
        const serviceId = serviceMessages[0].serviceInfo?.serviceId;
        
        if (serviceId) {
          // Find the service details from the redux store
          const serviceRequest = serviceRequests.find(request => request.id === serviceId);
          
          if (serviceRequest) {
            setRelatedService({
              id: serviceRequest.id,
              title: serviceRequest.title || 'Service Request',
              serviceType: serviceRequest.service_type?.name || 'Service',
              status: serviceRequest.status,
              price: serviceRequest.service_type?.credit_value,
              scheduledDate: serviceRequest.scheduled_date,
              location: serviceRequest.service_listing?.location?.address,
              petName: 'Your Pet', // In a real app, this would come from the service request
              description: serviceRequest.notes,
              icon: serviceRequest.service_type?.icon
            });
            return;
          }
        }
      }
      
      // If no service messages found, check if there are any service requests between users
      const userServiceRequests = serviceRequests.filter(request => 
        (request.provider_id === otherUserId && request.requester_id === userId) || 
        (request.provider_id === userId && request.requester_id === otherUserId)
      );
      
      if (userServiceRequests.length > 0) {
        // Take the most recent service request
        const latestServiceRequest = userServiceRequests.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        
        setRelatedService({
          id: latestServiceRequest.id,
          title: latestServiceRequest.title || 'Service Request',
          serviceType: latestServiceRequest.service_type?.name || 'Service',
          status: latestServiceRequest.status,
          price: latestServiceRequest.service_type?.credit_value,
          scheduledDate: latestServiceRequest.scheduled_date,
          location: latestServiceRequest.service_listing?.location?.address,
          petName: 'Your Pet', // In a real app, this would come from the service request
          description: latestServiceRequest.notes,
          icon: latestServiceRequest.service_type?.icon
        });
      } else {
        // For demo purposes - show a mock service if we don't find any
        // REMOVE THIS IN PRODUCTION CODE - just for demonstration
        const shouldShowMockData = messages.some(msg => 
          msg.content.toLowerCase().includes('dog walking') || 
          msg.content.toLowerCase().includes('pet sitting')
        );
        
        if (shouldShowMockData) {
          const mockService = {
            id: 'mock-service-123',
            title: 'Dog Walking Service',
            serviceType: 'dog_walking',
            status: 'pending',
            price: 25,
            scheduledDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            location: '123 Pet Street, Dogville',
            petName: 'Max',
            description: 'Daily dog walking service, 30 minutes per session, including water and treats.',
            icon: 'dog-side'
          };
          
          setRelatedService(mockService);
          
          // Add a mock scheduled service status update message if not already present
          const hasStatusUpdateMessage = messages.some(msg => 
            msg.type === 'status_update' && 
            msg.statusInfo?.serviceId === 'mock-service-123'
          );
          
          if (!hasStatusUpdateMessage) {
            // Add a scheduled status message
            setTimeout(() => {
              const statusMessage: Message = {
                id: `status-${Date.now()}`,
                senderId: 'system',
                content: '',
                type: 'status_update',
                statusInfo: {
                  type: 'scheduled',
                  serviceId: mockService.id,
                  serviceName: mockService.title,
                  actionUser: otherUserName
                },
                createdAt: new Date().toISOString(),
                conversationId
              };
              
              dispatch(addMessage(statusMessage));
              
              // Add sample notifications
              setTimeout(() => {
                const reminderNotification: Message = {
                  id: `notification-reminder-${Date.now()}`,
                  senderId: 'system',
                  content: '',
                  type: 'notification',
                  notificationInfo: {
                    type: 'service_reminder',
                    title: 'Service Reminder',
                    message: `Your ${mockService.title} is scheduled for tomorrow. Don't forget to prepare!`,
                    referenceId: mockService.id
                  },
                  createdAt: new Date().toISOString(),
                  conversationId
                };
                
                dispatch(addMessage(reminderNotification));
                
                // Add another notification after a delay
                setTimeout(() => {
                  const reviewNotification: Message = {
                    id: `notification-review-${Date.now()}`,
                    senderId: 'system',
                    content: '',
                    type: 'notification',
                    notificationInfo: {
                      type: 'review',
                      title: 'Rate Previous Service',
                      message: 'Please rate your recent pet grooming service',
                      referenceId: 'previous-service-456'
                    },
                    createdAt: new Date().toISOString(),
                    conversationId
                  };
                  
                  dispatch(addMessage(reviewNotification));
                }, 3000);
              }, 2000);
            }, 1000);
          }
        } else {
          // No related service found
          setRelatedService(null);
        }
      }
    };
    
    if (messages.length > 0) {
      findRelatedServiceRequest();
    }
  }, [messages, serviceRequests, userId, otherUserId, otherUserName, conversationId, dispatch]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [messages.length]);

  // Add a message to the local UI immediately for better UX
  const addLocalMessage = (text: string) => {
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: userId || '',
      content: text,
      type: 'text',
      createdAt: new Date().toISOString(),
      conversationId,
      status: 'sending',
      isLocalOnly: true
    };
    dispatch(addMessage(tempMessage));
    return tempMessage.id;
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    const trimmedText = inputText.trim();
    if (!trimmedText) return;

    try {
      // Clear input and show sending state
      setIsSending(true);
      setInputText('');

      // Add message to UI immediately with 'sending' status
      const tempMessageId = addLocalMessage(trimmedText);

      console.log('[ChatDetailScreen] Sending message to:', otherUserId);
      const result = await sendMessage(otherUserId, trimmedText);

      if (result) {
        console.log('[ChatDetailScreen] Message sent successfully:', result.id);
        
        // Update UI to replace temp message with actual message
        // In a real app with a well-designed backend, we'd update the temp message's status
        // here we're simulating the process for demonstration

        // First find the temporary message in the current state
        const currentMessages = [...messages];
        const tempIndex = currentMessages.findIndex(m => m.id === tempMessageId);
        
        if (tempIndex !== -1) {
          // Replace the temp message with the real one, and set status to 'sent'
          const updatedMessage: Message = {
            ...result,
            status: 'sent'
          };
          
          // This simulates message delivery after a short delay
          setTimeout(() => {
            dispatch(addMessage({
              ...updatedMessage,
              status: 'delivered'
            }));
            
            // This simulates message being read after another short delay
            setTimeout(() => {
              dispatch(addMessage({
                ...updatedMessage,
                status: 'read',
                readAt: new Date().toISOString()
              }));
            }, 3000);
          }, 1500);
        }
      } else {
        console.error('[ChatDetailScreen] Message sending returned null');
        // Update the temporary message to show error state
        const currentMessages = [...messages];
        const tempIndex = currentMessages.findIndex(m => m.id === tempMessageId);
        
        if (tempIndex !== -1) {
          const errorMessage: Message = {
            ...currentMessages[tempIndex],
            status: 'error'
          };
          dispatch(addMessage(errorMessage));
        }
      }
    } catch (err) {
      console.error('[ChatDetailScreen] Error sending message:', err);
      // Show error message to user or retry logic could be added here
    } finally {
      setIsSending(false);
    }
  };

  // Handle picking an image
  const handleImagePick = async () => {
    try {
      // Request permission to access the photo library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need permission to access your photos to send images');
        return;
      }
      
      // Open the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Handle the selected image
        await handleSendImageMessage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'There was a problem selecting the image');
    }
  };
  
  // Handle sending an image message
  const handleSendImageMessage = async (imageUri: string) => {
    if (!imageUri) return;
    
    try {
      setIsSending(true);
      
      // Create a temporary local message
      const tempMessageId = `temp-img-${Date.now()}`;
      const tempMessage: Message = {
        id: tempMessageId,
        senderId: userId || '',
        content: '',
        type: 'image',
        imageUrl: imageUri,
        createdAt: new Date().toISOString(),
        conversationId,
        status: 'sending',
        isLocalOnly: true
      };
      
      dispatch(addMessage(tempMessage));
      
      // In a real app, we would upload the image to a server and get a public URL
      // For this implementation, we'll use the local URI
      // This is not a production-ready approach as the image won't be visible to other users
      
      // Simulate sending delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update message status to sent
      const sentMessage: Message = {
        ...tempMessage,
        id: `img-${Date.now()}`, // In a real app, this would be the server-assigned ID
        status: 'sent',
        isLocalOnly: false
      };
      
      dispatch(addMessage(sentMessage));
      
      // Simulate delivery and read receipts with delays
      setTimeout(() => {
        dispatch(addMessage({
          ...sentMessage,
          status: 'delivered',
        }));
        
        // Simulate read receipt
        setTimeout(() => {
          dispatch(addMessage({
            ...sentMessage,
            status: 'read',
            readAt: new Date().toISOString()
          }));
        }, 3000);
      }, 1500);
      
    } catch (error) {
      console.error('Error sending image message:', error);
      Alert.alert('Error', 'There was a problem sending the image');
    } finally {
      setIsSending(false);
    }
  };
  
  // Format message timestamp
  const formatMessageTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  // Handle service request actions
  const handleAcceptService = (serviceId: string) => {
    Alert.alert('Service Accepted', `You've accepted service request ${serviceId}`);
    // In a real app, this would call an API to update the service status
    
    // Update the local state to reflect the status change
    if (relatedService) {
      setRelatedService({
        ...relatedService,
        status: 'accepted'
      });
      
      // Send a system message to the conversation
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        senderId: 'system',
        content: `Service request has been accepted`,
        type: 'system',
        createdAt: new Date().toISOString(),
        conversationId
      };
      
      dispatch(addMessage(systemMessage));
      
      // Also add a status update message for richer UI
      const statusUpdateMessage: Message = {
        id: `status-${Date.now()}`,
        senderId: 'system',
        content: '', // not used for status updates
        type: 'status_update',
        statusInfo: {
          type: 'accepted',
          serviceId: relatedService.id,
          serviceName: relatedService.title,
          actionUser: 'You' // In a real app, this would be the current user's name
        },
        createdAt: new Date().toISOString(),
        conversationId
      };
      
      dispatch(addMessage(statusUpdateMessage));
    }
  };
  
  const handleDeclineService = (serviceId: string) => {
    Alert.alert('Service Declined', `You've declined service request ${serviceId}`);
    // In a real app, this would call an API to update the service status
    
    // Update the local state to reflect the status change
    if (relatedService) {
      setRelatedService({
        ...relatedService,
        status: 'cancelled'
      });
      
      // Send a system message to the conversation
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        senderId: 'system',
        content: `Service request has been declined`,
        type: 'system',
        createdAt: new Date().toISOString(),
        conversationId
      };
      
      dispatch(addMessage(systemMessage));
      
      // Also add a status update message for richer UI
      const statusUpdateMessage: Message = {
        id: `status-${Date.now()}`,
        senderId: 'system',
        content: '', // not used for status updates
        type: 'status_update',
        statusInfo: {
          type: 'declined',
          serviceId: relatedService.id,
          serviceName: relatedService.title,
          actionUser: 'You' // In a real app, this would be the current user's name
        },
        createdAt: new Date().toISOString(),
        conversationId
      };
      
      dispatch(addMessage(statusUpdateMessage));
    }
  };
  
  const handleCompleteService = (serviceId: string) => {
    Alert.alert('Service Completed', `You've marked service ${serviceId} as completed`);
    // In a real app, this would call an API to update the service status
    
    // Update the local state to reflect the status change
    if (relatedService) {
      setRelatedService({
        ...relatedService,
        status: 'completed'
      });
      
      // Send a system message to the conversation
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        senderId: 'system',
        content: `Service has been marked as completed`,
        type: 'system',
        createdAt: new Date().toISOString(),
        conversationId
      };
      
      dispatch(addMessage(systemMessage));
      
      // Also add a status update message for richer UI with payment info
      const serviceFee = relatedService.price || 25; // Fallback to $25 if price not specified
      
      const statusUpdateMessage: Message = {
        id: `status-${Date.now()}`,
        senderId: 'system',
        content: '', // not used for status updates
        type: 'status_update',
        statusInfo: {
          type: 'completed',
          serviceId: relatedService.id,
          serviceName: relatedService.title,
          actionUser: 'You', // In a real app, this would be the current user's name
          amount: serviceFee
        },
        createdAt: new Date().toISOString(),
        conversationId
      };
      
      dispatch(addMessage(statusUpdateMessage));
      
      // Add a payment status update message after a short delay
      setTimeout(() => {
        const paymentStatusMessage: Message = {
          id: `payment-status-${Date.now()}`,
          senderId: 'system',
          content: '', // not used for status updates
          type: 'status_update',
          statusInfo: {
            type: 'payment',
            serviceId: relatedService.id,
            serviceName: relatedService.title,
            amount: serviceFee
          },
          createdAt: new Date().toISOString(),
          conversationId
        };
        
        dispatch(addMessage(paymentStatusMessage));
        
        // Add a detailed payment confirmation message
        setTimeout(() => {
          const transactionId = `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
          
          const paymentMessage: Message = {
            id: `payment-${Date.now()}`,
            senderId: 'system',
            content: '',
            type: 'payment',
            paymentInfo: {
              transactionId: transactionId,
              amount: serviceFee,
              serviceName: relatedService.title,
              status: 'pending',
              paymentMethod: {
                type: 'credits',
                name: 'App Credits'
              }
            },
            createdAt: new Date().toISOString(),
            conversationId
          };
          
          dispatch(addMessage(paymentMessage));
          
          // Simulate payment completion after a delay
          setTimeout(() => {
            const completedPaymentMessage: Message = {
              id: `payment-completed-${Date.now()}`,
              senderId: 'system',
              content: '',
              type: 'payment',
              paymentInfo: {
                transactionId: transactionId,
                amount: serviceFee,
                serviceName: relatedService.title,
                status: 'completed',
                paymentMethod: {
                  type: 'credits',
                  name: 'App Credits'
                }
              },
              createdAt: new Date().toISOString(),
              conversationId
            };
            
            dispatch(addMessage(completedPaymentMessage));
          }, 3000);
        }, 1500);
      }, 2000);
    }
  };
  
  const handleViewServiceDetails = (serviceId: string) => {
    Alert.alert('View Service Details', `Viewing details for service ${serviceId}`);
    // In a real app, this would navigate to a service details screen
  };
  
  const handleMessageProvider = (serviceId: string, providerId: string) => {
    // This function should theoretically navigate to a new conversation with the provider
    // But since we're already in a conversation, we'll just show an alert
    Alert.alert('Message Provider', `You're already messaging with this provider`);
  };
  
  const handleScheduleService = (serviceId: string) => {
    Alert.alert('Schedule Service', `Opening scheduler for ${serviceId}`);
    // In a real app, this would navigate to a scheduling screen
    
    // Add a scheduled status update
    if (relatedService) {
      // Add a status update message
      const statusUpdateMessage: Message = {
        id: `status-${Date.now()}`,
        senderId: 'system',
        content: '',
        type: 'status_update',
        statusInfo: {
          type: 'scheduled',
          serviceId: relatedService.id,
          serviceName: relatedService.title,
          actionUser: 'You'
        },
        createdAt: new Date().toISOString(),
        conversationId
      };
      
      dispatch(addMessage(statusUpdateMessage));
    }
  };
  
  const handlePaymentService = (serviceId: string) => {
    Alert.alert('Payment', `Processing payment for ${serviceId}`);
    // In a real app, this would navigate to a payment screen
    
    // Simulate payment completion
    if (relatedService) {
      // First add a payment status update
      setTimeout(() => {
        const statusMessage: Message = {
          id: `status-${Date.now()}`,
          senderId: 'system',
          content: '',
          type: 'status_update',
          statusInfo: {
            type: 'payment',
            serviceId: relatedService.id,
            serviceName: relatedService.title,
            amount: relatedService.price || 25
          },
          createdAt: new Date().toISOString(),
          conversationId
        };
        
        dispatch(addMessage(statusMessage));
        
        // Then add a detailed payment confirmation message
        setTimeout(() => {
          const transactionId = `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
          
          const paymentMessage: Message = {
            id: `payment-${Date.now()}`,
            senderId: 'system',
            content: '',
            type: 'payment',
            paymentInfo: {
              transactionId: transactionId,
              amount: relatedService.price || 25,
              serviceName: relatedService.title,
              status: 'completed',
              paymentMethod: {
                type: 'card',
                lastFour: '4242'
              }
            },
            createdAt: new Date().toISOString(),
            conversationId
          };
          
          dispatch(addMessage(paymentMessage));
        }, 1000);
      }, 1500);
    }
  };
  
  const handleRateService = (serviceId: string) => {
    Alert.alert('Rate Service', `Opening rating screen for ${serviceId}`);
    // In a real app, this would navigate to a rating screen
    
    // Simulate rating submission
    if (relatedService) {
      // Add a system message
      setTimeout(() => {
        const ratingMessage: Message = {
          id: `system-${Date.now()}`,
          senderId: 'system',
          content: `You rated "${relatedService.title}" 5 stars`,
          type: 'system',
          createdAt: new Date().toISOString(),
          conversationId
        };
        
        dispatch(addMessage(ratingMessage));
      }, 1500);
    }
  };
  
  const handleViewReceipt = (transactionId: string) => {
    Alert.alert('View Receipt', `Opening receipt for transaction ${transactionId}`);
    // In a real app, this would open a receipt view or download a PDF
  };
  
  const handleContactSupport = () => {
    Alert.alert('Contact Support', 'Opening support chat for payment assistance');
    // In a real app, this would navigate to a support chat or open a support ticket
  };
  
  const handleNotificationPress = (notificationInfo: any) => {
    // Handle notification press based on type
    switch (notificationInfo.type) {
      case 'service_reminder':
        Alert.alert('Reminder', `Opening schedule for service reminder: ${notificationInfo.message}`);
        break;
      case 'new_service':
        Alert.alert('New Service', `Viewing new service: ${notificationInfo.title}`);
        break;
      case 'payment':
        Alert.alert('Payment', `Opening payment details: ${notificationInfo.title}`);
        break;
      case 'review':
        Alert.alert('Review', `Opening review form: ${notificationInfo.title}`);
        break;
      default:
        Alert.alert(notificationInfo.title, notificationInfo.message);
    }
    
    // In a real app, this would navigate to the appropriate screen based on notification type
  };
  
  const handleDismissNotification = (notificationId: string) => {
    // In a real app, this would mark the notification as dismissed in the database
    Alert.alert('Notification Dismissed', `Dismissing notification ${notificationId}`);
  };
  
  // Render different message types
  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === userId;

    switch (item.type) {
      case 'image':
        return <ImageMessage message={item} isMyMessage={isMyMessage} />;
      case 'service':
        return (
          <ServiceRequestMessage 
            message={item} 
            isMyMessage={isMyMessage}
            onAccept={handleAcceptService}
            onDecline={handleDeclineService}
            onComplete={handleCompleteService}
            onViewDetails={handleViewServiceDetails}
          />
        );
      case 'status_update':
        if (item.statusInfo) {
          return (
            <ServiceStatusUpdate
              status={{
                ...item.statusInfo,
                timestamp: item.createdAt
              }}
              onViewDetails={handleViewServiceDetails}
            />
          );
        }
        // Fallback to system message if status info is missing
        return <SystemMessage message={item} />;
      case 'payment':
        if (item.paymentInfo) {
          return (
            <PaymentConfirmation
              transactionId={item.paymentInfo.transactionId}
              amount={item.paymentInfo.amount}
              serviceName={item.paymentInfo.serviceName}
              date={item.createdAt}
              status={item.paymentInfo.status}
              paymentMethod={item.paymentInfo.paymentMethod}
              onViewReceipt={() => handleViewReceipt(item.paymentInfo?.transactionId || '')}
              onRepay={() => handlePaymentService(relatedService?.id || '')}
              onContact={handleContactSupport}
            />
          );
        }
        // Fallback to system message if payment info is missing
        return <SystemMessage message={item} />;
      case 'notification':
        if (item.notificationInfo) {
          return (
            <NotificationMessage
              type={item.notificationInfo.type}
              title={item.notificationInfo.title}
              message={item.notificationInfo.message}
              timestamp={item.createdAt}
              onPress={() => handleNotificationPress(item.notificationInfo)}
              onDismiss={() => handleDismissNotification(item.id)}
            />
          );
        }
        // Fallback to system message if notification info is missing
        return <SystemMessage message={item} />;
      case 'system':
        return <SystemMessage message={item} />;
      case 'text':
      default:
        return (
          <TextMessage 
            message={item} 
            isMyMessage={isMyMessage} 
            timestamp={formatMessageTime(item.createdAt)} 
          />
        );
    }
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.loadingGradient}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.loadingHeaderTitle}>{otherUserName}</Text>
        </LinearGradient>
        
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.errorHeader}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.errorHeaderTitle}>{otherUserName}</Text>
        </LinearGradient>
        
        <View style={styles.errorContent}>
          <MaterialCommunityIcons name="alert-circle-outline" size={60} color={theme.colors.error} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchMessages(conversationId)}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 30}
    >
      <StatusBar backgroundColor="transparent" barStyle="light-content" translucent />
      
      {/* Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.headerProfile}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{otherUserName.charAt(0)}</Text>
              </View>
              <Text style={styles.headerName}>{otherUserName}</Text>
            </View>
            
            <TouchableOpacity style={styles.menuButton}>
              <MaterialCommunityIcons name="dots-vertical" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
      
      {/* Service Context Card */}
      {relatedService && (
        <ServiceDetailsCard
          service={relatedService}
          onViewDetails={handleViewServiceDetails}
          onAccept={handleAcceptService}
          onCancel={handleDeclineService}
          providerId={otherUserId !== userId ? otherUserId : undefined}
          onMessageProvider={handleMessageProvider}
        />
      )}
      
      {/* Service Action Buttons */}
      {relatedService && (
        <ServiceActionButtons
          serviceStatus={relatedService.status}
          isProvider={otherUserId !== userId}
          onAccept={() => handleAcceptService(relatedService.id)}
          onDecline={() => handleDeclineService(relatedService.id)}
          onComplete={() => handleCompleteService(relatedService.id)}
          onViewDetails={() => handleViewServiceDetails(relatedService.id)}
          onSchedule={() => handleScheduleService(relatedService.id)}
          onPayment={() => handlePaymentService(relatedService.id)}
          onRateService={() => handleRateService(relatedService.id)}
        />
      )}
      
      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          const scrollY = event.nativeEvent.contentOffset.y;
          // Hide header when scrolling down through messages
          Animated.timing(headerOpacity, {
            toValue: scrollY < 50 ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
          }).start();
        }}
        ListFooterComponent={() => (
          <TypingStatus 
            userName={otherUserName} 
            isTyping={isOtherUserTyping} 
          />
        )}
      />
      
      {/* Input Bar */}
      <MessageInputBar 
        onSend={handleSendMessage}
        onAttachImage={handleImagePick}
        value={inputText}
        onChangeText={setInputText}
        isLoading={isSending}
        showAttachmentButton={true}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  // Header styles
  header: {
    width: '100%',
    overflow: 'hidden',
  },
  headerGradient: {
    width: '100%',
    height: '100%',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  // Messages list
  messagesList: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 24, // Extra padding at the bottom for spacing
  },
  // Loading state
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingGradient: {
    height: Platform.OS === 'ios' ? 110 : 80,
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingHeaderTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 16,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  // Error state
  errorContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  errorHeader: {
    height: Platform.OS === 'ios' ? 110 : 80,
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorHeaderTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 16,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.error,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ChatDetailScreen;