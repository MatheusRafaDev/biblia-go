import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/shared/hooks/useTheme';
import { DbVerse } from '@/src/shared/db/types';

interface AudioReaderBarProps {
  verses: DbVerse[];
  bookName: string;
  chapter: number;
  onActiveVerseChange?: (verseNumber: number | null) => void;
  onClose: () => void;
}

const SPEEDS = [1.0, 1.25, 1.5, 0.75];

export function AudioReaderBar({
  verses,
  bookName,
  chapter,
  onActiveVerseChange,
  onClose,
}: AudioReaderBarProps) {
  const theme = useAppTheme();
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(0);

  const rate = SPEEDS[speedIndex];
  const currentVerse = verses[currentIdx];

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speakVerseRef = useRef<(index: number) => void>(() => {});

  const stopAudio = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPlaying(false);
    onActiveVerseChange?.(null);
  }, [onActiveVerseChange]);

  const speakVerse = useCallback(
    (index: number) => {
      if (index >= verses.length) {
        stopAudio();
        return;
      }

      const v = verses[index];
      setCurrentIdx(index);
      onActiveVerseChange?.(v.verse);

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const textToSpeak = `${v.verse}. ${v.text}`;
        const utterance = new window.SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'pt-BR';
        utterance.rate = rate;

        utterance.onend = () => {
          if (index + 1 < verses.length) {
            speakVerseRef.current(index + 1);
          } else {
            stopAudio();
          }
        };

        utterance.onerror = () => {
          stopAudio();
        };

        window.speechSynthesis.speak(utterance);
      } else {
        // Fallback simulation for environments without Web Speech
        const estimatedDurationMs = Math.max(1500, (v.text.split(' ').length / 3) * 1000 * (1 / rate));
        timeoutRef.current = setTimeout(() => {
          if (index + 1 < verses.length) {
            speakVerseRef.current(index + 1);
          } else {
            stopAudio();
          }
        }, estimatedDurationMs);
      }
    },
    [verses, rate, onActiveVerseChange, stopAudio]
  );

  useEffect(() => {
    speakVerseRef.current = speakVerse;
  }, [speakVerse]);

  const handlePlayPause = () => {
    if (isPlaying) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (
        typeof window !== 'undefined' &&
        'speechSynthesis' in window &&
        window.speechSynthesis.paused
      ) {
        window.speechSynthesis.resume();
      } else {
        speakVerse(currentIdx);
      }
    }
  };

  const handlePrev = () => {
    const nextIdx = Math.max(0, currentIdx - 1);
    setCurrentIdx(nextIdx);
    if (isPlaying) {
      speakVerse(nextIdx);
    } else {
      onActiveVerseChange?.(verses[nextIdx].verse);
    }
  };

  const handleNext = () => {
    const nextIdx = Math.min(verses.length - 1, currentIdx + 1);
    setCurrentIdx(nextIdx);
    if (isPlaying) {
      speakVerse(nextIdx);
    } else {
      onActiveVerseChange?.(verses[nextIdx].verse);
    }
  };

  const handleCycleSpeed = () => {
    const nextSpeedIdx = (speedIndex + 1) % SPEEDS.length;
    setSpeedIndex(nextSpeedIdx);
    if (isPlaying) {
      speakVerse(currentIdx);
    }
  };

  // Auto-start on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      speakVerse(0);
    }, 0);

    return () => {
      clearTimeout(timer);
      stopAudio();
    };
  }, [speakVerse, stopAudio]);

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      {/* Top info row */}
      <View style={styles.infoRow}>
        <View style={styles.titleGroup}>
          <Ionicons name="volume-high" size={16} color={theme.colors.primary} />
          <Text style={[styles.titleText, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
            {bookName} {chapter}:{currentVerse?.verse ?? 1}
          </Text>
        </View>

        <Text style={[styles.progressText, { color: theme.colors.textMuted, fontFamily: 'Nunito_600SemiBold' }]}>
          {currentIdx + 1} de {verses.length}
        </Text>

        <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Fechar leitor de áudio">
          <Ionicons name="close" size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Controls row */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[styles.speedBtn, { backgroundColor: theme.colors.surfaceMuted }]}
          onPress={handleCycleSpeed}
          accessibilityLabel={`Velocidade de leitura: ${rate}x`}
        >
          <Text style={[styles.speedText, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
            {rate}x
          </Text>
        </TouchableOpacity>

        <View style={styles.playbackGroup}>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={handlePrev}
            disabled={currentIdx <= 0}
            accessibilityLabel="Versículo anterior"
          >
            <Ionicons
              name="play-back"
              size={22}
              color={currentIdx <= 0 ? theme.colors.textMuted : theme.colors.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.playPauseBtn, { backgroundColor: theme.colors.primary }]}
            onPress={handlePlayPause}
            accessibilityLabel={isPlaying ? 'Pausar áudio' : 'Reproduzir áudio'}
          >
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlBtn}
            onPress={handleNext}
            disabled={currentIdx >= verses.length - 1}
            accessibilityLabel="Próximo versículo"
          >
            <Ionicons
              name="play-forward"
              size={22}
              color={currentIdx >= verses.length - 1 ? theme.colors.textMuted : theme.colors.text}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.emptySpacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 70 : 64,
    left: 16,
    right: 16,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleText: {
    fontSize: 14,
  },
  progressText: {
    fontSize: 12,
  },
  closeBtn: {
    padding: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  speedBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 42,
    alignItems: 'center',
  },
  speedText: {
    fontSize: 12,
  },
  playbackGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  controlBtn: {
    padding: 6,
  },
  playPauseBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySpacer: {
    width: 42,
  },
});
