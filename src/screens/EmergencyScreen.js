import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import colors from '../styles/colors';
import { getRandomTruths } from '../data/truthReminders';

const { width } = Dimensions.get('window');

const EmergencyScreen = () => {
  const [truths, setTruths] = useState([]);
  const [breathingPhase, setBreathingPhase] = useState('inhale');
  const [breathCount, setBreathCount] = useState(0);
  const breathAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef(null);

  useEffect(() => {
    setTruths(getRandomTruths(5));
    startBreathingAnimation();

    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

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

  const handleStayStrong = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const refreshTruths = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTruths(getRandomTruths(5));
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
                <Text style={styles.refreshButtonText}>↻ Show More Truths</Text>
              </TouchableOpacity>
            </View>

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
                <Text style={styles.stayStrongEmoji}>💪</Text>
                <Text style={styles.stayStrongText}>I'm Staying Strong</Text>
              </LinearGradient>
            </TouchableOpacity>

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
  stayStrongButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 16,
  },
  stayStrongGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  stayStrongEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  stayStrongText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
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
