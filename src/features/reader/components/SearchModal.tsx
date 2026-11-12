import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/shared/hooks/useTheme';
import { useVerseSearch } from '../hooks/useBibleReader';
import { useReaderStore } from '@/src/shared/stores/useReaderStore';
import { SearchVerseResult } from '@/src/shared/db/types';
import { api } from '@/src/shared/api/client';
import { SemanticSearchResult } from '@/src/shared/api/types';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
}

const POPULAR_THEMES = [
  'Ansiedade',
  'Paz',
  'Esperança',
  'Perdão',
  'Fé',
  'Sabedoria',
  'Amor',
  'Gratidão',
  'Medo',
  'Consolo',
];

export function SearchModal({ visible, onClose }: SearchModalProps) {
  const theme = useAppTheme();
  const [searchMode, setSearchMode] = useState<'fts' | 'semantic'>('fts');
  const [query, setQuery] = useState('');
  const goToPassage = useReaderStore((s) => s.goToPassage);

  // FTS5 Local Search
  const { data: ftsResults, isLoading: isFtsLoading, isFetching: isFtsFetching } = useVerseSearch(
    searchMode === 'fts' ? query : ''
  );

  // Semantic AI Search State
  const [semanticResults, setSemanticResults] = useState<SemanticSearchResult[]>([]);
  const [isSemanticLoading, setIsSemanticLoading] = useState(false);
  const [semanticError, setSemanticError] = useState<string | null>(null);

  // Effect to trigger semantic search
  useEffect(() => {
    if (searchMode !== 'semantic' || query.trim().length < 2) return;

    const timer = setTimeout(async () => {
      setIsSemanticLoading(true);
      setSemanticError(null);
      try {
        const res = await api.semanticSearch(query.trim(), 15);
        setSemanticResults(res);
      } catch {
        setSemanticError(
          'Não foi possível conectar ao servidor Fastify para busca semântica. Verifique sua conexão ou use a aba FTS5 Offline.'
        );
      } finally {
        setIsSemanticLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, searchMode]);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (text.trim().length < 2) {
      setSemanticResults([]);
      setSemanticError(null);
    }
  };

  const handleClearQuery = () => {
    setQuery('');
    setSemanticResults([]);
    setSemanticError(null);
  };

  const handleSelectFts = (item: SearchVerseResult) => {
    goToPassage(item.book_id, item.chapter, item.verse);
    onClose();
  };

  const handleSelectSemantic = (item: SemanticSearchResult) => {
    goToPassage(item.bookId, item.chapter, item.verse);
    onClose();
  };

  const handleSelectThemePill = (themeName: string) => {
    setQuery(themeName);
  };

  const renderFtsItem = ({ item }: { item: SearchVerseResult }) => (
    <TouchableOpacity
      style={[
        styles.resultCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={() => handleSelectFts(item)}
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

  const renderSemanticItem = ({ item }: { item: SemanticSearchResult }) => (
    <TouchableOpacity
      style={[
        styles.resultCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={() => handleSelectSemantic(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.bookName} ${item.chapter}:${item.verse}. Relevância ${Math.round(
        item.similarityScore * 100
      )}%. ${item.text}`}
    >
      <View style={styles.resultHeader}>
        <Text style={[styles.reference, { color: theme.colors.primary, fontFamily: 'Nunito_700Bold' }]}>
          {item.bookName} {item.chapter}:{item.verse}
        </Text>
        <View style={[styles.scoreBadge, { backgroundColor: theme.colors.cardPastelGreen }]}>
          <Ionicons name="sparkles" size={12} color="#2E7D32" />
          <Text style={[styles.scoreBadgeText, { color: '#1B5E20', fontFamily: 'Nunito_700Bold' }]}>
            {Math.round(item.similarityScore * 100)}% relevância
          </Text>
        </View>
      </View>

      {item.themeTags && item.themeTags.length > 0 && (
        <View style={styles.tagsRow}>
          {item.themeTags.map((t, idx) => (
            <View
              key={idx}
              style={[styles.miniTag, { backgroundColor: theme.colors.primaryLight }]}
            >
              <Text style={[styles.miniTagText, { color: theme.colors.primary, fontFamily: 'Nunito_600SemiBold' }]}>
                #{t}
              </Text>
            </View>
          ))}
        </View>
      )}

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
        {/* Header Bar */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <View style={[styles.searchBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Ionicons name="search" size={20} color={theme.colors.textMuted} style={styles.searchIcon} />
            <TextInput
              autoFocus
              placeholder={
                searchMode === 'fts'
                  ? 'Buscar palavra exata (FTS5)... Ex: amor, princípio'
                  : 'Buscar por tema ou emoção... Ex: ansiedade, medo'
              }
              placeholderTextColor={theme.colors.textMuted}
              value={query}
              onChangeText={handleQueryChange}
              style={[styles.searchInput, { color: theme.colors.text, fontFamily: 'Nunito_400Regular' }]}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={handleClearQuery}
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

        {/* Mode Selector Tabs */}
        <View style={[styles.tabBar, { backgroundColor: theme.colors.surfaceMuted }]}>
          <TouchableOpacity
            style={[
              styles.tabItem,
              searchMode === 'fts' && [styles.tabItemActive, { backgroundColor: theme.colors.surface }],
            ]}
            onPress={() => setSearchMode('fts')}
            accessibilityRole="tab"
            accessibilityLabel="Busca textual offline SQLite FTS5"
          >
            <Ionicons
              name="flash-outline"
              size={16}
              color={searchMode === 'fts' ? theme.colors.primary : theme.colors.textMuted}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color: searchMode === 'fts' ? theme.colors.primary : theme.colors.textMuted,
                  fontFamily: searchMode === 'fts' ? 'Nunito_700Bold' : 'Nunito_600SemiBold',
                },
              ]}
            >
              FTS5 Offline (Palavra Exata)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              searchMode === 'semantic' && [styles.tabItemActive, { backgroundColor: theme.colors.surface }],
            ]}
            onPress={() => setSearchMode('semantic')}
            accessibilityRole="tab"
            accessibilityLabel="Busca semântica por temas e IA Fastify"
          >
            <Ionicons
              name="sparkles-outline"
              size={16}
              color={searchMode === 'semantic' ? theme.colors.primary : theme.colors.textMuted}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color: searchMode === 'semantic' ? theme.colors.primary : theme.colors.textMuted,
                  fontFamily: searchMode === 'semantic' ? 'Nunito_700Bold' : 'Nunito_600SemiBold',
                },
              ]}
            >
              Semântica & Temas (IA)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Popular Theme Pills for Semantic Mode */}
        {searchMode === 'semantic' && (
          <View style={styles.themesSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.themesScroll}
            >
              {POPULAR_THEMES.map((themeName) => (
                <TouchableOpacity
                  key={themeName}
                  style={[
                    styles.themePill,
                    {
                      backgroundColor:
                        query.toLowerCase() === themeName.toLowerCase()
                          ? theme.colors.primary
                          : theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => handleSelectThemePill(themeName)}
                  accessibilityRole="button"
                  accessibilityLabel={`Buscar tema ${themeName}`}
                >
                  <Text
                    style={[
                      styles.themePillText,
                      {
                        color:
                          query.toLowerCase() === themeName.toLowerCase()
                            ? '#FFFFFF'
                            : theme.colors.text,
                        fontFamily: 'Nunito_600SemiBold',
                      },
                    ]}
                  >
                    {themeName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Content based on Mode */}
        {searchMode === 'fts' ? (
          isFtsLoading || isFtsFetching ? (
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
          ) : ftsResults && ftsResults.length > 0 ? (
            <FlatList
              data={ftsResults}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderFtsItem}
              contentContainerStyle={styles.listContainer}
              ListHeaderComponent={
                <Text style={[styles.resultsCount, { color: theme.colors.textMuted, fontFamily: 'Nunito_600SemiBold' }]}>
                  {ftsResults.length} ocorrência{ftsResults.length > 1 ? 's' : ''} encontrada{ftsResults.length > 1 ? 's' : ''}
                </Text>
              }
            />
          ) : (
            <View style={styles.centered}>
              <Ionicons name="alert-circle-outline" size={48} color={theme.colors.textMuted} />
              <Text style={[styles.infoTitle, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                Nenhum versículo encontrado
              </Text>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
                Tente buscar por termos mais genéricos ou verifique se a tradução foi baixada offline.
              </Text>
            </View>
          )
        ) : (
          /* Semantic Mode Content */
          isSemanticLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.infoText, { color: theme.colors.textSecondary, fontFamily: 'Nunito_600SemiBold' }]}>
                Pesquisando temas semânticos no servidor Fastify...
              </Text>
            </View>
          ) : semanticError ? (
            <View style={styles.centered}>
              <Ionicons name="cloud-offline-outline" size={48} color="#D85A38" />
              <Text style={[styles.infoTitle, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                Servidor Offline
              </Text>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
                {semanticError}
              </Text>
            </View>
          ) : query.trim().length < 2 ? (
            <View style={styles.centered}>
              <Ionicons name="sparkles-outline" size={48} color={theme.colors.primary} />
              <Text style={[styles.infoTitle, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                Busca Semântica por Conceitos
              </Text>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
                Selecione um dos temas populares acima ou digite uma situação de vida (ex: ansiedade, luto, casamento, perseverança) para encontrar versículos temáticos.
              </Text>
            </View>
          ) : semanticResults.length > 0 ? (
            <FlatList
              data={semanticResults}
              keyExtractor={(item) => `${item.bookId}-${item.chapter}-${item.verse}`}
              renderItem={renderSemanticItem}
              contentContainerStyle={styles.listContainer}
              ListHeaderComponent={
                <Text style={[styles.resultsCount, { color: theme.colors.textMuted, fontFamily: 'Nunito_600SemiBold' }]}>
                  {semanticResults.length} passagem{semanticResults.length > 1 ? 'ns' : ''} relevante{semanticResults.length > 1 ? 's' : ''} encontrada{semanticResults.length > 1 ? 's' : ''}
                </Text>
              }
            />
          ) : (
            <View style={styles.centered}>
              <Ionicons name="help-circle-outline" size={48} color={theme.colors.textMuted} />
              <Text style={[styles.infoTitle, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                Nenhum tema localizado
              </Text>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
                Tente palavras-chave como ansiedade, fé, esperança, perdão ou amor.
              </Text>
            </View>
          )
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
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    minHeight: 40,
  },
  clearButton: {
    padding: 4,
  },
  cancelButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  cancelText: {
    fontSize: 16,
  },
  tabBar: {
    flexDirection: 'row',
    padding: 4,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    borderRadius: 10,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    borderRadius: 8,
    gap: 6,
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
  themesSection: {
    paddingBottom: 8,
  },
  themesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  themePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  themePillText: {
    fontSize: 13,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  resultsCount: {
    fontSize: 13,
    marginBottom: 8,
  },
  resultCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: 11,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scoreBadgeText: {
    fontSize: 11,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  miniTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  miniTagText: {
    fontSize: 11,
  },
  verseText: {
    fontSize: 15,
    lineHeight: 22,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  infoTitle: {
    fontSize: 18,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
