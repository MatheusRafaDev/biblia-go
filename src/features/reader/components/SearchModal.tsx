import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/shared/hooks/useTheme';
import { useVerseSearch } from '../hooks/useBibleReader';
import { useReaderStore } from '@/src/shared/stores/useReaderStore';
import { SearchVerseResult } from '@/src/shared/db/types';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SearchModal({ visible, onClose }: SearchModalProps) {
  const theme = useAppTheme();
  const [query, setQuery] = useState('');
  const goToPassage = useReaderStore((s) => s.goToPassage);

  const { data: results, isLoading, isFetching } = useVerseSearch(query);

  const handleSelectResult = (item: SearchVerseResult) => {
    goToPassage(item.book_id, item.chapter, item.verse);
    onClose();
  };

  const renderResultItem = ({ item }: { item: SearchVerseResult }) => (
    <TouchableOpacity
      style={[
        styles.resultCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={() => handleSelectResult(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.book_name} ${item.chapter}:${item.verse}. ${item.text}`}
    >
      <View style={styles.resultHeader}>
        <Text style={[styles.reference, { color: theme.colors.primary, fontFamily: 'Nunito_700Bold' }]}>
          {item.book_name} {item.chapter}:{item.verse}
        </Text>
        <View style={[styles.badge, { backgroundColor: theme.colors.primaryLight }]}>
          <Text style={[styles.badgeText, { color: theme.colors.primary, fontFamily: 'Nunito_700Bold' }]}>
            {item.book_abbrev}
          </Text>
        </View>
      </View>
      <Text
        style={[styles.verseText, { color: theme.colors.text, fontFamily: 'Nunito_400Regular' }]}
        numberOfLines={3}
      >
        {item.text}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <View style={[styles.searchBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Ionicons name="search" size={20} color={theme.colors.textMuted} style={styles.searchIcon} />
            <TextInput
              autoFocus
              placeholder="Buscar versículos (FTS5)... Ex: amor, princípio, luz"
              placeholderTextColor={theme.colors.textMuted}
              value={query}
              onChangeText={setQuery}
              style={[styles.searchInput, { color: theme.colors.text, fontFamily: 'Nunito_400Regular' }]}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => setQuery('')}
                accessibilityRole="button"
                accessibilityLabel="Limpar busca"
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Fechar busca"
            style={styles.cancelButton}
          >
            <Text style={[styles.cancelText, { color: theme.colors.primary, fontFamily: 'Nunito_700Bold' }]}>
              Fechar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {isLoading || isFetching ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.infoText, { color: theme.colors.textSecondary, fontFamily: 'Nunito_600SemiBold' }]}>
              Pesquisando no SQLite FTS5...
            </Text>
          </View>
        ) : query.trim().length < 2 ? (
          <View style={styles.centered}>
            <Ionicons name="book-outline" size={48} color={theme.colors.textMuted} />
            <Text style={[styles.infoTitle, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
              Busca Textual Offline
            </Text>
            <Text style={[styles.infoText, { color: theme.colors.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
              Digite pelo menos 2 letras para pesquisar rapidamente por palavras ou expressões em todos os livros da Bíblia.
            </Text>
          </View>
        ) : results && results.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderResultItem}
            contentContainerStyle={styles.listContainer}
            ListHeaderComponent={
              <Text style={[styles.resultsCount, { color: theme.colors.textMuted, fontFamily: 'Nunito_600SemiBold' }]}>
                {results.length} ocorrência{results.length > 1 ? 's' : ''} encontrada{results.length > 1 ? 's' : ''}
              </Text>
            }
          />
        ) : (
          <View style={styles.centered}>
            <Ionicons name="search-outline" size={48} color={theme.colors.textMuted} />
            <Text style={[styles.infoTitle, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
              Nenhum versículo encontrado
            </Text>
            <Text style={[styles.infoText, { color: theme.colors.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
              Tente buscar por termos sinônimos ou verifique a ortografia das palavras digitadas.
            </Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    minHeight: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    minHeight: 44,
  },
  clearButton: {
    padding: 4,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  cancelText: {
    fontSize: 15,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  infoTitle: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  resultsCount: {
    fontSize: 13,
    marginBottom: 8,
  },
  resultCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  reference: {
    fontSize: 15,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
  },
  verseText: {
    fontSize: 15,
    lineHeight: 22,
  },
});
