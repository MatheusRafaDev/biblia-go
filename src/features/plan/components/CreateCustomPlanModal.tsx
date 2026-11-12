import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/shared/hooks/useTheme';
import { CANONICAL_BOOKS, BibleBook } from '@/src/shared/constants/books';
import {
  generateCustomReadingPlan,
  validatePlanRequest,
  BookChapterCount,
} from '../utils/planGenerator';
import { useCreateCustomPlan } from '../hooks/useReadingPlan';

interface CreateCustomPlanModalProps {
  visible: boolean;
  onClose: () => void;
  onPlanCreated: (planId: string) => void;
}

interface ScopePreset {
  id: string;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  filter: (b: BibleBook) => boolean;
}

const PRESETS: ScopePreset[] = [
  {
    id: 'nt',
    label: 'Novo Testamento',
    description: '27 livros (Mateus ao Apocalipse) • 260 capítulos',
    icon: 'heart-outline',
    filter: (b) => b.testament === 'NT',
  },
  {
    id: 'gospels',
    label: 'Os Quatro Evangelhos',
    description: 'Mateus, Marcos, Lucas e João • 89 capítulos',
    icon: 'flame-outline',
    filter: (b) => [40, 41, 42, 43].includes(b.id),
  },
  {
    id: 'psalms_prov',
    label: 'Salmos & Provérbios',
    description: 'Poesia, oração e sabedoria diária • 181 capítulos',
    icon: 'sparkles-outline',
    filter: (b) => [19, 20].includes(b.id),
  },
  {
    id: 'pentateuch',
    label: 'Pentateuco (Torá)',
    description: 'Gênesis a Deuteronômio • 187 capítulos',
    icon: 'library-outline',
    filter: (b) => b.id >= 1 && b.id <= 5,
  },
  {
    id: 'all',
    label: 'Toda a Bíblia',
    description: 'Antigo e Novo Testamento • 66 livros • 1.189 capítulos',
    icon: 'book-outline',
    filter: () => true,
  },
];

const DURATION_OPTIONS = [15, 30, 60, 90, 180, 365];

