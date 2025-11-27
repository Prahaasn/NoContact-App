import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../styles/colors';

const DayTracker = ({ currentDay, checkedInToday }) => {
  // Show days relative to current streak position
  const getDays = () => {
    const days = [];
    const startDay = Math.max(1, currentDay - 2);

    for (let i = 0; i < 5; i++) {
      const dayNum = startDay + i;
      const isPast = dayNum < currentDay;
      const isCurrent = dayNum === currentDay;
      const isFuture = dayNum > currentDay;

      days.push({
        day: dayNum,
        isPast,
        isCurrent,
        isFuture,
        isCompleted: isPast || (isCurrent && checkedInToday),
      });
    }

    return days;
  };

  return (
    <View style={styles.container}>
      {getDays().map((day, index) => (
        <View key={index} style={styles.dayWrapper}>
          <View
            style={[
              styles.circle,
              day.isCompleted && styles.circleCompleted,
              day.isCurrent && styles.circleCurrent,
              day.isFuture && styles.circleFuture,
            ]}
          >
            {day.isCompleted ? (
              <Text style={styles.checkmark}>✓</Text>
            ) : (
              <Text
                style={[
                  styles.dayNumber,
                  day.isCurrent && styles.dayNumberCurrent,
                ]}
              >
                {day.day}
              </Text>
            )}
          </View>
          <Text style={styles.dayLabel}>D{day.day}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  dayWrapper: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surfaceLight,
  },
  circleCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  circleCurrent: {
    borderColor: colors.primary,
    borderWidth: 3,
  },
  circleFuture: {
    opacity: 0.5,
  },
  checkmark: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  dayNumber: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  dayNumberCurrent: {
    color: colors.primary,
  },
  dayLabel: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
});

export default DayTracker;
