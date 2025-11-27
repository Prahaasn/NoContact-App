import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../styles/colors';
import { getStreak, hasCheckedInToday, startStreak } from '../utils/storage';
import { getDailyTruth } from '../data/truthReminders';
import StreakCounter from '../components/StreakCounter';
import DayTracker from '../components/DayTracker';
import { useWidgetUpdate } from '../hooks/useWidgetUpdate';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [streak, setStreak] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [dailyTruth, setDailyTruth] = useState(getDailyTruth());
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Widget update hook - automatically updates home screen widgets when streak changes
  const { updateWidget } = useWidgetUpdate({
    currentStreak: streak,
    encouragementMessage: dailyTruth?.text || "You're doing great!",
  });

  const loadData = async () => {
    const currentStreak = await getStreak();
    const checkedIn = await hasCheckedInToday();
    setStreak(currentStreak);
    setCheckedInToday(checkedIn);
    setDailyTruth(getDailyTruth());
  };

  useEffect(() => {
    loadData();
    const initStreak = async () => {
      const currentStreak = await getStreak();
      if (currentStreak === 0) {
        await startStreak();
        loadData();
      }
    };
    initStreak();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Refresh data when screen comes into focus
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary + '20', colors.background, colors.background]}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.3 }}
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
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.subtitle}>You're doing amazing.</Text>
            </View>

            {/* Streak Counter */}
            <View style={styles.streakSection}>
              <StreakCounter streak={streak} />
            </View>

            {/* Day Tracker */}
            <DayTracker currentDay={streak} checkedInToday={checkedInToday} />

            {/* Check-in Prompt */}
            {!checkedInToday && (
              <TouchableOpacity
                style={styles.checkInPrompt}
                onPress={() => navigation.navigate('CheckIn')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.checkInGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.checkInIcon}>📝</Text>
                  <View style={styles.checkInTextContainer}>
                    <Text style={styles.checkInTitle}>Daily Check-In</Text>
                    <Text style={styles.checkInSubtitle}>
                      How are you feeling today?
                    </Text>
                  </View>
                  <Text style={styles.checkInArrow}>→</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {checkedInToday && (
              <View style={styles.checkedInBadge}>
                <Text style={styles.checkedInIcon}>✓</Text>
                <Text style={styles.checkedInText}>Checked in today</Text>
              </View>
            )}

            {/* Today's Truth Card */}
            <View style={styles.truthCard}>
              <View style={styles.truthHeader}>
                <Text style={styles.truthIcon}>💜</Text>
                <Text style={styles.truthLabel}>Today's Truth</Text>
              </View>
              <Text style={styles.truthText}>"{dailyTruth.text}"</Text>
              <View style={styles.truthCategory}>
                <Text style={styles.truthCategoryText}>{dailyTruth.category}</Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('Emergency')}
                activeOpacity={0.7}
              >
                <Text style={styles.actionIcon}>🆘</Text>
                <Text style={styles.actionLabel}>Emergency</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('Truths')}
                activeOpacity={0.7}
              >
                <Text style={styles.actionIcon}>💜</Text>
                <Text style={styles.actionLabel}>Truths</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('Journal')}
                activeOpacity={0.7}
              >
                <Text style={styles.actionIcon}>📖</Text>
                <Text style={styles.actionLabel}>Journal</Text>
              </TouchableOpacity>
            </View>

            {/* Encouragement */}
            <View style={styles.encouragementContainer}>
              <Text style={styles.encouragement}>
                Every day of no contact is a day of self-love.
              </Text>
            </View>
          </Animated.View>
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
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    width: '100%',
    paddingTop: 10,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  streakSection: {
    marginVertical: 20,
  },
  checkInPrompt: {
    width: '100%',
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  checkInGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  checkInIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  checkInTextContainer: {
    flex: 1,
  },
  checkInTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  checkInSubtitle: {
    fontSize: 13,
    color: colors.text,
    opacity: 0.8,
    marginTop: 2,
  },
  checkInArrow: {
    fontSize: 24,
    color: colors.text,
    opacity: 0.8,
  },
  checkedInBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 24,
  },
  checkedInIcon: {
    fontSize: 16,
    color: colors.success,
    marginRight: 8,
  },
  checkedInText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
  },
  truthCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    marginTop: 24,
  },
  truthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  truthIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  truthLabel: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  truthText: {
    fontSize: 20,
    color: colors.text,
    lineHeight: 30,
    fontStyle: 'italic',
  },
  truthCategory: {
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  truthCategoryText: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'capitalize',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  encouragementContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  encouragement: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default HomeScreen;
