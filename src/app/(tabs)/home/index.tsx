import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { spacing, typography } from '../../../theme';
import { useTheme } from '../../../theme/theme-context';
import { useMoods } from '../../../hooks/use-moods';
import { useAuth } from '../../../hooks/use-auth';
import { useQuotes } from '../../../hooks/use-quotes';
import { Ionicons } from '@expo/vector-icons';
import { notificationsService } from '../../../services/notifications.service';

const moodOptions = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😐', label: 'Neutral', value: 'neutral' },
  { emoji: '😟', label: 'Anxious', value: 'anxious' },
  { emoji: '😢', label: 'Sad', value: 'sad' },
  { emoji: '😠', label: 'Angry', value: 'angry' },
  { emoji: '😌', label: 'Calm', value: 'calm' },
  { emoji: '🤩', label: 'Excited', value: 'excited' },
  { emoji: '😴', label: 'Tired', value: 'tired' },
];

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { moods, isLoading, createMood, isCreating } = useMoods();
  const { quotes, isLoading: quotesLoading } = useQuotes();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  useEffect(() => {
    notificationsService.registerForPushNotifications();
    notificationsService.scheduleDailyNotification();
  }, []);

  const todayMood = moods.find(
    (mood) => new Date(mood.date).toDateString() === new Date().toDateString()
  );

  const handleSelectMood = async (moodType: string) => {
    try {
      setSelectedMood(moodType);
      await createMood({
        moodType,
        date: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to save mood:', error);
      setSelectedMood(null);
    }
  };

  const getMoodEmoji = (moodType?: string) => {
    switch (moodType) {
      case 'happy': return '😊';
      case 'excited': return '🤩';
      case 'calm': return '😌';
      case 'neutral': return '😐';
      case 'anxious': return '😟';
      case 'sad': return '😢';
      case 'angry': return '😠';
      case 'tired': return '😴';
      default: return '😊';
    }
  };

  const getMoodText = (moodType?: string) => {
    switch (moodType) {
      case 'happy': return 'Feeling happy';
      case 'excited': return 'Feeling excited';
      case 'calm': return 'Feeling calm';
      case 'neutral': return 'Feeling neutral';
      case 'anxious': return 'Feeling anxious';
      case 'sad': return 'Feeling down';
      case 'angry': return 'Feeling angry';
      case 'tired': return 'Feeling tired';
      default: return 'Feeling calm';
    }
  };

  const dynamicStyles = getStyles(colors);

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <ScrollView style={dynamicStyles.scrollView} contentContainerStyle={dynamicStyles.content}>
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.greeting}>Hi {user?.name || 'there'} 👋</Text>
          <Text style={dynamicStyles.subtitle}>Welcome back to your mindful space.</Text>
        </View>

        {todayMood ? (
          <Card style={dynamicStyles.moodCard}>
            <Text style={dynamicStyles.moodEmoji}>{getMoodEmoji(todayMood.moodType)}</Text>
            <Text style={dynamicStyles.moodTitle}>{getMoodText(todayMood.moodType)}</Text>
            <Text style={dynamicStyles.moodDescription}>
              Your mood has been stable today. Keep up the good work!
            </Text>
            <TouchableOpacity
              style={dynamicStyles.exploreLink}
              onPress={() => navigation.navigate('Mood')}
            >
              <Text style={dynamicStyles.exploreText}>Explore Mood History</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <Card style={dynamicStyles.moodSelectionCard}>
            <Text style={dynamicStyles.question}>How are you feeling today?</Text>
            <View style={dynamicStyles.moodGrid}>
              {moodOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    dynamicStyles.moodOption,
                    selectedMood === option.value && dynamicStyles.selectedMood,
                    isCreating && dynamicStyles.disabledMood,
                  ]}
                  onPress={() => handleSelectMood(option.value)}
                  disabled={isCreating}
                >
                  <Text style={dynamicStyles.moodOptionEmoji}>{option.emoji}</Text>
                  <Text style={dynamicStyles.moodLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {isCreating && (
              <Text style={dynamicStyles.savingText}>Saving your mood...</Text>
            )}
          </Card>
        )}

        <View style={dynamicStyles.quickActions}>
          <Text style={dynamicStyles.sectionTitle}>Quick Actions</Text>
          <View style={dynamicStyles.actionGrid}>
            <TouchableOpacity
              style={dynamicStyles.actionCard}
              onPress={() => navigation.navigate('Exercises')}
            >
              <Text style={dynamicStyles.actionEmoji}>🧘</Text>
              <Text style={dynamicStyles.actionTitle}>Exercises</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={dynamicStyles.actionCard}
              onPress={() => navigation.navigate('Mood')}
            >
              <Text style={dynamicStyles.actionEmoji}>😊</Text>
              <Text style={dynamicStyles.actionTitle}>Mood</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={dynamicStyles.actionCard}
              onPress={() => navigation.navigate('Goals')}
            >
              <Text style={dynamicStyles.actionEmoji}>🎯</Text>
              <Text style={dynamicStyles.actionTitle}>Goals</Text>
            </TouchableOpacity>
          </View>
        </View>

        {quotes.length > 0 && (
          <View style={dynamicStyles.quotesSection}>
            <Text style={dynamicStyles.sectionTitle}>Daily Inspiration</Text>
            {quotesLoading ? (
              <Card style={dynamicStyles.quoteCard}>
                <Text style={dynamicStyles.quote}>Loading inspiration...</Text>
              </Card>
            ) : (
              quotes.slice(0, 3).map((quote, index) => (
                <Card key={`quote-${index}-${quote.a}`} style={dynamicStyles.quoteCard}>
                  <Text style={dynamicStyles.quote}>"{quote.q}"</Text>
                  <Text style={dynamicStyles.quoteAuthor}>— {quote.a}</Text>
                </Card>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  moodCard: {
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  moodEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  moodSelectionCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  question: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  moodOption: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface,
    minWidth: 80,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedMood: {
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  disabledMood: {
    opacity: 0.6,
  },
  moodOptionEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  moodLabel: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  savingText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  moodTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  moodDescription: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  exploreLink: {
    marginTop: spacing.sm,
  },
  exploreText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  quickActions: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
    minWidth: 100,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  actionTitle: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  quotesSection: {
    marginTop: spacing.lg,
  },
  quoteCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  quote: {
    ...typography.body,
    color: colors.text.primary,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  quoteAuthor: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'right',
    fontStyle: 'normal',
  },
});

