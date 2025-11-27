# NoContact App - Backend Documentation

## Overview

The NoContact app uses **Supabase** as its backend-as-a-service platform, providing:
- User authentication (email/password, OAuth)
- PostgreSQL database with Row Level Security
- Real-time data synchronization
- Offline-first data management

## Table of Contents

1. [Setup Instructions](#setup-instructions)
2. [Database Schema](#database-schema)
3. [Authentication](#authentication)
4. [API Services](#api-services)
5. [Real-time Sync](#real-time-sync)
6. [Environment Variables](#environment-variables)
7. [Common Errors](#common-errors)
8. [Migration Guide](#migration-guide)

---

## Setup Instructions

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create an account
2. Click "New Project" and fill in:
   - Project name: `nocontact-app`
   - Database password: (save this securely)
   - Region: (choose closest to your users)
3. Wait for project to be created (~2 minutes)

### Step 2: Get API Credentials

1. In your Supabase dashboard, go to **Project Settings** > **API**
2. Copy these values:
   - `Project URL` → `EXPO_PUBLIC_SUPABASE_URL`
   - `anon public` key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Step 3: Run Database Migrations

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `supabase/migrations/001_create_tables.sql`
3. Paste and run the SQL to create all tables

### Step 4: Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in your Supabase credentials in `.env`

### Step 5: Install Dependencies

```bash
npm install @supabase/supabase-js
```

---

## Database Schema

### Tables Overview

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (extends auth.users) |
| `streaks` | No-contact streak tracking |
| `daily_checkins` | Daily mood check-ins |
| `journal_entries` | Journal entries and unsent letters |
| `saved_truths` | User's saved truth reminders |
| `emergency_events` | Emergency button usage logs |
| `milestones` | Achievement milestones |

### Table: profiles

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,           -- Links to auth.users
  email TEXT UNIQUE,
  full_name TEXT,
  breakup_date DATE,             -- When the relationship ended
  ex_name TEXT,                  -- Optional, for personalization
  notification_preferences JSONB,
  theme_preferences JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Table: streaks

```sql
CREATE TABLE public.streaks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  current_streak INTEGER,        -- Current consecutive days
  longest_streak INTEGER,        -- Best streak ever
  total_days INTEGER,            -- Total days of no contact
  last_checkin_date DATE,
  streak_start_date DATE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Table: daily_checkins

```sql
CREATE TABLE public.daily_checkins (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  checkin_date DATE,
  mood INTEGER (1-5),            -- 1=very bad, 5=very good
  trigger_text TEXT,             -- What triggered the urge
  notes TEXT,
  created_at TIMESTAMPTZ
);
```

### Table: journal_entries

```sql
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  entry_type TEXT,               -- 'quick_note', 'guided_prompt', 'unsent_letter', 'free_write'
  prompt_id TEXT,
  title TEXT,
  content TEXT,
  mood_before INTEGER (1-5),
  mood_after INTEGER (1-5),
  is_locked BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Table: saved_truths

```sql
CREATE TABLE public.saved_truths (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  truth_id TEXT,                 -- Reference to truthReminders.js
  truth_text TEXT,
  category TEXT,
  saved_at TIMESTAMPTZ
);
```

### Table: emergency_events

```sql
CREATE TABLE public.emergency_events (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  triggered_at TIMESTAMPTZ,
  did_break_contact BOOLEAN,
  action_taken TEXT,             -- 'stayed_strong', 'journaled', etc.
  duration_seconds INTEGER,
  notes TEXT
);
```

### Table: milestones

```sql
CREATE TABLE public.milestones (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  milestone_type TEXT,           -- 'streak_7', 'journal_10', etc.
  achieved_at TIMESTAMPTZ,
  is_acknowledged BOOLEAN
);
```

---

## Authentication

### Using AuthContext

The app provides an `AuthProvider` context for managing authentication state:

```jsx
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Wrap your app
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// Use in components
function ProfileScreen() {
  const { user, profile, signOut, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <View>
      <Text>Welcome, {profile?.full_name}</Text>
      <Button onPress={signOut} title="Sign Out" />
    </View>
  );
}
```

### Auth Service Methods

```javascript
import { authService } from './src/services';

// Sign up
const { data, error } = await authService.signUp(email, password, fullName);

// Sign in
const { data, error } = await authService.signIn(email, password);

// Sign out
const { error } = await authService.signOut();

// Get current user
const user = await authService.getCurrentUser();

// Reset password
const { error } = await authService.resetPassword(email);

// Listen to auth changes
const subscription = authService.onAuthStateChange((event, session) => {
  console.log('Auth changed:', event, session?.user);
});
```

---

## API Services

### Streak Service

```javascript
import { streakService } from './src/services';

// Get user's streak
const { data } = await streakService.getStreak(userId);

// Increment streak (on check-in)
const { data } = await streakService.incrementStreak(userId);

// Reset streak (contact was broken)
const { data } = await streakService.resetStreak(userId);

// Get streak statistics
const { data } = await streakService.getStreakStats(userId);
// Returns: { current, longest, total, startDate, lastCheckin }
```

### Check-in Service

```javascript
import { checkinService } from './src/services';

// Create daily check-in
const { data } = await checkinService.createCheckin(userId, {
  mood: 4,
  triggerText: 'Saw their photo',
  notes: 'Stayed strong though'
});

// Check if already checked in today
const hasCheckedIn = await checkinService.hasCheckedInToday(userId);

// Get mood trend
const { data } = await checkinService.getMoodTrend(userId, 30);
// Returns: { entries, average, trend, totalCheckins }
```

### Journal Service

```javascript
import { journalService } from './src/services';

// Create entry
const { data } = await journalService.createEntry(userId, {
  entryType: 'unsent_letter',
  content: 'Dear ex...',
  title: 'Things I wish I said',
  moodBefore: 2,
  moodAfter: 4
});

// Get all entries
const { data } = await journalService.getEntries(userId);

// Get unsent letters
const { data } = await journalService.getUnsentLetters(userId);

// Search entries
const { data } = await journalService.searchEntries(userId, 'feeling');

// Delete entry
await journalService.deleteEntry(entryId);
```

### Emergency Service

```javascript
import { emergencyService } from './src/services';

// Log emergency event
const { data } = await emergencyService.logEmergency(userId, {
  actionTaken: 'stayed_strong',
  didBreakContact: false,
  durationSeconds: 120
});

// Get statistics
const { data } = await emergencyService.getEmergencyStats(userId);
// Returns: { total, stayedStrong, brokeContact, successRate, actions }

// Get most effective strategy
const { data } = await emergencyService.getMostEffectiveStrategy(userId);
```

### Milestones Service

```javascript
import { milestonesService } from './src/services';

// Get all milestones
const { data } = await milestonesService.getMilestones(userId);

// Get unacknowledged (show celebration)
const { data } = await milestonesService.getUnacknowledgedMilestones(userId);

// Check and award streak milestones
const awarded = await milestonesService.checkStreakMilestones(userId, 7);
// Returns: ['streak_7'] if newly awarded

// Get milestone display info
const info = milestonesService.getMilestoneInfo('streak_7');
// Returns: { title: 'One Week Wonder', description: '...', icon: '⭐' }

// Acknowledge milestone
await milestonesService.acknowledgeMilestone(milestoneId);
```

### Truths Service

```javascript
import { truthsService } from './src/services';

// Save a truth
await truthsService.saveTruth(userId, { id: 1, text: '...', category: 'healing' });

// Get saved truths
const { data } = await truthsService.getSavedTruths(userId);

// Toggle save status
const { isSaved } = await truthsService.toggleSaveTruth(userId, truth);

// Get saved IDs for quick lookup
const savedIds = await truthsService.getSavedTruthIds(userId);
```

---

## Real-time Sync

### Setting Up Real-time Listeners

```javascript
import { syncService } from './src/services';

// Set up listeners
const cleanup = syncService.setupRealtimeListeners(userId, {
  onStreakChange: (newData, eventType) => {
    console.log('Streak updated:', newData);
    // Update UI
  },
  onCheckinChange: (newData, eventType) => {
    console.log('Check-in changed:', newData);
  },
  onMilestoneChange: (newData) => {
    console.log('New milestone!', newData);
    // Show celebration
  }
});

// Clean up on unmount
useEffect(() => {
  return () => cleanup();
}, []);
```

### Offline-First Sync

```javascript
import { syncService } from './src/services';

// Full sync (upload pending, then download)
await syncService.fullSync(userId);

// Get cached data (works offline)
const cached = await syncService.getCachedData();

// Queue action when offline
await syncService.queueOfflineAction('checkin', {
  mood: 4,
  triggerText: 'Offline check-in'
});

// Check for pending changes
const hasPending = await syncService.hasPendingChanges();
```

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Yes |

### Setting Up Environment

1. Create `.env` file in project root:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
```

2. The values are accessed automatically by Expo via `process.env`

---

## Common Errors

### "Invalid API key"
- **Cause**: Wrong or missing SUPABASE_ANON_KEY
- **Fix**: Check your `.env` file matches Supabase dashboard

### "Row Level Security violation"
- **Cause**: User trying to access another user's data
- **Fix**: This is expected behavior - RLS is working correctly

### "duplicate key value violates unique constraint"
- **Cause**: Trying to insert duplicate data (e.g., second check-in today)
- **Fix**: Check for existing records before insert, or handle the error

### "JWT expired"
- **Cause**: User session expired
- **Fix**: The Supabase client auto-refreshes tokens. If persistent, have user re-login

### "Network request failed"
- **Cause**: No internet connection
- **Fix**: Use offline queue via `syncService.queueOfflineAction()`

---

## Migration Guide

### Migrating from Local Storage to Supabase

1. **Read existing local data**:
```javascript
import { getStreak, getCheckIns, getJournalEntries } from './src/utils/storage';

const localStreak = await getStreak();
const localCheckins = await getCheckIns();
const localEntries = await getJournalEntries();
```

2. **After user signs up/in, sync data**:
```javascript
import { streakService, checkinService, journalService } from './src/services';

// Create streak with existing value
await streakService.updateStreak(userId, {
  current_streak: localStreak,
  // ... other fields
});

// Migrate check-ins
for (const checkin of localCheckins) {
  await checkinService.createCheckin(userId, checkin);
}

// Migrate journal entries
for (const entry of localEntries) {
  await journalService.createEntry(userId, entry);
}
```

3. **Clear local storage after migration**:
```javascript
import { clearAllData } from './src/utils/storage';
await clearAllData();
```

---

## Testing

### Test User Authentication

```javascript
// Test sign up
const { data, error } = await authService.signUp(
  'test@example.com',
  'password123',
  'Test User'
);
console.log('Sign up:', data ? 'Success' : error);

// Test sign in
const { data: session } = await authService.signIn(
  'test@example.com',
  'password123'
);
console.log('Sign in:', session ? 'Success' : 'Failed');
```

### Test Data Operations

```javascript
// Test streak
const { data: streak } = await streakService.getOrCreateStreak(userId);
console.log('Streak:', streak);

// Test check-in
const { data: checkin } = await checkinService.createCheckin(userId, {
  mood: 4
});
console.log('Check-in:', checkin);

// Test journal
const { data: entry } = await journalService.createEntry(userId, {
  entryType: 'quick_note',
  content: 'Test entry'
});
console.log('Journal:', entry);
```

---

## Security Notes

1. **Row Level Security (RLS)** is enabled on all tables - users can only access their own data
2. **Never expose** the `service_role` key in client-side code
3. **Validate input** on the client before sending to Supabase
4. **Use HTTPS** - Supabase enforces this automatically

---

## Support

- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- NoContact App Issues: [GitHub Issues]
