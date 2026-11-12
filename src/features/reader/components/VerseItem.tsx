import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppTheme } from '@/src/shared/hooks/useTheme';
import { useReaderStore } from '@/src/shared/stores/useReaderStore';
import { useCurrentBook, useToggleFavorite, useUpdateFavoriteNote } from '../hooks/useBibleReader';

interface VerseItemProps {
  verseNumber: number;
  text: string;
  isFavorited?: boolean;
  highlightColor?: string | null;
  note?: string | null;
  isTarget?: boolean;
}

const HIGHLIGHT_OPTIONS = [
  { label: 'Amarelo', color: '#FFF59D' },
  { label: 'Verde', color: '#C8E6C9' },
  { label: 'Azul', color: '#BBDEFB' },
  { label: 'Coral', color: '#FFCCBC' },
];

export function VerseItem({
  verseNumber,
  text,
  isFavorited = false,
  highlightColor,
  note,
  isTarget = false,
}: VerseItemProps) {
  const theme = useAppTheme();
  const fontSize = useReaderStore((s) => s.fontSize);
  const currentChapter = useReaderStore((s) => s.currentChapter);
  const currentTranslation = useReaderStore((s) => s.currentTranslation);
  const currentBook = useCurrentBook();

  const toggleFavoriteMutation = useToggleFavorite();
  const updateNoteMutation = useUpdateFavoriteNote();
  const [showActions, setShowActions] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteDraft, setNoteDraft] = useState(note || '');

  const activeColor = highlightColor || (isFavorited ? '#FFF59D' : undefined);

  const handleColorSelect = (color: string) => {
    toggleFavoriteMutation.mutate({ verse: verseNumber, color });
    setShowActions(false);
  };

  const handleToggle = () => {
    setShowActions((prev) => !prev);
    setShowNoteInput(false);
  };

  const handleSaveNote = () => {
    if (!isFavorited) {
      toggleFavoriteMutation.mutate({
        verse: verseNumber,
        color: activeColor || '#FFF59D',
      });
    }
    updateNoteMutation.mutate({
      bookId: currentBook.id,
      chapter: currentChapter,
      verse: verseNumber,
      note: noteDraft.trim(),
    });
    setShowNoteInput(false);
    setShowActions(false);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `"${text}" — ${currentBook.name} ${currentChapter}:${verseNumber} (${currentTranslation})`,
      });
    } catch {
      // Ignore
    }
    setShowActions(false);
  };

  const handleCompare = () => {
    setShowActions(false);
    router.push({
      pathname: '/(tabs)/compare',
      params: {
        bookId: String(currentBook.id),
        chapter: String(currentChapter),
        verse: String(verseNumber),
      },
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleToggle}
        accessibilityRole="button"
        accessibilityLabel={`Versículo ${verseNumber}: ${text}${note ? `. Anotação: ${note}` : ''}`}
        accessibilityHint="Toque para destacar, anotar, copiar ou comparar traduções"
        style={[
          styles.verseRow,
          activeColor && !theme.isDark && { backgroundColor: activeColor + '80' },
          activeColor && theme.isDark && { backgroundColor: activeColor + '30' },
          isTarget && {
            borderLeftColor: theme.colors.primary,
            borderLeftWidth: 4,
            paddingLeft: 8,
          },
        ]}
      >
        <Text
          style={[
            styles.verseNumber,
            {
              color: theme.colors.primary,
              fontSize: Math.max(13, fontSize - 4),
              fontFamily: 'Nunito_700Bold',
            },
          ]}
        >
          {verseNumber}{' '}
        </Text>

        {note && (
          <Ionicons name="document-text" size={13} color={theme.colors.primary} style={styles.noteIndicator} />
        )}

        <Text
          style={[
            styles.verseText,
            {
              color: theme.colors.text,
              fontSize,
              lineHeight: Math.round(fontSize * 1.6),
              fontFamily: 'Nunito_400Regular',
            },
          ]}
        >
          {text}
        </Text>
      </TouchableOpacity>

      {/* Render Note card if exists */}
      {note && (
        <View style={[styles.savedNoteCard, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
          <View style={styles.noteHeader}>
            <Ionicons name="create-outline" size={13} color={theme.colors.primary} />
            <Text style={[styles.noteAuthor, { color: theme.colors.primary, fontFamily: 'Nunito_700Bold' }]}>
              Anotação de Estudo
            </Text>
          </View>
          <Text style={[styles.noteContent, { color: theme.colors.text, fontFamily: 'Nunito_400Regular' }]}>
            {note}
          </Text>
        </View>
      )}

      {/* Actions Bar */}
      {showActions && (
        <View
          style={[
            styles.actionsBar,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.actionsTopRow}>
            <Text
              style={[
                styles.actionsLabel,
                { color: theme.colors.textMuted, fontFamily: 'Nunito_600SemiBold' },
              ]}
            >
              Destacar v.{verseNumber}:
            </Text>
            <View style={styles.colorsRow}>
              {HIGHLIGHT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.color}
                  style={[
                    styles.colorDot,
                    { backgroundColor: opt.color },
                    activeColor === opt.color && styles.colorDotActive,
                  ]}
                  onPress={() => handleColorSelect(opt.color)}
                  accessibilityLabel={`Destacar com cor ${opt.label}`}
                  accessibilityRole="button"
                />
              ))}
              {isFavorited && (
                <TouchableOpacity
                  style={styles.actionIconBtn}
                  onPress={() => {
                    toggleFavoriteMutation.mutate({ verse: verseNumber });
                    setShowActions(false);
                    setShowNoteInput(false);
                  }}
                  accessibilityLabel="Remover destaque"
                  accessibilityRole="button"
                >
                  <Ionicons name="trash-outline" size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Quick Buttons: Share, Compare, Note */}
          <View style={styles.actionsBottomRow}>
            <TouchableOpacity
              style={[styles.quickButton, { backgroundColor: theme.colors.surfaceMuted }]}
              onPress={handleShare}
              accessibilityRole="button"
              accessibilityLabel="Compartilhar versículo"
            >
              <Ionicons name="share-social-outline" size={16} color={theme.colors.text} />
              <Text style={[styles.quickBtnText, { color: theme.colors.text, fontFamily: 'Nunito_600SemiBold' }]}>
                Compartilhar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickButton, { backgroundColor: theme.colors.primaryLight }]}
              onPress={handleCompare}
              accessibilityRole="button"
              accessibilityLabel="Comparar versículo em outras versões"
            >
              <Ionicons name="git-compare-outline" size={16} color={theme.colors.primary} />
              <Text style={[styles.quickBtnText, { color: theme.colors.primary, fontFamily: 'Nunito_700Bold' }]}>
                Comparar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickButton,
                { backgroundColor: showNoteInput ? theme.colors.primaryLight : theme.colors.surfaceMuted },
              ]}
              onPress={() => setShowNoteInput(!showNoteInput)}
              accessibilityRole="button"
              accessibilityLabel="Adicionar ou editar anotação"
            >
              <Ionicons name="create-outline" size={16} color={showNoteInput ? theme.colors.primary : theme.colors.text} />
              <Text
                style={[
                  styles.quickBtnText,
                  {
                    color: showNoteInput ? theme.colors.primary : theme.colors.text,
                    fontFamily: 'Nunito_700Bold',
                  },
                ]}
              >
                {note ? 'Editar Nota' : 'Anotar'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Inline Note Editor */}
          {showNoteInput && (
            <View style={styles.noteInputContainer}>
              <TextInput
                style={[
                  styles.noteTextInput,
                  {
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surfaceMuted,
                  },
                ]}
                placeholder="Escreva sua reflexão sobre este versículo..."
                placeholderTextColor={theme.colors.textMuted}
                multiline
                numberOfLines={3}
                value={noteDraft}
                onChangeText={setNoteDraft}
                autoFocus
              />
              <View style={styles.noteActionsRow}>
                <TouchableOpacity
                  style={[styles.saveNoteBtn, { backgroundColor: theme.colors.primary }]}
                  onPress={handleSaveNote}
                  accessibilityRole="button"
                  accessibilityLabel="Salvar anotação"
                >
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  <Text style={[styles.saveNoteText, { color: '#FFFFFF', fontFamily: 'Nunito_700Bold' }]}>
                    Salvar Nota
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.cancelNoteBtn, { borderColor: theme.colors.border }]}
                  onPress={() => setShowNoteInput(false)}
                  accessibilityRole="button"
                >
                  <Text style={[styles.cancelNoteText, { color: theme.colors.textMuted, fontFamily: 'Nunito_600SemiBold' }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  verseRow: {
    minHeight: 44,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
  },
  verseNumber: {
    marginRight: 4,
    lineHeight: 24,
  },
  noteIndicator: {
    marginRight: 4,
  },
  verseText: {
    flexShrink: 1,
  },
  savedNoteCard: {
    marginTop: 4,
    marginHorizontal: 12,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  noteAuthor: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noteContent: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionsBar: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 6,
    marginHorizontal: 8,
    gap: 10,
  },
  actionsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionsBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickButton: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  quickBtnText: {
    fontSize: 12,
  },
  actionsLabel: {
    fontSize: 13,
  },
  colorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotActive: {
    borderColor: '#3B6EF5',
    transform: [{ scale: 1.15 }],
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  noteInputContainer: {
    marginTop: 6,
    gap: 8,
  },
  noteTextInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    height: 70,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  noteActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  saveNoteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
    borderRadius: 8,
    gap: 6,
  },
  saveNoteText: {
    fontSize: 13,
  },
  cancelNoteBtn: {
    paddingHorizontal: 12,
    minHeight: 36,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelNoteText: {
    fontSize: 13,
  },
});
