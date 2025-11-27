import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://pwytaswapazwubegfrzz.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3eXRhc3dhcGF6d3ViZWdmcnp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyODMyMjIsImV4cCI6MjA3OTg1OTIyMn0.QftG--7e9BBl-PehlZaoRZqBSjJvs-MnAZ3evdOLDjs';

// Create Supabase client with React Native AsyncStorage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Export configuration for reference
export const config = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
};

export default supabase;
