import { supabase } from '../config/supabase';

/**
 * Truths Service
 * Handles saved truth reminders
 */
export const truthsService = {
  /**
   * Save a truth to favorites
   * @param {string} userId - User's ID
   * @param {Object} truth - Truth object
   * @param {string|number} truth.id - Truth ID from truthReminders.js
   * @param {string} truth.text - Truth text
   * @param {string} [truth.category] - Truth category
   * @returns {Promise<{data: Object|null, error: Error|null, alreadySaved: boolean}>}
   */
  async saveTruth(userId, truth) {
    try {
      const { data, error } = await supabase
        .from('saved_truths')
        .insert({
          user_id: userId,
          truth_id: String(truth.id),
          truth_text: truth.text,
          category: truth.category || null,
        })
        .select()
        .single();

      // Handle unique constraint (already saved)
      if (error && error.code === '23505') {
        return { data: null, error: null, alreadySaved: true };
      }

      if (error) throw error;

      return { data, error: null, alreadySaved: false };
    } catch (error) {
      console.error('Save truth error:', error.message);
      return { data: null, error, alreadySaved: false };
    }
  },

  /**
   * Get all saved truths
   * @param {string} userId - User's ID
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  async getSavedTruths(userId) {
    try {
      const { data, error } = await supabase
        .from('saved_truths')
        .select('*')
        .eq('user_id', userId)
        .order('saved_at', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Get saved truths error:', error.message);
      return { data: [], error };
    }
  },

  /**
   * Remove a saved truth
   * @param {string} userId - User's ID
   * @param {string|number} truthId - Truth ID to remove
   * @returns {Promise<{error: Error|null}>}
   */
  async removeSavedTruth(userId, truthId) {
    try {
      const { error } = await supabase
        .from('saved_truths')
        .delete()
        .eq('user_id', userId)
        .eq('truth_id', String(truthId));

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Remove saved truth error:', error.message);
      return { error };
    }
  },

  /**
   * Check if a truth is saved
   * @param {string} userId - User's ID
   * @param {string|number} truthId - Truth ID to check
   * @returns {Promise<boolean>}
   */
  async isTruthSaved(userId, truthId) {
    try {
      const { data, error } = await supabase
        .from('saved_truths')
        .select('id')
        .eq('user_id', userId)
        .eq('truth_id', String(truthId))
        .single();

      if (error && error.code === 'PGRST116') {
        return false;
      }

      if (error) throw error;

      return !!data;
    } catch (error) {
      console.error('Check truth saved error:', error.message);
      return false;
    }
  },

  /**
   * Get saved truths by category
   * @param {string} userId - User's ID
   * @param {string} category - Category to filter
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  async getSavedTruthsByCategory(userId, category) {
    try {
      const { data, error } = await supabase
        .from('saved_truths')
        .select('*')
        .eq('user_id', userId)
        .eq('category', category)
        .order('saved_at', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Get truths by category error:', error.message);
      return { data: [], error };
    }
  },

  /**
   * Get total saved truth count
   * @param {string} userId - User's ID
   * @returns {Promise<number>}
   */
  async getSavedTruthCount(userId) {
    try {
      const { count, error } = await supabase
        .from('saved_truths')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('Get saved truth count error:', error.message);
      return 0;
    }
  },

  /**
   * Toggle save status of a truth
   * @param {string} userId - User's ID
   * @param {Object} truth - Truth object
   * @returns {Promise<{isSaved: boolean, error: Error|null}>}
   */
  async toggleSaveTruth(userId, truth) {
    try {
      const isSaved = await this.isTruthSaved(userId, truth.id);

      if (isSaved) {
        const { error } = await this.removeSavedTruth(userId, truth.id);
        return { isSaved: false, error };
      } else {
        const { error } = await this.saveTruth(userId, truth);
        return { isSaved: true, error };
      }
    } catch (error) {
      console.error('Toggle save truth error:', error.message);
      return { isSaved: false, error };
    }
  },

  /**
   * Get saved truth IDs as a Set for quick lookup
   * @param {string} userId - User's ID
   * @returns {Promise<Set<string>>}
   */
  async getSavedTruthIds(userId) {
    try {
      const { data } = await this.getSavedTruths(userId);
      return new Set((data || []).map((t) => String(t.truth_id)));
    } catch (error) {
      console.error('Get saved truth IDs error:', error.message);
      return new Set();
    }
  },
};

export default truthsService;
