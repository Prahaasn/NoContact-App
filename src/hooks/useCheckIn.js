import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHECKINS_KEY = '@nocontact_checkins';

// Helper to format date as YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const useCheckIn = () => {
  const [todayCheckin, setTodayCheckin] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadTodayCheckin = useCallback(async () => {
    try {
      const today = formatDate(new Date());
      const checkins = await AsyncStorage.getItem(CHECKINS_KEY);
      const allCheckins = checkins ? JSON.parse(checkins) : [];

      // Find today's check-in
      const todaysCheckin = allCheckins.find((c) => {
        const checkinDate = formatDate(new Date(c.date));
        return checkinDate === today;
      });

      setTodayCheckin(todaysCheckin || null);
    } catch (error) {
      console.error('Error loading check-in:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodayCheckin();
  }, [loadTodayCheckin]);

  const saveCheckin = async (mood, triggers = [], notes = '') => {
    try {
      const today = formatDate(new Date());
      const checkinData = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        dateKey: today,
        mood,
        triggers,
        notes,
      };

      // Load existing check-ins
      const existing = await AsyncStorage.getItem(CHECKINS_KEY);
      const allCheckins = existing ? JSON.parse(existing) : [];

      // Check if already checked in today
      const existingTodayIndex = allCheckins.findIndex((c) => {
        const checkinDate = formatDate(new Date(c.date));
        return checkinDate === today;
      });

      if (existingTodayIndex >= 0) {
        // Update existing check-in
        allCheckins[existingTodayIndex] = {
          ...allCheckins[existingTodayIndex],
          ...checkinData,
        };
      } else {
        // Add new check-in
        allCheckins.push(checkinData);
      }

      // Save
      await AsyncStorage.setItem(CHECKINS_KEY, JSON.stringify(allCheckins));
      setTodayCheckin(checkinData);

      return { success: true, isNewCheckin: existingTodayIndex < 0 };
    } catch (error) {
      console.error('Error saving check-in:', error);
      return { success: false, error };
    }
  };

  const getCheckinHistory = async (days = 7) => {
    try {
      const checkins = await AsyncStorage.getItem(CHECKINS_KEY);
      const allCheckins = checkins ? JSON.parse(checkins) : [];

      // Sort by date descending
      return allCheckins
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, days);
    } catch (error) {
      console.error('Error getting check-in history:', error);
      return [];
    }
  };

  const getMoodStats = async (days = 30) => {
    try {
      const checkins = await AsyncStorage.getItem(CHECKINS_KEY);
      const allCheckins = checkins ? JSON.parse(checkins) : [];

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const recentCheckins = allCheckins.filter(
        (c) => new Date(c.date) >= cutoffDate
      );

      if (recentCheckins.length === 0) {
        return { averageMood: 0, totalCheckins: 0, moodTrend: 'neutral' };
      }

      const totalMood = recentCheckins.reduce((sum, c) => sum + (c.mood || 0), 0);
      const averageMood = totalMood / recentCheckins.length;

      // Calculate trend (compare first half to second half)
      const midpoint = Math.floor(recentCheckins.length / 2);
      const firstHalf = recentCheckins.slice(0, midpoint);
      const secondHalf = recentCheckins.slice(midpoint);

      const firstAvg = firstHalf.length > 0
        ? firstHalf.reduce((sum, c) => sum + (c.mood || 0), 0) / firstHalf.length
        : 0;
      const secondAvg = secondHalf.length > 0
        ? secondHalf.reduce((sum, c) => sum + (c.mood || 0), 0) / secondHalf.length
        : 0;

      let moodTrend = 'neutral';
      if (secondAvg > firstAvg + 0.5) moodTrend = 'improving';
      else if (secondAvg < firstAvg - 0.5) moodTrend = 'declining';

      return {
        averageMood: Math.round(averageMood * 10) / 10,
        totalCheckins: recentCheckins.length,
        moodTrend,
      };
    } catch (error) {
      console.error('Error getting mood stats:', error);
      return { averageMood: 0, totalCheckins: 0, moodTrend: 'neutral' };
    }
  };

  const hasCheckedInToday = () => {
    return todayCheckin !== null;
  };

  return {
    todayCheckin,
    loading,
    saveCheckin,
    getCheckinHistory,
    getMoodStats,
    refreshCheckin: loadTodayCheckin,
    hasCheckedInToday,
  };
};

export default useCheckIn;
