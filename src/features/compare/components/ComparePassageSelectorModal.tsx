import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/shared/hooks/useTheme';
import { CANONICAL_BOOKS, BibleBook, BOOKS_BY_ID } from '@/src/shared/constants/books';

interface ComparePassageSelectorModalProps {
  visible: boolean;
  initialBookId: number;
  initialChapter: number;
  initialVerse: number;
  onClose: () => void;
  onSelect: (bookId: number, chapter: number, verse: number) => void;
}

export function ComparePassageSelectorModal({
  visible,
  initialBookId,
  initialChapter,
  onClose,
  onSelect,
}: ComparePassageSelectorModalProps) {
  const theme = useAppTheme();

  const [step, setStep] = useState<'book' | 'chapter' | 'verse'>('book');
  const [selectedBook, setSelectedBook] = useState<BibleBook>(
    BOOKS_BY_ID.get(initialBookId) ?? BOOKS_BY_ID.get(1)!
  );
  const [selectedChapter, setSelectedChapter] = useState(initialChapter);
  const [activeTestament, setActiveTestament] = useState<'OT' | 'NT'>('OT');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBooks = CANONICAL_BOOKS.filter((b) => {
    if (searchQuery.trim().length > 0) {
      return (
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.abbrev.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return b.testament === activeTestament;
  });

  const handleSelectBook = (book: BibleBook) => {
    setSelectedBook(book);
    setSelectedChapter(1);
    setStep('chapter');
  };

  const handleSelectChapter = (ch: number) => {
    setSelectedChapter(ch);
    setStep('verse');
  };

  const handleSelectVerse = (v: number) => {
    onSelect(selectedBook.id, selectedChapter, v);
    setStep('book');
    onClose();
  };

  const handleClose = () => {
    setStep('book');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          {step !== 'book' ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep(step === 'verse' ? 'chapter' : 'book')}
              accessibilityRole="button"
              accessibilityLabel="Voltar etapa"
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
              <Text style={[styles.backText, { color: theme.colors.text, fontFamily: 'Nunito_600SemiBold' }]}>
                {step === 'verse' ? `${selectedBook.name} ${selectedChapter}` : 'Livros'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
              Selecionar Passagem
            </Text>
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Fechar seleção"
          >
            <Ionicons name="close" size={26} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Step: Select Book */}
        {step === 'book' && (
          <View style={styles.content}>
            <View style={[styles.searchBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Ionicons name="search" size={20} color={theme.colors.textMuted} style={styles.searchIcon} />
              <TextInput
                placeholder="Buscar livro por nome ou sigla..."
                placeholderTextColor={theme.colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[styles.searchInput, { color: theme.colors.text, fontFamily: 'Nunito_400Regular' }]}
              />
            </View>

            {searchQuery.trim().length === 0 && (
              <View style={[styles.tabBar, { backgroundColor: theme.colors.surfaceMuted }]}>
                <TouchableOpacity
                  style={[
                    styles.tabItem,
                    activeTestament === 'OT' && [styles.tabItemActive, { backgroundColor: theme.colors.surface }],
                  ]}
                  onPress={() => setActiveTestament('OT')}
                  accessibilityRole="tab"
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

            <ScrollView contentContainerStyle={styles.booksGrid}>
              {filteredBooks.map((b) => (
                <TouchableOpacity
                  key={b.id}
                  style={[
                    styles.bookCard,
                    {
                      backgroundColor: b.id === selectedBook.id ? theme.colors.cardPastelBlue : theme.colors.surface,
                      borderColor: b.id === selectedBook.id ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => handleSelectBook(b)}
                  accessibilityRole="button"
                >
                  <Text style={[styles.bookName, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                    {b.name}
                  </Text>
                  <Text style={[styles.chaptersInfo, { color: theme.colors.textMuted, fontFamily: 'Nunito_400Regular' }]}>
                    {b.chaptersCount} caps
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Step: Select Chapter */}
        {step === 'chapter' && (
          <View style={styles.content}>
            <View style={styles.badgeInfo}>
              <Text style={[styles.badgeTitle, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                {selectedBook.name} — Selecione o Capítulo
              </Text>
            </View>
            <ScrollView contentContainerStyle={styles.numberGrid}>
              {Array.from({ length: selectedBook.chaptersCount }, (_, i) => i + 1).map((ch) => (
                <TouchableOpacity
                  key={ch}
                  style={[
                    styles.numberBox,
                    {
                      backgroundColor: ch === selectedChapter ? theme.colors.primary : theme.colors.surface,
                      borderColor: ch === selectedChapter ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => handleSelectChapter(ch)}
                  accessibilityRole="button"
                  accessibilityLabel={`Capítulo ${ch}`}
                >
                  <Text
                    style={[
                      styles.numberText,
                      { color: ch === selectedChapter ? '#FFFFFF' : theme.colors.text, fontFamily: 'Nunito_700Bold' },
                    ]}
                  >
                    {ch}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Step: Select Verse */}
        {step === 'verse' && (
          <View style={styles.content}>
            <View style={styles.badgeInfo}>
              <Text style={[styles.badgeTitle, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                {selectedBook.name} {selectedChapter} — Selecione o Versículo
              </Text>
            </View>
            <ScrollView contentContainerStyle={styles.numberGrid}>
              {/* Common average verses range (up to 40 or 80) */}
              {Array.from({ length: 60 }, (_, i) => i + 1).map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[
                    styles.numberBox,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => handleSelectVerse(v)}
                  accessibilityRole="button"
                  accessibilityLabel={`Versículo ${v}`}
                >
                  <Text style={[styles.numberText, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                    {v}
                  </Text>
                </TouchableOpacity>
              ))}
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
  content: {
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  bookName: {
    fontSize: 16,
  },
  chaptersInfo: {
    fontSize: 13,
  },
  badgeInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeTitle: {
    fontSize: 18,
    textAlign: 'center',
  },
  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    paddingBottom: 32,
  },
  numberBox: {
    width: 54,
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 17,
  },
});
