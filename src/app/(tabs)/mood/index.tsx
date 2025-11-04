import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { colors, spacing, typography } from '../../../theme';
import { useMoods } from '../../../hooks/use-moods';
import { LineChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

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

export default function MoodScreen() {
  const { moods, createMood, isCreating } = useMoods();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleSelectMood = async (moodType: string) => {
    try {
      setSelectedMood(moodType);
      await createMood({
        moodType,
        date: selectedDate.toISOString(),
      });
    } catch (error) {
      console.error('Failed to save mood:', error);
    }
  };

  // Prepare chart data for the last 7 days
  const getWeeklyData = () => {
    const days = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const moodValues: Record<string, number> = {
      sad: 1,
      anxious: 2,
      tired: 2,
      angry: 2,
      neutral: 3,
      calm: 4,
      happy: 5,
      excited: 5,
    };

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    const data = last7Days.map((date) => {
      const moodEntry = moods.find(
        (m) => new Date(m.date).toDateString() === date.toDateString()
      );
      return {
        value: moodEntry ? moodValues[moodEntry.moodType] : 3,
        label: days[date.getDay()],
        labelTextStyle: { color: colors.text.secondary, fontSize: 12 },
      };
    });

    return data;
  };

  const chartData = getWeeklyData();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Mood Tracker</Text>

        <View style={styles.dateSelector}>
          <TouchableOpacity onPress={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() - 1);
            setSelectedDate(newDate);
          }}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() + 1);
            setSelectedDate(newDate);
          }}>
            <Ionicons name="chevron-forward" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.moodSelection}>
          <Text style={styles.question}>How are you feeling today?</Text>
          <View style={styles.moodGrid}>
            {moodOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.moodOption,
                  selectedMood === option.value && styles.selectedMood,
                ]}
                onPress={() => handleSelectMood(option.value)}
              >
                <Text style={styles.moodEmoji}>{option.emoji}</Text>
                <Text style={styles.moodLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Weekly Mood Trend</Text>
            <Ionicons name="stats-chart" size={20} color={colors.primary} />
          </View>
          <LineChart
            data={chartData}
            width={width - 80}
            height={200}
            spacing={40}
            thickness={3}
            color={colors.primary}
            hideRules
            hideYAxisText
            yAxisColor={colors.gray[300]}
            xAxisColor={colors.gray[300]}
            curved
            areaChart
            startFillColor={colors.primary}
            endFillColor={colors.primaryLight}
            startOpacity={0.4}
            endOpacity={0.1}
            yAxisLabelWidth={0}
            yAxisTextStyle={{ color: colors.text.secondary, fontSize: 12 }}
            rulesType="solid"
            rulesColor={colors.gray[200]}
          />
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={styles.legendText}>Mood Level</Text>
            </View>
          </View>
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
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  dateText: {
    ...typography.body,
    color: colors.text.primary,
  },
  moodSelection: {
    marginBottom: spacing.xl,
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
    backgroundColor: colors.white,
    minWidth: 80,
  },
  selectedMood: {
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  moodEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  moodLabel: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  chartCard: {
    padding: spacing.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  chartTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
});

