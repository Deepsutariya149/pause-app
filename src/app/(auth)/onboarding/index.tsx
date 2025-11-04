import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { colors, spacing, typography } from '../../../theme';
import { storage } from '../../../utils/storage';

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    quote: 'Embrace the journey. Every step forward is a victory.',
    author: 'Pause Collective',
  },
  {
    id: '2',
    quote: 'Take a moment to pause, breathe, and be present.',
    author: 'Pause Collective',
  },
  {
    id: '3',
    quote: 'Your mental wellness matters. Start your journey today.',
    author: 'Pause Collective',
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleComplete = async () => {
    await storage.setOnboardingComplete();
    navigation.replace('Login');
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={onboardingData}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Card style={styles.card}>
              <Text style={styles.quote}>{item.quote}</Text>
              <Text style={styles.author}>— {item.author}</Text>
            </Card>
          </View>
        )}
      />
      <View style={styles.footer}>
        <View style={styles.dots}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>
        <Button
          title={currentIndex === onboardingData.length - 1 ? 'Begin Your Journey' : 'Next'}
          onPress={handleNext}
          size="large"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  slide: {
    width,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    alignItems: 'center',
    padding: spacing.xl,
  },
  quote: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  author: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[300],
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 24,
  },
});


