import { supabase } from '../config/supabase';

/**
 * Streak Service
 * Handles all streak-related operations
 */
export const streakService = {
  /**
   * Get user's streak data
   * @param {string} userId - User's ID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async getStreak(userId) {
    try {
      const { data, error } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      // If no streak exists, return null (not an error)
      if (error && error.code === 'PGRST116') {
        return { data: null, error: null };
      }

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Get streak error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Create initial streak for new user
   * @param {string} userId - User's ID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async createStreak(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('streaks')
        .insert({
          user_id: userId,
          current_streak: 0,
          longest_streak: 0,
          total_days: 0,
          streak_start_date: today,
          last_checkin_date: null,
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Create streak error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Get or create streak (ensures streak exists)
   * @param {string} userId - User's ID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async getOrCreateStreak(userId) {
    const { data: existingStreak } = await this.getStreak(userId);

    if (existingStreak) {
      return { data: existingStreak, error: null };
    }

    return this.createStreak(userId);
  },

  /**
   * Update streak values
   * @param {string} userId - User's ID
   * @param {Object} updates - Streak fields to update
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async updateStreak(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('streaks')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Update streak error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Increment streak (called when user checks in)
   * @param {string} userId - User's ID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async incrementStreak(userId) {
    try {
      const { data: current } = await this.getOrCreateStreak(userId);
      if (!current) throw new Error('Failed to get streak');

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Check if already checked in today
      if (current.last_checkin_date === today) {
        return { data: current, error: null };
      }

      let newStreak;
      let newStreakStart = current.streak_start_date;

      // Check if streak continues from yesterday
      if (current.last_checkin_date === yesterdayStr) {
        newStreak = current.current_streak + 1;
      } else if (!current.last_checkin_date) {
        // First ever check-in
        newStreak = 1;
        newStreakStart = today;
      } else {
        // Streak was broken, start new
        newStreak = 1;
        newStreakStart = today;
      }

      const newLongest = Math.max(current.longest_streak, newStreak);
      const newTotal = current.total_days + 1;

      return this.updateStreak(userId, {
        current_streak: newStreak,
        longest_streak: newLongest,
        total_days: newTotal,
        last_checkin_date: today,
        streak_start_date: newStreakStart,
      });
    } catch (error) {
      console.error('Increment streak error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Reset streak (when user breaks no contact)
   * @param {string} userId - User's ID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async resetStreak(userId) {
    try {
      const { data: current } = await this.getOrCreateStreak(userId);
      if (!current) throw new Error('Failed to get streak');

      const today = new Date().toISOString().split('T')[0];
      const newLongest = Math.max(current.longest_streak, current.current_streak);

      return this.updateStreak(userId, {
        current_streak: 0,
        longest_streak: newLongest,
        streak_start_date: today,
        last_checkin_date: null,
      });
    } catch (error) {
      console.error('Reset streak error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Calculate current streak from streak_start_date
   * @param {string} userId - User's ID
   * @returns {Promise<number>}
   */
  async calculateCurrentStreak(userId) {
    try {
      const { data } = await this.getStreak(userId);
      if (!data?.streak_start_date) return 0;

      const startDate = new Date(data.streak_start_date);
      const now = new Date();
      const diffTime = Math.abs(now - startDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return diffDays;
    } catch (error) {
      console.error('Calculate streak error:', error.message);
      return 0;
    }
  },

  /**
   * Get streak statistics
   * @param {string} userId - User's ID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async getStreakStats(userId) {
    try {
      const { data, error } = await this.getStreak(userId);
      if (error) throw error;
      if (!data) return { data: { current: 0, longest: 0, total: 0 }, error: null };

      return {
        data: {
          current: data.current_streak,
          longest: data.longest_streak,
          total: data.total_days,
          startDate: data.streak_start_date,
          lastCheckin: data.last_checkin_date,
        },
        error: null,
      };
    } catch (error) {
      console.error('Get streak stats error:', error.message);
      return { data: null, error };
    }
  },
};

export default streakService;
