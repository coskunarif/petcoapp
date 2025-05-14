# Location Features

This document explains the implementation of location features in the PetCo app, which are vital for connecting service providers and service receivers in the same geographic area.

## Overview

Location functionality consists of several components:

1. **Location Service**: Core functionality for requesting permissions, getting current location, and updating user location in the database
2. **Location Settings Screen**: UI for users to manage their location preferences
3. **Location-based Matching**: Backend functionality to find nearby service providers (uses PostGIS)

## Implementation Details

### Location Service

The `locationService.ts` module provides the following functionality:

- Request location permissions (foreground and background)
- Get the user's current location
- Update location in the database
- Calculate distance between two points
- Format location for display
- Create a location watcher that updates a user's location at intervals

### Location Settings Screen

The Location Settings screen allows users to:

1. **Toggle Location Access**: Enable/disable the app's ability to access location
2. **Background Location**: Enable/disable background location access
3. **Precise Location**: Toggle between precise and approximate location sharing
4. **Auto-Update**: Choose whether location updates automatically when the app opens
5. **Manual Update**: Manually update location

### Database Schema

The `users` table contains a `location` column with PostGIS geography type to store user locations:

```sql
location geography -- Uses PostgreSQL PostGIS extension
```

The app uses `POINT(longitude latitude)` format to update this field.

### Finding Nearby Users

The `find_nearby_providers` SQL function uses PostGIS to find service providers within a specified distance:

```sql
create or replace function find_nearby_providers(
  user_location geography,
  distance_km double precision,
  service_type uuid,
  min_rating int
)
returns setof users
```

## Location Privacy

The app implements several privacy protections:

1. **Permission Transparency**: Clear explanation of why location is needed
2. **Precision Control**: Users can choose to share precise or approximate location
3. **Background Access Control**: Users can enable or disable background updates
4. **Manual Updates**: Users can update location only when needed
5. **Purpose Limitation**: Location is only shared when providing or receiving services

## Testing Location Features

For testing in development:
- Use the Expo location testing tools to simulate different locations
- On iOS simulator, use Features > Location to set custom locations
- On Android emulator, use the location controls in the Extended Controls panel

## Adding New Location Features

When adding new location-based features:

1. Use the existing locationService.ts functions to maintain consistency
2. Request permissions before accessing location
3. Always handle permission denied cases gracefully
4. Provide clear feedback about location usage
5. Consider privacy implications of any new location features