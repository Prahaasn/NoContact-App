import { supabase } from '../config/supabase';

/**
 * Profile Service
 * Handles user profile operations
 */
export const profileService = {
  /**
   * Get user profile
   * @param {string} userId - User's ID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Get profile error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Update user profile
   * @param {string} userId - User's ID
   * @param {Object} updates - Profile fields to update
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Update profile error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Set breakup date
   * @param {string} userId - User's ID
   * @param {Date|string} breakupDate - Date of breakup
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async setBreakupDate(userId, breakupDate) {
    const dateStr = breakupDate instanceof Date
      ? breakupDate.toISOString().split('T')[0]
      : breakupDate;

    return this.updateProfile(userId, { breakup_date: dateStr });
  },

  /**
   * Update notification preferences
   * @param {string} userId - User's ID
   * @param {Object} preferences - Notification preferences
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async updateNotificationPreferences(userId, preferences) {
    try {
      const { data: profile } = await this.getProfile(userId);
      const currentPrefs = profile?.notification_preferences || {};

      const { data, error } = await supabase
        .from('profiles')
        .update({
          notification_preferences: { ...currentPrefs, ...preferences },
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Update notification preferences error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Update theme preferences
   * @param {string} userId - User's ID
   * @param {Object} preferences - Theme preferences
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async updateThemePreferences(userId, preferences) {
    try {
      const { data: profile } = await this.getProfile(userId);
      const currentPrefs = profile?.theme_preferences || {};

      const { data, error } = await supabase
        .from('profiles')
        .update({
          theme_preferences: { ...currentPrefs, ...preferences },
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Update theme preferences error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Set ex's name (optional personalization)
   * @param {string} userId - User's ID
   * @param {string} exName - Ex's name
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async setExName(userId, exName) {
    return this.updateProfile(userId, { ex_name: exName });
  },

  /**
   * Get days since breakup
   * @param {string} userId - User's ID
   * @returns {Promise<number|null>}
   */
  async getDaysSinceBreakup(userId) {
    try {
      const { data } = await this.getProfile(userId);
      if (!data?.breakup_date) return null;

      const breakupDate = new Date(data.breakup_date);
      const now = new Date();
      const diffTime = Math.abs(now - breakupDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return diffDays;
    } catch (error) {
      console.error('Get days since breakup error:', error.message);
      return null;
    }
  },
};

export default profileService;
