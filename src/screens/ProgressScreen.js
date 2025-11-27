import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
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
  const progressAnim = useState(new Animated.Value(0))[0];

  const loadData = async () => {
    const currentStreak = await getStreak();
    const checkIns = await getRecentCheckIns(7);
    setStreak(currentStreak);
    setRecentCheckIns(checkIns);

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: getMilestoneProgressValue(currentStreak),
      duration: 800,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleResetStreak = () => {
    Alert.alert(
      'Reset Streak',
      'Are you sure you broke no contact? This will reset your streak. Be honest with yourself - this journey is for you.',
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
              "It's Okay 💜",
              "Healing isn't linear. What matters is you're starting again. Every day is a new chance."
            );
          },
        },
      ]
    );
  };

  const getNextMilestone = (currentStreak = streak) => {
    for (const milestone of MILESTONES) {
      if (currentStreak < milestone) {
        return milestone;
      }
    }
    return currentStreak + 30;
  };

  const getMilestoneProgressValue = (currentStreak) => {
    const next = getNextMilestone(currentStreak);
    const prevIndex = MILESTONES.indexOf(next) - 1;
    const prev = prevIndex >= 0 ? MILESTONES[prevIndex] : 0;
    return ((currentStreak - prev) / (next - prev)) * 100;
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

  const getStreakEmoji = () => {
    if (streak >= 90) return '👑';
    if (streak >= 60) return '💎';
    if (streak >= 30) return '🌟';
    if (streak >= 14) return '✨';
    if (streak >= 7) return '🔥';
    return '💪';
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
        dayNum: date.getDate(),
        checkIn,
        isToday: i === 0,
      });
    }
    return days;
  };

  const getAverageMood = () => {
    if (recentCheckIns.length === 0) return null;
    const sum = recentCheckIns.reduce((acc, c) => acc + c.mood, 0);
    return (sum / recentCheckIns.length).toFixed(1);
  };

  const daysUntilNext = getNextMilestone() - streak;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary + '20', colors.background]}
        style={styles.gradient}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Your Progress</Text>
            <Text style={styles.subtitle}>Track your healing journey</Text>
          </View>

          {/* Main Streak Card */}
          <View style={styles.streakCard}>
            <LinearGradient
              colors={[colors.surface, colors.surfaceLight]}
              style={styles.streakGradient}
            >
              <Text style={styles.streakEmoji}>{getStreakEmoji()}</Text>
              <Text style={styles.streakNumber}>{streak}</Text>
              <Text style={styles.streakLabel}>days strong</Text>

              {/* Progress to next milestone */}
              <View style={styles.progressSection}>
                <View style={styles.progressBarContainer}>
                  <Animated.View
                    style={[
                      styles.progressBar,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 100],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.nextMilestone}>
                  {daysUntilNext} days until {getNextMilestone()}-day milestone
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Last 7 Days */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📅</Text>
              <Text style={styles.sectionTitle}>Last 7 Days</Text>
            </View>
            <View style={styles.weekContainer}>
              {getLast7Days().map((day, index) => (
                <View key={index} style={styles.dayColumn}>
                  <Text style={[styles.dayName, day.isToday && styles.dayNameToday]}>
                    {day.dayName}
                  </Text>
                  <View
                    style={[
                      styles.dayCircle,
                      day.checkIn && styles.dayCircleCheckedIn,
                      day.isToday && !day.checkIn && styles.dayCircleToday,
                    ]}
                  >
                    {day.checkIn ? (
                      <Text style={styles.moodEmoji}>
                        {getMoodEmoji(day.checkIn.mood)}
                      </Text>
                    ) : (
                      <Text style={[styles.dayNum, day.isToday && styles.dayNumToday]}>
                        {day.dayNum}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{recentCheckIns.length}/7</Text>
              <Text style={styles.statLabel}>Check-ins</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {getAverageMood() ? getMoodEmoji(Math.round(getAverageMood())) : '—'}
              </Text>
              <Text style={styles.statLabel}>Avg Mood</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{MILESTONES.filter(m => streak >= m).length}</Text>
              <Text style={styles.statLabel}>Milestones</Text>
            </View>
          </View>

          {/* Milestones */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🏆</Text>
              <Text style={styles.sectionTitle}>Milestones</Text>
            </View>
            <View style={styles.milestonesContainer}>
              {MILESTONES.map((milestone) => {
                const achieved = streak >= milestone;
                return (
                  <View
                    key={milestone}
                    style={[
                      styles.milestoneItem,
                      achieved && styles.milestoneAchieved,
                    ]}
                  >
                    {achieved ? (
                      <Text style={styles.milestoneCheck}>✓</Text>
                    ) : (
                      <Text style={styles.milestoneLock}>🔒</Text>
                    )}
                    <Text
                      style={[
                        styles.milestoneText,
                        achieved && styles.milestoneTextAchieved,
                      ]}
                    >
                      {milestone} days
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Motivational Message */}
          <View style={styles.motivationCard}>
            <Text style={styles.motivationText}>
              {streak === 0
                ? "Every journey begins with a single step. You've got this!"
                : streak < 7
                ? "The first week is the hardest. Keep pushing through!"
                : streak < 30
                ? "You're building real strength. Don't stop now!"
                : streak < 90
                ? "A month+ of self-respect. You're becoming unstoppable!"
                : "You've proven you don't need them. You're free."}
            </Text>
          </View>

          {/* Reset Button */}
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetStreak}
            activeOpacity={0.7}
          >
            <Text style={styles.resetButtonText}>I Broke No Contact</Text>
          </TouchableOpacity>

          <Text style={styles.honestText}>
            Be honest with yourself. This journey is for you.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 300,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  streakCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  streakGradient: {
    padding: 30,
    alignItems: 'center',
  },
  streakEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 80,
    fontWeight: 'bold',
    color: colors.primary,
    lineHeight: 85,
  },
  streakLabel: {
    fontSize: 20,
    color: colors.textSecondary,
    marginTop: -5,
    fontWeight: '500',
  },
  progressSection: {
    width: '100%',
    marginTop: 24,
  },
  progressBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: colors.background,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  nextMilestone: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
  },
  dayColumn: {
    alignItems: 'center',
  },
  dayName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  dayNameToday: {
    color: colors.primary,
  },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleCheckedIn: {
    backgroundColor: colors.primary,
  },
  dayCircleToday: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  moodEmoji: {
    fontSize: 18,
  },
  dayNum: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  dayNumToday: {
    color: colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  milestonesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  milestoneItem: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneAchieved: {
    backgroundColor: colors.primary,
  },
  milestoneCheck: {
    fontSize: 14,
    marginRight: 6,
    color: colors.text,
  },
  milestoneLock: {
    fontSize: 12,
    marginRight: 6,
    opacity: 0.6,
  },
  milestoneText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  milestoneTextAchieved: {
    color: colors.text,
  },
  motivationCard: {
    backgroundColor: colors.primary + '20',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  motivationText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  resetButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.error,
    borderRadius: 14,
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
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 14,
  },
});

export default ProgressScreen;
