import { supabase } from '../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { streakService } from './streak.service';
import { checkinService } from './checkin.service';
import { journalService } from './journal.service';
import { emergencyService } from './emergency.service';
import { truthsService } from './truths.service';
import { milestonesService } from './milestones.service';
import { profileService } from './profile.service';

// Local storage keys for offline data
const SYNC_KEYS = {
  LAST_SYNC: '@nocontact_last_sync',
  OFFLINE_QUEUE: '@nocontact_offline_queue',
  CACHED_STREAK: '@nocontact_cached_streak',
  CACHED_CHECKINS: '@nocontact_cached_checkins',
  CACHED_ENTRIES: '@nocontact_cached_entries',
  CACHED_TRUTHS: '@nocontact_cached_truths',
  CACHED_MILESTONES: '@nocontact_cached_milestones',
};

/**
 * Sync Service
 * Handles offline-first data sync and real-time listeners
 */
export const syncService = {
  /**
   * Sync all data from cloud to local storage
   * @param {string} userId - User's ID
   * @returns {Promise<{success: boolean, error: Error|null}>}
   */
  async syncFromCloud(userId) {
    try {
      // Fetch all user data in parallel
      const [streak, checkins, entries, truths, milestones, profile] = await Promise.all([
        streakService.getStreak(userId),
        checkinService.getCheckinHistory(userId, 30),
        journalService.getEntries(userId, 100),
        truthsService.getSavedTruths(userId),
        milestonesService.getMilestones(userId),
        profileService.getProfile(userId),
      ]);

      // Store data locally
      await Promise.all([
        AsyncStorage.setItem(SYNC_KEYS.CACHED_STREAK, JSON.stringify(streak.data)),
        AsyncStorage.setItem(SYNC_KEYS.CACHED_CHECKINS, JSON.stringify(checkins.data)),
        AsyncStorage.setItem(SYNC_KEYS.CACHED_ENTRIES, JSON.stringify(entries.data)),
        AsyncStorage.setItem(SYNC_KEYS.CACHED_TRUTHS, JSON.stringify(truths.data)),
        AsyncStorage.setItem(SYNC_KEYS.CACHED_MILESTONES, JSON.stringify(milestones.data)),
        AsyncStorage.setItem(SYNC_KEYS.LAST_SYNC, new Date().toISOString()),
      ]);

      return { success: true, error: null, data: { streak, checkins, entries, truths, milestones, profile } };
    } catch (error) {
      console.error('Sync from cloud failed:', error.message);
      return { success: false, error };
    }
  },

  /**
   * Sync offline changes to cloud
   * @param {string} userId - User's ID
   * @returns {Promise<{success: boolean, error: Error|null}>}
   */
  async syncToCloud(userId) {
    try {
      // Get offline queue
      const queueData = await AsyncStorage.getItem(SYNC_KEYS.OFFLINE_QUEUE);
      const queue = queueData ? JSON.parse(queueData) : [];

      if (queue.length === 0) {
        return { success: true, error: null };
      }

      // Process each queued action
      for (const action of queue) {
        try {
          await this.processOfflineAction(userId, action);
        } catch (err) {
          console.error('Failed to process offline action:', err.message);
          // Continue with other actions
        }
      }

      // Clear the queue
      await AsyncStorage.setItem(SYNC_KEYS.OFFLINE_QUEUE, JSON.stringify([]));

      return { success: true, error: null };
    } catch (error) {
      console.error('Sync to cloud failed:', error.message);
      return { success: false, error };
    }
  },

  /**
   * Process a single offline action
   * @param {string} userId - User's ID
   * @param {Object} action - Action to process
   */
  async processOfflineAction(userId, action) {
    switch (action.type) {
      case 'checkin':
        await checkinService.createCheckin(userId, action.data);
        break;
      case 'journal_entry':
        await journalService.createEntry(userId, action.data);
        break;
      case 'emergency':
        await emergencyService.logEmergency(userId, action.data);
        break;
      case 'save_truth':
        await truthsService.saveTruth(userId, action.data);
        break;
      case 'remove_truth':
        await truthsService.removeSavedTruth(userId, action.data.truthId);
        break;
      default:
        console.warn('Unknown offline action type:', action.type);
    }
  },

  /**
   * Add action to offline queue
   * @param {string} type - Action type
   * @param {Object} data - Action data
   */
  async queueOfflineAction(type, data) {
    try {
      const queueData = await AsyncStorage.getItem(SYNC_KEYS.OFFLINE_QUEUE);
      const queue = queueData ? JSON.parse(queueData) : [];

      queue.push({
        type,
        data,
        timestamp: new Date().toISOString(),
      });

      await AsyncStorage.setItem(SYNC_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to queue offline action:', error.message);
    }
  },

  /**
   * Get cached data from local storage
   * @returns {Promise<Object>}
   */
  async getCachedData() {
    try {
      const [streak, checkins, entries, truths, milestones, lastSync] = await Promise.all([
        AsyncStorage.getItem(SYNC_KEYS.CACHED_STREAK),
        AsyncStorage.getItem(SYNC_KEYS.CACHED_CHECKINS),
        AsyncStorage.getItem(SYNC_KEYS.CACHED_ENTRIES),
        AsyncStorage.getItem(SYNC_KEYS.CACHED_TRUTHS),
        AsyncStorage.getItem(SYNC_KEYS.CACHED_MILESTONES),
        AsyncStorage.getItem(SYNC_KEYS.LAST_SYNC),
      ]);

      return {
        streak: streak ? JSON.parse(streak) : null,
        checkins: checkins ? JSON.parse(checkins) : [],
        entries: entries ? JSON.parse(entries) : [],
        truths: truths ? JSON.parse(truths) : [],
        milestones: milestones ? JSON.parse(milestones) : [],
        lastSync,
      };
    } catch (error) {
      console.error('Failed to get cached data:', error.message);
      return {
        streak: null,
        checkins: [],
        entries: [],
        truths: [],
        milestones: [],
        lastSync: null,
      };
    }
  },

  /**
   * Get last sync timestamp
   * @returns {Promise<string|null>}
   */
  async getLastSyncTime() {
    try {
      return await AsyncStorage.getItem(SYNC_KEYS.LAST_SYNC);
    } catch (error) {
      return null;
    }
  },

  /**
   * Check if we have pending offline changes
   * @returns {Promise<boolean>}
   */
  async hasPendingChanges() {
    try {
      const queueData = await AsyncStorage.getItem(SYNC_KEYS.OFFLINE_QUEUE);
      const queue = queueData ? JSON.parse(queueData) : [];
      return queue.length > 0;
    } catch (error) {
      return false;
    }
  },

  /**
   * Set up real-time listeners for data changes
   * @param {string} userId - User's ID
   * @param {Object} callbacks - Callback functions for different events
   * @returns {Function} Cleanup function to unsubscribe
   */
  setupRealtimeListeners(userId, callbacks = {}) {
    const channels = [];

    // Listen to streak changes
    if (callbacks.onStreakChange) {
      const streakChannel = supabase
        .channel('streak-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'streaks',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            callbacks.onStreakChange(payload.new, payload.eventType);
          }
        )
        .subscribe();

      channels.push(streakChannel);
    }

    // Listen to check-in changes
    if (callbacks.onCheckinChange) {
      const checkinChannel = supabase
        .channel('checkin-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'daily_checkins',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            callbacks.onCheckinChange(payload.new, payload.eventType);
          }
        )
        .subscribe();

      channels.push(checkinChannel);
    }

    // Listen to journal entry changes
    if (callbacks.onJournalChange) {
      const journalChannel = supabase
        .channel('journal-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'journal_entries',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            callbacks.onJournalChange(payload.new, payload.eventType);
          }
        )
        .subscribe();

      channels.push(journalChannel);
    }

    // Listen to milestone changes
    if (callbacks.onMilestoneChange) {
      const milestoneChannel = supabase
        .channel('milestone-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'milestones',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            callbacks.onMilestoneChange(payload.new, 'INSERT');
          }
        )
        .subscribe();

      channels.push(milestoneChannel);
    }

    // Return cleanup function
    return () => {
      channels.forEach((channel) => {
        channel.unsubscribe();
      });
    };
  },

  /**
   * Full sync - both directions
   * @param {string} userId - User's ID
   * @returns {Promise<{success: boolean, error: Error|null}>}
   */
  async fullSync(userId) {
    try {
      // First sync any offline changes to cloud
      const uploadResult = await this.syncToCloud(userId);
      if (!uploadResult.success) {
        console.warn('Upload sync had errors, continuing with download...');
      }

      // Then sync from cloud to local
      const downloadResult = await this.syncFromCloud(userId);

      return downloadResult;
    } catch (error) {
      console.error('Full sync failed:', error.message);
      return { success: false, error };
    }
  },

  /**
   * Clear all cached data (for logout)
   */
  async clearCache() {
    try {
      await AsyncStorage.multiRemove(Object.values(SYNC_KEYS));
    } catch (error) {
      console.error('Failed to clear cache:', error.message);
    }
  },

  /**
   * Update cached streak data
   * @param {Object} streakData - New streak data
   */
  async updateCachedStreak(streakData) {
    try {
      await AsyncStorage.setItem(SYNC_KEYS.CACHED_STREAK, JSON.stringify(streakData));
    } catch (error) {
      console.error('Failed to update cached streak:', error.message);
    }
  },

  /**
   * Check network connectivity
   * @returns {Promise<boolean>}
   */
  async isOnline() {
    try {
      // Try a simple request to Supabase
      const { error } = await supabase.from('profiles').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  },
};

export default syncService;
