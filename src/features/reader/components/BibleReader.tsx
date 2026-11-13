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
import { useAppTheme } from '@/src/shared/hooks/useTheme';
import { useReaderStore } from '@/src/shared/stores/useReaderStore';
import { CANONICAL_BOOKS } from '@/src/shared/constants/books';
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
import { ReaderOptionsModal } from './ReaderOptionsModal';
import { AudioReaderBar } from './AudioReaderBar';
import { LoadingState, EmptyState } from '@/src/shared/components/FeedbackStates';
import { formatChapterForShare } from '../utils/copyChapter';

export function BibleReader() {
  const theme = useAppTheme();

  const currentBook = useCurrentBook();
  const currentChapter = useReaderStore((s) => s.currentChapter);
  const setChapter = useReaderStore((s) => s.setChapter);
  const goToPassage = useReaderStore((s) => s.goToPassage);
  const targetVerse = useReaderStore((s) => s.targetVerse);
  const clearTargetVerse = useReaderStore((s) => s.clearTargetVerse);

  const [bookModalVisible, setBookModalVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [translationModalVisible, setTranslationModalVisible] = useState(false);
  const [favoritesModalVisible, setFavoritesModalVisible] = useState(false);
  const [cloudSyncModalVisible, setCloudSyncModalVisible] = useState(false);
  const [aiModalVisible, setAiModalVisible] = useState(false);
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

  // Clear target verse highlight after 3.5s
  useEffect(() => {
    if (targetVerse) {
      const timer = setTimeout(() => {
        clearTargetVerse();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [targetVerse, clearTargetVerse]);

  // Scroll to top when book or chapter changes
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [currentBook.id, currentChapter]);

  // Seamless chapter navigation (crosses book boundaries)
  const handlePrevChapter = () => {
    if (currentChapter > 1) {
      setChapter(currentChapter - 1);
    } else if (currentBook.id > 1) {
      const prevBook = CANONICAL_BOOKS.find((b) => b.id === currentBook.id - 1);
      if (prevBook) {
        goToPassage(prevBook.id, prevBook.chaptersCount);
      }
    }
  };

  const handleNextChapter = () => {
    if (currentChapter < currentBook.chaptersCount) {
      setChapter(currentChapter + 1);
    } else if (currentBook.id < 66) {
      const nextBook = CANONICAL_BOOKS.find((b) => b.id === currentBook.id + 1);
      if (nextBook) {
        goToPassage(nextBook.id, 1);
      }
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

  const isFirstChapter = currentBook.id === 1 && currentChapter === 1;
  const isLastChapter = currentBook.id === 66 && currentChapter === currentBook.chaptersCount;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Top Header Bar - Quiet, Dignified & Minimal */}
      <View
        style={[
          styles.headerBar,
          {
            borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <View style={styles.selectorsGroup}>
          {/* Book & Chapter Selector Pill */}
          <TouchableOpacity
            style={[
              styles.selectorPill,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => setBookModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={`Selecionar livro e capítulo. Atual: ${currentBook.name} capítulo ${currentChapter}`}
          >
            <Text style={[styles.selectorTitle, { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' }]}>
              {currentBook.name} {currentChapter}
            </Text>
            <Ionicons name="chevron-down" size={13} color={theme.colors.gold} />
          </TouchableOpacity>

          {/* Translation Picker Pill */}
          <TouchableOpacity
            style={[
              styles.translationPill,
              {
                backgroundColor: theme.colors.surfaceMuted,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => setTranslationModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={`Tradução atual: ${currentTranslation}. Toque para alterar`}
          >
            <Text style={[styles.translationText, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
              {currentTranslation}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quiet, Essential Action Icons */}
        <View style={styles.headerActions}>
          {/* 🎧 Audio Narration */}
          <TouchableOpacity
            style={[
              styles.iconButton,
              audioPlaying && { backgroundColor: theme.colors.cardPastelYellow },
            ]}
            onPress={() => setAudioPlaying((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel={audioPlaying ? 'Ocultar áudio' : 'Ouvir narração em áudio'}
          >
            <Ionicons
              name={audioPlaying ? 'volume-high' : 'volume-medium-outline'}
              size={21}
              color={audioPlaying ? theme.colors.gold : theme.colors.text}
            />
          </TouchableOpacity>

          {/* 🔍 Search */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setSearchModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Buscar na Bíblia"
          >
            <Ionicons name="search-outline" size={20} color={theme.colors.text} />
          </TouchableOpacity>

          {/* 🔖 Bookmarks & Notes */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setFavoritesModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Ver versículos destacados e notas de estudo"
          >
            <Ionicons name="bookmark-outline" size={20} color={theme.colors.text} />
          </TouchableOpacity>

          {/* Aa Reading Options & Typography */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setOptionsModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Ajustes de leitura, tamanho de texto e opções"
          >
            <Ionicons name="text-outline" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Copy Feedback Toast */}
      {copyFeedback && (
        <View
          style={[
            styles.toastBanner,
            {
              backgroundColor: theme.colors.cardPastelGreen,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Ionicons name="checkmark-circle" size={16} color="#15803D" />
          <Text style={[styles.toastText, { color: '#14532D', fontFamily: 'Nunito_700Bold' }]}>
            Capítulo {currentBook.name} {currentChapter} copiado com referências!
          </Text>
        </View>
      )}

      {/* Scripture Verses Content */}
      {isLoading ? (
        <LoadingState message={`Abrindo ${currentBook.name} ${currentChapter}...`} />
      ) : verses && verses.length > 0 ? (
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.versesContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Reverent, Sacred Chapter Header */}
          <View style={styles.chapterHeader}>
            <Text style={[styles.bookNameTitle, { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' }]}>
              {currentBook.name}
            </Text>
            <Text style={[styles.chapterSubtitle, { color: theme.colors.gold, fontFamily: 'Nunito_700Bold' }]}>
              Capítulo {currentChapter}
            </Text>
            <View style={[styles.sacredDivider, { backgroundColor: theme.colors.border }]} />
          </View>

          {/* Verses Flow */}
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
        </ScrollView>
      ) : (
        <EmptyState
          title={`Capítulo ${currentChapter} indisponível`}
          message="Toque na tradução acima para selecionar ou carregar o texto bíblico."
        />
      )}

      {/* Floating Bottom Chapter Navigator Bar */}
      <View
        style={[
          styles.bottomNavBar,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.bottomNavBtn, isFirstChapter && styles.disabledNavBtn]}
          onPress={handlePrevChapter}
          disabled={isFirstChapter}
          accessibilityRole="button"
          accessibilityLabel="Capítulo anterior"
        >
          <Ionicons name="chevron-back" size={18} color={isFirstChapter ? theme.colors.textMuted : theme.colors.gold} />
          <Text
            style={[
              styles.bottomNavBtnText,
              {
                color: isFirstChapter ? theme.colors.textMuted : theme.colors.text,
                fontFamily: 'Nunito_700Bold',
              },
            ]}
          >
            Anterior
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavCenterBtn}
          onPress={() => setBookModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Selecionar outro livro e capítulo"
        >
          <Text style={[styles.bottomNavCenterText, { color: theme.colors.textSecondary, fontFamily: 'Nunito_600SemiBold' }]}>
            {currentBook.name} {currentChapter} de {currentBook.chaptersCount}
          </Text>
          <Ionicons name="list-outline" size={14} color={theme.colors.gold} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomNavBtn, isLastChapter && styles.disabledNavBtn]}
          onPress={handleNextChapter}
          disabled={isLastChapter}
          accessibilityRole="button"
          accessibilityLabel="Próximo capítulo"
        >
          <Text
            style={[
              styles.bottomNavBtnText,
              {
                color: isLastChapter ? theme.colors.textMuted : theme.colors.text,
                fontFamily: 'Nunito_700Bold',
              },
            ]}
          >
            Próximo
          </Text>
          <Ionicons name="chevron-forward" size={18} color={isLastChapter ? theme.colors.textMuted : theme.colors.gold} />
        </TouchableOpacity>
      </View>

      {/* Floating Audio Reader Bar */}
      {audioPlaying && verses && (
        <AudioReaderBar
          bookName={currentBook.name}
          chapter={currentChapter}
          verses={verses}
          onClose={() => {
            setAudioPlaying(false);
            setActiveAudioVerse(null);
          }}
          onActiveVerseChange={setActiveAudioVerse}
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

      <ReaderOptionsModal
        visible={optionsModalVisible}
        onClose={() => setOptionsModalVisible(false)}
        onOpenAi={() => setAiModalVisible(true)}
        onOpenCloud={() => setCloudSyncModalVisible(true)}
        onCopyChapter={handleCopyChapter}
        onStartAudio={() => setAudioPlaying(true)}
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
    minHeight: 38,
    borderRadius: 19,
    borderWidth: 1,
  },
  selectorTitle: {
    fontSize: 15,
  },
  translationPill: {
    paddingHorizontal: 10,
    minHeight: 38,
    borderRadius: 19,
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
    gap: 2,
  },
  iconButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 90,
  },
  chapterHeader: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 20,
    gap: 2,
  },
  bookNameTitle: {
    fontSize: 26,
    letterSpacing: 0.5,
  },
  chapterSubtitle: {
    fontSize: 15,
  },
  sacredDivider: {
    width: 48,
    height: 1,
    marginTop: 10,
  },
  bottomNavBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  bottomNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  bottomNavBtnText: {
    fontSize: 13,
  },
  disabledNavBtn: {
    opacity: 0.35,
  },
  bottomNavCenterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  bottomNavCenterText: {
    fontSize: 12,
  },
});
