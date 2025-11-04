import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { colors, spacing, typography } from '../../../theme';
import { useExercises } from '../../../hooks/use-exercises';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { Video, ResizeMode } from 'expo-av';

export default function ExercisesScreen() {
  const { exercises, isLoading } = useExercises();
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const videoRef = useRef<Video | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startExercise = async (exercise: any) => {
    try {
      setSelectedExercise(exercise);
      setIsPlaying(true);
      setTimeElapsed(0);

      if (exercise.mediaUrl) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: exercise.mediaUrl },
          { shouldPlay: true }
        );
        soundRef.current = sound;

        await sound.setPositionAsync(0);
        await sound.playAsync();

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setTimeElapsed(status.positionMillis / 1000);
            if (status.didJustFinish) {
              stopExercise();
            }
          }
        });
      }

      // Start timer
      intervalRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to start exercise');
      stopExercise();
    }
  };

  const stopExercise = async () => {
    setIsPlaying(false);
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimeElapsed(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (selectedExercise && isPlaying) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.exerciseContainer}>
          <TouchableOpacity style={styles.backButton} onPress={stopExercise}>
            <Ionicons name="close" size={28} color={colors.text.primary} />
          </TouchableOpacity>

          <Text style={styles.exerciseTitle}>{selectedExercise.title}</Text>
          <Text style={styles.exerciseDescription}>{selectedExercise.description}</Text>

          {selectedExercise.mediaUrl && (
            <Video
              ref={videoRef}
              source={{ uri: selectedExercise.mediaUrl }}
              style={styles.video}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={isPlaying}
            />
          )}

          <View style={styles.timerContainer}>
            <Text style={styles.timer}>{formatTime(timeElapsed)}</Text>
            <Text style={styles.timerLabel}>
              Duration: {selectedExercise.duration} minutes
            </Text>
          </View>

          <Button
            title="Stop Exercise"
            onPress={stopExercise}
            variant="outline"
            size="large"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Exercises</Text>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {isLoading ? (
          <Text style={styles.loadingText}>Loading exercises...</Text>
        ) : exercises.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No exercises available</Text>
          </View>
        ) : (
          exercises.map((exercise) => (
            <Card key={exercise._id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseIcon}>
                  <Ionicons
                    name={
                      exercise.category === 'breathing'
                        ? 'leaf-outline'
                        : exercise.category === 'meditation'
                        ? 'sparkles-outline'
                        : 'flower-outline'
                    }
                    size={32}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseCardTitle}>{exercise.title}</Text>
                  <Text style={styles.exerciseType}>
                    {exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1)} • {exercise.duration} min
                  </Text>
                </View>
              </View>
              <Text style={styles.exerciseCardDescription}>{exercise.description}</Text>
              <Button
                title="Start Session"
                onPress={() => startExercise(exercise)}
                size="medium"
              />
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
  title: {
    ...typography.h2,
    color: colors.text.primary,
    padding: spacing.lg,
    paddingBottom: spacing.md,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  exerciseCard: {
    marginBottom: spacing.md,
  },
  exerciseHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  exerciseIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseCardTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  exerciseType: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  exerciseCardDescription: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  exerciseContainer: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  exerciseTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  exerciseDescription: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  video: {
    width: '100%',
    height: 250,
    marginBottom: spacing.lg,
    borderRadius: 12,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  timer: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  timerLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
});

