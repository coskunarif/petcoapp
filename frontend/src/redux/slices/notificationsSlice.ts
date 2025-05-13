import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as notificationService from '../../services/notificationService';
import { NotificationSetting } from '../../services/notificationService';

// Define the state interface
interface NotificationsState {
  settings: NotificationSetting[];
  masterEnabled: boolean;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Initial state
const initialState: NotificationsState = {
  settings: notificationService.getDefaultSettings(),
  masterEnabled: true,
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks
export const fetchNotificationSettings = createAsyncThunk(
  'notifications/fetchSettings',
  async (userId: string, { rejectWithValue }) => {
    try {
      const userSettings = await notificationService.getNotificationSettings(userId);
      
      // Convert settings object to array format
      const settingsArray = notificationService.getDefaultSettings().map(defaultSetting => ({
        ...defaultSetting,
        enabled: userSettings.settings[defaultSetting.id] ?? defaultSetting.enabled,
      }));
      
      return {
        settings: settingsArray,
        masterEnabled: userSettings.masterEnabled,
        lastUpdated: userSettings.updatedAt,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch notification settings');
    }
  }
);

export const saveNotificationSettings = createAsyncThunk(
  'notifications/saveSettings',
  async ({ 
    userId, 
    settings, 
    masterEnabled 
  }: { 
    userId: string; 
    settings: NotificationSetting[]; 
    masterEnabled: boolean; 
  }, { rejectWithValue }) => {
    try {
      // Convert settings array to object format
      const settingsObj: { [key: string]: boolean } = {};
      settings.forEach(setting => {
        settingsObj[setting.id] = setting.enabled;
      });
      
      const result = await notificationService.saveNotificationSettings(
        userId,
        settingsObj,
        masterEnabled
      );
      
      // Convert back to array format for Redux state
      const settingsArray = settings.map(setting => ({
        ...setting,
        enabled: result.settings[setting.id] ?? setting.enabled,
      }));
      
      return {
        settings: settingsArray,
        masterEnabled: result.masterEnabled,
        lastUpdated: result.updatedAt,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save notification settings');
    }
  }
);

export const registerPushToken = createAsyncThunk(
  'notifications/registerPushToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = await notificationService.registerForPushNotifications();
      return { token };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to register for push notifications');
    }
  }
);

// Create the slice
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    updateSetting(state, action: PayloadAction<{ id: string; enabled: boolean }>) {
      const { id, enabled } = action.payload;
      const settingIndex = state.settings.findIndex(setting => setting.id === id);
      
      if (settingIndex !== -1) {
        state.settings[settingIndex].enabled = enabled;
      }
      
      // Check if all are enabled or disabled to update master toggle
      const allEnabled = state.settings.every(setting => setting.enabled);
      const allDisabled = state.settings.every(setting => !setting.enabled);
      
      if (allEnabled) state.masterEnabled = true;
      if (allDisabled) state.masterEnabled = false;
    },
    updateMasterToggle(state, action: PayloadAction<boolean>) {
      state.masterEnabled = action.payload;
      
      // Update all settings to match master toggle
      state.settings = state.settings.map(setting => ({
        ...setting,
        enabled: action.payload,
      }));
    },
    clearNotificationError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch notification settings
    builder.addCase(fetchNotificationSettings.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchNotificationSettings.fulfilled, (state, action) => {
      state.settings = action.payload.settings;
      state.masterEnabled = action.payload.masterEnabled;
      state.lastUpdated = action.payload.lastUpdated;
      state.loading = false;
    });
    builder.addCase(fetchNotificationSettings.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Save notification settings
    builder.addCase(saveNotificationSettings.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(saveNotificationSettings.fulfilled, (state, action) => {
      state.settings = action.payload.settings;
      state.masterEnabled = action.payload.masterEnabled;
      state.lastUpdated = action.payload.lastUpdated;
      state.loading = false;
    });
    builder.addCase(saveNotificationSettings.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Registration doesn't modify state directly, but can trigger errors
    builder.addCase(registerPushToken.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

export const { updateSetting, updateMasterToggle, clearNotificationError } = notificationsSlice.actions;
export default notificationsSlice.reducer;