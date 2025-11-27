import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../styles/colors';
import { getStreak, hasCheckedInToday, startStreak } from '../utils/storage';
import { getDailyTruth } from '../data/truthReminders';
import StreakCounter from '../components/StreakCounter';
import DayTracker from '../components/DayTracker';

const HomeScreen = () => {
  const [streak, setStreak] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [dailyTruth, setDailyTruth] = useState(getDailyTruth());

  const loadData = async () => {
    const currentStreak = await getStreak();
    const checkedIn = await hasCheckedInToday();
    setStreak(currentStreak);
    setCheckedInToday(checkedIn);
    setDailyTruth(getDailyTruth());
  };

  useEffect(() => {
    loadData();
    // Start streak if first time
    const initStreak = async () => {
      const currentStreak = await getStreak();
      if (currentStreak === 0) {
        await startStreak();
        loadData();
      }
    };
    initStreak();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
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
        <Text style={styles.greeting}>You're doing great.</Text>

        <StreakCounter streak={streak} />

        <DayTracker currentDay={streak} checkedInToday={checkedInToday} />

        <View style={styles.truthCard}>
          <Text style={styles.truthLabel}>Today's Truth</Text>
          <Text style={styles.truthText}>{dailyTruth.text}</Text>
        </View>

        <Text style={styles.encouragement}>
          Every day of no contact is a day of self-love.
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
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 30,
  },
  truthCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    marginTop: 30,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  truthLabel: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  truthText: {
    fontSize: 18,
    color: colors.text,
    lineHeight: 26,
  },
  encouragement: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
  },
});

export default HomeScreen;
