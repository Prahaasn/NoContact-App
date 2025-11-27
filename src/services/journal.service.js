import { supabase } from '../config/supabase';

/**
 * Journal Service
 * Handles journal entry operations
 */
export const journalService = {
  /**
   * Create a journal entry
   * @param {string} userId - User's ID
   * @param {Object} entryData - Entry data
   * @param {string} entryData.entryType - Type: 'quick_note', 'guided_prompt', 'unsent_letter', 'free_write'
   * @param {string} entryData.content - Entry content
   * @param {string} [entryData.title] - Entry title
   * @param {string} [entryData.promptId] - Prompt ID if guided
   * @param {number} [entryData.moodBefore] - Mood before writing (1-5)
   * @param {number} [entryData.moodAfter] - Mood after writing (1-5)
   * @param {boolean} [entryData.isLocked] - Whether entry is locked
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async createEntry(userId, entryData) {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: userId,
          entry_type: entryData.entryType,
          content: entryData.content,
          title: entryData.title || null,
          prompt_id: entryData.promptId || null,
          mood_before: entryData.moodBefore || null,
          mood_after: entryData.moodAfter || null,
          is_locked: entryData.isLocked || false,
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Create journal entry error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Get all journal entries
   * @param {string} userId - User's ID
   * @param {number} [limit=50] - Max entries to return
   * @param {number} [offset=0] - Offset for pagination
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  async getEntries(userId, limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Get journal entries error:', error.message);
      return { data: [], error };
    }
  },

  /**
   * Get a single entry by ID
   * @param {string} entryId - Entry ID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async getEntry(entryId) {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', entryId)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Get journal entry error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Get entries by type
   * @param {string} userId - User's ID
   * @param {string} entryType - Entry type to filter
   * @param {number} [limit=50] - Max entries to return
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  async getEntriesByType(userId, entryType, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('entry_type', entryType)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Get entries by type error:', error.message);
      return { data: [], error };
    }
  },

  /**
   * Get unsent letters
   * @param {string} userId - User's ID
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  async getUnsentLetters(userId) {
    return this.getEntriesByType(userId, 'unsent_letter');
  },

  /**
   * Update a journal entry
   * @param {string} entryId - Entry ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async updateEntry(entryId, updates) {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', entryId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Update journal entry error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Delete a journal entry
   * @param {string} entryId - Entry ID
   * @returns {Promise<{error: Error|null}>}
   */
  async deleteEntry(entryId) {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Delete journal entry error:', error.message);
      return { error };
    }
  },

  /**
   * Toggle lock status of an entry
   * @param {string} entryId - Entry ID
   * @param {boolean} isLocked - Lock status
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async toggleLock(entryId, isLocked) {
    return this.updateEntry(entryId, { is_locked: isLocked });
  },

  /**
   * Get total entry count
   * @param {string} userId - User's ID
   * @returns {Promise<number>}
   */
  async getTotalEntryCount(userId) {
    try {
      const { count, error } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('Get total entry count error:', error.message);
      return 0;
    }
  },

  /**
   * Get entry count by type
   * @param {string} userId - User's ID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async getEntryCountsByType(userId) {
    try {
      const types = ['quick_note', 'guided_prompt', 'unsent_letter', 'free_write'];
      const counts = {};

      for (const type of types) {
        const { count } = await supabase
          .from('journal_entries')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('entry_type', type);
        counts[type] = count || 0;
      }

      return { data: counts, error: null };
    } catch (error) {
      console.error('Get entry counts error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Search entries by content
   * @param {string} userId - User's ID
   * @param {string} searchTerm - Search term
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  async searchEntries(userId, searchTerm) {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .or(`content.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Search entries error:', error.message);
      return { data: [], error };
    }
  },

  /**
   * Get mood improvement statistics from journaling
   * @param {string} userId - User's ID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async getMoodImprovementStats(userId) {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('mood_before, mood_after')
        .eq('user_id', userId)
        .not('mood_before', 'is', null)
        .not('mood_after', 'is', null);

      if (error) throw error;

      const entries = data || [];
      if (entries.length === 0) {
        return { data: { averageImprovement: 0, improvedCount: 0, totalWithMood: 0 }, error: null };
      }

      let totalImprovement = 0;
      let improvedCount = 0;

      for (const entry of entries) {
        const improvement = entry.mood_after - entry.mood_before;
        totalImprovement += improvement;
        if (improvement > 0) improvedCount++;
      }

      return {
        data: {
          averageImprovement: Math.round((totalImprovement / entries.length) * 10) / 10,
          improvedCount,
          totalWithMood: entries.length,
          improvementRate: Math.round((improvedCount / entries.length) * 100),
        },
        error: null,
      };
    } catch (error) {
      console.error('Get mood improvement stats error:', error.message);
      return { data: null, error };
    }
  },
};

export default journalService;
