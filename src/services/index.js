/**
 * Services Index
 * Export all services from a single entry point
 */

// Configuration
export { supabase, config } from '../config/supabase';

// Authentication
export { authService } from './auth.service';

// User Profile
export { profileService } from './profile.service';

// Core Features
export { streakService } from './streak.service';
export { checkinService } from './checkin.service';
export { journalService } from './journal.service';
export { emergencyService } from './emergency.service';
export { truthsService } from './truths.service';
export { milestonesService, MILESTONE_THRESHOLDS } from './milestones.service';

// Sync & Real-time
export { syncService } from './sync.service';

// Default export with all services
const services = {
  auth: require('./auth.service').authService,
  profile: require('./profile.service').profileService,
  streak: require('./streak.service').streakService,
  checkin: require('./checkin.service').checkinService,
  journal: require('./journal.service').journalService,
  emergency: require('./emergency.service').emergencyService,
  truths: require('./truths.service').truthsService,
  milestones: require('./milestones.service').milestonesService,
  sync: require('./sync.service').syncService,
};

export default services;
