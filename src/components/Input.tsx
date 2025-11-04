import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import { colors, spacing, borderRadius } from '../theme';
import { TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Container = styled.View`
  margin-bottom: ${spacing.md}px;
`;

const Label = styled.Text`
  color: ${colors.text.primary};
  font-size: 14px;
  font-weight: 500;
  margin-bottom: ${spacing.xs}px;
`;

const InputContainer = styled.View<{ hasError: boolean }>`
  flex-direction: row;
  align-items: center;
  border: 1px solid ${(props) => (props.hasError ? colors.error : colors.gray[300])};
  border-radius: ${borderRadius.md}px;
  padding: ${spacing.md}px;
  background-color: ${colors.white};
`;

const StyledInput = styled.TextInput`
  flex: 1;
  font-size: 16px;
  color: ${colors.text.primary};
`;

const ErrorText = styled.Text`
  color: ${colors.error};
  font-size: 12px;
  margin-top: ${spacing.xs}px;
`;

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  ...props
}) => {
  return (
    <Container>
      {label && <Label>{label}</Label>}
      <InputContainer hasError={!!error}>
        {icon && <View style={{ marginRight: spacing.xs }}>{icon}</View>}
        <StyledInput
          placeholderTextColor={colors.gray[400]}
          {...props}
        />
      </InputContainer>
      {error && <ErrorText>{error}</ErrorText>}
    </Container>
  );
};


