import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
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
import { TranslationBanner } from './TranslationBanner';
import { LoadingState, EmptyState } from '@/src/shared/components/FeedbackStates';

export function BibleReader() {
  const theme = useAppTheme();
  const themePreference = useThemeStore((s) => s.preference);
  const setThemePreference = useThemeStore((s) => s.setPreference);

  const currentBook = useCurrentBook();
  const currentChapter = useReaderStore((s) => s.currentChapter);
  const setChapter = useReaderStore((s) => s.setChapter);
  const fontSize = useReaderStore((s) => s.fontSize);
  const setFontSize = useReaderStore((s) => s.setFontSize);
  const targetVerse = useReaderStore((s) => s.targetVerse);
  const clearTargetVerse = useReaderStore((s) => s.clearTargetVerse);

  const [bookModalVisible, setBookModalVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [translationModalVisible, setTranslationModalVisible] = useState(false);
  const [favoritesModalVisible, setFavoritesModalVisible] = useState(false);
  const [cloudSyncModalVisible, setCloudSyncModalVisible] = useState(false);
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const currentTranslation = useReaderStore((s) => s.currentTranslation);

  const { data: verses, isLoading } = useChapterVerses();
  const { data: favorites } = useChapterFavorites();

  const scrollViewRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

  const favoritesMap = new Map<number, string | null>();
  if (favorites) {
    for (const f of favorites) {
      favoritesMap.set(f.verse, f.highlight_color);
    }
  }

  // Clear target verse after 3 seconds
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

  const handleToggleTheme = () => {
    const nextPref = themePreference === 'dark' ? 'light' : 'dark';
    setThemePreference(nextPref);
  };

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
            <Text style={[styles.selectorTitle, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
              {currentBook.name} {currentChapter}
            </Text>
            <Ionicons name="chevron-down" size={16} color={theme.colors.primary} />
          </TouchableOpacity>

          {/* Translation Picker Pill */}
          <TouchableOpacity
            style={[styles.translationPill, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.border }]}
            onPress={() => setTranslationModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={`Tradução atual: ${currentTranslation}. Toque para alterar ou baixar outras`}
          >
            <Text style={[styles.translationText, { color: theme.colors.primary, fontFamily: 'Nunito_700Bold' }]}>
              {currentTranslation}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action icons */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setAiModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Assistente Bíblico com Inteligência Artificial"
          >
            <Ionicons name="sparkles-outline" size={20} color={theme.colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setCloudSyncModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Sincronização em Nuvem Fastify"
          >
            <Ionicons name="cloud-outline" size={21} color={theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setFavoritesModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Ver versículos destacados e favoritos"
          >
            <Ionicons name="bookmark-outline" size={22} color={theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setSearchModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Buscar versículos"
          >
            <Ionicons name="search" size={22} color={theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setFontSize(fontSize === 22 ? 16 : fontSize + 2)}
            accessibilityRole="button"
            accessibilityLabel="Ajustar tamanho da fonte"
          >
            <Ionicons name="text-outline" size={22} color={theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleToggleTheme}
            accessibilityRole="button"
            accessibilityLabel="Alternar modo escuro"
          >
            <Ionicons
              name={theme.isDark ? 'sunny-outline' : 'moon-outline'}
              size={22}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

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
          <View style={styles.chapterHeaderBadge}>
            <Text style={[styles.chapterTitle, { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' }]}>
              {currentBook.name}
            </Text>
            <Text style={[styles.chapterSubtitle, { color: theme.colors.primary, fontFamily: 'Nunito_700Bold' }]}>
              Capítulo {currentChapter}
            </Text>
          </View>

          {verses.map((v) => (
            <VerseItem
              key={v.verse}
              verseNumber={v.verse}
              text={v.text}
              isFavorited={favoritesMap.has(v.verse)}
              highlightColor={favoritesMap.get(v.verse)}
              isTarget={targetVerse === v.verse}
            />
          ))}

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
  },
  selectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    minHeight: 44,
    borderRadius: 22,
    borderWidth: 1,
  },
  selectorTitle: {
    fontSize: 16,
  },
  translationPill: {
    paddingHorizontal: 12,
    minHeight: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  translationText: {
    fontSize: 13,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  versesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  chapterHeaderBadge: {
    alignItems: 'center',
    marginVertical: 18,
  },
  chapterTitle: {
    fontSize: 24,
  },
  chapterSubtitle: {
    fontSize: 16,
    marginTop: 2,
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
