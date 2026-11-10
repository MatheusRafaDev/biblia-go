import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/shared/hooks/useTheme';
import { Card } from '@/src/shared/components/Card';

export default function CompareTab() {
  const theme = useAppTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Card variant="pastelBlue" style={styles.card}>
          <Ionicons name="git-compare" size={48} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
            Comparador de Traduções
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
            Em breve (Feature 2): Compare o mesmo versículo em 2 ou 3 traduções lado a lado (ACF, ARA, KJV) com realce das diferenças por algoritmo de diff por palavra.
          </Text>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
