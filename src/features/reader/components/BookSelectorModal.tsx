import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/shared/hooks/useTheme';
import { CANONICAL_BOOKS, BibleBook } from '@/src/shared/constants/books';
import { useReaderStore } from '@/src/shared/stores/useReaderStore';

interface BookSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

export function BookSelectorModal({ visible, onClose }: BookSelectorModalProps) {
  const theme = useAppTheme();
  const currentBookId = useReaderStore((s) => s.currentBookId);
  const currentChapter = useReaderStore((s) => s.currentChapter);
  const goToPassage = useReaderStore((s) => s.goToPassage);

  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [activeTestament, setActiveTestament] = useState<'OT' | 'NT'>('OT');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBooks = useMemo(() => {
    return CANONICAL_BOOKS.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.abbrev.toLowerCase().includes(searchQuery.toLowerCase());
      if (searchQuery.trim().length > 0) return matchesSearch;
      return b.testament === activeTestament;
    });
  }, [activeTestament, searchQuery]);

  const handleSelectBook = (book: BibleBook) => {
    setSelectedBook(book);
  };

  const handleSelectChapter = (chapterNum: number) => {
    if (selectedBook) {
      goToPassage(selectedBook.id, chapterNum);
      setSelectedBook(null);
      setSearchQuery('');
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedBook(null);
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          {selectedBook ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedBook(null)}
              accessibilityRole="button"
              accessibilityLabel="Voltar para a lista de livros"
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
              <Text style={[styles.backText, { color: theme.colors.text, fontFamily: 'Nunito_600SemiBold' }]}>
                Livros
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
              Selecione o Livro
            </Text>
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Fechar seleção de livro"
          >
            <Ionicons name="close" size={26} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {selectedBook ? (
          /* Chapter Selection Grid */
          <View style={styles.chaptersContainer}>
            <View style={styles.bookHeaderBadge}>
              <Text style={[styles.bookHeaderTitle, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                {selectedBook.name}
              </Text>
              <Text style={[styles.bookHeaderSubtitle, { color: theme.colors.textMuted, fontFamily: 'Nunito_400Regular' }]}>
                {selectedBook.chaptersCount} capítulos disponíveis
              </Text>
            </View>

            <ScrollView contentContainerStyle={styles.chaptersGrid}>
              {Array.from({ length: selectedBook.chaptersCount }, (_, i) => i + 1).map((ch) => {
                const isCurrent = selectedBook.id === currentBookId && ch === currentChapter;
                return (
                  <TouchableOpacity
                    key={ch}
                    style={[
                      styles.chapterBox,
                      {
                        backgroundColor: isCurrent ? theme.colors.primary : theme.colors.surface,
                        borderColor: isCurrent ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    onPress={() => handleSelectChapter(ch)}
                    accessibilityRole="button"
                    accessibilityLabel={`Capítulo ${ch}`}
                  >
                    <Text
                      style={[
                        styles.chapterNumber,
                        {
                          color: isCurrent ? '#FFFFFF' : theme.colors.text,
                          fontFamily: 'Nunito_700Bold',
                        },
                      ]}
                    >
                      {ch}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          /* Book List Selection */
          <View style={styles.bookListContainer}>
            {/* Search Input */}
            <View style={[styles.searchBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Ionicons name="search" size={20} color={theme.colors.textMuted} style={styles.searchIcon} />
              <TextInput
                placeholder="Buscar livro por nome ou sigla (ex: Mt, Salmos)..."
                placeholderTextColor={theme.colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[styles.searchInput, { color: theme.colors.text, fontFamily: 'Nunito_400Regular' }]}
                clearButtonMode="while-editing"
              />
            </View>

            {/* Testament Filter Tabs */}
            {searchQuery.trim().length === 0 && (
              <View style={[styles.tabBar, { backgroundColor: theme.colors.surfaceMuted }]}>
                <TouchableOpacity
                  style={[
                    styles.tabItem,
                    activeTestament === 'OT' && [styles.tabItemActive, { backgroundColor: theme.colors.surface }],
                  ]}
                  onPress={() => setActiveTestament('OT')}
                  accessibilityRole="tab"
                  accessibilityLabel="Antigo Testamento"
                >
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color: activeTestament === 'OT' ? theme.colors.primary : theme.colors.textMuted,
                        fontFamily: activeTestament === 'OT' ? 'Nunito_700Bold' : 'Nunito_600SemiBold',
                      },
                    ]}
                  >
                    Antigo Testamento (39)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabItem,
                    activeTestament === 'NT' && [styles.tabItemActive, { backgroundColor: theme.colors.surface }],
                  ]}
                  onPress={() => setActiveTestament('NT')}
                  accessibilityRole="tab"
                  accessibilityLabel="Novo Testamento"
                >
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color: activeTestament === 'NT' ? theme.colors.primary : theme.colors.textMuted,
                        fontFamily: activeTestament === 'NT' ? 'Nunito_700Bold' : 'Nunito_600SemiBold',
                      },
                    ]}
                  >
                    Novo Testamento (27)
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Books List */}
            <ScrollView contentContainerStyle={styles.booksGrid}>
              {filteredBooks.map((b) => {
                const isCurrent = b.id === currentBookId;
                return (
                  <TouchableOpacity
                    key={b.id}
                    style={[
                      styles.bookCard,
                      {
                        backgroundColor: isCurrent ? theme.colors.cardPastelBlue : theme.colors.surface,
                        borderColor: isCurrent ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    onPress={() => handleSelectBook(b)}
                    accessibilityRole="button"
                    accessibilityLabel={`${b.name}, ${b.chaptersCount} capítulos`}
                  >
                    <View style={styles.bookCardRow}>
                      <Text style={[styles.bookName, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                        {b.name}
                      </Text>
                      <View style={[styles.abbrevBadge, { backgroundColor: theme.colors.primaryLight }]}>
                        <Text style={[styles.abbrevText, { color: theme.colors.primary, fontFamily: 'Nunito_700Bold' }]}>
                          {b.abbrev}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.chaptersInfo, { color: theme.colors.textMuted, fontFamily: 'Nunito_400Regular' }]}>
                      {b.chaptersCount} capítulos
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
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
  headerTitle: {
    fontSize: 18,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
  },
  backText: {
    fontSize: 16,
  },
  closeButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookListContainer: {
    flex: 1,
    padding: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    minHeight: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    minHeight: 44,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  tabItem: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  tabItemActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
  },
  booksGrid: {
    paddingBottom: 24,
    gap: 8,
  },
  bookCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 52,
    justifyContent: 'center',
  },
  bookCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookName: {
    fontSize: 16,
  },
  abbrevBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  abbrevText: {
    fontSize: 12,
  },
  chaptersInfo: {
    fontSize: 12,
    marginTop: 2,
  },
  chaptersContainer: {
    flex: 1,
    padding: 16,
  },
  bookHeaderBadge: {
    alignItems: 'center',
    marginBottom: 16,
  },
  bookHeaderTitle: {
    fontSize: 22,
  },
  bookHeaderSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  chaptersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    paddingBottom: 32,
  },
  chapterBox: {
    width: 54,
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterNumber: {
    fontSize: 17,
  },
});
