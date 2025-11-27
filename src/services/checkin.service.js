import { supabase } from '../config/supabase';

/**
 * Check-in Service
 * Handles daily check-in operations
 */
export const checkinService = {
  /**
   * Create a daily check-in
   * @param {string} userId - User's ID
   * @param {Object} checkinData - Check-in data
   * @param {number} checkinData.mood - Mood rating 1-5
   * @param {string} [checkinData.triggerText] - What triggered the urge
   * @param {string} [checkinData.notes] - Additional notes
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async createCheckin(userId, { mood, triggerText, notes }) {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_checkins')
        .insert({
          user_id: userId,
          checkin_date: today,
          mood,
          trigger_text: triggerText || null,
          notes: notes || null,
        })
        .select()
        .single();

      if (error) {
        // Handle unique constraint violation (already checked in today)
        if (error.code === '23505') {
          return { data: null, error: new Error('Already checked in today') };
        }
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Create checkin error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Get today's check-in
   * @param {string} userId - User's ID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async getTodayCheckin(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .eq('checkin_date', today)
        .single();

      // Not found is not an error for this use case
      if (error && error.code === 'PGRST116') {
        return { data: null, error: null };
      }

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Get today checkin error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Check if user has checked in today
   * @param {string} userId - User's ID
   * @returns {Promise<boolean>}
   */
  async hasCheckedInToday(userId) {
    const { data } = await this.getTodayCheckin(userId);
    return !!data;
  },

  /**
   * Get check-in history
   * @param {string} userId - User's ID
   * @param {number} [days=7] - Number of days to retrieve
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  async getCheckinHistory(userId, days = 7) {
    try {
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .order('checkin_date', { ascending: false })
        .limit(days);

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Get checkin history error:', error.message);
      return { data: [], error };
    }
  },

  /**
   * Get check-ins within date range
   * @param {string} userId - User's ID
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  async getCheckinsInRange(userId, startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .gte('checkin_date', startDate)
        .lte('checkin_date', endDate)
        .order('checkin_date', { ascending: true });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Get checkins in range error:', error.message);
      return { data: [], error };
    }
  },

  /**
   * Get mood trend data
   * @param {string} userId - User's ID
   * @param {number} [days=30] - Number of days
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async getMoodTrend(userId, days = 30) {
    try {
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('checkin_date, mood')
        .eq('user_id', userId)
        .order('checkin_date', { ascending: true })
        .limit(days);

      if (error) throw error;

      // Calculate trend statistics
      const moods = (data || []).map((d) => d.mood).filter(Boolean);
      const average = moods.length > 0
        ? moods.reduce((a, b) => a + b, 0) / moods.length
        : 0;

      // Calculate trend direction
      let trend = 'stable';
      if (moods.length >= 7) {
        const firstHalf = moods.slice(0, Math.floor(moods.length / 2));
        const secondHalf = moods.slice(Math.floor(moods.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

        if (secondAvg > firstAvg + 0.3) trend = 'improving';
        else if (secondAvg < firstAvg - 0.3) trend = 'declining';
      }

      return {
        data: {
          entries: data || [],
          average: Math.round(average * 10) / 10,
          trend,
          totalCheckins: moods.length,
        },
        error: null,
      };
    } catch (error) {
      console.error('Get mood trend error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Get check-in streak (consecutive days)
   * @param {string} userId - User's ID
   * @returns {Promise<number>}
   */
  async getCheckinStreak(userId) {
    try {
      const { data } = await this.getCheckinHistory(userId, 365);
      if (!data || data.length === 0) return 0;

      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < data.length; i++) {
        const checkinDate = new Date(data[i].checkin_date);
        checkinDate.setHours(0, 0, 0, 0);

        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - i);

        if (checkinDate.getTime() === expectedDate.getTime()) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Get checkin streak error:', error.message);
      return 0;
    }
  },

  /**
   * Update a check-in
   * @param {string} checkinId - Check-in ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async updateCheckin(checkinId, updates) {
    try {
      const { data, error } = await supabase
        .from('daily_checkins')
        .update(updates)
        .eq('id', checkinId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Update checkin error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Get total check-in count
   * @param {string} userId - User's ID
   * @returns {Promise<number>}
   */
  async getTotalCheckinCount(userId) {
    try {
      const { count, error } = await supabase
        .from('daily_checkins')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('Get total checkin count error:', error.message);
      return 0;
    }
  },
};

export default checkinService;
