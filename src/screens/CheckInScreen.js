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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import colors from '../styles/colors';
import { saveCheckIn } from '../utils/storage';
import MoodSelector from '../components/MoodSelector';

const CheckInScreen = ({ navigation }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [trigger, setTrigger] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = async () => {
    if (!selectedMood) {
      Alert.alert('Select a mood', 'Please select how you\'re feeling today.');
      return;
    }

    setSaving(true);
    try {
      await saveCheckIn({
        mood: selectedMood,
        trigger: trigger.trim(),
        note: note.trim(),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        'Check-in Saved',
        'Great job taking a moment for yourself today.',
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedMood(null);
              setTrigger('');
              setNote('');
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Daily Check-In</Text>
          <Text style={styles.subtitle}>How are you feeling today?</Text>

          <MoodSelector
            selectedMood={selectedMood}
            onSelectMood={handleMoodSelect}
          />

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>What triggered you today?</Text>
            <TextInput
              style={styles.textInput}
              placeholder="A song, a memory, social media..."
              placeholderTextColor={colors.textMuted}
              value={trigger}
              onChangeText={setTrigger}
              multiline
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Anything else on your mind?</Text>
            <TextInput
              style={[styles.textInput, styles.largeInput]}
              placeholder="Write your thoughts here..."
              placeholderTextColor={colors.textMuted}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Check-In'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 30,
  },
  inputContainer: {
    marginTop: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    color: colors.text,
    fontSize: 16,
    minHeight: 50,
  },
  largeInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 40,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CheckInScreen;
