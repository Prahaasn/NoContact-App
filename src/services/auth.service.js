import { supabase } from '../config/supabase';

/**
 * Authentication Service
 * Handles all user authentication operations with Supabase
 */
export const authService = {
  /**
   * Sign up with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {string} fullName - User's full name
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async signUp(email, password, fullName) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Sign in with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Sign in with OAuth provider (Google, Apple, etc.)
   * @param {string} provider - OAuth provider name
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async signInWithOAuth(provider) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: 'nocontact://auth/callback',
        },
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('OAuth sign in error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Sign out current user
   * @returns {Promise<{error: Error|null}>}
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error.message);
      return { error };
    }
  },

  /**
   * Get current authenticated user
   * @returns {Promise<Object|null>}
   */
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Get current user error:', error.message);
      return null;
    }
  },

  /**
   * Get current session
   * @returns {Promise<Object|null>}
   */
  async getSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Get session error:', error.message);
      return null;
    }
  },

  /**
   * Reset password - sends reset email
   * @param {string} email - User's email
   * @returns {Promise<{error: Error|null}>}
   */
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'nocontact://auth/reset-password',
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error.message);
      return { error };
    }
  },

  /**
   * Update password for authenticated user
   * @param {string} newPassword - New password
   * @returns {Promise<{error: Error|null}>}
   */
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Update password error:', error.message);
      return { error };
    }
  },

  /**
   * Update user email
   * @param {string} newEmail - New email address
   * @returns {Promise<{error: Error|null}>}
   */
  async updateEmail(newEmail) {
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Update email error:', error.message);
      return { error };
    }
  },

  /**
   * Subscribe to auth state changes
   * @param {Function} callback - Callback function (event, session) => void
   * @returns {Object} Subscription object with unsubscribe method
   */
  onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return subscription;
  },

  /**
   * Delete user account
   * Note: This requires admin privileges or edge function
   * @returns {Promise<{error: Error|null}>}
   */
  async deleteAccount() {
    try {
      // Note: Direct account deletion requires service role key
      // This should be done via an edge function in production
      const { error } = await supabase.rpc('delete_user_account');

      if (error) throw error;

      await this.signOut();
      return { error: null };
    } catch (error) {
      console.error('Delete account error:', error.message);
      return { error };
    }
  },

  /**
   * Verify if user is authenticated
   * @returns {Promise<boolean>}
   */
  async isAuthenticated() {
    const user = await this.getCurrentUser();
    return !!user;
  },
};

export default authService;
