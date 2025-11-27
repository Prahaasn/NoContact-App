import { supabase } from '../config/supabase';

/**
 * Emergency Service
 * Handles emergency event logging and statistics
 */
export const emergencyService = {
  /**
   * Log an emergency event
   * @param {string} userId - User's ID
   * @param {Object} eventData - Event data
   * @param {string} eventData.actionTaken - Action taken: 'stayed_strong', 'journaled', 'called_friend', 'used_truths', 'took_breath', 'broke_contact', 'other'
   * @param {boolean} [eventData.didBreakContact=false] - Whether contact was broken
   * @param {number} [eventData.durationSeconds] - How long emergency screen was used
   * @param {string} [eventData.notes] - Additional notes
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async logEmergency(userId, eventData) {
    try {
      const { data, error } = await supabase
        .from('emergency_events')
        .insert({
          user_id: userId,
          action_taken: eventData.actionTaken,
          did_break_contact: eventData.didBreakContact || false,
          duration_seconds: eventData.durationSeconds || null,
          notes: eventData.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Log emergency error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Get emergency event history
   * @param {string} userId - User's ID
   * @param {number} [limit=20] - Max events to return
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  async getEmergencyHistory(userId, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('emergency_events')
        .select('*')
        .eq('user_id', userId)
        .order('triggered_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Get emergency history error:', error.message);
      return { data: [], error };
    }
  },

  /**
   * Get emergency statistics
   * @param {string} userId - User's ID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async getEmergencyStats(userId) {
    try {
      const { data, error } = await supabase
        .from('emergency_events')
        .select('did_break_contact, action_taken, duration_seconds')
        .eq('user_id', userId);

      if (error) throw error;

      const events = data || [];

      if (events.length === 0) {
        return {
          data: {
            total: 0,
            stayedStrong: 0,
            brokeContact: 0,
            successRate: 100,
            actions: {},
            averageDuration: 0,
          },
          error: null,
        };
      }

      const stayedStrong = events.filter((e) => !e.did_break_contact).length;
      const brokeContact = events.filter((e) => e.did_break_contact).length;

      // Count actions
      const actions = events.reduce((acc, e) => {
        if (e.action_taken) {
          acc[e.action_taken] = (acc[e.action_taken] || 0) + 1;
        }
        return acc;
      }, {});

      // Calculate average duration
      const durationsWithValue = events.filter((e) => e.duration_seconds);
      const averageDuration = durationsWithValue.length > 0
        ? Math.round(
            durationsWithValue.reduce((sum, e) => sum + e.duration_seconds, 0) /
            durationsWithValue.length
          )
        : 0;

      return {
        data: {
          total: events.length,
          stayedStrong,
          brokeContact,
          successRate: Math.round((stayedStrong / events.length) * 100),
          actions,
          averageDuration,
        },
        error: null,
      };
    } catch (error) {
      console.error('Get emergency stats error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Get count of emergencies avoided (stayed strong)
   * @param {string} userId - User's ID
   * @returns {Promise<number>}
   */
  async getEmergenciesAvoided(userId) {
    try {
      const { count, error } = await supabase
        .from('emergency_events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('did_break_contact', false);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('Get emergencies avoided error:', error.message);
      return 0;
    }
  },

  /**
   * Update an emergency event
   * @param {string} eventId - Event ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async updateEmergency(eventId, updates) {
    try {
      const { data, error } = await supabase
        .from('emergency_events')
        .update(updates)
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Update emergency error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Get recent emergencies (last 24 hours)
   * @param {string} userId - User's ID
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  async getRecentEmergencies(userId) {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data, error } = await supabase
        .from('emergency_events')
        .select('*')
        .eq('user_id', userId)
        .gte('triggered_at', yesterday.toISOString())
        .order('triggered_at', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Get recent emergencies error:', error.message);
      return { data: [], error };
    }
  },

  /**
   * Get most effective coping strategy
   * @param {string} userId - User's ID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async getMostEffectiveStrategy(userId) {
    try {
      const { data, error } = await supabase
        .from('emergency_events')
        .select('action_taken, did_break_contact')
        .eq('user_id', userId)
        .eq('did_break_contact', false);

      if (error) throw error;

      const actions = (data || []).reduce((acc, e) => {
        if (e.action_taken) {
          acc[e.action_taken] = (acc[e.action_taken] || 0) + 1;
        }
        return acc;
      }, {});

      // Find most used successful strategy
      let mostEffective = null;
      let maxCount = 0;

      for (const [action, count] of Object.entries(actions)) {
        if (count > maxCount) {
          maxCount = count;
          mostEffective = action;
        }
      }

      return {
        data: {
          strategy: mostEffective,
          count: maxCount,
          allStrategies: actions,
        },
        error: null,
      };
    } catch (error) {
      console.error('Get most effective strategy error:', error.message);
      return { data: null, error };
    }
  },
};

export default emergencyService;
