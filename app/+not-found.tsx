import React from 'react';
import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { useAppTheme } from '@/src/shared/hooks/useTheme';

export default function NotFoundScreen() {
  const theme = useAppTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
          Esta tela não existe.
        </Text>

        <Link href="/" style={styles.link}>
          <Text style={[styles.linkText, { color: theme.colors.primary, fontFamily: 'Nunito_700Bold' }]}>
            Voltar para o início
          </Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
    minHeight: 44,
  },
  linkText: {
    fontSize: 16,
  },
});
