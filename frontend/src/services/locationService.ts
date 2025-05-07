import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { supabase } from '../supabaseClient';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// Default location (San Francisco) if we can't get user's location
export const DEFAULT_LOCATION: LocationCoords = {
  latitude: 37.7749,
  longitude: -122.4194
};

/**
 * Request location permissions from the user
 * @returns {Promise<boolean>} True if permissions granted
 */
export async function requestLocationPermissions(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('[locationService] Error requesting permissions:', error);
    return false;
  }
}

/**
 * Get the user's current location
 * @returns {Promise<LocationCoords>} Location coordinates or default location
 */
export async function getCurrentLocation(): Promise<LocationCoords> {
  try {
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) {
      console.warn('[locationService] Location permission not granted');
      return DEFAULT_LOCATION;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy
    };
  } catch (error) {
    console.error('[locationService] Error getting location:', error);
    return DEFAULT_LOCATION;
  }
}

/**
 * Update the user's location in the database
 * @param userId User ID
 * @param coords Location coordinates
 */
export async function updateUserLocation(userId: string, coords: LocationCoords): Promise<void> {
  try {
    if (!userId) {
      console.warn('[locationService] No user ID provided for location update');
      return;
    }

    // Format for PostGIS geography type
    const pointStr = `POINT(${coords.longitude} ${coords.latitude})`;
    
    const { error } = await supabase
      .from('users')
      .update({ location: pointStr })
      .eq('id', userId);
    
    if (error) {
      console.error('[locationService] Error updating user location:', error);
      throw error;
    }
    
    console.log('[locationService] User location updated successfully');
  } catch (error) {
    console.error('[locationService] Failed to update user location:', error);
    throw error;
  }
}

/**
 * Calculate distance between two points in kilometers
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return parseFloat(distance.toFixed(1));
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format a location for display
 */
export function formatLocationForDisplay(coords: LocationCoords): string {
  return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
}

/**
 * Hook factory to create a location update watcher
 */
export function createLocationWatcher(userId: string, intervalMs: number = 300000) {
  let watcherId: Location.LocationSubscription | null = null;
  
  const startWatching = async () => {
    if (Platform.OS === 'web') {
      // Web doesn't support background location
      return;
    }
    
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) return;
    
    watcherId = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: intervalMs,
        distanceInterval: 100 // meters
      },
      async (location) => {
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        };
        
        try {
          await updateUserLocation(userId, coords);
        } catch (error) {
          console.error('[locationWatcher] Failed to update location:', error);
        }
      }
    );
  };
  
  const stopWatching = () => {
    if (watcherId) {
      watcherId.remove();
      watcherId = null;
    }
  };
  
  return {
    startWatching,
    stopWatching
  };
}