import { createSelector } from 'reselect';
import { RootState } from '../store';

// Memoized selector for conversations state
export const selectConversationsState = (state: RootState) => state.messaging?.conversations || {};

export const selectConversations = createSelector(
  [selectConversationsState],
  (conversations) => ({
    allIds: conversations.allIds || [],
    byId: conversations.byId || {},
    loading: conversations.loading || false,
    error: conversations.error || null,
  })
);

// Memoized selector for auth user id
export const selectUserId = (state: RootState) => state.auth?.user?.id;
