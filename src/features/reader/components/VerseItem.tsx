import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/shared/hooks/useTheme';
import { useReaderStore } from '@/src/shared/stores/useReaderStore';
import { useToggleFavorite } from '../hooks/useBibleReader';

interface VerseItemProps {
  verseNumber: number;
  text: string;
  isFavorited?: boolean;
  highlightColor?: string | null;
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
  isTarget = false,
}: VerseItemProps) {
  const theme = useAppTheme();
  const fontSize = useReaderStore((s) => s.fontSize);
  const toggleFavoriteMutation = useToggleFavorite();
  const [showActions, setShowActions] = useState(false);

  const activeColor = highlightColor || (isFavorited ? '#FFF59D' : undefined);

  const handleColorSelect = (color: string) => {
    toggleFavoriteMutation.mutate({ verse: verseNumber, color });
    setShowActions(false);
  };

  const handleToggle = () => {
    setShowActions((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleToggle}
        accessibilityRole="button"
        accessibilityLabel={`Versículo ${verseNumber}: ${text}`}
        accessibilityHint="Toque para destacar ou marcar como favorito"
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
                style={styles.removeHighlightButton}
                onPress={() => {
                  toggleFavoriteMutation.mutate({ verse: verseNumber });
                  setShowActions(false);
                }}
                accessibilityLabel="Remover destaque"
                accessibilityRole="button"
              >
                <Ionicons name="trash-outline" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
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
  verseText: {
    flexShrink: 1,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
    marginHorizontal: 8,
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
  removeHighlightButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
});
