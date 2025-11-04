import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { colors, spacing, typography } from '../../../theme';
import { useMoods } from '../../../hooks/use-moods';
import { useAuth } from '../../../hooks/use-auth';
import { Ionicons } from '@expo/vector-icons';
import { notificationsService } from '../../../services/notifications.service';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { moods, isLoading } = useMoods();

  useEffect(() => {
    notificationsService.registerForPushNotifications();
    notificationsService.scheduleDailyNotification();
  }, []);

  const todayMood = moods.find(
    (mood) => new Date(mood.date).toDateString() === new Date().toDateString()
  );

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hi {user?.name || 'there'} 👋</Text>
          <Text style={styles.subtitle}>Welcome back to your mindful space.</Text>
        </View>

        {todayMood && (
          <Card style={styles.moodCard}>
            <Text style={styles.moodEmoji}>{getMoodEmoji(todayMood.moodType)}</Text>
            <Text style={styles.moodTitle}>{getMoodText(todayMood.moodType)}</Text>
            <Text style={styles.moodDescription}>
              Your mood has been stable today. Keep up the good work!
            </Text>
            <TouchableOpacity
              style={styles.exploreLink}
              onPress={() => navigation.navigate('Mood')}
            >
              <Text style={styles.exploreText}>Explore Mood History</Text>
            </TouchableOpacity>
          </Card>
        )}

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Journal')}
            >
              <Text style={styles.actionEmoji}>📖</Text>
              <Text style={styles.actionTitle}>Journal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Exercises')}
            >
              <Text style={styles.actionEmoji}>🧘</Text>
              <Text style={styles.actionTitle}>Exercises</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Mood')}
            >
              <Text style={styles.actionEmoji}>😊</Text>
              <Text style={styles.actionTitle}>Mood</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Card style={styles.quoteCard}>
          <Text style={styles.quote}>"Embrace the journey. Every step forward is a victory."</Text>
          <Text style={styles.quoteAuthor}>— Pause Collective</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  moodTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
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
    backgroundColor: colors.white,
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
  quoteCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  quote: {
    ...typography.body,
    color: colors.text.primary,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  quoteAuthor: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
});

