// Logo colors: Gradient from #8E7CC3 to #4AA3FF
const logoColors = {
  primary: '#8E7CC3', // Purple
  secondary: '#4AA3FF', // Blue
};

export const lightColors = {
  primary: logoColors.primary,
  primaryLight: '#A896D4',
  primaryDark: '#6B5A9A',
  secondary: logoColors.secondary,
  secondaryLight: '#6BB5FF',
  secondaryDark: '#2E7FD9',
  accent: '#FF6B6B',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F8F9FA',
    100: '#E9ECEF',
    200: '#DEE2E6',
    300: '#CED4DA',
    400: '#ADB5BD',
    500: '#6C757D',
    600: '#495057',
    700: '#343A40',
    800: '#212529',
    900: '#0D1117',
  },
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#17A2B8',
  text: {
    primary: '#212529',
    secondary: '#6C757D',
    disabled: '#ADB5BD',
  },
};

export const darkColors = {
  primary: logoColors.secondary, // Use blue as primary in dark mode
  primaryLight: '#6BB5FF',
  primaryDark: '#2E7FD9',
  secondary: logoColors.primary, // Use purple as secondary in dark mode
  secondaryLight: '#A896D4',
  secondaryDark: '#6B5A9A',
  accent: '#FF6B6B',
  background: '#0D1117',
  surface: '#161B22',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#0D1117',
    100: '#161B22',
    200: '#21262D',
    300: '#30363D',
    400: '#484F58',
    500: '#6E7681',
    600: '#8B949E',
    700: '#B1BAC4',
    800: '#C9D1D9',
    900: '#F0F6FC',
  },
  success: '#3FB950',
  warning: '#D29922',
  error: '#F85149',
  info: '#58A6FF',
  text: {
    primary: '#F0F6FC',
    secondary: '#B1BAC4',
    disabled: '#6E7681',
  },
};

// Default export for backward compatibility (light theme)
export const colors = lightColors;
