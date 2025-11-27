import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import colors from '../styles/colors';

const StreakCounter = ({ streak }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getStreakEmoji = () => {
    if (streak >= 90) return '👑';
    if (streak >= 60) return '💎';
    if (streak >= 30) return '🌟';
    if (streak >= 14) return '✨';
    if (streak >= 7) return '🔥';
    return '💪';
  };

  const getMessage = () => {
    if (streak === 0) return 'Start your journey';
    if (streak === 1) return 'Day one. You got this.';
    if (streak < 7) return 'Building momentum';
    if (streak < 14) return "One week strong!";
    if (streak < 30) return "Two weeks! Amazing!";
    if (streak < 60) return "One month! Incredible!";
    if (streak < 90) return "Two months! Unstoppable!";
    return "90+ days! You're free!";
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      <Animated.View
        style={[styles.container, { transform: [{ scale: scaleAnim }] }]}
      >
        <Text style={styles.emoji}>{getStreakEmoji()}</Text>
        <Text style={styles.number}>{streak}</Text>
        <Text style={styles.label}>days</Text>
        <Text style={styles.message}>{getMessage()}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 30,
    paddingHorizontal: 50,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  number: {
    fontSize: 80,
    fontWeight: 'bold',
    color: colors.primary,
    lineHeight: 85,
  },
  label: {
    fontSize: 24,
    color: colors.textSecondary,
    marginTop: -5,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default StreakCounter;
