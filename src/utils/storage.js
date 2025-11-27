import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const KEYS = {
  STREAK_START: '@nocontact_streak_start',
  CHECKINS: '@nocontact_checkins',
  JOURNAL_ENTRIES: '@nocontact_journal_entries',
  UNSENT_LETTERS: '@nocontact_unsent_letters',
  SAVED_TRUTHS: '@nocontact_saved_truths',
  SETTINGS: '@nocontact_settings',
  EMERGENCY_EVENTS: '@nocontact_emergency_events',
};

// ============ STREAK FUNCTIONS ============

// Get current streak in days
export const getStreak = async () => {
  try {
    const streakStart = await AsyncStorage.getItem(KEYS.STREAK_START);
    if (!streakStart) return 0;

    const start = new Date(streakStart);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (error) {
    console.error('Error getting streak:', error);
    return 0;
  }
};

// Start or reset streak
export const startStreak = async () => {
  try {
    const today = new Date().toISOString();
    await AsyncStorage.setItem(KEYS.STREAK_START, today);
    return true;
  } catch (error) {
    console.error('Error starting streak:', error);
    return false;
  }
};

// Reset streak (user broke no contact)
export const resetStreak = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.STREAK_START);
    return true;
  } catch (error) {
    console.error('Error resetting streak:', error);
    return false;
  }
};

// Get streak start date
export const getStreakStartDate = async () => {
  try {
    const streakStart = await AsyncStorage.getItem(KEYS.STREAK_START);
    return streakStart ? new Date(streakStart) : null;
  } catch (error) {
    console.error('Error getting streak start date:', error);
    return null;
  }
};

// ============ CHECK-IN FUNCTIONS ============

// Save daily check-in
export const saveCheckIn = async (checkIn) => {
  try {
    const existing = await AsyncStorage.getItem(KEYS.CHECKINS);
    const checkins = existing ? JSON.parse(existing) : [];

    const newCheckIn = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...checkIn,
    };

    checkins.push(newCheckIn);
    await AsyncStorage.setItem(KEYS.CHECKINS, JSON.stringify(checkins));
    return newCheckIn;
  } catch (error) {
    console.error('Error saving check-in:', error);
    return null;
  }
};

// Get all check-ins
export const getCheckIns = async () => {
  try {
    const checkins = await AsyncStorage.getItem(KEYS.CHECKINS);
    return checkins ? JSON.parse(checkins) : [];
  } catch (error) {
    console.error('Error getting check-ins:', error);
    return [];
  }
};

// Get check-ins for last N days
export const getRecentCheckIns = async (days = 7) => {
  try {
    const checkins = await getCheckIns();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return checkins.filter((c) => new Date(c.date) >= cutoff);
  } catch (error) {
    console.error('Error getting recent check-ins:', error);
    return [];
  }
};

// Check if user checked in today
export const hasCheckedInToday = async () => {
  try {
    const checkins = await getCheckIns();
    const today = new Date().toDateString();

    return checkins.some((c) => new Date(c.date).toDateString() === today);
  } catch (error) {
    console.error('Error checking today\'s check-in:', error);
    return false;
  }
};

// ============ JOURNAL FUNCTIONS ============

// Save journal entry
export const saveJournalEntry = async (entry) => {
  try {
    const existing = await AsyncStorage.getItem(KEYS.JOURNAL_ENTRIES);
    const entries = existing ? JSON.parse(existing) : [];

    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...entry,
    };

    entries.push(newEntry);
    await AsyncStorage.setItem(KEYS.JOURNAL_ENTRIES, JSON.stringify(entries));
    return newEntry;
  } catch (error) {
    console.error('Error saving journal entry:', error);
    return null;
  }
};

// Get all journal entries
export const getJournalEntries = async () => {
  try {
    const entries = await AsyncStorage.getItem(KEYS.JOURNAL_ENTRIES);
    return entries ? JSON.parse(entries) : [];
  } catch (error) {
    console.error('Error getting journal entries:', error);
    return [];
  }
};

// Delete journal entry
export const deleteJournalEntry = async (id) => {
  try {
    const entries = await getJournalEntries();
    const filtered = entries.filter((e) => e.id !== id);
    await AsyncStorage.setItem(KEYS.JOURNAL_ENTRIES, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    return false;
  }
};

// ============ UNSENT LETTERS FUNCTIONS ============

// Save unsent letter
export const saveUnsentLetter = async (letter) => {
  try {
    const existing = await AsyncStorage.getItem(KEYS.UNSENT_LETTERS);
    const letters = existing ? JSON.parse(existing) : [];

    const newLetter = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...letter,
    };

    letters.push(newLetter);
    await AsyncStorage.setItem(KEYS.UNSENT_LETTERS, JSON.stringify(letters));
    return newLetter;
  } catch (error) {
    console.error('Error saving unsent letter:', error);
    return null;
  }
};

// Get all unsent letters
export const getUnsentLetters = async () => {
  try {
    const letters = await AsyncStorage.getItem(KEYS.UNSENT_LETTERS);
    return letters ? JSON.parse(letters) : [];
  } catch (error) {
    console.error('Error getting unsent letters:', error);
    return [];
  }
};

