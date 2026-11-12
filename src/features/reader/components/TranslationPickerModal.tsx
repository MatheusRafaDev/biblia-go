import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/shared/hooks/useTheme';
import { KNOWN_TRANSLATIONS } from '@/src/shared/db/migrations';
import { useReaderStore } from '@/src/shared/stores/useReaderStore';
import { useQuery } from '@tanstack/react-query';
import { useBibleRepository } from '@/src/shared/db/client';
import { useTranslationSync } from '../hooks/useBibleReader';

interface TranslationPickerModalProps {
  visible: boolean;
  onClose: () => void;
}

export function TranslationPickerModal({ visible, onClose }: TranslationPickerModalProps) {
  const theme = useAppTheme();
  const repo = useBibleRepository();
  const currentTranslation = useReaderStore((s) => s.currentTranslation);
  const setTranslation = useReaderStore((s) => s.setTranslation);
  const { downloadTranslation, isDownloading, progress } = useTranslationSync();

  const { data: dbTranslations, refetch } = useQuery({
    queryKey: ['db-translations'],
    queryFn: () => repo.getTranslations(),
  });

  const downloadedMap = new Map<string, boolean>();
  if (dbTranslations) {
    for (const t of dbTranslations) {
      downloadedMap.set(t.id, t.is_downloaded === 1);
    }
  }

  const handleSelect = (id: string) => {
    setTranslation(id);
    onClose();
  };

  const handleDownload = async (id: string) => {
    try {
      await downloadTranslation(id);
      await refetch();
    } catch {
      // Handled in sync service
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
            Traduções da Bíblia
          </Text>
          <TouchableOpacity
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Fechar seleção de tradução"
            style={styles.closeButton}
          >
            <Ionicons name="close" size={26} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {isDownloading && (
          <View style={[styles.progressBox, { backgroundColor: theme.colors.cardPastelYellow }]}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={[styles.progressText, { color: theme.colors.text, fontFamily: 'Nunito_600SemiBold' }]}>
              {progress.message || 'Baixando tradução...'}
            </Text>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.list}>
          {KNOWN_TRANSLATIONS.map((t) => {
            const isSelected = t.id === currentTranslation;
            const isDownloaded = downloadedMap.get(t.id) ?? false;

            return (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: isSelected ? theme.colors.cardPastelBlue : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => handleSelect(t.id)}
                accessibilityRole="button"
                accessibilityLabel={`${t.name}, código ${t.id}`}
              >
                <View style={styles.cardInfo}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                      {t.id}
                    </Text>
                    {isDownloaded ? (
                      <View style={[styles.tag, { backgroundColor: theme.colors.cardPastelGreen }]}>
                        <Ionicons name="checkmark-circle" size={14} color="#2E7D32" />
                        <Text style={[styles.tagText, { color: '#2E7D32', fontFamily: 'Nunito_700Bold' }]}>
                          Offline
                        </Text>
                      </View>
                    ) : (
                      <View style={[styles.tag, { backgroundColor: theme.colors.surfaceMuted }]}>
                        <Text style={[styles.tagText, { color: theme.colors.textMuted, fontFamily: 'Nunito_600SemiBold' }]}>
                          Online
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
                    {t.name}
                  </Text>
                </View>

                {!isDownloaded && (
                  <TouchableOpacity
                    style={[styles.downloadIconBtn, { backgroundColor: theme.colors.primaryLight }]}
                    onPress={() => handleDownload(t.id)}
                    disabled={isDownloading}
                    accessibilityRole="button"
                    accessibilityLabel={`Baixar versão ${t.id} para uso offline`}
                  >
                    <Ionicons name="cloud-download-outline" size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
  },
  closeButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    gap: 10,
  },
  progressText: {
    fontSize: 14,
    flex: 1,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 56,
  },
  cardInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 17,
  },
  cardSubtitle: {
    fontSize: 14,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
  },
  downloadIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});

