import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { colors, spacing, typography } from '../../../theme';
import { signupSchema } from '../../../utils/validations';
import { useAuth } from '../../../hooks/use-auth';
import { Ionicons } from '@expo/vector-icons';

export default function SignupScreen() {
  const navigation = useNavigation<any>();
  const { signup, isSignupLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});

  const validate = () => {
    try {
      signupSchema.parse({ name, email, password, confirmPassword });
      setErrors({});
      return true;
    } catch (error: any) {
      const newErrors: any = {};
      error.errors?.forEach((err: any) => {
        if (err.path) {
          newErrors[err.path[0]] = err.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
  };

  const onSubmit = async () => {
    if (!validate()) return;

    try {
      await signup({ name, email, password });
      navigation.replace('Tabs');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start your wellness journey today</Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Name"
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
          icon={<Ionicons name="person-outline" size={20} color={colors.gray[400]} />}
          error={errors.name}
        />

        <Input
          label="Email address"
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          icon={<Ionicons name="mail-outline" size={20} color={colors.gray[400]} />}
          error={errors.email}
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          icon={<Ionicons name="lock-closed-outline" size={20} color={colors.gray[400]} />}
          error={errors.password}
        />

        <Input
          label="Confirm Password"
          placeholder="Confirm your password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          icon={<Ionicons name="lock-closed-outline" size={20} color={colors.gray[400]} />}
          error={errors.confirmPassword}
        />

        <Button
          title="Create Account"
          onPress={onSubmit}
          loading={isSignupLoading}
          size="large"
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('Login')}
          >
            Sign In
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  form: {
    marginTop: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  link: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});
