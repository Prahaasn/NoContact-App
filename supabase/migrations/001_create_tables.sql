-- ============================================================
-- NoContact App Database Schema
-- Run this SQL in your Supabase SQL Editor to create all tables
-- ============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Table 1: profiles (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- NoContact specific fields
  breakup_date DATE,
  ex_name TEXT, -- Optional, for personalization
  notification_preferences JSONB DEFAULT '{"daily_checkin": true, "encouragement": true, "milestone": true}'::jsonb,
  theme_preferences JSONB DEFAULT '{"dark_mode": true}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Table 2: streaks
-- ============================================================
CREATE TABLE IF NOT EXISTS public.streaks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_days INTEGER DEFAULT 0,
  last_checkin_date DATE,
  streak_start_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one streak record per user
  CONSTRAINT unique_user_streak UNIQUE (user_id)
);

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks"
  ON public.streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
  ON public.streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON public.streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- Table 3: daily_checkins
-- ============================================================
CREATE TABLE IF NOT EXISTS public.daily_checkins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  checkin_date DATE NOT NULL,
  mood INTEGER CHECK (mood >= 1 AND mood <= 5), -- 1=very bad, 5=very good
  trigger_text TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checkins"
  ON public.daily_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins"
  ON public.daily_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkins"
  ON public.daily_checkins FOR UPDATE
  USING (auth.uid() = user_id);

-- Unique constraint: one check-in per day per user
CREATE UNIQUE INDEX IF NOT EXISTS unique_daily_checkin
  ON public.daily_checkins(user_id, checkin_date);

-- ============================================================
-- Table 4: journal_entries
-- ============================================================
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  entry_type TEXT CHECK (entry_type IN ('quick_note', 'guided_prompt', 'unsent_letter', 'free_write')),
  prompt_id TEXT, -- Reference to which prompt was used (optional)
  title TEXT,
  content TEXT NOT NULL,
  mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 5),
  mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 5),
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entries"
  ON public.journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries"
  ON public.journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON public.journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON public.journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date
  ON public.journal_entries(user_id, created_at DESC);

-- ============================================================
-- Table 5: saved_truths
-- ============================================================
CREATE TABLE IF NOT EXISTS public.saved_truths (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  truth_id TEXT NOT NULL, -- Reference to truth in truthReminders.js
  truth_text TEXT NOT NULL,
  category TEXT,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate saves
  CONSTRAINT unique_user_truth UNIQUE (user_id, truth_id)
);

ALTER TABLE public.saved_truths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved truths"
  ON public.saved_truths FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved truths"
  ON public.saved_truths FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved truths"
  ON public.saved_truths FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- Table 6: emergency_events
-- ============================================================
CREATE TABLE IF NOT EXISTS public.emergency_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  did_break_contact BOOLEAN DEFAULT false,
  action_taken TEXT CHECK (action_taken IN ('stayed_strong', 'journaled', 'called_friend', 'used_truths', 'took_breath', 'broke_contact', 'other')),
  duration_seconds INTEGER, -- How long they used the emergency screen
  notes TEXT
);

ALTER TABLE public.emergency_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own emergency events"
  ON public.emergency_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emergency events"
  ON public.emergency_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emergency events"
  ON public.emergency_events FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for analytics
CREATE INDEX IF NOT EXISTS idx_emergency_events_user_date
  ON public.emergency_events(user_id, triggered_at DESC);

-- ============================================================
-- Table 7: milestones
-- ============================================================
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  milestone_type TEXT CHECK (milestone_type IN (
    'streak_1', 'streak_3', 'streak_7', 'streak_14', 'streak_21',
    'streak_30', 'streak_60', 'streak_90', 'streak_180', 'streak_365',
    'emergency_avoided', 'emergency_avoided_5', 'emergency_avoided_10',
    'journal_1', 'journal_10', 'journal_25', 'journal_50', 'journal_100',
    'checkin_7', 'checkin_30', 'checkin_100'
  )),
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_acknowledged BOOLEAN DEFAULT false,

  -- Prevent duplicate milestones
  CONSTRAINT unique_user_milestone UNIQUE (user_id, milestone_type)
);

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own milestones"
  ON public.milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones"
  ON public.milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones"
  ON public.milestones FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- Helper Functions
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_streaks_updated_at ON public.streaks;
CREATE TRIGGER update_streaks_updated_at
  BEFORE UPDATE ON public.streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_journal_entries_updated_at ON public.journal_entries;
CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Initial seed data for testing (optional)
-- ============================================================
-- Uncomment below if you want sample data for testing

-- INSERT INTO public.milestones (user_id, milestone_type, achieved_at, is_acknowledged)
-- SELECT id, 'streak_1', NOW(), false FROM public.profiles LIMIT 1;
