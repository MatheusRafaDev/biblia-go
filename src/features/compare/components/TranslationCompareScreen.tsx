import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '@/src/shared/hooks/useTheme';
import { BOOKS_BY_ID } from '@/src/shared/constants/books';
import { KNOWN_TRANSLATIONS } from '@/src/shared/db/migrations';
import { computeWordDiff, DiffToken } from '@/src/shared/utils/textDiff';
import { useCompareVerses } from '../hooks/useCompareVerses';
import { ComparePassageSelectorModal } from './ComparePassageSelectorModal';
import { Card } from '@/src/shared/components/Card';
import { formatComparisonClipboard } from '../utils/formatCompareSummary';
import { computeThreeWayDiff } from '../utils/threeWayDiff';

export function TranslationCompareScreen() {
  const theme = useAppTheme();
  const params = useLocalSearchParams<{ bookId?: string; chapter?: string; verse?: string }>();

  const [bookId, setBookId] = useState<number>(params.bookId ? Number(params.bookId) : 1);
  const [chapter, setChapter] = useState<number>(params.chapter ? Number(params.chapter) : 1);
  const [verse, setVerse] = useState<number>(params.verse ? Number(params.verse) : 1);

  // Selected translations to compare (minimum 2, maximum 3)
  const [selectedTranslations, setSelectedTranslations] = useState<string[]>(['ACF11', 'ARA', 'KJV']);
  const [showDiffHighlights, setShowDiffHighlights] = useState(true);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const currentBook = BOOKS_BY_ID.get(bookId) ?? BOOKS_BY_ID.get(1)!;

  const { data: versesData, isLoading } = useCompareVerses(
    bookId,
    chapter,
    verse,
    selectedTranslations
  );

  const threeWayDiff = useMemo(() => {
    if (!versesData || versesData.length < 3) return null;
    return computeThreeWayDiff(
      { id: versesData[0].translationId, text: versesData[0].text },
      { id: versesData[1].translationId, text: versesData[1].text },
      { id: versesData[2].translationId, text: versesData[2].text }
    );
  }, [versesData]);

  const handleCopyComparison = async () => {
    if (!versesData || versesData.length === 0) return;
    const refStr = `${currentBook.name} ${chapter}:${verse}`;
    const text = formatComparisonClipboard(refStr, versesData);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleToggleTranslation = (tId: string) => {
    if (selectedTranslations.includes(tId)) {
      if (selectedTranslations.length > 2) {
        setSelectedTranslations(selectedTranslations.filter((id) => id !== tId));
      }
    } else {
      if (selectedTranslations.length < 3) {
        setSelectedTranslations([...selectedTranslations, tId]);
      } else {
        // Replace last one if already 3
        setSelectedTranslations([selectedTranslations[0], selectedTranslations[1], tId]);
      }
    }
  };

  const handlePrevVerse = () => {
    if (verse > 1) {
      setVerse(verse - 1);
    }
  };

  const handleNextVerse = () => {
    setVerse(verse + 1);
  };

  const baseVerseText = versesData?.[0]?.text ?? '';

  const renderDiffTokens = (tokens: DiffToken[]) => {
    return tokens.map((token, index) => {
      if (token.type === 'added' && showDiffHighlights) {
        return (
          <Text
            key={index}
            style={[
              styles.diffAdded,
              {
                backgroundColor: theme.isDark ? '#4A3D22' : theme.colors.cardPastelYellow,
                color: theme.colors.text,
                fontFamily: 'Nunito_700Bold',
              },
            ]}
          >
            {token.value}{' '}
          </Text>
        );
      }
      return (
        <Text
          key={index}
          style={[styles.diffEqual, { color: theme.colors.text, fontFamily: 'Nunito_400Regular' }]}
        >
          {token.value}{' '}
        </Text>
      );
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Bar */}
      <View style={[styles.headerBar, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.passagePill, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={() => setSelectorVisible(true)}
          accessibilityRole="button"
          accessibilityLabel={`Passagem atual: ${currentBook.name} ${chapter}:${verse}. Toque para alterar`}
        >
          <Text style={[styles.passageText, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
            {currentBook.name} {chapter}:{verse}
          </Text>
          <Ionicons name="chevron-down" size={16} color={theme.colors.primary} />
        </TouchableOpacity>

        {/* Stepper buttons & Copy action */}
        <View style={styles.stepperGroup}>
          <TouchableOpacity
            style={[styles.stepperBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={handlePrevVerse}
            disabled={verse <= 1}
            accessibilityRole="button"
            accessibilityLabel="Versículo anterior"
          >
            <Ionicons name="chevron-back" size={20} color={verse <= 1 ? theme.colors.textMuted : theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.stepperBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={handleNextVerse}
            accessibilityRole="button"
            accessibilityLabel="Próximo versículo"
          >
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.stepperBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={handleCopyComparison}
            accessibilityRole="button"
            accessibilityLabel="Copiar comparação de versões"
          >
            <Ionicons name={copied ? 'checkmark-circle' : 'copy-outline'} size={18} color={copied ? '#2E7D32' : theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Copy Feedback */}
      {copied && (
        <View style={[styles.copyToast, { backgroundColor: theme.colors.cardPastelGreen, borderColor: '#A7F3D0' }]}>
          <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
          <Text style={[styles.copyToastText, { color: '#1B5E20', fontFamily: 'Nunito_700Bold' }]}>
            Comparação copiada para a área de transferência!
          </Text>
        </View>
      )}

      {/* Translations selector chips */}
      <View style={styles.chipsContainer}>
        <Text style={[styles.chipsLabel, { color: theme.colors.textMuted, fontFamily: 'Nunito_600SemiBold' }]}>
          Comparar (2 ou 3 versões):
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {KNOWN_TRANSLATIONS.map((t) => {
            const isSelected = selectedTranslations.includes(t.id);
            const isBase = selectedTranslations[0] === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => handleToggleTranslation(t.id)}
                accessibilityRole="button"
                accessibilityLabel={`Tradução ${t.id}`}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isSelected ? '#FFFFFF' : theme.colors.text,
                      fontFamily: isSelected ? 'Nunito_700Bold' : 'Nunito_600SemiBold',
                    },
                  ]}
                >
                  {t.id} {isBase ? '(Base)' : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Highlights toggle pill */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[
            styles.togglePill,
            { backgroundColor: showDiffHighlights ? theme.colors.primaryLight : theme.colors.surfaceMuted },
          ]}
          onPress={() => setShowDiffHighlights(!showDiffHighlights)}
          accessibilityRole="button"
          accessibilityLabel="Alternar destaque de palavras diferentes"
        >
          <Ionicons
            name={showDiffHighlights ? 'color-wand' : 'color-wand-outline'}
            size={16}
            color={showDiffHighlights ? theme.colors.primary : theme.colors.textMuted}
          />
          <Text
            style={[
              styles.toggleText,
              {
                color: showDiffHighlights ? theme.colors.primary : theme.colors.textMuted,
                fontFamily: 'Nunito_700Bold',
              },
            ]}
          >
            {showDiffHighlights ? 'Destaque de diferenças ativo' : 'Destaque desativado'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary, fontFamily: 'Nunito_600SemiBold' }]}>
            Comparando traduções...
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.cardsContainer} showsVerticalScrollIndicator={false}>
          {versesData?.map((item, idx) => {
            const isBase = idx === 0;
            const diffResult = !isBase && baseVerseText ? computeWordDiff(baseVerseText, item.text) : null;
            const differentWordsCount = diffResult
              ? diffResult.compareTokens.filter((t) => t.type === 'added').length
              : 0;

            return (
              <Card
                key={item.translationId}
                variant={isBase ? 'pastelBlue' : 'surface'}
                style={styles.verseCard}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.versionBadge}>
                    <Text style={[styles.versionName, { color: theme.colors.primary, fontFamily: 'Nunito_800ExtraBold' }]}>
                      {item.translationId}
                    </Text>
                    {isBase && (
                      <View style={[styles.baseTag, { backgroundColor: theme.colors.primary }]}>
                        <Text style={[styles.baseTagText, { color: '#FFFFFF', fontFamily: 'Nunito_700Bold' }]}>
                          Referência
                        </Text>
                      </View>
                    )}
                  </View>

                  {!isBase && showDiffHighlights && (
                    <Text style={[styles.diffCount, { color: theme.colors.textMuted, fontFamily: 'Nunito_600SemiBold' }]}>
                      {differentWordsCount === 0
                        ? 'Idêntico à base'
                        : `${differentWordsCount} palavra${differentWordsCount > 1 ? 's' : ''} diferente${differentWordsCount > 1 ? 's' : ''}`}
                    </Text>
                  )}
                </View>

                {/* Verse Text with Diff */}
                <Text style={styles.verseBody}>
                  {isBase || !diffResult
                    ? item.text
                    : renderDiffTokens(diffResult.compareTokens)}
                </Text>
              </Card>
            );
          })}

          {/* Three-Way Alignment & Similarity Analysis */}
          {threeWayDiff && (
            <Card variant="pastelYellow" style={styles.analysisCard}>
              <TouchableOpacity
                style={styles.analysisHeader}
                onPress={() => setShowAnalysis((prev) => !prev)}
                accessibilityRole="button"
                accessibilityLabel="Alternar análise léxica das 3 versões"
              >
                <View style={styles.analysisTitleRow}>
                  <Ionicons name="analytics" size={18} color="#B78103" />
                  <Text style={[styles.analysisTitle, { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' }]}>
                    Concordância & Similaridade (3 Versões)
                  </Text>
                </View>
                <Ionicons
                  name={showAnalysis ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={theme.colors.textMuted}
                />
              </TouchableOpacity>

              {showAnalysis && (
                <View style={styles.analysisBody}>
                  <Text style={[styles.analysisSubtitle, { color: theme.colors.textSecondary, fontFamily: 'Nunito_700Bold' }]}>
                    Índice de Similaridade de Vocabulário
                  </Text>
                  <View style={styles.similarityRow}>
                    <View style={[styles.similarityPill, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                      <Text style={[styles.similarityText, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                        {versesData?.[0]?.translationId} ↔ {versesData?.[1]?.translationId}: {Math.round(threeWayDiff.similarityScore.firstToSecond * 100)}%
                      </Text>
                    </View>
                    <View style={[styles.similarityPill, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                      <Text style={[styles.similarityText, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                        {versesData?.[0]?.translationId} ↔ {versesData?.[2]?.translationId}: {Math.round(threeWayDiff.similarityScore.firstToThird * 100)}%
                      </Text>
                    </View>
                    <View style={[styles.similarityPill, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                      <Text style={[styles.similarityText, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                        {versesData?.[1]?.translationId} ↔ {versesData?.[2]?.translationId}: {Math.round(threeWayDiff.similarityScore.secondToThird * 100)}%
                      </Text>
                    </View>
                  </View>

                  {threeWayDiff.commonTokens.length > 0 && (
                    <View style={styles.tokensSection}>
                      <Text style={[styles.tokensLabel, { color: theme.colors.textMuted, fontFamily: 'Nunito_600SemiBold' }]}>
                        Vocabulário comum às 3 traduções ({threeWayDiff.commonTokens.length} termos):
                      </Text>
                      <View style={styles.tokenChipsWrap}>
                        {threeWayDiff.commonTokens.slice(0, 15).map((tok, i) => (
                          <View key={i} style={[styles.tokenChip, { backgroundColor: theme.colors.cardPastelGreen }]}>
                            <Text style={[styles.tokenChipText, { color: '#1B5E20', fontFamily: 'Nunito_600SemiBold' }]}>
                              {tok}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}
            </Card>
          )}
        </ScrollView>
      )}

      {/* Passage Selector Modal */}
      <ComparePassageSelectorModal
        visible={selectorVisible}
        initialBookId={bookId}
        initialChapter={chapter}
        initialVerse={verse}
        onClose={() => setSelectorVisible(false)}
        onSelect={(b, c, v) => {
          setBookId(b);
          setChapter(c);
          setVerse(v);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  passagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    minHeight: 44,
    borderRadius: 22,
    borderWidth: 1,
  },
  passageText: {
    fontSize: 16,
  },
  stepperGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyToast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  copyToastText: {
    fontSize: 13,
  },
  chipsContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  chipsLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  chipsScroll: {
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    minHeight: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 13,
  },
  toggleRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  togglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    minHeight: 44,
    borderRadius: 22,
  },
  toggleText: {
    fontSize: 13,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 15,
    marginTop: 12,
  },
  cardsContainer: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  verseCard: {
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  versionName: {
    fontSize: 18,
  },
  baseTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  baseTagText: {
    fontSize: 11,
  },
  diffCount: {
    fontSize: 13,
  },
  verseBody: {
    fontSize: 17,
    lineHeight: 28,
  },
  diffAdded: {
    borderRadius: 4,
    paddingHorizontal: 2,
  },
  diffEqual: {},
  analysisCard: {
    marginTop: 10,
    padding: 14,
    borderRadius: 14,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  analysisTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  analysisTitle: {
    fontSize: 14,
  },
  analysisBody: {
    marginTop: 12,
    gap: 10,
  },
  analysisSubtitle: {
    fontSize: 12,
  },
  similarityRow: {
    flexDirection: 'column',
    gap: 6,
  },
  similarityPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  similarityText: {
    fontSize: 12,
  },
  tokensSection: {
    gap: 6,
    marginTop: 4,
  },
  tokensLabel: {
    fontSize: 12,
  },
  tokenChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tokenChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tokenChipText: {
    fontSize: 11,
  },
});

