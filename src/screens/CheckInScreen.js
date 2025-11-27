import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import colors from '../styles/colors';
import { saveCheckIn } from '../utils/storage';
import MoodSelector from '../components/MoodSelector';

const TRIGGERS = [
  { id: 1, label: 'Social media', icon: '📱' },
  { id: 2, label: 'A song', icon: '🎵' },
  { id: 3, label: 'A memory', icon: '💭' },
  { id: 4, label: 'Mutual friends', icon: '👥' },
  { id: 5, label: 'Loneliness', icon: '😔' },
  { id: 6, label: 'A place', icon: '📍' },
];

const CheckInScreen = ({ navigation }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedTriggers, setSelectedTriggers] = useState([]);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleTrigger = (triggerId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTriggers((prev) =>
      prev.includes(triggerId)
        ? prev.filter((id) => id !== triggerId)
        : [...prev, triggerId]
    );
  };

  const handleSave = async () => {
    if (!selectedMood) {
      Alert.alert('Select a mood', 'Please select how you\'re feeling today.');
      return;
    }

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setSaving(true);
    try {
      const triggerLabels = selectedTriggers.map(
        (id) => TRIGGERS.find((t) => t.id === id)?.label
      ).filter(Boolean);

      await saveCheckIn({
        mood: selectedMood,
        triggers: triggerLabels,
        note: note.trim(),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        'Check-in Complete ✓',
        'Great job taking care of yourself today. Keep going!',
        [
          {
            text: 'Done',
            onPress: () => {
              navigation.navigate('Home');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save check-in. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getMoodMessage = () => {
    if (!selectedMood) return '';
    const messages = {
      1: "It's okay to not be okay. I'm proud of you for checking in.",
      2: "Tough days are part of healing. You're doing better than you think.",
      3: "Neutral is progress. Every day gets a little easier.",
      4: "That's wonderful! Celebrate the good moments.",
      5: "Amazing! You're finding your way back to yourself.",
    };
    return messages[selectedMood];
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary + '15', colors.background]}
        style={styles.gradient}
      />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.title}>Daily Check-In</Text>
              <Text style={styles.subtitle}>
                Take a moment to reflect on today
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How are you feeling?</Text>
              <MoodSelector
                selectedMood={selectedMood}
                onSelectMood={handleMoodSelect}
              />
              {selectedMood && (
                <Text style={styles.moodMessage}>{getMoodMessage()}</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What triggered you today?</Text>
              <Text style={styles.sectionSubtitle}>Select all that apply</Text>
              <View style={styles.triggersGrid}>
                {TRIGGERS.map((trigger) => (
                  <TouchableOpacity
                    key={trigger.id}
                    style={[
                      styles.triggerChip,
                      selectedTriggers.includes(trigger.id) &&
                        styles.triggerChipSelected,
                    ]}
                    onPress={() => toggleTrigger(trigger.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.triggerIcon}>{trigger.icon}</Text>
                    <Text
                      style={[
                        styles.triggerLabel,
                        selectedTriggers.includes(trigger.id) &&
                          styles.triggerLabelSelected,
                      ]}
                    >
                      {trigger.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Anything on your mind?</Text>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Write your thoughts here... This is your safe space."
                  placeholderTextColor={colors.textMuted}
                  value={note}
                  onChangeText={setNote}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    saving
                      ? [colors.surfaceLight, colors.surfaceLight]
                      : [colors.primary, colors.primaryDark]
                  }
                  style={styles.saveButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.saveButtonText}>
                    {saving ? 'Saving...' : 'Complete Check-In'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.skipButtonText}>Maybe later</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
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
    height: 200,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  moodMessage: {
    fontSize: 14,
    color: colors.primary,
    fontStyle: 'italic',
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  triggersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  triggerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  triggerChipSelected: {
    backgroundColor: colors.primary + '30',
    borderColor: colors.primary,
  },
  triggerIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  triggerLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  triggerLabelSelected: {
    color: colors.text,
    fontWeight: '600',
  },
  textInputContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginTop: 8,
  },
  textInput: {
    padding: 16,
    color: colors.text,
    fontSize: 16,
    minHeight: 120,
    lineHeight: 24,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  skipButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});

export default CheckInScreen;
