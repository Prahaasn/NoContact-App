import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import colors from '../styles/colors';
import { getRandomPrompts } from '../data/journalPrompts';
import {
  saveJournalEntry,
  getJournalEntries,
  saveUnsentLetter,
  getUnsentLetters,
  deleteUnsentLetter,
} from '../utils/storage';

const JournalScreen = () => {
  const [prompts, setPrompts] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [unsentLetters, setUnsentLetters] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [journalText, setJournalText] = useState('');
  const [letterText, setLetterText] = useState('');
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [showViewLetterModal, setShowViewLetterModal] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);

  const loadData = async () => {
    setPrompts(getRandomPrompts(3));
    const entries = await getJournalEntries();
    const letters = await getUnsentLetters();
    setJournalEntries(entries.slice(-5).reverse());
    setUnsentLetters(letters.reverse());
  };

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handlePromptSelect = (prompt) => {
    setSelectedPrompt(selectedPrompt?.id === prompt.id ? null : prompt);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSaveEntry = async () => {
    if (!journalText.trim()) {
      Alert.alert('Empty Entry', 'Please write something before saving.');
      return;
    }

    await saveJournalEntry({
      prompt: selectedPrompt?.prompt || 'Free write',
      content: journalText.trim(),
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Saved!', 'Your journal entry has been saved.');
    setJournalText('');
    setSelectedPrompt(null);
    loadData();
  };

  const handleSaveLetter = async () => {
    if (!letterText.trim()) {
      Alert.alert('Empty Letter', 'Please write something before saving.');
      return;
    }

    await saveUnsentLetter({
      content: letterText.trim(),
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLetterText('');
    setShowLetterModal(false);
    loadData();
  };

  const handleDeleteLetter = async (id) => {
    Alert.alert(
      'Delete Letter',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteUnsentLetter(id);
            setShowViewLetterModal(false);
            loadData();
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Journal</Text>
              <Text style={styles.subtitle}>Your safe space to reflect</Text>
            </View>

            {/* Prompts Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>💭</Text>
                <Text style={styles.sectionTitle}>Today's Prompts</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.promptsContainer}
              >
                {prompts.map((prompt) => (
                  <TouchableOpacity
                    key={prompt.id}
                    style={[
                      styles.promptCard,
                      selectedPrompt?.id === prompt.id && styles.promptCardSelected,
                    ]}
                    onPress={() => handlePromptSelect(prompt)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.promptCategory}>{prompt.category}</Text>
                    <Text style={styles.promptText}>{prompt.prompt}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Journal Entry Input */}
            <View style={styles.entryContainer}>
              <Text style={styles.entryLabel}>
                {selectedPrompt ? selectedPrompt.prompt : 'Free write...'}
              </Text>
              <TextInput
                style={styles.entryInput}
                placeholder="Start writing your thoughts..."
                placeholderTextColor={colors.textMuted}
                value={journalText}
                onChangeText={setJournalText}
                multiline
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveEntry}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>Save Entry</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Unsent Letters Vault */}
            <View style={styles.vaultSection}>
              <View style={styles.vaultHeader}>
                <View style={styles.vaultTitleRow}>
                  <Text style={styles.vaultIcon}>📨</Text>
                  <Text style={styles.sectionTitle}>Unsent Letters Vault</Text>
                </View>
                <TouchableOpacity
                  style={styles.newLetterButton}
                  onPress={() => setShowLetterModal(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.newLetterText}>+ New</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.vaultDescription}>
                Write letters you'll never send. Get it all out.
              </Text>

              {unsentLetters.length === 0 ? (
                <View style={styles.emptyVault}>
                  <Text style={styles.emptyIcon}>✉️</Text>
                  <Text style={styles.emptyText}>No letters yet</Text>
                  <Text style={styles.emptySubtext}>
                    Write what you can't say out loud
                  </Text>
                </View>
              ) : (
                unsentLetters.slice(0, 3).map((letter) => (
                  <TouchableOpacity
                    key={letter.id}
                    style={styles.letterPreview}
                    onPress={() => {
                      setSelectedLetter(letter);
                      setShowViewLetterModal(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.letterMeta}>
                      <Text style={styles.letterDate}>{formatDate(letter.date)}</Text>
                      <Text style={styles.letterArrow}>→</Text>
                    </View>
                    <Text style={styles.letterSnippet} numberOfLines={2}>
                      {letter.content}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>

            {/* Recent Entries */}
            {journalEntries.length > 0 && (
              <View style={styles.recentSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionIcon}>📖</Text>
                  <Text style={styles.sectionTitle}>Recent Entries</Text>
                </View>
                {journalEntries.map((entry) => (
                  <View key={entry.id} style={styles.recentEntry}>
                    <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                    <Text style={styles.entryPromptLabel}>{entry.prompt}</Text>
                    <Text style={styles.entryContent} numberOfLines={3}>
                      {entry.content}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* New Letter Modal */}
      <Modal visible={showLetterModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>📝 Write an Unsent Letter</Text>
            <Text style={styles.modalSubtitle}>
              Say everything you need to say. No one will ever see this but you.
            </Text>
            <TextInput
              style={styles.letterInput}
              placeholder="Dear..."
              placeholderTextColor={colors.textMuted}
              value={letterText}
              onChangeText={setLetterText}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setLetterText('');
                  setShowLetterModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveLetterButton}
                onPress={handleSaveLetter}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.saveLetterGradient}
                >
                  <Text style={styles.saveLetterText}>Save to Vault</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* View Letter Modal */}
      <Modal visible={showViewLetterModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>📨 Unsent Letter</Text>
            <Text style={styles.letterFullDate}>
              {selectedLetter && formatDate(selectedLetter.date)}
            </Text>
            <ScrollView style={styles.letterScrollView}>
              <Text style={styles.letterFullContent}>
                {selectedLetter?.content}
              </Text>
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteLetter(selectedLetter?.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowViewLetterModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  promptsContainer: {
    paddingRight: 20,
  },
  promptCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 200,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  promptCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  promptCategory: {
    fontSize: 11,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    fontWeight: '600',
  },
  promptText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  entryContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  entryLabel: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 12,
    fontWeight: '500',
  },
  entryInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    padding: 16,
    color: colors.text,
    fontSize: 16,
    minHeight: 140,
    lineHeight: 24,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
  },
  saveButtonGradient: {
    padding: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  vaultSection: {
    marginBottom: 24,
  },
  vaultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  vaultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vaultIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  newLetterButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  newLetterText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  vaultDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    marginLeft: 28,
  },
  emptyVault: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  letterPreview: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  letterMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  letterDate: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  letterArrow: {
    fontSize: 16,
    color: colors.textMuted,
  },
  letterSnippet: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  recentSection: {
    marginBottom: 20,
  },
  recentEntry: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  entryDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  entryPromptLabel: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 4,
    marginBottom: 8,
    fontWeight: '500',
  },
  entryContent: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingTop: 12,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.surfaceLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  letterInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    padding: 16,
    color: colors.text,
    fontSize: 16,
    minHeight: 200,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.textSecondary,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  saveLetterButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveLetterGradient: {
    padding: 16,
    alignItems: 'center',
  },
  saveLetterText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  letterFullDate: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 16,
  },
  letterScrollView: {
    maxHeight: 300,
    marginBottom: 10,
  },
  letterFullContent: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 26,
  },
  deleteButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  closeButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default JournalScreen;
