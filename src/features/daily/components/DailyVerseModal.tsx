import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/shared/hooks/useTheme';
import { useReaderStore } from '@/src/shared/stores/useReaderStore';
import { getDailyVerse, formatDailyVerseShare } from '../utils/getDailyVerse';

interface DailyVerseModalProps {
  visible: boolean;
  onClose: () => void;
}

export function DailyVerseModal({ visible, onClose }: DailyVerseModalProps) {
  const theme = useAppTheme();
  const goToPassage = useReaderStore((s) => s.goToPassage);
  const [copied, setCopied] = useState(false);

  const dailyVerse = getDailyVerse();

  const handleOpenInChapter = () => {
    goToPassage(dailyVerse.bookId, dailyVerse.chapter, dailyVerse.verse);
    onClose();
  };

  const handleCopy = async () => {
    const formatted = formatDailyVerseShare(dailyVerse);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(formatted);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.headerTitleGroup}>
            <Text style={[styles.dateText, { color: theme.colors.textMuted, fontFamily: 'Nunito_600SemiBold' }]}>
              {todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1)}
            </Text>
            <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' }]}>
              Versículo do Dia 📖
            </Text>
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Fechar versículo do dia"
          >
            <Ionicons name="close" size={26} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Theme Pill Badge */}
          <View style={[styles.themeBadge, { backgroundColor: theme.colors.primaryLight }]}>
            <Ionicons name="sparkles" size={14} color={theme.colors.primary} />
            <Text style={[styles.themeBadgeText, { color: theme.colors.primary, fontFamily: 'Nunito_700Bold' }]}>
              {dailyVerse.theme}
            </Text>
          </View>

          {/* Main Scripture Card */}
          <View
            style={[
              styles.scriptureCard,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={28} color={theme.colors.primary} style={styles.quoteIcon} />
            <Text style={[styles.scriptureText, { color: theme.colors.text, fontFamily: 'Nunito_600SemiBold' }]}>
              &ldquo;{dailyVerse.text}&rdquo;
            </Text>
            <Text style={[styles.referenceText, { color: theme.colors.primary, fontFamily: 'Nunito_800ExtraBold' }]}>
              — {dailyVerse.bookName} {dailyVerse.chapter}:{dailyVerse.verse}
            </Text>
          </View>

          {/* Devotional Reflection Card */}
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: theme.colors.cardPastelGreen, borderColor: '#A7F3D0' },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb-outline" size={20} color="#2E7D32" />
              <Text style={[styles.sectionTitle, { color: '#1B5E20', fontFamily: 'Nunito_700Bold' }]}>
                Reflexão Devocional
              </Text>
            </View>
            <Text style={[styles.sectionBody, { color: theme.colors.text, fontFamily: 'Nunito_400Regular' }]}>
              {dailyVerse.reflection}
            </Text>
          </View>

          {/* Daily Prayer Card */}
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: theme.colors.cardPastelBlue, borderColor: '#BAE6FD' },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="heart-outline" size={20} color="#0284C7" />
              <Text style={[styles.sectionTitle, { color: '#0369A1', fontFamily: 'Nunito_700Bold' }]}>
                Oração do Dia
              </Text>
            </View>
            <Text style={[styles.prayerBody, { color: theme.colors.text, fontFamily: 'Nunito_600SemiBold' }]}>
              &ldquo;{dailyVerse.prayer}&rdquo;
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.primaryAction, { backgroundColor: theme.colors.primary }]}
              onPress={handleOpenInChapter}
              accessibilityRole="button"
              accessibilityLabel={`Ler ${dailyVerse.bookName} capítulo ${dailyVerse.chapter} no leitor`}
            >
              <Ionicons name="book-outline" size={20} color="#FFFFFF" />
              <Text style={[styles.primaryActionText, { color: '#FFFFFF', fontFamily: 'Nunito_700Bold' }]}>
                Ler no Contexto ({dailyVerse.bookName} {dailyVerse.chapter})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryAction, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={handleCopy}
              accessibilityRole="button"
              accessibilityLabel="Copiar versículo e devocional para compartilhar"
            >
              <Ionicons name={copied ? 'checkmark-circle' : 'copy-outline'} size={18} color={copied ? '#2E7D32' : theme.colors.text} />
              <Text style={[styles.secondaryActionText, { color: copied ? '#2E7D32' : theme.colors.text, fontFamily: 'Nunito_600SemiBold' }]}>
                {copied ? 'Copiado para a área de transferência!' : 'Compartilhar / Copiar'}
              </Text>
            </TouchableOpacity>
          </View>
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
  headerTitleGroup: {
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 20,
    marginTop: 2,
  },
  closeButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  themeBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  themeBadgeText: {
    fontSize: 13,
  },
  scriptureCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  quoteIcon: {
    marginBottom: 8,
    opacity: 0.8,
  },
  scriptureText: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 12,
  },
  referenceText: {
    fontSize: 16,
    alignSelf: 'flex-end',
  },
  sectionCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
  },
  sectionBody: {
    fontSize: 15,
    lineHeight: 22,
  },
  prayerBody: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  actionsContainer: {
    gap: 10,
    marginTop: 8,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: 12,
    gap: 8,
  },
  primaryActionText: {
    fontSize: 15,
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  secondaryActionText: {
    fontSize: 14,
  },
});

