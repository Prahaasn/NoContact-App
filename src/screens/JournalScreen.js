import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setPrompts(getRandomPrompts(3));
    const entries = await getJournalEntries();
    const letters = await getUnsentLetters();
    setJournalEntries(entries.slice(-5).reverse());
    setUnsentLetters(letters.reverse());
  };

  const handlePromptSelect = (prompt) => {
    setSelectedPrompt(prompt);
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
      'Are you sure you want to delete this letter? This cannot be undone.',
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Journal</Text>

        {/* Prompts Section */}
        <Text style={styles.sectionTitle}>Today's Prompts</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {prompts.map((prompt) => (
            <TouchableOpacity
              key={prompt.id}
              style={[
                styles.promptCard,
                selectedPrompt?.id === prompt.id && styles.promptCardSelected,
              ]}
              onPress={() => handlePromptSelect(prompt)}
            >
              <Text style={styles.promptText}>{prompt.prompt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Journal Entry Input */}
        <View style={styles.entryContainer}>
          <Text style={styles.entryLabel}>
            {selectedPrompt ? selectedPrompt.prompt : 'Free write...'}
          </Text>
          <TextInput
            style={styles.entryInput}
            placeholder="Start writing..."
            placeholderTextColor={colors.textMuted}
            value={journalText}
            onChangeText={setJournalText}
            multiline
            numberOfLines={6}
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveEntry}>
            <Text style={styles.saveButtonText}>Save Entry</Text>
          </TouchableOpacity>
        </View>

        {/* Unsent Letters Vault */}
        <View style={styles.vaultSection}>
          <View style={styles.vaultHeader}>
            <Text style={styles.sectionTitle}>Unsent Letters Vault</Text>
            <TouchableOpacity
              style={styles.newLetterButton}
              onPress={() => setShowLetterModal(true)}
            >
              <Text style={styles.newLetterText}>+ New</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.vaultDescription}>
            Write letters you'll never send. Get it all out.
          </Text>

          {unsentLetters.length === 0 ? (
            <Text style={styles.emptyText}>No letters yet</Text>
          ) : (
            unsentLetters.slice(0, 3).map((letter) => (
              <TouchableOpacity
                key={letter.id}
                style={styles.letterPreview}
                onPress={() => {
                  setSelectedLetter(letter);
                  setShowViewLetterModal(true);
                }}
              >
                <Text style={styles.letterDate}>{formatDate(letter.date)}</Text>
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
            <Text style={styles.sectionTitle}>Recent Entries</Text>
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

      {/* New Letter Modal */}
      <Modal visible={showLetterModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Write an Unsent Letter</Text>
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
                <Text style={styles.saveLetterText}>Save to Vault</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* View Letter Modal */}
      <Modal visible={showViewLetterModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Unsent Letter</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  promptCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 200,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  promptCardSelected: {
    borderColor: colors.primary,
  },
  promptText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  entryContainer: {
    marginTop: 24,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  entryLabel: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 12,
  },
  entryInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 16,
    color: colors.text,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  vaultSection: {
    marginTop: 32,
  },
  vaultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  newLetterButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  letterPreview: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  letterDate: {
    fontSize: 12,
    color: colors.primary,
    marginBottom: 4,
  },
  letterSnippet: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  recentSection: {
    marginTop: 32,
  },
  recentEntry: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  },
  entryContent: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
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
  },
  letterInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 16,
    color: colors.text,
    fontSize: 16,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    marginRight: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.textSecondary,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  saveLetterButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 14,
    alignItems: 'center',
    marginLeft: 10,
    borderRadius: 10,
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
  },
  letterFullContent: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  deleteButton: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    marginRight: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.error,
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: 16,
  },
  closeButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 14,
    alignItems: 'center',
    marginLeft: 10,
    borderRadius: 10,
  },
  closeButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default JournalScreen;
