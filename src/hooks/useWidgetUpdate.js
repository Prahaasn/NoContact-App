import { useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { widgetDataService } from '../utils/widgetData';

/**
 * Hook to automatically update home screen widgets when streak data changes
 *
 * @param {Object} streakData - The current streak data
 * @param {number} streakData.currentStreak - Current no-contact streak in days
 * @param {number} streakData.longestStreak - Longest streak achieved (optional)
 * @param {string} streakData.encouragementMessage - Custom message (optional)
 *
 * @returns {Object} - { updateWidget: Function, isUpdating: boolean }
 */
export const useWidgetUpdate = (streakData) => {
  const isUpdating = useRef(false);
  const lastUpdateTime = useRef(null);
  const appState = useRef(AppState.currentState);

  // Debounce updates to prevent too frequent calls
  const MIN_UPDATE_INTERVAL = 1000; // 1 second minimum between updates

  const updateWidget = useCallback(async (customMessage = null) => {
    if (!streakData && streakData !== 0) {
      return { success: false, error: 'No streak data provided' };
    }

    // Prevent concurrent updates
    if (isUpdating.current) {
      return { success: false, error: 'Update already in progress' };
    }

    // Debounce check
    const now = Date.now();
    if (lastUpdateTime.current && now - lastUpdateTime.current < MIN_UPDATE_INTERVAL) {
      return { success: false, error: 'Update too frequent' };
    }

    isUpdating.current = true;
    lastUpdateTime.current = now;

    try {
      const dataToUpdate = typeof streakData === 'number'
        ? { currentStreak: streakData }
        : streakData;

      if (customMessage) {
        dataToUpdate.encouragementMessage = customMessage;
      }

      const result = await widgetDataService.updateWidgetData(dataToUpdate);

      isUpdating.current = false;
      return result;
    } catch (error) {
      isUpdating.current = false;
      console.error('Widget update failed:', error);
      return { success: false, error };
    }
  }, [streakData]);

  // Update widget when streak data changes
  useEffect(() => {
    if (streakData !== null && streakData !== undefined) {
      updateWidget();
    }
  }, [streakData, updateWidget]);

  // Update widget when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground, refresh widget data
        if (streakData !== null && streakData !== undefined) {
          updateWidget();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription?.remove();
    };
  }, [streakData, updateWidget]);

  return {
    updateWidget,
    refreshWidgets: widgetDataService.refreshWidgets,
  };
};

/**
 * Hook to sync widget data on app startup
 * Call this once in your app's root component
 */
export const useWidgetSync = (getStreakData) => {
  useEffect(() => {
    const syncWidgetData = async () => {
      try {
        const streakData = await getStreakData();
        if (streakData !== null && streakData !== undefined) {
          await widgetDataService.updateWidgetData({
            currentStreak: typeof streakData === 'number' ? streakData : streakData.currentStreak,
            longestStreak: typeof streakData === 'number' ? streakData : streakData.longestStreak,
          });
        }
      } catch (error) {
        console.error('Failed to sync widget data on startup:', error);
      }
    };

    syncWidgetData();
  }, [getStreakData]);
};

export default useWidgetUpdate;
