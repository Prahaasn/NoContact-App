import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = '@nocontact_streak_data';
const STREAK_START_KEY = '@nocontact_streak_start';
const CHECKINS_KEY = '@nocontact_checkins';

// Helper to format date as YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Helper to get difference in days between two dates
const getDaysDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  const diffTime = Math.abs(d2 - d1);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const useStreak = () => {
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalDays: 0,
    lastCheckinDate: null,
    startDate: null,
  });
  const [loading, setLoading] = useState(true);

  const loadStreak = useCallback(async () => {
    try {
      // Load streak data
      const data = await AsyncStorage.getItem(STREAK_KEY);

      if (data) {
        const parsed = JSON.parse(data);

        // Check if streak should be reset (missed a day)
        if (parsed.lastCheckinDate) {
          const today = formatDate(new Date());
          const lastCheckin = parsed.lastCheckinDate;
          const daysSinceLastCheckin = getDaysDifference(lastCheckin, today);

          if (daysSinceLastCheckin > 1) {
            // Streak broken! Reset current streak but keep longest
            const newData = {
              ...parsed,
              currentStreak: 0,
              longestStreak: Math.max(parsed.longestStreak, parsed.currentStreak),
            };
            await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(newData));
            setStreakData(newData);
          } else {
            setStreakData(parsed);
          }
        } else {
          setStreakData(parsed);
        }
      } else {
        // First time user - initialize data
        // Check if there's legacy data from old streak system
        const legacyStart = await AsyncStorage.getItem(STREAK_START_KEY);
        const checkins = await AsyncStorage.getItem(CHECKINS_KEY);
        const checkinsArray = checkins ? JSON.parse(checkins) : [];

        let initialStreak = 0;
        let totalDays = checkinsArray.length;

        if (legacyStart) {
          // Calculate streak from legacy start date
          const start = new Date(legacyStart);
          const now = new Date();
          const diffTime = Math.abs(now - start);
          initialStreak = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }

        const today = formatDate(new Date());
        const initialData = {
          currentStreak: initialStreak,
          longestStreak: initialStreak,
          totalDays: totalDays,
          lastCheckinDate: checkinsArray.length > 0
            ? formatDate(new Date(checkinsArray[checkinsArray.length - 1].date))
            : null,
          startDate: today,
        };

        await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(initialData));
        setStreakData(initialData);
      }
    } catch (error) {
      console.error('Error loading streak:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStreak();
  }, [loadStreak]);

  const incrementStreak = async () => {
    const today = formatDate(new Date());

    // Don't allow multiple check-ins per day
    if (streakData.lastCheckinDate === today) {
      return { success: false, message: 'Already checked in today!' };
    }

    // Check if this continues the streak or starts a new one
    let newStreak;
    if (streakData.lastCheckinDate) {
      const daysSinceLastCheckin = getDaysDifference(streakData.lastCheckinDate, today);

      if (daysSinceLastCheckin === 1) {
        // Continuing the streak
        newStreak = streakData.currentStreak + 1;
      } else if (daysSinceLastCheckin === 0) {
        // Same day - shouldn't happen but handle it
        return { success: false, message: 'Already checked in today!' };
      } else {
        // Streak was broken, start fresh
        newStreak = 1;
      }
    } else {
      // First check-in ever
      newStreak = 1;
    }

    const newTotalDays = streakData.totalDays + 1;
    const newLongestStreak = Math.max(streakData.longestStreak, newStreak);

    const newData = {
      ...streakData,
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      totalDays: newTotalDays,
      lastCheckinDate: today,
    };

    try {
      await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(newData));
      setStreakData(newData);
      return { success: true, newStreak };
    } catch (error) {
      console.error('Error incrementing streak:', error);
      return { success: false, message: 'Failed to save streak' };
    }
  };

  const resetStreak = async (reason = 'contact_broken') => {
    try {
      const newData = {
        ...streakData,
        currentStreak: 0,
        longestStreak: Math.max(streakData.longestStreak, streakData.currentStreak),
        lastCheckinDate: null,
      };

      await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(newData));
      setStreakData(newData);

      // Log the reset
      await logStreakReset(reason, streakData.currentStreak);

      return { success: true };
    } catch (error) {
      console.error('Error resetting streak:', error);
      return { success: false };
    }
  };

  const logStreakReset = async (reason, streakAtReset) => {
    try {
      const logKey = '@nocontact_streak_resets';
      const log = await AsyncStorage.getItem(logKey);
      const logs = log ? JSON.parse(log) : [];
      logs.push({
        date: new Date().toISOString(),
        streakAtReset,
        reason,
      });
      await AsyncStorage.setItem(logKey, JSON.stringify(logs));
    } catch (error) {
      console.error('Error logging reset:', error);
    }
  };

  const hasCheckedInToday = () => {
    const today = formatDate(new Date());
    return streakData.lastCheckinDate === today;
  };

  return {
    streakData,
    loading,
    incrementStreak,
    resetStreak,
    refreshStreak: loadStreak,
    hasCheckedInToday,
  };
};

export default useStreak;
