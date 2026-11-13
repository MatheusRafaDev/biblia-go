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
  { label: 'Ouro', color: '#FEF08A' },
  { label: 'Oliva', color: '#BBF7D0' },
  { label: 'Celeste', color: '#BAE6FD' },
  { label: 'Coral', color: '#FECDD3' },
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

  const activeColor = highlightColor || (isFavorited ? '#FEF08A' : undefined);

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
        color: activeColor || '#FEF08A',
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
      {/* Verse Text Row */}
      <TouchableOpacity
        activeOpacity={0.65}
        onPress={handleToggle}
        accessibilityRole="button"
        accessibilityLabel={`Versículo ${verseNumber}: ${text}${note ? `. Anotação: ${note}` : ''}`}
        accessibilityHint="Toque para destacar, anotar, copiar ou comparar"
        style={[
          styles.verseRow,
          activeColor && !theme.isDark && { backgroundColor: activeColor + '85' },
          activeColor && theme.isDark && { backgroundColor: activeColor + '30' },
          isTarget && [
            styles.targetVerseRow,
            {
              borderLeftColor: theme.colors.gold,
              backgroundColor: theme.isDark ? '#2E2818' : '#FEF9EE',
            },
          ],
        ]}
      >
        {/* Subtle, Dignified Verse Number */}
        <Text
          style={[
            styles.verseNumber,
            {
              color: theme.colors.verseNumber,
              fontSize: Math.max(11, fontSize - 4),
              fontFamily: 'Nunito_800ExtraBold',
            },
          ]}
        >
          {verseNumber}{' '}
        </Text>

        {/* Note indicator dot if exists */}
        {note && (
          <Ionicons name="bookmark" size={12} color={theme.colors.gold} style={styles.noteIndicator} />
        )}

        {/* Scripture Text */}
        <Text
          style={[
            styles.verseText,
            {
              color: theme.colors.text,
              fontSize,
              lineHeight: Math.round(fontSize * 1.72),
              fontFamily: 'Nunito_400Regular',
            },
          ]}
        >
          {text}
        </Text>
      </TouchableOpacity>

      {/* Note Preview if exists */}
      {note && (
        <View
          style={[
            styles.savedNoteCard,
            {
              backgroundColor: theme.colors.surfaceMuted,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.noteHeader}>
            <Ionicons name="document-text-outline" size={13} color={theme.colors.gold} />
            <Text style={[styles.noteAuthor, { color: theme.colors.gold, fontFamily: 'Nunito_700Bold' }]}>
              Anotação de Estudo
            </Text>
          </View>
          <Text style={[styles.noteContent, { color: theme.colors.text, fontFamily: 'Nunito_400Regular' }]}>
            {note}
          </Text>
        </View>
      )}

      {/* Refined, Quiet Quick Action Strip (only shown on tap) */}
      {showActions && (
        <View
          style={[
            styles.actionsBar,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              shadowColor: theme.isDark ? '#000000' : '#1C1917',
            },
          ]}
        >
          <View style={styles.actionsTopRow}>
            {/* Highlighter Color Dots */}
            <View style={styles.colorsRow}>
              {HIGHLIGHT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.color}
                  style={[
                    styles.colorDot,
                    { backgroundColor: opt.color },
                    activeColor === opt.color && [styles.colorDotActive, { borderColor: theme.colors.gold }],
                  ]}
                  onPress={() => handleColorSelect(opt.color)}
                  accessibilityRole="button"
                  accessibilityLabel={`Destacar em ${opt.label}`}
                />
              ))}

              {activeColor && (
                <TouchableOpacity
                  style={styles.actionIconBtn}
                  onPress={() => handleColorSelect('')}
                  accessibilityRole="button"
                  accessibilityLabel="Remover destaque"
                >
                  <Ionicons name="close-circle-outline" size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Quick Action Icons */}
            <View style={styles.actionsIconsGroup}>
              <TouchableOpacity
                style={styles.actionIconBtn}
                onPress={() => setShowNoteInput((prev) => !prev)}
                accessibilityRole="button"
                accessibilityLabel="Anotar no versículo"
              >
                <Ionicons name="create-outline" size={18} color={theme.colors.text} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionIconBtn}
                onPress={handleShare}
                accessibilityRole="button"
                accessibilityLabel="Copiar versículo"
              >
                <Ionicons name="copy-outline" size={18} color={theme.colors.text} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionIconBtn}
                onPress={handleCompare}
                accessibilityRole="button"
                accessibilityLabel="Comparar traduções"
              >
                <Ionicons name="git-compare-outline" size={18} color={theme.colors.text} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionIconBtn}
                onPress={() => setShowActions(false)}
                accessibilityRole="button"
                accessibilityLabel="Fechar ações"
              >
                <Ionicons name="close" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Inline Note Editor */}
          {showNoteInput && (
            <View style={styles.noteInputContainer}>
              <TextInput
                style={[
                  styles.noteTextInput,
                  {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.surfaceMuted,
                    borderColor: theme.colors.border,
                    fontFamily: 'Nunito_400Regular',
                  },
                ]}
                placeholder="Escreva sua reflexão ou nota teológica..."
                placeholderTextColor={theme.colors.textMuted}
                multiline
                value={noteDraft}
                onChangeText={setNoteDraft}
              />
              <View style={styles.noteActionsRow}>
                <TouchableOpacity
                  style={[styles.saveNoteBtn, { backgroundColor: theme.colors.gold }]}
                  onPress={handleSaveNote}
                  accessibilityRole="button"
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
    marginVertical: 1,
  },
  verseRow: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
  },
  targetVerseRow: {
    borderLeftWidth: 3.5,
    paddingLeft: 8,
  },
  verseNumber: {
    marginRight: 4,
    lineHeight: 22,
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
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
    marginHorizontal: 6,
    gap: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotActive: {
    transform: [{ scale: 1.15 }],
  },
  actionsIconsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  noteInputContainer: {
    marginTop: 6,
    gap: 8,
  },
  noteTextInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    height: 64,
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
    minHeight: 34,
    borderRadius: 8,
    gap: 6,
  },
  saveNoteText: {
    fontSize: 12,
  },
  cancelNoteBtn: {
    paddingHorizontal: 12,
    minHeight: 34,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelNoteText: {
    fontSize: 12,
  },
});
