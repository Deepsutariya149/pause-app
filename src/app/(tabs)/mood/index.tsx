import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { spacing, typography } from '../../../theme';
import { useTheme } from '../../../theme/theme-context';
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
  const { colors } = useTheme();
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
  const dynamicStyles = getStyles(colors);

  // Check if mood exists for selected date
  const selectedDateMood = moods.find(
    (m) => new Date(m.date).toDateString() === selectedDate.toDateString()
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
      case 'happy': return 'Happy';
      case 'excited': return 'Excited';
      case 'calm': return 'Calm';
      case 'neutral': return 'Neutral';
      case 'anxious': return 'Anxious';
      case 'sad': return 'Sad';
      case 'angry': return 'Angry';
      case 'tired': return 'Tired';
      default: return 'Unknown';
    }
  };

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <ScrollView style={dynamicStyles.scrollView} contentContainerStyle={dynamicStyles.content}>
        <Text style={dynamicStyles.title}>Mood Tracker</Text>

        <View style={dynamicStyles.dateSelector}>
          <TouchableOpacity onPress={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() - 1);
            setSelectedDate(newDate);
          }}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={dynamicStyles.dateText}>
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

        {selectedDateMood ? (
          <Card style={dynamicStyles.moodCard}>
            <Text style={dynamicStyles.moodEmoji}>{getMoodEmoji(selectedDateMood.moodType)}</Text>
            <Text style={dynamicStyles.moodTitle}>You were feeling {getMoodText(selectedDateMood.moodType).toLowerCase()}</Text>
            <Text style={dynamicStyles.moodDescription}>
              Mood already recorded for this date.
            </Text>
          </Card>
        ) : (
          <View style={dynamicStyles.moodSelection}>
            <Text style={dynamicStyles.question}>How are you feeling today?</Text>
            <View style={dynamicStyles.moodGrid}>
              {moodOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    dynamicStyles.moodOption,
                    selectedMood === option.value && dynamicStyles.selectedMood,
                  ]}
                  onPress={() => handleSelectMood(option.value)}
                >
                  <Text style={dynamicStyles.moodEmoji}>{option.emoji}</Text>
                  <Text style={dynamicStyles.moodLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <Card style={dynamicStyles.chartCard}>
          <View style={dynamicStyles.chartHeader}>
            <Text style={dynamicStyles.chartTitle}>Weekly Mood Trend</Text>
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
          <View style={dynamicStyles.legend}>
            <View style={dynamicStyles.legendItem}>
              <View style={[dynamicStyles.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={dynamicStyles.legendText}>Mood Level</Text>
            </View>
          </View>
        </Card>
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
  moodCard: {
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.xl,
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
  moodEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
    textAlign: 'center',
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