// Delete unsent letter
export const deleteUnsentLetter = async (id) => {
  try {
    const letters = await getUnsentLetters();
    const filtered = letters.filter((l) => l.id !== id);
    await AsyncStorage.setItem(KEYS.UNSENT_LETTERS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting unsent letter:', error);
    return false;
  }
};

// ============ SAVED TRUTHS FUNCTIONS ============

// Save a truth to favorites
export const saveTruth = async (truth) => {
  try {
    const existing = await AsyncStorage.getItem(KEYS.SAVED_TRUTHS);
    const truths = existing ? JSON.parse(existing) : [];

    // Don't save duplicates
    if (truths.some((t) => t.id === truth.id)) return truths;

    truths.push(truth);
    await AsyncStorage.setItem(KEYS.SAVED_TRUTHS, JSON.stringify(truths));
    return truths;
  } catch (error) {
    console.error('Error saving truth:', error);
    return [];
  }
};

// Get saved truths
export const getSavedTruths = async () => {
  try {
    const truths = await AsyncStorage.getItem(KEYS.SAVED_TRUTHS);
    return truths ? JSON.parse(truths) : [];
  } catch (error) {
    console.error('Error getting saved truths:', error);
    return [];
  }
};

// Remove truth from favorites
export const removeSavedTruth = async (id) => {
  try {
    const truths = await getSavedTruths();
    const filtered = truths.filter((t) => t.id !== id);
    await AsyncStorage.setItem(KEYS.SAVED_TRUTHS, JSON.stringify(filtered));
    return filtered;
  } catch (error) {
    console.error('Error removing saved truth:', error);
    return [];
  }
};

// ============ EMERGENCY EVENTS FUNCTIONS ============

// Log emergency event (when user feels urge to contact ex)
export const logEmergencyEvent = async () => {
  try {
    const existing = await AsyncStorage.getItem(KEYS.EMERGENCY_EVENTS);
    const events = existing ? JSON.parse(existing) : [];

    const newEvent = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      stayedStrong: null, // Will be updated when user makes choice
    };

    events.push(newEvent);
    await AsyncStorage.setItem(KEYS.EMERGENCY_EVENTS, JSON.stringify(events));
    return newEvent;
  } catch (error) {
    console.error('Error logging emergency event:', error);
    return null;
  }
};

// Update emergency event outcome
export const updateEmergencyEvent = async (id, stayedStrong) => {
  try {
    const existing = await AsyncStorage.getItem(KEYS.EMERGENCY_EVENTS);
    const events = existing ? JSON.parse(existing) : [];

    const eventIndex = events.findIndex((e) => e.id === id);
    if (eventIndex !== -1) {
      events[eventIndex].stayedStrong = stayedStrong;
      events[eventIndex].resolvedAt = new Date().toISOString();
      await AsyncStorage.setItem(KEYS.EMERGENCY_EVENTS, JSON.stringify(events));
    }
    return true;
  } catch (error) {
    console.error('Error updating emergency event:', error);
    return false;
  }
};

// Get all emergency events
export const getEmergencyEvents = async () => {
  try {
    const events = await AsyncStorage.getItem(KEYS.EMERGENCY_EVENTS);
    return events ? JSON.parse(events) : [];
  } catch (error) {
    console.error('Error getting emergency events:', error);
    return [];
  }
};

// Get emergency stats
export const getEmergencyStats = async () => {
  try {
    const events = await getEmergencyEvents();
    const total = events.length;
    const stayedStrong = events.filter((e) => e.stayedStrong === true).length;
    const brokeContact = events.filter((e) => e.stayedStrong === false).length;

    return {
      total,
      stayedStrong,
      brokeContact,
      successRate: total > 0 ? Math.round((stayedStrong / total) * 100) : 0,
    };
  } catch (error) {
    console.error('Error getting emergency stats:', error);
    return { total: 0, stayedStrong: 0, brokeContact: 0, successRate: 0 };
  }
};

// ============ SETTINGS FUNCTIONS ============

// Get settings
export const getSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem(KEYS.SETTINGS);
    return settings
      ? JSON.parse(settings)
      : {
          notificationsEnabled: false,
          notificationTime: '09:00',
          hapticFeedback: true,
        };
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      notificationsEnabled: false,
      notificationTime: '09:00',
      hapticFeedback: true,
    };
  }
};

// Save settings
export const saveSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

// ============ CLEAR ALL DATA ============

export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove(Object.values(KEYS));
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

export default {
  getStreak,
  startStreak,
  resetStreak,
  getStreakStartDate,
  saveCheckIn,
  getCheckIns,
  getRecentCheckIns,
  hasCheckedInToday,
  saveJournalEntry,
  getJournalEntries,
  deleteJournalEntry,
  saveUnsentLetter,
  getUnsentLetters,
  deleteUnsentLetter,
  saveTruth,
  getSavedTruths,
  removeSavedTruth,
  logEmergencyEvent,
  updateEmergencyEvent,
  getEmergencyEvents,
  getEmergencyStats,
  getSettings,
  saveSettings,
  clearAllData,
};
