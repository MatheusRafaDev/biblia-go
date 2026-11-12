import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, useThemeStore } from '@/src/shared/hooks/useTheme';
import { useReaderStore } from '@/src/shared/stores/useReaderStore';

interface ReaderOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenAi: () => void;
  onOpenCloud: () => void;
  onCopyChapter: () => void;
}

export function ReaderOptionsModal({
  visible,
  onClose,
  onOpenAi,
  onOpenCloud,
  onCopyChapter,
}: ReaderOptionsModalProps) {
  const theme = useAppTheme();
  const themePreference = useThemeStore((s) => s.preference);
  const setThemePreference = useThemeStore((s) => s.setPreference);

  const fontSize = useReaderStore((s) => s.fontSize);
  const setFontSize = useReaderStore((s) => s.setFontSize);

  const handleDecreaseFont = () => {
    if (fontSize > 14) setFontSize(fontSize - 2);
  };

  const handleIncreaseFont = () => {
    if (fontSize < 28) setFontSize(fontSize + 2);
  };

  const handleToggleTheme = () => {
    const next = themePreference === 'dark' ? 'light' : 'dark';
    setThemePreference(next);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' }]}>
              Opções de Leitura
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Fechar opções">
              <Ionicons name="close" size={22} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Font Size Selector */}
          <View style={[styles.optionRow, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.rowLabelGroup}>
              <Ionicons name="text-outline" size={20} color={theme.colors.text} />
              <Text style={[styles.rowLabel, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                Tamanho do Texto
              </Text>
            </View>
            <View style={styles.stepperGroup}>
              <TouchableOpacity
                style={[styles.stepperBtn, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}
                onPress={handleDecreaseFont}
                disabled={fontSize <= 14}
                accessibilityLabel="Diminuir fonte"
              >
                <Ionicons name="remove" size={18} color={fontSize <= 14 ? theme.colors.textMuted : theme.colors.text} />
              </TouchableOpacity>
              <Text style={[styles.fontSizeLabel, { color: theme.colors.primary, fontFamily: 'Nunito_800ExtraBold' }]}>
                {fontSize}pt
              </Text>
              <TouchableOpacity
                style={[styles.stepperBtn, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}
                onPress={handleIncreaseFont}
                disabled={fontSize >= 28}
                accessibilityLabel="Aumentar fonte"
              >
                <Ionicons name="add" size={18} color={fontSize >= 28 ? theme.colors.textMuted : theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Theme Mode Toggle */}
          <TouchableOpacity
            style={[styles.optionRow, { borderBottomColor: theme.colors.border }]}
            onPress={handleToggleTheme}
            accessibilityRole="button"
            accessibilityLabel="Alternar tema escuro ou claro"
          >
            <View style={styles.rowLabelGroup}>
              <Ionicons
                name={theme.isDark ? 'sunny-outline' : 'moon-outline'}
                size={20}
                color={theme.isDark ? '#E57A00' : theme.colors.primary}
              />
              <Text style={[styles.rowLabel, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                Tema Visual
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: theme.colors.primaryLight }]}>
              <Text style={[styles.badgeText, { color: theme.colors.primary, fontFamily: 'Nunito_700Bold' }]}>
                {theme.isDark ? 'Modo Escuro' : 'Modo Claro'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Copy Chapter Action */}
          <TouchableOpacity
            style={[styles.optionRow, { borderBottomColor: theme.colors.border }]}
            onPress={() => {
              onClose();
              onCopyChapter();
            }}
            accessibilityRole="button"
            accessibilityLabel="Copiar todo o capítulo para a área de transferência"
          >
            <View style={styles.rowLabelGroup}>
              <Ionicons name="copy-outline" size={20} color={theme.colors.text} />
              <Text style={[styles.rowLabel, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                Copiar Capítulo Completo
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>

          {/* AI Assistant */}
          <TouchableOpacity
            style={[styles.optionRow, { borderBottomColor: theme.colors.border }]}
            onPress={() => {
              onClose();
              onOpenAi();
            }}
            accessibilityRole="button"
            accessibilityLabel="Abrir Assistente Bíblico IA"
          >
            <View style={styles.rowLabelGroup}>
              <Ionicons name="sparkles" size={20} color={theme.colors.primary} />
              <Text style={[styles.rowLabel, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                Assistente Bíblico com IA
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: theme.colors.cardPastelGreen }]}>
              <Text style={[styles.badgeText, { color: '#1B5E20', fontFamily: 'Nunito_700Bold' }]}>
                RAG Online
              </Text>
            </View>
          </TouchableOpacity>

          {/* Cloud Sync & Backup */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => {
              onClose();
              onOpenCloud();
            }}
            accessibilityRole="button"
            accessibilityLabel="Abrir Sincronização em Nuvem e Backup"
          >
            <View style={styles.rowLabelGroup}>
              <Ionicons name="cloud-done-outline" size={20} color="#2E7D32" />
              <Text style={[styles.rowLabel, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                Nuvem, Backup & Fila Offline
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
  },
  closeBtn: {
    padding: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLabel: {
    fontSize: 15,
  },
  stepperGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontSizeLabel: {
    fontSize: 15,
    minWidth: 42,
    textAlign: 'center',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
  },
});
