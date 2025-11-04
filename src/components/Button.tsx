import React from 'react';
import styled from 'styled-components/native';
import { colors, spacing, borderRadius } from '../theme';
import { ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

const StyledButton = styled.TouchableOpacity<{ variant: string; disabled: boolean; size: string }>`
  background-color: ${(props) => {
    if (props.disabled) return colors.gray[300];
    if (props.variant === 'primary') return colors.primary;
    if (props.variant === 'secondary') return colors.secondary;
    return 'transparent';
  }};
  border: ${(props) =>
    props.variant === 'outline' ? `2px solid ${colors.primary}` : 'none'};
  padding: ${(props) => {
    if (props.size === 'small') return `${spacing.sm}px ${spacing.md}px`;
    if (props.size === 'large') return `${spacing.md}px ${spacing.xl}px`;
    return `${spacing.md}px ${spacing.lg}px`;
  }};
  border-radius: ${borderRadius.md}px;
  align-items: center;
  justify-content: center;
  min-height: 48px;
`;

const ButtonText = styled.Text<{ variant: string; disabled: boolean }>`
  color: ${(props) => {
    if (props.disabled) return colors.gray[500];
    if (props.variant === 'outline') return colors.primary;
    return colors.white;
  }};
  font-size: 16px;
  font-weight: 600;
`;

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
}) => {
  return (
    <StyledButton
      onPress={onPress}
      disabled={disabled || loading}
      variant={variant}
      size={size}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.white} />
      ) : (
        <ButtonText variant={variant} disabled={disabled}>
          {title}
        </ButtonText>
      )}
    </StyledButton>
  );
};