export function CreateCustomPlanModal({
  visible,
  onClose,
  onPlanCreated,
}: CreateCustomPlanModalProps) {
  const theme = useAppTheme();
  const createPlanMutation = useCreateCustomPlan();

  const [selectedPresetId, setSelectedPresetId] = useState<string>('nt');
  const [durationDays, setDurationDays] = useState<number>(90);
  const [customTitle, setCustomTitle] = useState<string>('Meu Novo Testamento');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activePreset = PRESETS.find((p) => p.id === selectedPresetId) ?? PRESETS[0];
  const selectedBooks = CANONICAL_BOOKS.filter(activePreset.filter);
  const totalChapters = selectedBooks.reduce((sum, b) => sum + b.chaptersCount, 0);
  const avgChaptersPerDay = Math.ceil(totalChapters / Math.max(1, durationDays));

  const handleSelectPreset = (preset: ScopePreset) => {
    setSelectedPresetId(preset.id);
    setCustomTitle(`Plano: ${preset.label}`);
    setErrorMessage(null);
  };

  const handleCreate = async () => {
    setErrorMessage(null);

    const booksForGenerator: BookChapterCount[] = selectedBooks.map((b) => ({
      bookId: b.name,
      totalChapters: b.chaptersCount,
    }));

    const valError = validatePlanRequest({
      title: customTitle.trim(),
      durationDays,
      books: booksForGenerator,
    });

    if (valError) {
      setErrorMessage(valError);
      return;
    }

    try {
      const generated = generateCustomReadingPlan({
        title: customTitle.trim(),
        durationDays,
        books: booksForGenerator,
      });

      const planId = `custom_${Date.now()}`;

      // Format readings into human-friendly strings like "Mateus 1-3"
      const formattedReadings = generated.days.map((d) => {
        if (d.readings.length === 0) {
          return { day: d.day, passage: 'Leitura Livre / Reflexão' };
        }

        // Group consecutive chapters by book
        const bookGroups = new Map<string, number[]>();
        for (const item of d.readings) {
          const list = bookGroups.get(item.bookId) || [];
          list.push(item.chapter);
          bookGroups.set(item.bookId, list);
        }

        const parts: string[] = [];
        for (const [bName, chaps] of bookGroups.entries()) {
          const sorted = [...chaps].sort((a, b) => a - b);
          if (sorted.length === 1) {
            parts.push(`${bName} ${sorted[0]}`);
          } else {
            const min = sorted[0];
            const max = sorted[sorted.length - 1];
            parts.push(`${bName} ${min}-${max}`);
          }
        }

        return {
          day: d.day,
          passage: parts.join(', '),
        };
      });

      await createPlanMutation.mutateAsync({
        id: planId,
        title: customTitle.trim(),
        description: `${activePreset.label} em ${durationDays} dias (~${avgChaptersPerDay} caps/dia)`,
        totalDays: durationDays,
        readings: formattedReadings,
      });

      onPlanCreated(planId);
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Falha ao gerar o plano de leitura.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' }]}>
            Novo Plano Personalizado 🗓️
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Fechar criação de plano"
          >
            <Ionicons name="close" size={26} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
              Nome do Plano
            </Text>
            <TextInput
              value={customTitle}
              onChangeText={setCustomTitle}
              placeholder="Ex: Novo Testamento em 60 dias"
              placeholderTextColor={theme.colors.textMuted}
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
            />
          </View>

          {/* Scope Selection */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
              Livros & Escopo
            </Text>
            <View style={styles.presetList}>
              {PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <TouchableOpacity
                    key={preset.id}
                    style={[
                      styles.presetCard,
                      {
                        backgroundColor: isSelected ? theme.colors.primaryLight : theme.colors.surface,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    onPress={() => handleSelectPreset(preset)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Ionicons
                      name={preset.icon}
                      size={22}
                      color={isSelected ? theme.colors.primary : theme.colors.textMuted}
                    />
                    <View style={styles.presetTextGroup}>
                      <Text
                        style={[
                          styles.presetLabel,
                          {
                            color: isSelected ? theme.colors.primary : theme.colors.text,
                            fontFamily: 'Nunito_700Bold',
                          },
                        ]}
                      >
                        {preset.label}
                      </Text>
                      <Text
                        style={[
                          styles.presetDesc,
                          { color: theme.colors.textSecondary, fontFamily: 'Nunito_400Regular' },
                        ]}
                      >
                        {preset.description}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Duration Chips */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
              Duração da Leitura
            </Text>
            <View style={styles.durationRow}>
              {DURATION_OPTIONS.map((days) => {
                const isSelected = durationDays === days;
                return (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.durationChip,
                      {
                        backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    onPress={() => setDurationDays(days)}
                    accessibilityRole="button"
                  >
                    <Text
                      style={[
                        styles.durationText,
                        {
                          color: isSelected ? '#FFFFFF' : theme.colors.text,
                          fontFamily: 'Nunito_700Bold',
                        },
                      ]}
                    >
                      {days} dias
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Plan Summary Preview Card */}
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: theme.colors.cardPastelBlue,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Ionicons name="layers-outline" size={20} color={theme.colors.primary} />
                <Text style={[styles.summaryVal, { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' }]}>
                  {totalChapters}
                </Text>
                <Text style={[styles.summarySub, { color: theme.colors.textMuted, fontFamily: 'Nunito_600SemiBold' }]}>
                  Capítulos
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
                <Text style={[styles.summaryVal, { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' }]}>
                  {durationDays}
                </Text>
                <Text style={[styles.summarySub, { color: theme.colors.textMuted, fontFamily: 'Nunito_600SemiBold' }]}>
                  Dias
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Ionicons name="speedometer-outline" size={20} color={theme.colors.primary} />
                <Text style={[styles.summaryVal, { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' }]}>
                  ~{avgChaptersPerDay}
                </Text>
                <Text style={[styles.summarySub, { color: theme.colors.textMuted, fontFamily: 'Nunito_600SemiBold' }]}>
                  Caps / dia
                </Text>
              </View>
            </View>
          </View>

          {errorMessage && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#D85A38" />
              <Text style={[styles.errorText, { fontFamily: 'Nunito_600SemiBold' }]}>
                {errorMessage}
              </Text>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.createBtn, { backgroundColor: theme.colors.primary }]}
            onPress={handleCreate}
            disabled={createPlanMutation.isPending}
            accessibilityRole="button"
            accessibilityLabel="Gerar e iniciar plano de leitura"
          >
            {createPlanMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                <Text style={[styles.createBtnText, { fontFamily: 'Nunito_700Bold' }]}>
                  Gerar e Iniciar Plano
                </Text>
              </>
            )}
          </TouchableOpacity>
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
    fontSize: 20,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 16,
    gap: 18,
    paddingBottom: 40,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
  },
  textInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  presetList: {
    gap: 8,
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  presetTextGroup: {
    flex: 1,
    gap: 2,
  },
  presetLabel: {
    fontSize: 14,
  },
  presetDesc: {
    fontSize: 12,
  },
  durationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  durationText: {
    fontSize: 13,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    gap: 4,
  },
  summaryVal: {
    fontSize: 18,
  },
  summarySub: {
    fontSize: 12,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FDEEE9',
    padding: 12,
    borderRadius: 10,
  },
  errorText: {
    color: '#D85A38',
    fontSize: 13,
    flex: 1,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 14,
    marginTop: 4,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
