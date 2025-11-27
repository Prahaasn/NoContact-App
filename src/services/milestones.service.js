import { supabase } from '../config/supabase';

/**
 * Milestones Service
 * Handles achievement milestones
 */

// Define milestone thresholds
export const MILESTONE_THRESHOLDS = {
  streak: [1, 3, 7, 14, 21, 30, 60, 90, 180, 365],
  emergency_avoided: [1, 5, 10],
  journal: [1, 10, 25, 50, 100],
  checkin: [7, 30, 100],
};

export const milestonesService = {
  /**
   * Get all milestones for a user
   * @param {string} userId - User's ID
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  async getMilestones(userId) {
    try {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('user_id', userId)
        .order('achieved_at', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Get milestones error:', error.message);
      return { data: [], error };
    }
  },

  /**
   * Get unacknowledged milestones
   * @param {string} userId - User's ID
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  async getUnacknowledgedMilestones(userId) {
    try {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('user_id', userId)
        .eq('is_acknowledged', false)
        .order('achieved_at', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Get unacknowledged milestones error:', error.message);
      return { data: [], error };
    }
  },

  /**
   * Award a milestone
   * @param {string} userId - User's ID
   * @param {string} milestoneType - Type of milestone
   * @returns {Promise<{data: Object|null, error: Error|null, alreadyExists: boolean}>}
   */
  async awardMilestone(userId, milestoneType) {
    try {
      const { data, error } = await supabase
        .from('milestones')
        .insert({
          user_id: userId,
          milestone_type: milestoneType,
          is_acknowledged: false,
        })
        .select()
        .single();

      // Handle unique constraint (milestone already exists)
      if (error && error.code === '23505') {
        return { data: null, error: null, alreadyExists: true };
      }

      if (error) throw error;

      return { data, error: null, alreadyExists: false };
    } catch (error) {
      console.error('Award milestone error:', error.message);
      return { data: null, error, alreadyExists: false };
    }
  },

  /**
   * Acknowledge a milestone
   * @param {string} milestoneId - Milestone ID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async acknowledgeMilestone(milestoneId) {
    try {
      const { data, error } = await supabase
        .from('milestones')
        .update({ is_acknowledged: true })
        .eq('id', milestoneId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Acknowledge milestone error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Acknowledge all milestones for a user
   * @param {string} userId - User's ID
   * @returns {Promise<{error: Error|null}>}
   */
  async acknowledgeAllMilestones(userId) {
    try {
      const { error } = await supabase
        .from('milestones')
        .update({ is_acknowledged: true })
        .eq('user_id', userId)
        .eq('is_acknowledged', false);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Acknowledge all milestones error:', error.message);
      return { error };
    }
  },

  /**
   * Check and award streak milestones
   * @param {string} userId - User's ID
   * @param {number} currentStreak - Current streak value
   * @returns {Promise<Array>} Array of newly awarded milestones
   */
  async checkStreakMilestones(userId, currentStreak) {
    const awarded = [];

    for (const threshold of MILESTONE_THRESHOLDS.streak) {
      if (currentStreak >= threshold) {
        const milestoneType = `streak_${threshold}`;
        const { alreadyExists } = await this.awardMilestone(userId, milestoneType);
        if (!alreadyExists) {
          awarded.push(milestoneType);
        }
      }
    }

    return awarded;
  },

  /**
   * Check and award journal milestones
   * @param {string} userId - User's ID
   * @param {number} entryCount - Total journal entries
   * @returns {Promise<Array>} Array of newly awarded milestones
   */
  async checkJournalMilestones(userId, entryCount) {
    const awarded = [];

    for (const threshold of MILESTONE_THRESHOLDS.journal) {
      if (entryCount >= threshold) {
        const milestoneType = `journal_${threshold}`;
        const { alreadyExists } = await this.awardMilestone(userId, milestoneType);
        if (!alreadyExists) {
          awarded.push(milestoneType);
        }
      }
    }

    return awarded;
  },

  /**
   * Check and award emergency avoided milestones
   * @param {string} userId - User's ID
   * @param {number} avoidedCount - Number of emergencies avoided
   * @returns {Promise<Array>} Array of newly awarded milestones
   */
  async checkEmergencyMilestones(userId, avoidedCount) {
    const awarded = [];

    // Check for first emergency avoided
    if (avoidedCount >= 1) {
      const { alreadyExists } = await this.awardMilestone(userId, 'emergency_avoided');
      if (!alreadyExists) {
        awarded.push('emergency_avoided');
      }
    }

    // Check for milestone counts
    for (const threshold of MILESTONE_THRESHOLDS.emergency_avoided) {
      if (threshold > 1 && avoidedCount >= threshold) {
        const milestoneType = `emergency_avoided_${threshold}`;
        const { alreadyExists } = await this.awardMilestone(userId, milestoneType);
        if (!alreadyExists) {
          awarded.push(milestoneType);
        }
      }
    }

    return awarded;
  },

  /**
   * Check and award check-in milestones
   * @param {string} userId - User's ID
   * @param {number} checkinCount - Total check-ins
   * @returns {Promise<Array>} Array of newly awarded milestones
   */
  async checkCheckinMilestones(userId, checkinCount) {
    const awarded = [];

    for (const threshold of MILESTONE_THRESHOLDS.checkin) {
      if (checkinCount >= threshold) {
        const milestoneType = `checkin_${threshold}`;
        const { alreadyExists } = await this.awardMilestone(userId, milestoneType);
        if (!alreadyExists) {
          awarded.push(milestoneType);
        }
      }
    }

    return awarded;
  },

  /**
   * Get milestone details (display info)
   * @param {string} milestoneType - Type of milestone
   * @returns {Object} Milestone display information
   */
  getMilestoneInfo(milestoneType) {
    const milestoneInfo = {
      // Streak milestones
      streak_1: { title: 'First Day', description: 'Completed your first day of no contact', icon: '🌱' },
      streak_3: { title: '3 Day Warrior', description: '3 days of staying strong', icon: '💪' },
      streak_7: { title: 'One Week Wonder', description: 'A full week of no contact', icon: '⭐' },
      streak_14: { title: 'Two Week Champion', description: '14 days of dedication', icon: '🏆' },
      streak_21: { title: 'Habit Formed', description: '21 days - they say habits form in 21 days!', icon: '🎯' },
      streak_30: { title: 'Monthly Master', description: 'One full month of healing', icon: '🌟' },
      streak_60: { title: 'Two Month Triumph', description: '60 days of growth', icon: '🔥' },
      streak_90: { title: 'Quarter Champion', description: '90 days - you\'re unstoppable!', icon: '👑' },
      streak_180: { title: 'Half Year Hero', description: '6 months of incredible strength', icon: '🦸' },
      streak_365: { title: 'One Year Legend', description: 'A full year! You\'re amazing!', icon: '🏅' },

      // Emergency milestones
      emergency_avoided: { title: 'Crisis Averted', description: 'Resisted the urge to reach out', icon: '🛡️' },
      emergency_avoided_5: { title: 'Urge Fighter', description: 'Resisted 5 urges to contact', icon: '⚔️' },
      emergency_avoided_10: { title: 'Temptation Master', description: 'Resisted 10 urges - incredible!', icon: '🏰' },

      // Journal milestones
      journal_1: { title: 'First Entry', description: 'Started your healing journal', icon: '📝' },
      journal_10: { title: 'Journaling Habit', description: '10 journal entries completed', icon: '📖' },
      journal_25: { title: 'Reflection Regular', description: '25 entries of self-discovery', icon: '📚' },
      journal_50: { title: 'Writing Warrior', description: '50 journal entries - amazing!', icon: '✍️' },
      journal_100: { title: 'Journal Master', description: '100 entries of growth', icon: '🎖️' },

      // Check-in milestones
      checkin_7: { title: 'Week of Check-ins', description: '7 daily check-ins completed', icon: '✅' },
      checkin_30: { title: 'Monthly Checker', description: '30 check-ins - consistency!', icon: '📊' },
      checkin_100: { title: 'Check-in Champion', description: '100 check-ins completed', icon: '🏆' },
    };

    return milestoneInfo[milestoneType] || {
      title: 'Achievement',
      description: 'You earned a milestone!',
      icon: '🎉',
    };
  },

  /**
   * Get total milestone count
   * @param {string} userId - User's ID
   * @returns {Promise<number>}
   */
  async getTotalMilestoneCount(userId) {
    try {
      const { count, error } = await supabase
        .from('milestones')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('Get milestone count error:', error.message);
      return 0;
    }
  },
};

export default milestonesService;
