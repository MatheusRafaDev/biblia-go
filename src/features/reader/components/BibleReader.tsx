import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, useThemeStore } from '@/src/shared/hooks/useTheme';
import { useReaderStore } from '@/src/shared/stores/useReaderStore';
import {
  useChapterVerses,
  useChapterFavorites,
  useCurrentBook,
} from '../hooks/useBibleReader';
import { VerseItem } from './VerseItem';
import { BookSelectorModal } from './BookSelectorModal';
import { SearchModal } from './SearchModal';
import { TranslationPickerModal } from './TranslationPickerModal';
import { FavoritesModal } from './FavoritesModal';
import { CloudSyncModal } from './CloudSyncModal';
import { AiAssistantModal } from './AiAssistantModal';
import { DailyVerseModal } from '@/src/features/daily/components/DailyVerseModal';
import { ReaderOptionsModal } from './ReaderOptionsModal';
import { AudioReaderBar } from './AudioReaderBar';
import { TranslationBanner } from './TranslationBanner';
import { LoadingState, EmptyState } from '@/src/shared/components/FeedbackStates';
import { estimateReadingTimeMinutes, formatReadingTime } from '../utils/readingTime';
import { formatChapterForShare } from '../utils/copyChapter';

export function BibleReader() {
  const theme = useAppTheme();
  const themePreference = useThemeStore((s) => s.preference);
  const setThemePreference = useThemeStore((s) => s.setPreference);

  const handleToggleTheme = () => {
    setThemePreference(themePreference === 'dark' ? 'light' : 'dark');
  };

  const currentBook = useCurrentBook();
  const currentChapter = useReaderStore((s) => s.currentChapter);
  const setChapter = useReaderStore((s) => s.setChapter);
  const targetVerse = useReaderStore((s) => s.targetVerse);
  const clearTargetVerse = useReaderStore((s) => s.clearTargetVerse);

  const [bookModalVisible, setBookModalVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [translationModalVisible, setTranslationModalVisible] = useState(false);
  const [favoritesModalVisible, setFavoritesModalVisible] = useState(false);
  const [cloudSyncModalVisible, setCloudSyncModalVisible] = useState(false);
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [dailyVerseModalVisible, setDailyVerseModalVisible] = useState(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [activeAudioVerse, setActiveAudioVerse] = useState<number | null>(null);

  const currentTranslation = useReaderStore((s) => s.currentTranslation);

  const { data: verses, isLoading } = useChapterVerses();
  const { data: favorites } = useChapterFavorites();

  const scrollViewRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

  const favoritesMap = new Map<number, { color: string | null; note: string | null }>();
  if (favorites) {
    for (const f of favorites) {
      favoritesMap.set(f.verse, { color: f.highlight_color, note: f.note });
    }
  }

  // Clear target verse after 3.5 seconds
  useEffect(() => {
    if (targetVerse) {
      const timer = setTimeout(() => {
        clearTargetVerse();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [targetVerse, clearTargetVerse]);

  // Scroll to top when chapter changes
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [currentBook.id, currentChapter]);

  const handlePrevChapter = () => {
    if (currentChapter > 1) {
      setChapter(currentChapter - 1);
    }
  };

  const handleNextChapter = () => {
    if (currentChapter < currentBook.chaptersCount) {
      setChapter(currentChapter + 1);
    }
  };

  const handleCopyChapter = async () => {
    if (!verses || verses.length === 0) return;
    const formatted = formatChapterForShare({
      bookName: currentBook.name,
      chapter: currentChapter,
      translationId: currentTranslation,
      verses,
    });
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(formatted);
    }
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  const readingTimeText =
    verses && verses.length > 0
      ? formatReadingTime(estimateReadingTimeMinutes(verses))
      : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Top Header Bar */}
      <View style={[styles.headerBar, { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
        <View style={styles.selectorsGroup}>
          {/* Book & Chapter Selector Pill */}
          <TouchableOpacity
            style={[styles.selectorPill, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => setBookModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={`Selecionar livro e capítulo. Atual: ${currentBook.name} capítulo ${currentChapter}`}
          >
            <Ionicons name="book" size={15} color={theme.colors.gold} />
            <Text style={[styles.selectorTitle, { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' }]}>
              {currentBook.name} {currentChapter}
            </Text>
            <Ionicons name="chevron-down" size={13} color={theme.colors.gold} />
          </TouchableOpacity>

          {/* Translation Picker Pill */}
          <TouchableOpacity
            style={[styles.translationPill, { backgroundColor: theme.colors.cardPastelYellow, borderColor: theme.colors.border }]}
            onPress={() => setTranslationModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={`Tradução atual: ${currentTranslation}. Toque para alterar`}
          >
            <Text style={[styles.translationText, { color: theme.colors.gold, fontFamily: 'Nunito_800ExtraBold' }]}>
              {currentTranslation}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Icons */}
        <View style={styles.headerActions}>
          {/* 🎧 Audio Player Quick Toggle */}
          <TouchableOpacity
            style={[
              styles.iconButton,
              audioPlaying && { backgroundColor: theme.colors.cardPastelYellow },
            ]}
            onPress={() => setAudioPlaying((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel={audioPlaying ? 'Ocultar áudio' : 'Ouvir capítulo com narração em áudio'}
          >
            <Ionicons
              name={audioPlaying ? 'volume-high' : 'volume-medium-outline'}
              size={21}
              color={audioPlaying ? theme.colors.gold : theme.colors.text}
            />
          </TouchableOpacity>

          {/* ☀️/🌙 Instant Light/Dark Theme Switch */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleToggleTheme}
            accessibilityRole="button"
            accessibilityLabel={theme.isDark ? 'Ativar modo Papel Bíblico Claro' : 'Ativar modo Noturno'}
          >
            <Ionicons
              name={theme.isDark ? 'sunny' : 'moon'}
              size={19}
              color={theme.isDark ? '#F59E0B' : theme.colors.text}
            />
          </TouchableOpacity>

          {/* 🔍 Search */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setSearchModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Buscar versículos"
          >
            <Ionicons name="search" size={20} color={theme.colors.text} />
          </TouchableOpacity>

          {/* 🔖 Bookmarks & Notes */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setFavoritesModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Ver versículos destacados e favoritos"
          >
            <Ionicons name="bookmark-outline" size={20} color={theme.colors.text} />
          </TouchableOpacity>

          {/* ⚙️ More Reader Options */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setOptionsModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Mais opções de leitura e configurações"
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Copy Feedback Toast */}
      {copyFeedback && (
        <View style={[styles.toastBanner, { backgroundColor: theme.colors.cardPastelGreen, borderColor: '#A7F3D0' }]}>
          <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
          <Text style={[styles.toastText, { color: '#1B5E20', fontFamily: 'Nunito_700Bold' }]}>
            Capítulo {currentBook.name} {currentChapter} copiado com referências!
          </Text>
        </View>
      )}

      {/* Offline Download Banner */}
      <TranslationBanner />

      {/* Chapter Verses Content */}
      {isLoading ? (
        <LoadingState message={`Carregando ${currentBook.name} ${currentChapter}...`} />
      ) : verses && verses.length > 0 ? (
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.versesContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Authentic Biblical Chapter Header */}
          <View style={styles.chapterHeaderBadge}>
            <Text style={[styles.testamentLabel, { color: theme.colors.gold, fontFamily: 'Nunito_700Bold' }]}>
              {currentBook.testament === 'OT' ? 'ANTIGO TESTAMENTO' : 'NOVO TESTAMENTO'}
            </Text>
            <Text style={[styles.chapterTitle, { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' }]}>
              {currentBook.name.toUpperCase()}
            </Text>
            <Text style={[styles.chapterSubtitle, { color: theme.colors.gold, fontFamily: 'Nunito_700Bold' }]}>
              Capítulo {currentChapter}
            </Text>

            {/* Sacred Ornamental Divider */}
            <View style={styles.sacredOrnamentRow}>
              <View style={[styles.ornamentLine, { backgroundColor: theme.colors.border }]} />
              <Text style={[styles.ornamentSymbol, { color: theme.colors.gold }]}>✦</Text>
              <View style={[styles.ornamentLine, { backgroundColor: theme.colors.border }]} />
            </View>

            {/* Reading Details Pill */}
            <View style={[styles.readingTimePill, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
              <Ionicons name="book-outline" size={13} color={theme.colors.textMuted} />
              <Text style={[styles.readingTimeText, { color: theme.colors.textMuted, fontFamily: 'Nunito_600SemiBold' }]}>
                {verses.length} versículos {readingTimeText ? `• ${readingTimeText}` : ''}
              </Text>
            </View>
          </View>

          {verses.map((v) => {
            const favInfo = favoritesMap.get(v.verse);
            return (
              <VerseItem
                key={v.verse}
                verseNumber={v.verse}
                text={v.text}
                isFavorited={favoritesMap.has(v.verse)}
                highlightColor={favInfo?.color}
                note={favInfo?.note}
                isTarget={targetVerse === v.verse || activeAudioVerse === v.verse}
              />
            );
          })}

          {/* Chapter Navigation Footer */}
          <View style={styles.footerNav}>
            <TouchableOpacity
              style={[
                styles.navButton,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                currentChapter <= 1 && styles.navButtonDisabled,
              ]}
              onPress={handlePrevChapter}
              disabled={currentChapter <= 1}
              accessibilityRole="button"
              accessibilityLabel="Capítulo anterior"
            >
              <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
              <Text style={[styles.navButtonText, { color: theme.colors.text, fontFamily: 'Nunito_600SemiBold' }]}>
                Anterior
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navButton,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                currentChapter >= currentBook.chaptersCount && styles.navButtonDisabled,
              ]}
              onPress={handleNextChapter}
              disabled={currentChapter >= currentBook.chaptersCount}
              accessibilityRole="button"
              accessibilityLabel="Próximo capítulo"
            >
              <Text style={[styles.navButtonText, { color: theme.colors.text, fontFamily: 'Nunito_600SemiBold' }]}>
                Próximo
              </Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <EmptyState
          title={`Capítulo ${currentChapter} indisponível`}
          message="Toque no botão de download acima para baixar todos os livros para leitura offline."
        />
      )}

      {/* Modals */}
      <BookSelectorModal
        visible={bookModalVisible}
        onClose={() => setBookModalVisible(false)}
      />

      <SearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
      />

      <TranslationPickerModal
        visible={translationModalVisible}
        onClose={() => setTranslationModalVisible(false)}
      />

      <FavoritesModal
        visible={favoritesModalVisible}
        onClose={() => setFavoritesModalVisible(false)}
      />

      <CloudSyncModal
        visible={cloudSyncModalVisible}
        onClose={() => setCloudSyncModalVisible(false)}
      />

      <AiAssistantModal
        visible={aiModalVisible}
        onClose={() => setAiModalVisible(false)}
      />

      <DailyVerseModal
        visible={dailyVerseModalVisible}
        onClose={() => setDailyVerseModalVisible(false)}
      />

      <ReaderOptionsModal
        visible={optionsModalVisible}
        onClose={() => setOptionsModalVisible(false)}
        onOpenAi={() => setAiModalVisible(true)}
        onOpenCloud={() => setCloudSyncModalVisible(true)}
        onCopyChapter={handleCopyChapter}
        onStartAudio={() => setAudioPlaying(true)}
      />

      {/* Floating Audio Chapter Player */}
      {audioPlaying && verses && verses.length > 0 && (
        <AudioReaderBar
          verses={verses}
          bookName={currentBook.name}
          chapter={currentChapter}
          onActiveVerseChange={(vNum) => setActiveAudioVerse(vNum)}
          onClose={() => {
            setAudioPlaying(false);
            setActiveAudioVerse(null);
          }}
        />
      )}
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
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  selectorsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  selectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    minHeight: 40,
    borderRadius: 20,
    borderWidth: 1,
    flexShrink: 1,
  },
  selectorTitle: {
    fontSize: 15,
  },
  translationPill: {
    paddingHorizontal: 10,
    minHeight: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  translationText: {
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  toastText: {
    fontSize: 13,
  },
  versesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  chapterHeaderBadge: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
    gap: 4,
  },
  testamentLabel: {
    fontSize: 11,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  chapterTitle: {
    fontSize: 28,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  chapterSubtitle: {
    fontSize: 15,
  },
  sacredOrnamentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 6,
    width: 140,
  },
  ornamentLine: {
    flex: 1,
    height: 1,
  },
  ornamentSymbol: {
    fontSize: 14,
  },
  readingTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  readingTimeText: {
    fontSize: 12,
  },
  footerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 16,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  navButtonDisabled: {
    opacity: 0.35,
  },
  navButtonText: {
    fontSize: 15,
  },
});
