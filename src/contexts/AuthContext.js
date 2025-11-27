import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { profileService } from '../services/profile.service';
import { streakService } from '../services/streak.service';
import { syncService } from '../services/sync.service';

// Create Auth Context
const AuthContext = createContext({
  user: null,
  profile: null,
  session: null,
  loading: true,
  error: null,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
  refreshUser: async () => {},
});

/**
 * Auth Provider Component
 * Wraps the app and provides authentication state
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();

    // Subscribe to auth changes
    const subscription = authService.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Fetch profile when user signs in
        const { data: profileData } = await profileService.getProfile(session.user.id);
        setProfile(profileData);

        // Sync data from cloud
        await syncService.syncFromCloud(session.user.id);
      } else {
        setProfile(null);
        // Clear cached data on sign out
        await syncService.clearCache();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Initialize authentication
  async function initializeAuth() {
    try {
      setLoading(true);

      // Check for existing session
      const currentSession = await authService.getSession();
      setSession(currentSession);

      if (currentSession?.user) {
        setUser(currentSession.user);

        // Fetch user profile
        const { data: profileData } = await profileService.getProfile(currentSession.user.id);
        setProfile(profileData);

        // Sync data in background
        syncService.syncFromCloud(currentSession.user.id);
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Sign up handler
  async function signUp(email, password, fullName) {
    try {
      setError(null);
      setLoading(true);

      const { data, error: signUpError } = await authService.signUp(email, password, fullName);

      if (signUpError) {
        setError(signUpError.message);
        return { success: false, error: signUpError };
      }

      if (data?.user) {
        // Initialize streak for new user
        await streakService.createStreak(data.user.id);
      }

      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }

  // Sign in handler
  async function signIn(email, password) {
    try {
      setError(null);
      setLoading(true);

      const { data, error: signInError } = await authService.signIn(email, password);

      if (signInError) {
        setError(signInError.message);
        return { success: false, error: signInError };
      }

      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }

  // Sign out handler
  async function signOut() {
    try {
      setError(null);
      setLoading(true);

      // Sync any pending changes before logout
      if (user) {
        await syncService.syncToCloud(user.id);
      }

      const { error: signOutError } = await authService.signOut();

      if (signOutError) {
        setError(signOutError.message);
        return { success: false, error: signOutError };
      }

      setUser(null);
      setProfile(null);
      setSession(null);

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }

  // Reset password handler
  async function resetPassword(email) {
    try {
      setError(null);

      const { error: resetError } = await authService.resetPassword(email);

      if (resetError) {
        setError(resetError.message);
        return { success: false, error: resetError };
      }

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err };
    }
  }

  // Update profile handler
  async function updateProfile(updates) {
    try {
      setError(null);

      if (!user) {
        throw new Error('No user logged in');
      }

      const { data, error: updateError } = await profileService.updateProfile(user.id, updates);

      if (updateError) {
        setError(updateError.message);
        return { success: false, error: updateError };
      }

      setProfile(data);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err };
    }
  }

  // Refresh user data
  async function refreshUser() {
    try {
      if (!user) return;

      const { data: profileData } = await profileService.getProfile(user.id);
      setProfile(profileData);

      await syncService.syncFromCloud(user.id);
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  }

  // Context value
  const value = {
    user,
    profile,
    session,
    loading,
    error,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use auth context
 * @returns {Object} Auth context value
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default AuthContext;
