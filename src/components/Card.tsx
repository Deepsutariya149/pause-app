import React from 'react';
import styled from 'styled-components/native';
import { colors, spacing, borderRadius } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: any;
}

const StyledCard = styled.View`
  background-color: ${colors.white};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.md}px;
  margin-bottom: ${spacing.md}px;
  shadow-color: ${colors.black};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

export const Card: React.FC<CardProps> = ({ children, style }) => {
  return <StyledCard style={style}>{children}</StyledCard>;
};


