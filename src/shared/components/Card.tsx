import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '../hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  variant?: 'surface' | 'pastelBlue' | 'pastelYellow' | 'pastelGreen' | 'pastelCoral';
}

export function Card({ children, style, variant = 'surface' }: CardProps) {
  const theme = useAppTheme();

  const getBgColor = () => {
    switch (variant) {
      case 'pastelBlue':
        return theme.colors.cardPastelBlue;
      case 'pastelYellow':
        return theme.colors.cardPastelYellow;
      case 'pastelGreen':
        return theme.colors.cardPastelGreen;
      case 'pastelCoral':
        return theme.colors.cardPastelCoral;
      default:
        return theme.colors.surface;
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: getBgColor(),
          borderColor: theme.colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
});
