import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  StatusBar, 
  SafeAreaView, 
  Animated, 
  Text,
  Platform,
  TouchableOpacity,
  BackHandler
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { theme } from '../../../theme';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchAllServiceRequests, 
  setRequestsTabAsProvider,
  selectRequestsTabAsProvider
} from '../../../redux/slices/serviceSlice';
import { AppDispatch } from '../../../redux/store';
import RequestsFilterToggle from '../RequestsTab/RequestsFilterToggle';
import RequestsList from '../RequestsTab/RequestsList';

/**
 * Request List Screen
 * 
 * Displays a list of service requests made by the user with:
 * - Filtering options by status
 * - Toggle between "As Requester" and "As Provider" views
 * - Pull-to-refresh functionality
 * - Navigation to request details
 */
export default function RequestListScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: any) => state.auth?.user);
  const asProvider = useSelector(selectRequestsTabAsProvider);
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  
  // Load requests on mount and when filter changes
  useEffect(() => {
    loadRequests();
  }, [asProvider, user?.id]);
  
  // Handle back button press
  useEffect(() => {
    const onBackPress = () => {
      navigation.goBack();
      return true;
    };
    
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [navigation]);
  
  // Function to load requests
  const loadRequests = async () => {
    try {
      if (!user?.id) {
        console.warn('Cannot fetch requests - user not authenticated');
        return;
      }
      
      // Dispatch to fetch requests with the current filter
      await dispatch(fetchAllServiceRequests({
        userId: user.id,
        asProvider,
      }));
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };
  
  // Function to toggle between as provider/requester
  const handleToggleRole = (asProvider: boolean) => {
    dispatch(setRequestsTabAsProvider(asProvider));
  };
  
  const handleScroll = (event: any) => {
    // Update our local animation value
    const scrollPosition = event.nativeEvent.contentOffset.y;
    scrollY.setValue(scrollPosition);
  };
  
  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <BlurView intensity={30} tint="light" style={styles.backButtonBlur}>
              <MaterialCommunityIcons 
                name="arrow-left" 
                size={22} 
                color={theme.colors.text} 
              />
            </BlurView>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Requests</Text>
          
          <View style={styles.rightPlaceholder} />
        </View>
        
        {/* Animated Header */}
        <Animated.View 
          style={[
            styles.headerContainer,
            { opacity: headerOpacity }
          ]}
        >
          <BlurView intensity={10} tint="light" style={styles.headerBlur}>
            <LinearGradient
              colors={['rgba(108, 99, 255, 0.12)', 'rgba(108, 99, 255, 0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              <Text style={styles.headerTitle}>Service Requests</Text>
              <Text style={styles.headerSubtitle}>
                {asProvider 
                  ? 'Manage requests from others for your services' 
                  : 'Track your service requests to other providers'
                }
              </Text>
            </LinearGradient>
          </BlurView>
        </Animated.View>
        
        {/* Filter Toggle */}
        <RequestsFilterToggle
          asProvider={asProvider}
          onToggle={handleToggleRole}
        />
        
        {/* Request List */}
        <RequestsList 
          onScroll={handleScroll}
          onRefresh={loadRequests}
          onSelectRequest={(requestId) => {
            navigation.navigate('RequestDetail', { 
              requestId,
              backScreen: 'RequestList'
            });
          }}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonBlur: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  rightPlaceholder: {
    width: 40,
  },
  headerContainer: {
    height: 120,
    overflow: 'hidden',
  },
  headerBlur: {
    flex: 1,
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerGradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    paddingBottom: 20,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
});