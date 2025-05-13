import { createSelector } from 'reselect';
import { RootState } from './store';

// Memoized selector for conversations state
// export const selectConversationsState = (state: RootState) => state.messaging?.conversations || {};

// export const selectConversations = createSelector(
//   [selectConversationsState],
//   (conversations) => ({
//     allIds: conversations.allIds || [],
//     byId: conversations.byId || {},
//     loading: conversations.loading || false,
//     error: conversations.error || null,
//   })
// );

// Memoized selector for auth user id
export const selectUserId = (state: RootState) => state.auth?.user?.id;

// Notification selectors
export const selectNotificationsState = (state: RootState) => state.notifications || {
  settings: [],
  masterEnabled: true,
  loading: false,
  error: null,
  lastUpdated: null
};

export const selectNotificationSettings = createSelector(
  [selectNotificationsState],
  (notifications) => notifications.settings
);

export const selectMasterEnabled = createSelector(
  [selectNotificationsState],
  (notifications) => notifications.masterEnabled
);

export const selectNotificationsLoading = createSelector(
  [selectNotificationsState],
  (notifications) => notifications.loading
);

export const selectNotificationById = (id: string) => createSelector(
  [selectNotificationSettings],
  (settings) => settings.find(setting => setting.id === id)
);
