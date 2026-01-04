import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { spacing, typography } from '../../../theme';
import { useTheme } from '../../../theme/theme-context';
import { useAuth } from '../../../hooks/use-auth';
import { useUser } from '../../../hooks/use-user';
import { useFeedback } from '../../../hooks/use-feedback';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { cloudinaryService } from '../../../services/cloudinary.service';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { colors, mode, setMode, isDark } = useTheme();
  const { user, logout } = useAuth();
  const { profile, updateProfile, isUpdating } = useUser();
  const { submitFeedback, isSubmitting } = useFeedback();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.name || user?.name || '');
  const [avatar, setAvatar] = useState(profile?.avatar || user?.avatar || '');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateProfile({ name, avatar });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setName(profile?.name || user?.name || '');
    setAvatar(profile?.avatar || user?.avatar || '');
    setIsEditing(false);
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const url = await cloudinaryService.uploadImage(result.assets[0].uri);
        setAvatar(url);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackRating || feedbackRating < 1 || feedbackRating > 5) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    if (!feedbackMessage.trim()) {
      Alert.alert('Error', 'Please enter your feedback message');
      return;
    }

    try {
      await submitFeedback({
        rating: feedbackRating,
        message: feedbackMessage,
      });
      Alert.alert('Success', 'Thank you for your feedback! We appreciate it.');
      setFeedbackMessage('');
      setFeedbackRating(0);
      setShowFeedback(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const dynamicStyles = getStyles(colors);

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>Profile</Text>
        {!isEditing && (
          <TouchableOpacity onPress={handleEdit}>
            <Ionicons name="create-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={dynamicStyles.scrollView} contentContainerStyle={dynamicStyles.content}>
        <View style={dynamicStyles.profileSection}>
          <TouchableOpacity
            style={dynamicStyles.avatarContainer}
            onPress={isEditing ? handleImagePick : undefined}
            disabled={!isEditing}
          >
            {avatar ? (
              <Image source={{ uri: avatar }} style={dynamicStyles.avatar} />
            ) : (
              <View style={dynamicStyles.avatarPlaceholder}>
                <Ionicons name="person" size={48} color={colors.white} />
              </View>
            )}
            {isEditing && (
              <View style={dynamicStyles.editIcon}>
                <Ionicons name="camera" size={20} color={colors.white} />
              </View>
            )}
          </TouchableOpacity>

          {isEditing ? (
            <TextInput
              style={dynamicStyles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.gray[400]}
            />
          ) : (
            <Text style={dynamicStyles.name}>{profile?.name || user?.name || 'User'}</Text>
          )}

          <Text style={dynamicStyles.email}>{profile?.email || user?.email || ''}</Text>
        </View>

        {isEditing && (
          <View style={dynamicStyles.editActions}>
            <Button
              title="Save"
              onPress={handleSave}
              loading={isUpdating}
              size="medium"
            />
            <Button
              title="Cancel"
              onPress={handleCancel}
              variant="outline"
              size="medium"
            />
          </View>
        )}

        <Card style={dynamicStyles.menuCard}>
          <TouchableOpacity 
            style={dynamicStyles.menuItem}
            onPress={() => setShowFeedback(!showFeedback)}
          >
            <Ionicons name="chatbubble-outline" size={24} color={colors.text.primary} />
            <Text style={dynamicStyles.menuText}>Send Feedback</Text>
            <Ionicons 
              name={showFeedback ? "chevron-up" : "chevron-forward"} 
              size={20} 
              color={colors.gray[400]} 
            />
          </TouchableOpacity>

          {showFeedback && (
            <View style={dynamicStyles.feedbackSection}>
              <View style={dynamicStyles.feedbackRatingContainer}>
                <Text style={dynamicStyles.feedbackLabel}>Rating:</Text>
                <View style={dynamicStyles.feedbackRatingStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setFeedbackRating(star)}
                      style={dynamicStyles.feedbackStarButton}
                    >
                      <Ionicons
                        name={star <= feedbackRating ? 'star' : 'star-outline'}
                        size={32}
                        color={star <= feedbackRating ? colors.primary : colors.gray[400]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TextInput
                style={[dynamicStyles.feedbackInput, dynamicStyles.feedbackTextArea]}
                placeholder="Tell us what you think..."
                placeholderTextColor={colors.gray[400]}
                value={feedbackMessage}
                onChangeText={setFeedbackMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <View style={dynamicStyles.feedbackActions}>
                <Button
                  title="Submit Feedback"
                  onPress={handleSubmitFeedback}
                  loading={isSubmitting}
                  size="medium"
                  disabled={!feedbackRating || !feedbackMessage.trim()}
                />
                <Button
                  title="Cancel"
                  onPress={() => {
                    setShowFeedback(false);
                    setFeedbackMessage('');
                    setFeedbackRating(0);
                  }}
                  variant="outline"
                  size="medium"
                />
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={dynamicStyles.menuItem}
            onPress={() => {
              const newMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'auto' : 'light';
              setMode(newMode);
            }}
          >
            <Ionicons 
              name={isDark ? "moon" : "sunny"} 
              size={24} 
              color={colors.text.primary} 
            />
            <Text style={dynamicStyles.menuText}>
              Theme: {mode === 'auto' ? 'Auto' : mode === 'dark' ? 'Dark' : 'Light'}
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={colors.gray[400]} 
            />
          </TouchableOpacity>

          <TouchableOpacity style={dynamicStyles.menuItem} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={colors.error} />
            <Text style={[dynamicStyles.menuText, { color: colors.error }]}>Logout</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  nameInput: {
    ...typography.h3,
    color: colors.text.primary,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingBottom: spacing.xs,
    marginBottom: spacing.sm,
    minWidth: 200,
  },
  name: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.body,
    color: colors.text.secondary,
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  menuCard: {
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    gap: spacing.md,
  },
  menuText: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  feedbackSection: {
    padding: spacing.md,
    backgroundColor: colors.gray[100],
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  feedbackRatingContainer: {
    marginBottom: spacing.md,
  },
  feedbackLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  feedbackRatingStars: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  feedbackStarButton: {
    padding: spacing.xs,
  },
  feedbackInput: {
    ...typography.body,
    color: colors.text.primary,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    minHeight: 44,
  },
  feedbackTextArea: {
    minHeight: 100,
    maxHeight: 150,
  },
  feedbackActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});


