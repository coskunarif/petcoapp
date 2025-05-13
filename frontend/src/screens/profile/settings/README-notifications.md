# Notifications System

This document explains the implementation of the notifications system in the PetCo app.

## Architecture Overview

The notifications system allows users to manage their notification preferences and enables the app to receive push notifications. It consists of:

1. **Frontend Components**:
   - `NotificationSettingsScreen`: UI for users to manage notification settings
   - `notificationsSlice`: Redux slice for notifications state management
   - `notificationService`: Service for interacting with the backend
   
2. **Database**:
   - `user_notification_settings` table in Supabase
   - Stores preferences and push token

3. **Push Notifications**:
   - Uses Expo's Push Notification service
   - Manages device tokens and permissions

## Setup Instructions

### 1. Create the Database Table

Execute the SQL script in `/src/migrations/create_notification_settings_table.sql` in your Supabase database. This creates:

- The `user_notification_settings` table
- Row-level security policies
- A trigger to create default settings for new users

### 2. Install Required Dependencies

Install the necessary Expo packages for notifications:

```bash
# Run in the frontend directory
npm install expo-device expo-notifications
```

If you encounter dependency conflicts, you can try:

```bash
npm install --legacy-peer-deps expo-device expo-notifications
# OR
npx expo install expo-device expo-notifications
```

### 3. Configure Expo Push Notifications

1. Make sure your app.json/app.config.js includes:
```json
"expo": {
  "notification": {
    "icon": "./assets/notification-icon.png",
    "color": "#6C63FF",
    "androidMode": "default"
  },
  "plugins": [
    [
      "expo-notifications",
      {
        "icon": "./assets/notification-icon.png",
        "color": "#6C63FF"
      }
    ]
  ]
}
```

2. Add the EAS project ID to your environment variables:
```
EXPO_PUBLIC_EAS_PROJECT_ID=your-eas-project-id
```

### Troubleshooting

If you encounter dependency errors when bundling, such as:
```
Unable to resolve "expo-device" from "src\services\notificationService.ts"
```

You have two options:

1. Install the required dependencies as mentioned above
2. The code has been written to handle missing dependencies gracefully - the notification settings UI will still work, but push notification registration will be disabled until dependencies are properly installed

### 3. Backend Integration

For a complete system, you will need to implement:

1. Push notification sending from your server
2. Activity/notification tracking for users
3. Administrative controls for system notifications

## Using the Notifications API

### Check if Notifications are Enabled

```typescript
import { useSelector } from 'react-redux';
import { selectNotificationsState } from '../redux/selectors';

const MyComponent = () => {
  // Get all notification settings
  const { settings, masterEnabled } = useSelector(selectNotificationsState);
  
  // Check if specific notification type is enabled
  const isMessagesEnabled = masterEnabled && 
    settings.find(s => s.id === 'messages')?.enabled;
  
  // ...rest of your component
};
```

### Register for Push Notifications

```typescript
import { useDispatch } from 'react-redux';
import { registerPushToken } from '../redux/slices/notificationsSlice';

const MyComponent = () => {
  const dispatch = useDispatch();
  
  // Call this during app initialization or when user logs in
  const setupNotifications = async () => {
    await dispatch(registerPushToken());
  };
  
  // ...rest of your component
};
```

## Testing Notifications

1. **Local Testing**: Use the Expo development server to test notifications
2. **Production Testing**: Use the Expo Push API to send test notifications

```bash
# Example of using Expo CLI to send a test notification
expo push:send --to "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]" --title "Test Notification" --body "This is a test notification"
```

## Troubleshooting

- If notifications aren't working on physical devices, check device permissions
- For emulators/simulators, notifications won't work (limitation of Expo)
- Check Supabase logs for any database errors related to notification settings
- Verify the push token is being saved correctly in the database