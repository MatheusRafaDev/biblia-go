import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/shared/hooks/useTheme';
import { useTranslationStatus, useTranslationSync } from '../hooks/useBibleReader';
import { useReaderStore } from '@/src/shared/stores/useReaderStore';

export function TranslationBanner() {
  const theme = useAppTheme();
  const currentTranslation = useReaderStore((s) => s.currentTranslation);
  const { data: isDownloaded, isLoading: isCheckingStatus } = useTranslationStatus(currentTranslation);
  const { downloadTranslation, isDownloading, progress } = useTranslationSync();

  if (isCheckingStatus || isDownloaded) {
    return null;
  }

  const handleDownload = () => {
    downloadTranslation(currentTranslation);
  };

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: theme.colors.cardPastelYellow,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.contentRow}>
        <Ionicons name="cloud-download-outline" size={24} color={theme.colors.primary} style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
            Disponível Offline
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
            {isDownloading
              ? progress.message || 'Baixando texto bíblico...'
              : 'Baixe todos os 66 livros para ler e buscar sem conexão com a internet.'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.downloadButton,
          { backgroundColor: theme.colors.primary },
          isDownloading && styles.downloadButtonDisabled,
        ]}
        onPress={handleDownload}
        disabled={isDownloading}
        accessibilityRole="button"
        accessibilityLabel="Baixar Bíblia Completa Offline"
      >
        {isDownloading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={[styles.buttonText, { color: '#FFFFFF', fontFamily: 'Nunito_700Bold' }]}>
            Baixar Bíblia Completa (3.5MB)
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  downloadButton: {
    minHeight: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  downloadButtonDisabled: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 14,
  },
});
