import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../hooks/useTheme';

export function LoadingState({ message = 'Carregando dados...' }: { message?: string }) {
  const theme = useAppTheme();
  return (
    <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text
        style={[
          styles.message,
          {
            color: theme.colors.textSecondary,
            fontFamily: 'Nunito_600SemiBold',
          },
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

export function ErrorState({
  title = 'Ocorreu um erro',
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  const theme = useAppTheme();
  return (
    <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.cardPastelCoral,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.title,
            { color: theme.colors.text, fontFamily: 'Nunito_700Bold' },
          ]}
        >
          {title}
        </Text>
        {message && (
          <Text
            style={[
              styles.cardMessage,
              { color: theme.colors.textSecondary, fontFamily: 'Nunito_400Regular' },
            ]}
          >
            {message}
          </Text>
        )}
        {onRetry && (
          <TouchableOpacity
            style={[
              styles.retryButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel="Tentar novamente"
          >
            <Text
              style={[
                styles.retryText,
                { color: '#FFFFFF', fontFamily: 'Nunito_700Bold' },
              ]}
            >
              Tentar novamente
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export function EmptyState({
  title = 'Nenhum resultado encontrado',
  message,
}: {
  title?: string;
  message?: string;
}) {
  const theme = useAppTheme();
  return (
    <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
      <Text
        style={[
          styles.title,
          { color: theme.colors.text, fontFamily: 'Nunito_700Bold' },
        ]}
      >
        {title}
      </Text>
      {message && (
        <Text
          style={[
            styles.message,
            { color: theme.colors.textSecondary, fontFamily: 'Nunito_400Regular' },
          ]}
        >
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 12,
  },
  cardMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    minHeight: 44,
    minWidth: 140,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    fontSize: 15,
  },
});
