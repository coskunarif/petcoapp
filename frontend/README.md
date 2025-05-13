# Pet Care Co-Op Mobile App (Frontend)

## Getting Started

1. Install dependencies:
   ```sh
   npm install
   ```
2. Set your Supabase project URL and anon key in `src/api/supabaseClient.js`.
3. Start the app:
   ```sh
   npm start
   ```

## Project Structure
- `App.js`: Entry point
- `src/navigation/`: Navigation setup
- `src/screens/`: App screens
- `src/redux/`: Redux store and slices
- `src/api/`: Supabase client and API hooks
- `src/components/`: Reusable UI components
- `src/services/`: Business logic and backend integrations
- `src/migrations/`: SQL migration scripts for Supabase

## Notes
- Uses React Native Paper for UI
- Redux Toolkit for state management
- React Navigation for navigation
- Formik/Yup for forms & validation
- react-native-maps for map/location features
- Expo Notifications for push notifications

## Features

### Profile Management
- Edit personal information
- Update profile pictures
- Location settings

### Notifications
- User-configurable notification preferences
- Push notifications for messages and service updates
- See `src/screens/profile/settings/README-notifications.md` for setup instructions
