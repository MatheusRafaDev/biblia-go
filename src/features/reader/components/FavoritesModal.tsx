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
import { BOOKS_BY_ID } from '@/src/shared/constants/books';
import { useReaderStore } from '@/src/shared/stores/useReaderStore';
import { useAllFavorites, useUpdateFavoriteNote } from '../hooks/useBibleReader';
import { DbFavorite } from '@/src/shared/db/types';

interface FavoritesModalProps {
  visible: boolean;
  onClose: () => void;
}

export function FavoritesModal({ visible, onClose }: FavoritesModalProps) {
  const theme = useAppTheme();
  const goToPassage = useReaderStore((s) => s.goToPassage);
  const { data: favorites } = useAllFavorites();
  const updateNoteMutation = useUpdateFavoriteNote();

  const [activeColorFilter, setActiveColorFilter] = useState<string>('todos');
  const [editingFavId, setEditingFavId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');

  const filtered = favorites?.filter((f) => {
    if (activeColorFilter === 'todos') return true;
    return f.highlight_color === activeColorFilter;
  });

  const handleOpenPassage = (item: DbFavorite) => {
    goToPassage(item.book_id, item.chapter, item.verse);
    onClose();
  };

  const handleStartEditNote = (item: DbFavorite) => {
    setEditingFavId(item.id);
    setNoteText(item.note ?? '');
  };

  const handleSaveNote = (item: DbFavorite) => {
    updateNoteMutation.mutate({
      bookId: item.book_id,
      chapter: item.chapter,
      verse: item.verse,
      note: noteText,
    });
    setEditingFavId(null);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' }]}>
            Versículos Destacados ({filtered?.length ?? 0})
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Fechar favoritos"
          >
            <Ionicons name="close" size={26} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Color Filters */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              {
                backgroundColor: activeColorFilter === 'todos' ? theme.colors.primary : theme.colors.surface,
                borderColor: activeColorFilter === 'todos' ? theme.colors.primary : theme.colors.border,
              },
            ]}
            onPress={() => setActiveColorFilter('todos')}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.filterChipText,
                {
                  color: activeColorFilter === 'todos' ? '#FFFFFF' : theme.colors.text,
                  fontFamily: 'Nunito_700Bold',
                },
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>

          {[
            { color: '#FFF59D', label: 'Amarelo' },
            { color: '#C8E6C9', label: 'Verde' },
            { color: '#BBDEFB', label: 'Azul' },
            { color: '#FFCCBC', label: 'Coral' },
          ].map((c) => (
            <TouchableOpacity
              key={c.color}
              style={[
                styles.filterColorDot,
                { backgroundColor: c.color },
                activeColorFilter === c.color && styles.filterColorDotActive,
              ]}
              onPress={() => setActiveColorFilter(activeColorFilter === c.color ? 'todos' : c.color)}
              accessibilityRole="button"
              accessibilityLabel={`Filtrar cor ${c.label}`}
            />
          ))}
        </View>

        {/* List */}
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {filtered && filtered.length > 0 ? (
            filtered.map((item) => {
              const book = BOOKS_BY_ID.get(item.book_id);
              const isEditing = editingFavId === item.id;

              return (
                <View
                  key={item.id}
                  style={[
                    styles.favCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      borderLeftColor: item.highlight_color ?? theme.colors.primary,
                      borderLeftWidth: 6,
                    },
                  ]}
                >
                  <TouchableOpacity onPress={() => handleOpenPassage(item)} style={styles.cardHeader}>
                    <Text style={[styles.cardRef, { color: theme.colors.primary, fontFamily: 'Nunito_800ExtraBold' }]}>
                      {book?.name ?? 'Livro'} {item.chapter}:{item.verse}
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color={theme.colors.textMuted} />
                  </TouchableOpacity>

                  {/* Note preview or editor */}
                  {isEditing ? (
                    <View style={styles.editNoteContainer}>
                      <TextInput
                        value={noteText}
                        onChangeText={setNoteText}
                        placeholder="Escreva sua anotação ou reflexão de estudo..."
                        placeholderTextColor={theme.colors.textMuted}
                        style={[styles.noteInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
                        multiline
                      />
                      <View style={styles.noteEditActions}>
                        <TouchableOpacity
                          style={[styles.noteBtn, { backgroundColor: theme.colors.surfaceMuted }]}
                          onPress={() => setEditingFavId(null)}
                        >
                          <Text style={[styles.noteBtnText, { color: theme.colors.text, fontFamily: 'Nunito_600SemiBold' }]}>
                            Cancelar
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.noteBtn, { backgroundColor: theme.colors.primary }]}
                          onPress={() => handleSaveNote(item)}
                        >
                          <Text style={[styles.noteBtnText, { color: '#FFFFFF', fontFamily: 'Nunito_700Bold' }]}>
                            Salvar Anotação
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : item.note ? (
                    <TouchableOpacity onPress={() => handleStartEditNote(item)} style={styles.notePreviewBox}>
                      <Ionicons name="document-text-outline" size={16} color={theme.colors.primary} />
                      <Text style={[styles.notePreviewText, { color: theme.colors.text, fontFamily: 'Nunito_400Regular' }]}>
                        {item.note}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => handleStartEditNote(item)} style={styles.addNoteBtn}>
                      <Ionicons name="add" size={16} color={theme.colors.textMuted} />
                      <Text style={[styles.addNoteText, { color: theme.colors.textMuted, fontFamily: 'Nunito_600SemiBold' }]}>
                        Adicionar anotação de estudo...
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="bookmark-outline" size={48} color={theme.colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                Nenhum versículo destacado
              </Text>
              <Text style={[styles.emptySub, { color: theme.colors.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
                No leitor bíblico, toque sobre qualquer versículo para marcá-lo com cores ou adicionar reflexões.
              </Text>
            </View>
          )}
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
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    minHeight: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipText: {
    fontSize: 13,
  },
  filterColorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterColorDotActive: {
    borderColor: '#3B6EF5',
    transform: [{ scale: 1.15 }],
  },
  list: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  favCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 32,
  },
  cardRef: {
    fontSize: 16,
  },
  notePreviewBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5FA',
    marginTop: 4,
  },
  notePreviewText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  addNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 36,
  },
  addNoteText: {
    fontSize: 13,
  },
  editNoteContainer: {
    marginTop: 6,
    gap: 8,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  noteEditActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  noteBtn: {
    paddingHorizontal: 14,
    minHeight: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteBtnText: {
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

