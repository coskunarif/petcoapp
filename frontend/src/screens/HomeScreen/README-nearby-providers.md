# Nearby Providers Feature

This document explains the implementation of the Nearby Providers feature in the PetCo app, which shows pet service providers in the user's geographic area.

## Overview

The Nearby Providers section on the Home screen displays a list of service providers who are located within a certain radius of the user's current location. This feature relies on:

1. **User Location**: Obtained via Expo's Location API
2. **PostGIS Database Function**: To perform geographic queries
3. **Redux State Management**: To store and update provider data

## Implementation Details

### Location Handling

The app uses the `locationService.ts` module to:
- Request location permissions from the user
- Get the current location coordinates
- Format location data for the PostGIS database (POINT format)

### Database Integration

The core of this feature is the `find_nearby_providers` PostgreSQL function:

```sql
find_nearby_providers(
  user_location GEOGRAPHY,  -- User's current location
  distance_km DOUBLE PRECISION,  -- Search radius
  service_type UUID DEFAULT NULL,  -- Optional service type filter
  min_rating INT DEFAULT 0  -- Minimum provider rating
)
```

This function returns providers within the specified distance, along with:
- Basic provider information (name, profile image, rating)
- Calculated distance from user
- Service types offered by the provider
- Availability information

### Frontend Integration

The HomeScreen component:
1. Gets the user's location using `getCurrentLocation()`
2. Dispatches the `fetchDashboardData` action, which includes nearby providers
3. Displays providers using the `NearbyProvidersSection` component

### Error Handling

The feature includes several robustness measures:
- Validation of location coordinates before queries
- Graceful error handling with user-friendly empty states
- Detailed error logging for debugging

## Troubleshooting

If the Nearby Providers section isn't displaying properly:

1. Check location permissions in app settings
2. Verify location data is valid in Redux state
3. Ensure the database function is correctly deployed
4. Look for errors in API responses in console logs

## Further Development

Possible enhancements for this feature:

1. Add filtering by service type directly in the UI
2. Implement a map view of nearby providers
3. Add sorting options (by distance, rating, etc.)
4. Add "favorite providers" functionality