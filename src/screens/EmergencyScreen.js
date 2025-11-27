import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import colors from '../styles/colors';
import { getRandomTruths } from '../data/truthReminders';
import {
  logEmergencyEvent,
  updateEmergencyEvent,
  resetStreak,
  startStreak,
} from '../utils/storage';

const { width } = Dimensions.get('window');
const TIMER_DURATION = 300; // 5 minutes in seconds

const EmergencyScreen = () => {
  const navigation = useNavigation();
  const [truths, setTruths] = useState([]);
  const [breathingPhase, setBreathingPhase] = useState('inhale');
  const [breathCount, setBreathCount] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(TIMER_DURATION);
  const [timerActive, setTimerActive] = useState(true);
  const [currentEventId, setCurrentEventId] = useState(null);

  const breathAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setTruths(getRandomTruths(5));
    startBreathingAnimation();
    logEmergencyOnMount();

    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    return () => {};
  }, []);

  // 5-minute countdown timer
  useEffect(() => {
    if (!timerActive || secondsRemaining <= 0) {
      if (secondsRemaining <= 0) {
        setTimerActive(false);
        // Pulse animation when timer ends
        Animated.sequence([
          Animated.timing(timerAnim, { toValue: 1.1, duration: 200, useNativeDriver: true }),
          Animated.timing(timerAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
      }
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, secondsRemaining]);

  const logEmergencyOnMount = async () => {
    const event = await logEmergencyEvent();
    if (event) {
      setCurrentEventId(event.id);
    }
  };

  const startBreathingAnimation = () => {
    const breathe = () => {
      // Inhale
      setBreathingPhase('inhale');
      Animated.parallel([
        Animated.timing(breathAnim, {
          toValue: 1.2,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Exhale
        setBreathingPhase('exhale');
        setBreathCount((prev) => prev + 1);
        Animated.parallel([
          Animated.timing(breathAnim, {
            toValue: 0.8,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.6,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]).start(breathe);
      });
    };

    breathe();
  };

  const handleStayStrong = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Update event as stayed strong
    if (currentEventId) {
      await updateEmergencyEvent(currentEventId, true);
    }

    Alert.alert(
      "You're Incredible!",
      "You resisted the urge. That takes real strength. Your future self thanks you.",
      [
        {
          text: 'Write in Journal',
          onPress: () => navigation.navigate('Journal'),
        },
        {
          text: 'Back to Home',
          onPress: () => navigation.navigate('Home'),
          style: 'cancel',
        },
      ]
    );
  };

  const handleBrokeContact = () => {
    Alert.alert(
      'Are you sure?',
      'Breaking contact will reset your streak. Be honest with yourself - this journey is for you.',
      [
        {
          text: 'No, Stay Strong',
          onPress: handleStayStrong,
          style: 'default',
        },
        {
          text: 'Yes, I broke contact',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            // Update event as broke contact
            if (currentEventId) {
              await updateEmergencyEvent(currentEventId, false);
            }

            // Reset streak
            await resetStreak();
            await startStreak();

            Alert.alert(
              "It's Okay",
              "Healing isn't linear. What matters is you're starting again. Every day is a new chance.",
              [
                {
                  text: 'Start Fresh',
                  onPress: () => navigation.navigate('Home'),
                },
              ]
            );
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleGoToJournal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Journal');
  };

  const refreshTruths = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTruths(getRandomTruths(5));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[colors.primary + '30', colors.background, colors.background]}
        style={styles.backgroundGradient}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            {/* Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.emergencyIcon}>🆘</Text>
              <Text style={styles.header}>Take a breath.</Text>
              <Text style={styles.subheader}>
                They're not your person anymore.
              </Text>
            </View>

            {/* Countdown Timer */}
            {timerActive && (
              <Animated.View
                style={[
                  styles.timerContainer,
                  { transform: [{ scale: timerAnim }] }
                ]}
              >
                <Text style={styles.timerLabel}>Wait before deciding:</Text>
                <Text style={styles.timerText}>{formatTime(secondsRemaining)}</Text>
                <Text style={styles.timerHint}>
                  Take this time to think clearly
                </Text>
              </Animated.View>
            )}

            {!timerActive && (
              <View style={styles.timerDoneContainer}>
                <Text style={styles.timerDoneText}>Time's up - you've waited!</Text>
                <Text style={styles.timerDoneHint}>You're thinking clearer now</Text>
              </View>
            )}

            {/* Breathing Exercise */}
            <View style={styles.breathingContainer}>
              <View style={styles.breathingOuter}>
                <Animated.View
                  style={[
                    styles.breathingCircle,
                    {
                      transform: [{ scale: breathAnim }],
                      opacity: opacityAnim,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.breathingGradient}
                  >
                    <Text style={styles.breathingText}>
                      {breathingPhase === 'inhale' ? 'Breathe In' : 'Breathe Out'}
                    </Text>
                  </LinearGradient>
                </Animated.View>
              </View>
              <Text style={styles.breathCountText}>
                {breathCount > 0 ? `${breathCount} breath${breathCount > 1 ? 's' : ''} completed` : 'Follow the circle'}
              </Text>
            </View>

            {/* Truths Section */}
            <View style={styles.truthsSection}>
              <Text style={styles.sectionTitle}>Remember These Truths</Text>

              {truths.map((truth, index) => (
                <View key={truth.id} style={styles.truthCard}>
                  <View style={styles.truthNumber}>
                    <Text style={styles.truthNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.truthText}>{truth.text}</Text>
                </View>
              ))}

              <TouchableOpacity
                style={styles.refreshButton}
                onPress={refreshTruths}
                activeOpacity={0.7}
              >
                <Text style={styles.refreshButtonText}>Show More Truths</Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              {/* Stay Strong Button */}
              <TouchableOpacity
                style={styles.stayStrongButton}
                onPress={handleStayStrong}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.stayStrongGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.stayStrongText}>Stay Strong</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Write in Journal Button */}
              <TouchableOpacity
                style={styles.journalButton}
                onPress={handleGoToJournal}
                activeOpacity={0.7}
              >
                <Text style={styles.journalButtonText}>Write in Journal Instead</Text>
              </TouchableOpacity>

              {/* I Broke Contact Button */}
              <TouchableOpacity
                style={styles.brokeContactButton}
                onPress={handleBrokeContact}
                activeOpacity={0.7}
              >
                <Text style={styles.brokeContactButtonText}>I broke contact</Text>
              </TouchableOpacity>
            </View>

            {/* Support Message */}
            <View style={styles.supportContainer}>
              <Text style={styles.supportText}>
                You've survived every urge before this one.
              </Text>
              <Text style={styles.supportText}>
                You'll survive this one too.
              </Text>
            </View>

            {/* Crisis Resources */}
            <View style={styles.crisisContainer}>
              <Text style={styles.crisisTitle}>Need more support?</Text>
              <Text style={styles.crisisText}>
                If you're struggling, talking to someone can help.
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
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 400,
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
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 20,
    marginBottom: 20,
  },
  emergencyIcon: {
    fontSize: 40,
    marginBottom: 16,
  },
  header: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  subheader: {
    fontSize: 18,
    color: colors.primary,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
  },
  timerLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
  },
  timerHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
  },
  timerDoneContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: colors.success + '20',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.success + '40',
  },
  timerDoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
  },
  timerDoneHint: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  breathingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  breathingOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: colors.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    overflow: 'hidden',
  },
  breathingGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  breathCountText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.textSecondary,
  },
  truthsSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  truthCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  truthNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  truthNumberText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  truthText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  refreshButton: {
    alignItems: 'center',
    padding: 16,
    marginTop: 4,
  },
  refreshButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  actionsContainer: {
    marginTop: 16,
    gap: 12,
  },
  stayStrongButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  stayStrongGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  stayStrongText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  journalButton: {
    backgroundColor: colors.surface,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  journalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  brokeContactButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  brokeContactButtonText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  supportContainer: {
    alignItems: 'center',
    marginTop: 28,
  },
  supportText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  crisisContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    alignItems: 'center',
  },
  crisisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  crisisText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default EmergencyScreen;
