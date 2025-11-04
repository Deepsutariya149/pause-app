import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { colors, spacing, typography } from '../../../theme';
import { useJournals } from '../../../hooks/use-journals';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { cloudinaryService } from '../../../services/cloudinary.service';
import { journalSchema } from '../../../utils/validations';

export default function JournalScreen() {
  const navigation = useNavigation<any>();
  const { journals, isLoading, createJournal, deleteJournal, isCreating } = useJournals();
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [recording, setRecording] = useState(false);

  const handleCreate = async () => {
    try {
      const validated = journalSchema.parse({ title, description: content });
      await createJournal(validated);
      setTitle('');
      setContent('');
      setIsCreatingNew(false);
      Alert.alert('Success', 'Journal entry created successfully!');
    } catch (error: any) {
      if (error.errors) {
        Alert.alert('Validation Error', error.errors[0].message);
      } else {
        Alert.alert('Error', 'Failed to create journal entry');
      }
    }
  };

  const handleRecordVoice = async () => {
    try {
      setRecording(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Audio,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const url = await cloudinaryService.uploadVoiceNote(result.assets[0].uri);
        Alert.alert('Success', 'Voice note uploaded! Now complete your journal entry.');
        // You can save the URL to state and include it when creating the journal
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload voice note');
    } finally {
      setRecording(false);
    }
  };

  const handleAnalyze = async (id: string) => {
    // Analysis is done automatically by backend
    Alert.alert('Info', 'Mood analysis is done automatically when creating journal entries.');
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Journal',
      'Are you sure you want to delete this journal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteJournal(id);
          },
        },
      ]
    );
  };

  if (isCreatingNew) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setIsCreatingNew(false)}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <Text style={styles.title}>New Journal Entry</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={colors.gray[400]}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What's on your mind?"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={10}
              placeholderTextColor={colors.gray[400]}
            />

            <Button
              title={recording ? 'Recording...' : 'Record Voice Note'}
              onPress={handleRecordVoice}
              variant="outline"
              disabled={recording}
            />

            <Button
              title="Save Entry"
              onPress={handleCreate}
              loading={isCreating}
              disabled={!title || !content}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Journal</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsCreatingNew(true)}
        >
          <Ionicons name="add" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {journals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No journal entries yet</Text>
            <Text style={styles.emptySubtext}>Start writing your thoughts</Text>
          </View>
        ) : (
          journals.map((journal) => (
            <Card key={journal._id} style={styles.journalCard}>
              <View style={styles.journalHeader}>
                <Text style={styles.journalTitle}>{journal.title}</Text>
                <TouchableOpacity onPress={() => handleDelete(journal._id)}>
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
              <Text style={styles.journalContent}>{journal.description}</Text>
              {journal.voiceNoteUrl && (
                <View style={styles.voiceNote}>
                  <Ionicons name="mic-outline" size={16} color={colors.primary} />
                  <Text style={styles.voiceNoteText}>Voice note attached</Text>
                </View>
              )}
              {journal.aiMoodAnalysis && (
                <Text style={styles.tone}>Analysis: {journal.aiMoodAnalysis}</Text>
              )}
              {journal.mood && (
                <Text style={styles.tone}>Mood: {journal.mood}</Text>
              )}
              <View style={styles.journalFooter}>
                <Text style={styles.journalDate}>
                  {new Date(journal.createdAt).toLocaleDateString()}
                </Text>
                <TouchableOpacity onPress={() => handleAnalyze(journal._id)}>
                  <Text style={styles.analyzeButton}>Analyze</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  screenTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  addButton: {
    padding: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl,
  },
  emptyText: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.text.secondary,
  },
  journalCard: {
    marginBottom: spacing.md,
  },
  journalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  journalTitle: {
    ...typography.h4,
    color: colors.text.primary,
    flex: 1,
  },
  journalContent: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  voiceNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  voiceNoteText: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  tone: {
    ...typography.bodySmall,
    color: colors.primary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  journalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  journalDate: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  analyzeButton: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  backButton: {
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  form: {
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...typography.body,
    color: colors.text.primary,
  },
  textArea: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
});

