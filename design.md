# Services Screen: Implementation Design

Based on your navigation structure, the Services screen will be a crucial component where users can browse, offer, and manage pet care services within the co-op community.

## 1. Screen Purpose & User Flow

The Services screen should serve as the central marketplace where users can:
- Browse services offered by other pet owners
- View their own service listings
- Track service requests (both sent and received)
- Filter and search for specific service types

## 2. Component Structure

```
ServicesScreen/
├── TabNavigator/
│   ├── BrowseServicesTab/
│   │   ├── ServiceFilterBar/
│   │   ├── ServicesList/
│   │   └── ServiceCard/
│   ├── MyListingsTab/
│   │   ├── ActiveListingsSection/
│   │   ├── ListingCard/
│   │   └── EmptyListingsState/
│   └── RequestsTab/
│       ├── RequestsFilterToggle/
│       ├── RequestsList/
│       └── RequestCard/
├── ServiceDetailModal/
└── RequestDetailModal/
```

## 3. Data Architecture

### Service Listing Entity
- Service type (walking, boarding, sitting, etc.)
- Provider details
- Availability schedule
- Location/range
- Credit cost
- Description
- Photos (optional)

### Request Entity
- Service type reference
- Provider and requester reference
- Pet reference
- Time/date details
- Status (pending, accepted, completed, canceled)
- Location details
- Special instructions

## 4. Screen Flows

### Browse Services Flow
1. User navigates to Services tab
2. System loads nearby service listings by default
3. User can filter by service type, distance, availability
4. User taps on service to view details
5. User can request service from detail view

### My Listings Flow
1. User switches to My Listings tab
2. System loads user's active service listings
3. User can edit, pause, or delete listings
4. User can view request history for each listing

### Requests Flow
1. User switches to Requests tab
2. System loads pending/active requests
3. User toggles between "As Provider" and "As Requester" views
4. User can accept/decline/cancel requests based on status
5. User can view request details

## 5. Supabase Integration

### Data Queries
- Fetch nearby services based on user location
- Fetch user's service listings
- Fetch service requests (as provider or requester)
- Real-time updates for request status changes

### Stored Procedures
- Create service request with transaction handling
- Update service request status with credit transactions
- Find nearby providers with geospatial queries

## 6. State Management

### Redux Store Structure
- Current tab selection
- Filter/search parameters
- Loading states for each tab
- Service listing data
- Request data with categorization

### Selector Functions
- Filter services by type, distance, availability
- Group requests by status
- Calculate distance from user's location

## 7. UI Components Specification

### Service Card
- Service type icon (left)
- Provider name and rating
- Service description (truncated)
- Credit cost (prominent)
- Distance from user

### Request Card
- Pet photo (small, left)
- Service type and date/time
- Status badge with appropriate color
- Action buttons based on status

### Filter Bar
- Horizontal scrolling service type selectors
- Distance radius selector
- Date/time filter
- Sort options (price, distance, rating)

## 8. Real-time Updates

- Subscribe to changes on requests table
- Update UI immediately on status changes
- Push notifications for request updates
- Optimistic updates for request actions

## 9. Geolocation Integration

- Periodic location updates (when app is active)
- Distance calculation for nearby services
- Map integration for service locations
- Location permission handling

## 10. Error Handling

- Location services unavailable
- Network connectivity issues
- Transaction failures
- Empty result sets with helpful guidance

## 11. Performance Optimizations

- Pagination for service listings
- Caching strategy for frequent queries
- Background data prefetching
- Debounced filter updates

## 12. UI/UX Considerations

- Pull-to-refresh for all lists
- Skeleton loaders during data fetching
- Animated transitions between tabs
- Success/error feedback animations
- Empty states with clear CTAs

## 13. Business Logic

- Credit verification before request submission
- Availability validation
- Conflict detection for overlapping requests
- Rating prompts after service completion

## 14. Cross-cutting Concerns

- Analytics for user engagement metrics
- Error logging and monitoring
- A/B testing for conversion optimization
- Accessibility considerations

This implementation design provides a comprehensive framework for developing the Services screen, which is core to your app's functionality. The approach emphasizes usability, performance, and maintainability while ensuring all the key features are covered.