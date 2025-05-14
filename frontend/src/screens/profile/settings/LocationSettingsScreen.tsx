import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  ActivityIndicator,
  Alert,
  Platform,
  Linking
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { theme, globalStyles } from '../../../theme';
import { Text, AppButton } from '../../../components/ui';
import { useSelector, useDispatch } from 'react-redux';
import { selectUserId } from '../../../redux/selectors';
import * as Location from 'expo-location';
import { 
  getCurrentLocation, 
  updateUserLocation, 
  formatLocationForDisplay,
  LocationCoords,
  DEFAULT_LOCATION
} from '../../../services/locationService';

export default function LocationSettingsScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const userId = useSelector(selectUserId);
  
  // State for location settings
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [preciseLoc, setPreciseLoc] = useState(false);
  const [backgroundLoc, setBackgroundLoc] = useState(false);
  const [autoUpdateLoc, setAutoUpdateLoc] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [permError, setPermError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  
  // Check current permissions
  useEffect(() => {
    checkLocationPermissions();
  }, []);
  
  const checkLocationPermissions = async () => {
    try {
      setLoading(true);
      setPermError(null);
      
      // Get foreground permission status
      const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
      setLocationEnabled(foregroundStatus === 'granted');
      
      // Get background permission status (iOS only for now)
      if (Platform.OS === 'ios') {
        const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();
        setBackgroundLoc(backgroundStatus === 'granted');
      }
      
      // Get location accuracy
      const accuracy = await Location.getProviderStatusAsync();
      setPreciseLoc(accuracy.accuracyAuthorization === Location.AccuracyAuthorization.ReducedAccuracy ? false : true);
      
      // Get current location if permissions are granted
      if (foregroundStatus === 'granted') {
        const location = await getCurrentLocation();
        setCurrentLocation(location);
      }
    } catch (error) {
      console.error('[LocationSettings] Error checking permissions:', error);
      setPermError('Failed to check location permissions');
    } finally {
      setLoading(false);
    }
  };
  
  const requestForegroundPermission = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationEnabled(status === 'granted');
      
      if (status === 'granted') {
        const location = await getCurrentLocation();
        setCurrentLocation(location);
      }
    } catch (error) {
      console.error('[LocationSettings] Error requesting foreground permission:', error);
      Alert.alert('Error', 'Failed to request location permission');
    } finally {
      setLoading(false);
    }
  };
  
  const requestBackgroundPermission = async () => {
    if (!locationEnabled) {
      Alert.alert('Error', 'Please enable location access first');
      return;
    }
    
    try {
      setLoading(true);
      const { status } = await Location.requestBackgroundPermissionsAsync();
      setBackgroundLoc(status === 'granted');
    } catch (error) {
      console.error('[LocationSettings] Error requesting background permission:', error);
      Alert.alert('Error', 'Failed to request background location permission');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleAutoUpdate = (value: boolean) => {
    if (value && !locationEnabled) {
      Alert.alert('Error', 'Please enable location access first');
      return;
    }
    
    setAutoUpdateLoc(value);
  };
  
  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };
  
  const updateLocationNow = async () => {
    if (!userId) {
      Alert.alert('Error', 'You must be logged in to update your location');
      return;
    }
    
    if (!locationEnabled) {
      Alert.alert('Error', 'Please enable location access first');
      return;
    }
    
    try {
      setLoading(true);
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      
      // Save to database
      await updateUserLocation(userId, location);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('[LocationSettings] Error updating location:', error);
      Alert.alert('Error', 'Failed to update location');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text variant="h2">Location Settings</Text>
        <View style={{ width: 40 }} /> {/* Empty space for balance */}
      </View>
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
      
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Location permissions section */}
        <BlurView intensity={80} tint="light" style={styles.masterToggleContainer}>
          <View style={styles.masterToggleContent}>
            <View style={styles.permissionText}>
              <Text variant="h3">Location Access</Text>
              <Text variant="body2" color="textSecondary">
                {locationEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={(value) => {
                if (value) {
                  requestForegroundPermission();
                } else {
                  openSettings();
                }
              }}
              trackColor={{ false: '#e0e0e0', true: `${theme.colors.primary}80` }}
              thumbColor={locationEnabled ? theme.colors.primary : '#f4f4f4'}
              ios_backgroundColor="#e0e0e0"
            />
          </View>
        </BlurView>
        
        {/* Location settings */}
        <View style={styles.settingsContainer}>
          {/* Background location */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text variant="body" style={styles.settingTitle}>
                Background Location
              </Text>
              <Text variant="caption" color="textSecondary" style={styles.settingDescription}>
                Allow app to access location while in background
              </Text>
            </View>
            <Switch
              value={backgroundLoc}
              onValueChange={(value) => {
                if (value) {
                  requestBackgroundPermission();
                } else {
                  openSettings();
                }
              }}
              trackColor={{ false: '#e0e0e0', true: `${theme.colors.primary}80` }}
              thumbColor={backgroundLoc ? theme.colors.primary : '#f4f4f4'}
              ios_backgroundColor="#e0e0e0"
              disabled={!locationEnabled}
            />
          </View>
          
          {/* Precise location - redirects to system settings */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text variant="body" style={styles.settingTitle}>
                Precise Location
              </Text>
              <Text variant="caption" color="textSecondary" style={styles.settingDescription}>
                Share exact location (recommended for finding nearby services)
              </Text>
            </View>
            <Switch
              value={preciseLoc}
              onValueChange={() => openSettings()}
              trackColor={{ false: '#e0e0e0', true: `${theme.colors.primary}80` }}
              thumbColor={preciseLoc ? theme.colors.primary : '#f4f4f4'}
              ios_backgroundColor="#e0e0e0"
              disabled={!locationEnabled}
            />
          </View>
          
          {/* Auto update location */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text variant="body" style={styles.settingTitle}>
                Auto-Update Location
              </Text>
              <Text variant="caption" color="textSecondary" style={styles.settingDescription}>
                Automatically update location when opening the app
              </Text>
            </View>
            <Switch
              value={autoUpdateLoc}
              onValueChange={toggleAutoUpdate}
              trackColor={{ false: '#e0e0e0', true: `${theme.colors.primary}80` }}
              thumbColor={autoUpdateLoc ? theme.colors.primary : '#f4f4f4'}
              ios_backgroundColor="#e0e0e0"
              disabled={!locationEnabled}
            />
          </View>
        </View>
        
        {/* Current location info */}
        <View style={styles.locationInfoContainer}>
          <Text variant="label" style={styles.locationLabel}>Current Location</Text>
          <Text variant="body" style={styles.locationValue}>
            {currentLocation 
              ? formatLocationForDisplay(currentLocation)
              : 'Location not available'
            }
          </Text>
          
          {currentLocation && currentLocation !== DEFAULT_LOCATION && (
            <Text variant="caption" color="textSecondary" style={styles.locationAccuracy}>
              {currentLocation.accuracy 
                ? `Accuracy: ±${Math.round(currentLocation.accuracy)} meters`
                : ''}
            </Text>
          )}
          
          {permError && (
            <Text variant="caption" color="error" style={styles.errorText}>
              {permError}
            </Text>
          )}
        </View>
        
        <AppButton
          title={saved ? "✓ Location Updated" : "Update Location Now"}
          onPress={updateLocationNow}
          fullWidth
          style={[
            styles.updateButton,
            saved && styles.savedButton
          ]}
          loading={loading}
          disabled={loading || !locationEnabled}
        />
        
        {/* Location privacy notice */}
        <View style={styles.privacyNotice}>
          <MaterialCommunityIcons 
            name="information-outline" 
            size={16} 
            color={theme.colors.textSecondary}
            style={styles.infoIcon}
          />
          <Text variant="caption" color="textSecondary" style={styles.privacyText}>
            Your location is only shared when providing or receiving services. 
            Your privacy is important to us. See our Privacy Policy for details.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#fff',
    ...theme.elevation.small,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  masterToggleContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    ...theme.elevation.small,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  masterToggleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  permissionText: {
    flex: 1,
    marginRight: 16,
  },
  settingsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    ...theme.elevation.small,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    lineHeight: 18,
  },
  locationInfoContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    padding: 16,
    ...theme.elevation.small,
  },
  locationLabel: {
    marginBottom: 8,
    color: theme.colors.textSecondary,
  },
  locationValue: {
    fontWeight: '500',
    marginBottom: 4,
  },
  locationAccuracy: {
    marginTop: 4,
  },
  errorText: {
    marginTop: 8,
  },
  updateButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  savedButton: {
    backgroundColor: '#4CAF50',
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  privacyText: {
    flex: 1,
    lineHeight: 18,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});