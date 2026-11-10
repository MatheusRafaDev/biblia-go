import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/shared/hooks/useTheme';
import { Card } from '@/src/shared/components/Card';

export default function CharactersTab() {
  const theme = useAppTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Card variant="pastelCoral" style={styles.card}>
          <Ionicons name="people-outline" size={48} color="#D85A38" />
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
            Grafo de Personagens & Genealogias
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
            Em breve (Feature 5): Visualização interativa em grafo de personagens, genealogias e conexões históricas (Theographic Bible Metadata) com zoom e links diretos para versículos.
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
