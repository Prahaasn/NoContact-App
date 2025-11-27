import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import colors from '../styles/colors';
import {
  getStreak,
  getRecentCheckIns,
  resetStreak,
  startStreak,
} from '../utils/storage';

const MILESTONES = [7, 14, 30, 60, 90, 180, 365];

const ProgressScreen = () => {
  const [streak, setStreak] = useState(0);
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const currentStreak = await getStreak();
    const checkIns = await getRecentCheckIns(7);
    setStreak(currentStreak);
    setRecentCheckIns(checkIns);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleResetStreak = () => {
    Alert.alert(
      'Reset Streak',
      'Are you sure you broke no contact? This will reset your streak to 0. Be honest with yourself - this is for you.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: "Yes, I Broke It",
          style: 'destructive',
          onPress: async () => {
            await resetStreak();
            await startStreak();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            loadData();
            Alert.alert(
              "It's Okay",
              "Healing isn't linear. What matters is you're starting again. Every day is a new chance."
            );
          },
        },
      ]
    );
  };

  const getNextMilestone = () => {
    for (const milestone of MILESTONES) {
      if (streak < milestone) {
        return milestone;
      }
    }
    return streak + 30; // After 365, set goals in 30-day increments
  };

  const getMilestoneProgress = () => {
    const next = getNextMilestone();
    const prev = MILESTONES.find((m) => m >= streak) === streak
      ? MILESTONES[MILESTONES.indexOf(streak) - 1] || 0
      : MILESTONES[MILESTONES.indexOf(getNextMilestone()) - 1] || 0;
    return ((streak - prev) / (next - prev)) * 100;
  };

  const getAchievedMilestones = () => {
    return MILESTONES.filter((m) => streak >= m);
  };

  const getMoodEmoji = (mood) => {
    const moods = {
      1: '😢',
      2: '😔',
      3: '😐',
      4: '🙂',
      5: '😊',
    };
    return moods[mood] || '😐';
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const checkIn = recentCheckIns.find(
        (c) => new Date(c.date).toDateString() === dateStr
      );
      days.push({
        date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        checkIn,
      });
    }
    return days;
  };

  const getAverageMood = () => {
    if (recentCheckIns.length === 0) return null;
    const sum = recentCheckIns.reduce((acc, c) => acc + c.mood, 0);
    return (sum / recentCheckIns.length).toFixed(1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <Text style={styles.title}>Your Progress</Text>

        {/* Current Streak */}
        <View style={styles.streakCard}>
          <Text style={styles.streakNumber}>{streak}</Text>
          <Text style={styles.streakLabel}>days strong</Text>
          <View style={styles.progressBarContainer}>
            <View
              style={[styles.progressBar, { width: `${getMilestoneProgress()}%` }]}
            />
          </View>
          <Text style={styles.nextMilestone}>
            {getNextMilestone() - streak} days until {getNextMilestone()}-day milestone
          </Text>
        </View>

        {/* Last 7 Days */}
        <Text style={styles.sectionTitle}>Last 7 Days</Text>
        <View style={styles.weekContainer}>
          {getLast7Days().map((day, index) => (
            <View key={index} style={styles.dayColumn}>
              <Text style={styles.dayName}>{day.dayName}</Text>
              <View
                style={[
                  styles.dayCircle,
                  day.checkIn && styles.dayCircleCheckedIn,
                ]}
              >
                {day.checkIn ? (
                  <Text style={styles.moodEmoji}>
                    {getMoodEmoji(day.checkIn.mood)}
                  </Text>
                ) : (
                  <Text style={styles.dayCircleEmpty}>-</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{recentCheckIns.length}</Text>
            <Text style={styles.statLabel}>Check-ins this week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {getAverageMood() ? getMoodEmoji(Math.round(getAverageMood())) : '-'}
            </Text>
            <Text style={styles.statLabel}>Average mood</Text>
          </View>
        </View>

        {/* Milestones Achieved */}
        <Text style={styles.sectionTitle}>Milestones</Text>
        <View style={styles.milestonesContainer}>
          {MILESTONES.map((milestone) => (
            <View
              key={milestone}
              style={[
                styles.milestoneItem,
                streak >= milestone && styles.milestoneAchieved,
              ]}
            >
              <Text
                style={[
                  styles.milestoneText,
                  streak >= milestone && styles.milestoneTextAchieved,
                ]}
              >
                {milestone}
              </Text>
              {streak >= milestone && <Text style={styles.checkmark}>✓</Text>}
            </View>
          ))}
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetStreak}
        >
          <Text style={styles.resetButtonText}>I Broke No Contact</Text>
        </TouchableOpacity>

        <Text style={styles.honestText}>
          Be honest with yourself. This journey is for you.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
  },
  streakCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 24,
  },
  streakNumber: {
    fontSize: 72,
    fontWeight: 'bold',
    color: colors.primary,
  },
  streakLabel: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: -5,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    marginTop: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  nextMilestone: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  dayColumn: {
    alignItems: 'center',
  },
  dayName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleCheckedIn: {
    backgroundColor: colors.primary,
  },
  moodEmoji: {
    fontSize: 18,
  },
  dayCircleEmpty: {
    color: colors.textMuted,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  milestonesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 32,
  },
  milestoneItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneAchieved: {
    backgroundColor: colors.primary,
  },
  milestoneText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  milestoneTextAchieved: {
    color: colors.text,
  },
  checkmark: {
    color: colors.text,
    marginLeft: 6,
    fontSize: 14,
  },
  resetButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  honestText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
});

export default ProgressScreen;
