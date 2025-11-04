import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { colors, spacing, typography } from '../../../theme';
import { loginSchema } from '../../../utils/validations';
import { useAuth } from '../../../hooks/use-auth';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { login, isLoginLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    try {
      loginSchema.parse({ email, password });
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
    if (!validate()) {
      console.log('❌ Validation failed');
      return;
    }

    console.log('🚀 Login Form Submitted:', { email });
    try {
      await login({ email, password });
      console.log('✅ Login successful, navigating to Tabs');
      navigation.replace('Tabs');
    } catch (error: any) {
      console.error('❌ Login Error in component:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue your journey</Text>
      </View>

      <View style={styles.form}>
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

        <Button
          title="Continue"
          onPress={onSubmit}
          loading={isLoginLoading}
          size="large"
        />

        <Text style={styles.divider}>or</Text>

        <Button
          title="Continue with Google"
          onPress={() => {/* Handle Google login */}}
          variant="outline"
          size="large"
        />

        <Button
          title="Continue with Apple"
          onPress={() => {/* Handle Apple login */}}
          variant="outline"
          size="large"
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('Signup')}
          >
            Sign Up
          </Text>
        </View>

        <Text
          style={styles.forgotPassword}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          Forgot Password?
        </Text>
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
  divider: {
    textAlign: 'center',
    color: colors.text.secondary,
    marginVertical: spacing.md,
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
  forgotPassword: {
    ...typography.bodySmall,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
