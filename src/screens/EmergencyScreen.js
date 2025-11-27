import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import colors from '../styles/colors';
import { getRandomTruths } from '../data/truthReminders';

const EmergencyScreen = () => {
  const [truths, setTruths] = useState([]);
  const [breathingPhase, setBreathingPhase] = useState('inhale');
  const breathAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    setTruths(getRandomTruths(5));
    startBreathingAnimation();
  }, []);

  const startBreathingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1.3,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Update breathing phase text
    const interval = setInterval(() => {
      setBreathingPhase((prev) => (prev === 'inhale' ? 'exhale' : 'inhale'));
    }, 4000);

    return () => clearInterval(interval);
  };

  const handleStayStrong = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTruths(getRandomTruths(5));
  };

  const refreshTruths = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTruths(getRandomTruths(5));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Take a breath.</Text>
        <Text style={styles.subheader}>
          They're not your person anymore.
        </Text>

        <View style={styles.breathingContainer}>
          <Animated.View
            style={[
              styles.breathingCircle,
              { transform: [{ scale: breathAnim }] },
            ]}
          >
            <Text style={styles.breathingText}>
              {breathingPhase === 'inhale' ? 'Breathe In' : 'Breathe Out'}
            </Text>
          </Animated.View>
        </View>

        <Text style={styles.sectionTitle}>Remember These Truths</Text>

        {truths.map((truth, index) => (
          <View key={truth.id} style={styles.truthCard}>
            <Text style={styles.truthText}>{truth.text}</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.refreshButton} onPress={refreshTruths}>
          <Text style={styles.refreshButtonText}>Show More Truths</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.stayStrongButton}
          onPress={handleStayStrong}
        >
          <Text style={styles.stayStrongText}>I'm Staying Strong</Text>
        </TouchableOpacity>

        <Text style={styles.supportText}>
          You've survived every urge before this one.{'\n'}
          You'll survive this one too.
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
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  subheader: {
    fontSize: 20,
    color: colors.primary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  breathingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
    marginBottom: 30,
  },
  breathingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    opacity: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 16,
  },
  truthCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  truthText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  refreshButton: {
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
  },
  refreshButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  stayStrongButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  stayStrongText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  supportText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 22,
  },
});

export default EmergencyScreen;
