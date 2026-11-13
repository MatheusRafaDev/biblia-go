import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppTheme } from '@/src/shared/hooks/useTheme';
import { Card } from '@/src/shared/components/Card';
import { useReaderStore } from '@/src/shared/stores/useReaderStore';
import {
  THEOGRAPHIC_CHARACTERS,
  THEOGRAPHIC_EDGES,
  CharacterNode,
} from '../data/theographicData';
import { CharacterIllustration } from './CharacterIllustration';

export function CharacterGraphScreen() {
  const theme = useAppTheme();
  const goToPassage = useReaderStore((s) => s.goToPassage);

  const [viewMode, setViewMode] = useState<'graph' | 'gallery'>('graph');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTestament, setSelectedTestament] = useState<'ALL' | 'OT' | 'NT'>('ALL');
  const [zoomLevel, setZoomLevel] = useState(1);

  const filteredCharacters = THEOGRAPHIC_CHARACTERS.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.era && c.era.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.symbolLabel && c.symbolLabel.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTestament =
      selectedTestament === 'ALL' || c.testament === selectedTestament;
    return matchesSearch && matchesTestament;
  });

  const activeIds = new Set(filteredCharacters.map((c) => c.id));

  const nodesMap = new Map<string, CharacterNode>(
    THEOGRAPHIC_CHARACTERS.map((c) => [c.id, c])
  );

  const handleOpenVerseInReader = (bookId: number, chapter: number, verse: number) => {
    setSelectedCharacter(null);
    goToPassage(bookId, chapter, verse);
    router.push('/(tabs)');
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 1.6));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.7));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <View style={styles.headerTitleGroup}>
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' }]}>
            Genealogias & Personagens
          </Text>
          <Text style={[styles.sub, { color: theme.colors.textMuted, fontFamily: 'Nunito_400Regular' }]}>
            Linhagem Theographic ilustrada de Adão a Jesus Cristo
          </Text>
        </View>

        {/* Zoom Controls (only shown in graph mode) */}
        {viewMode === 'graph' && (
          <View style={styles.zoomGroup}>
            <TouchableOpacity
              style={[styles.zoomBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={handleZoomOut}
              accessibilityRole="button"
              accessibilityLabel="Diminuir zoom do grafo"
            >
              <Ionicons name="remove" size={20} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.zoomBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={handleZoomIn}
              accessibilityRole="button"
              accessibilityLabel="Aumentar zoom do grafo"
            >
              <Ionicons name="add" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Mode Switcher: Grafo vs Galeria Ilustrada */}
      <View style={[styles.modeSwitcherContainer, { backgroundColor: theme.colors.surfaceMuted }]}>
        <TouchableOpacity
          style={[
            styles.modeSwitchBtn,
            viewMode === 'graph' && [styles.modeSwitchBtnActive, { backgroundColor: theme.colors.surface }],
          ]}
          onPress={() => setViewMode('graph')}
          accessibilityRole="button"
          accessibilityLabel="Visualizar árvore genealógica em grafo"
        >
          <Ionicons
            name="git-network-outline"
            size={18}
            color={viewMode === 'graph' ? theme.colors.primary : theme.colors.textMuted}
          />
          <Text
            style={[
              styles.modeSwitchText,
              {
                color: viewMode === 'graph' ? theme.colors.text : theme.colors.textMuted,
                fontFamily: viewMode === 'graph' ? 'Nunito_700Bold' : 'Nunito_600SemiBold',
              },
            ]}
          >
            Árvore & Grafo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeSwitchBtn,
            viewMode === 'gallery' && [styles.modeSwitchBtnActive, { backgroundColor: theme.colors.surface }],
          ]}
          onPress={() => setViewMode('gallery')}
          accessibilityRole="button"
          accessibilityLabel="Visualizar galeria de ilustrações"
        >
          <Ionicons
            name="images-outline"
            size={18}
            color={viewMode === 'gallery' ? theme.colors.primary : theme.colors.textMuted}
          />
          <Text
            style={[
              styles.modeSwitchText,
              {
                color: viewMode === 'gallery' ? theme.colors.text : theme.colors.textMuted,
                fontFamily: viewMode === 'gallery' ? 'Nunito_700Bold' : 'Nunito_600SemiBold',
              },
            ]}
          >
            Galeria Ilustrada ({filteredCharacters.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Ionicons name="search" size={20} color={theme.colors.textMuted} style={styles.searchIcon} />
        <TextInput
          placeholder="Buscar personagem, época ou símbolo..."
          placeholderTextColor={theme.colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchInput, { color: theme.colors.text, fontFamily: 'Nunito_400Regular' }]}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityRole="button" accessibilityLabel="Limpar busca">
            <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Testament Filter Chips */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedTestament === 'ALL' && [styles.filterChipActive, { backgroundColor: theme.colors.primary }],
            { borderColor: theme.colors.border },
          ]}
          onPress={() => setSelectedTestament('ALL')}
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.filterChipText,
              { color: selectedTestament === 'ALL' ? '#FFFFFF' : theme.colors.text, fontFamily: 'Nunito_700Bold' },
            ]}
          >
            Todos ({THEOGRAPHIC_CHARACTERS.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedTestament === 'OT' && [styles.filterChipActive, { backgroundColor: theme.colors.primary }],
            { borderColor: theme.colors.border },
          ]}
          onPress={() => setSelectedTestament('OT')}
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.filterChipText,
              { color: selectedTestament === 'OT' ? '#FFFFFF' : theme.colors.text, fontFamily: 'Nunito_700Bold' },
            ]}
          >
            Antigo Testamento (10)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedTestament === 'NT' && [styles.filterChipActive, { backgroundColor: theme.colors.primary }],
            { borderColor: theme.colors.border },
          ]}
          onPress={() => setSelectedTestament('NT')}
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.filterChipText,
              { color: selectedTestament === 'NT' ? '#FFFFFF' : theme.colors.text, fontFamily: 'Nunito_700Bold' },
            ]}
          >
            Novo Testamento (1)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content: Graph vs Gallery */}
      {viewMode === 'graph' ? (
        /* Interactive Illustrated Canvas Graph */
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.canvasContainer}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={[styles.canvasWrapper, { transform: [{ scale: zoomLevel }] }]}>
              {/* Connecting Edges Layer */}
              <Svg width={400} height={1280} style={StyleSheet.absoluteFill}>
                {THEOGRAPHIC_EDGES.map((edge) => {
                  const sourceNode = nodesMap.get(edge.source);
                  const targetNode = nodesMap.get(edge.target);
                  if (!sourceNode || !targetNode) return null;

                  const isEdgeActive = activeIds.has(edge.source) && activeIds.has(edge.target);

                  return (
                    <Line
                      key={edge.id}
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={
                        isEdgeActive
                          ? theme.isDark
                            ? '#60A5FA'
                            : '#3B6EF5'
                          : theme.isDark
                          ? '#334155'
                          : '#E2E8F0'
                      }
                      strokeWidth={isEdgeActive ? 3 : 1.5}
                      strokeDasharray={edge.relationship === 'irmao_de' ? '4,4' : undefined}
                      opacity={isEdgeActive ? 0.9 : 0.25}
                    />
                  );
                })}
              </Svg>

              {/* Illustrated Character Nodes */}
              {THEOGRAPHIC_CHARACTERS.map((node) => {
                const isMatch = activeIds.has(node.id);
                return (
                  <TouchableOpacity
                    key={node.id}
                    style={[
                      styles.nodeContainer,
                      {
                        left: node.x - 38,
                        top: node.y - 38,
                        opacity: isMatch ? 1 : 0.2,
                      },
                    ]}
                    onPress={() => setSelectedCharacter(node)}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir detalhes de ${node.name}`}
                  >
                    <View
                      style={[
                        styles.nodeAvatarWrapper,
                        {
                          borderColor: node.color,
                          backgroundColor: theme.colors.surface,
                          shadowColor: theme.isDark ? '#000000' : '#1E293B',
                        },
                      ]}
                    >
                      <CharacterIllustration id={node.id} size={54} />
                    </View>

                    {/* Character Name Tag */}
                    <View
                      style={[
                        styles.nodeTag,
                        {
                          backgroundColor: theme.colors.surface,
                          borderColor: theme.colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.nodeName,
                          {
                            color: theme.colors.text,
                            fontFamily: 'Nunito_800ExtraBold',
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {node.name}
                      </Text>
                      {node.era && (
                        <Text
                          style={[
                            styles.nodeEraText,
                            {
                              color: theme.colors.textMuted,
                              fontFamily: 'Nunito_600SemiBold',
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {node.era}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </ScrollView>
      ) : (
        /* Illustrated Characters Gallery */
        <ScrollView
          style={styles.galleryScroll}
          contentContainerStyle={styles.galleryContainer}
          showsVerticalScrollIndicator={false}
        >
          {filteredCharacters.map((char) => (
            <Card
              key={char.id}
              variant="surface"
              style={styles.galleryCard}
            >
              <View style={styles.galleryCardHeader}>
                {/* Big Illustration */}
                <View
                  style={[
                    styles.galleryIllustrationWrapper,
                    {
                      borderColor: char.color,
                      backgroundColor: theme.isDark ? '#1E293B' : '#F8FAFC',
                    },
                  ]}
                >
                  <CharacterIllustration id={char.id} size={82} />
                </View>

                {/* Character Info */}
                <View style={styles.galleryCardInfo}>
                  <View style={styles.galleryBadgeRow}>
                    <View
                      style={[
                        styles.pillBadge,
                        {
                          backgroundColor:
                            char.testament === 'NT'
                              ? theme.colors.cardPastelBlue
                              : theme.colors.cardPastelYellow,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.pillBadgeText,
                          {
                            color:
                              char.testament === 'NT'
                                ? theme.colors.primary
                                : '#B45309',
                            fontFamily: 'Nunito_700Bold',
                          },
                        ]}
                      >
                        {char.testament === 'NT' ? 'Novo Testamento' : 'Antigo Testamento'}
                      </Text>
                    </View>

                    {char.era && (
                      <View style={[styles.pillBadge, { backgroundColor: theme.colors.surfaceMuted }]}>
                        <Text style={[styles.pillBadgeText, { color: theme.colors.textSecondary, fontFamily: 'Nunito_600SemiBold' }]}>
                          {char.era}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.galleryCardName,
                      { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' },
                    ]}
                  >
                    {char.name}
                  </Text>
                  <Text
                    style={[
                      styles.galleryCardTitle,
                      { color: theme.colors.primary, fontFamily: 'Nunito_700Bold' },
                    ]}
                  >
                    {char.title}
                  </Text>

                  {char.symbolLabel && (
                    <View style={styles.symbolLabelRow}>
                      <Ionicons name="sparkles" size={14} color="#F59E0B" />
                      <Text
                        style={[
                          styles.symbolLabelText,
                          { color: theme.colors.textMuted, fontFamily: 'Nunito_600SemiBold' },
                        ]}
                      >
                        {char.symbolLabel}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <Text
                style={[
                  styles.galleryBio,
                  { color: theme.colors.text, fontFamily: 'Nunito_400Regular' },
                ]}
                numberOfLines={3}
              >
                {char.bio}
              </Text>

              {/* Action Buttons */}
              <View style={styles.galleryActionRow}>
                <TouchableOpacity
                  style={[
                    styles.galleryActionBtn,
                    {
                      backgroundColor: theme.colors.surfaceMuted,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => setSelectedCharacter(char)}
                  accessibilityRole="button"
                  accessibilityLabel={`Ver genealogia e versículos de ${char.name}`}
                >
                  <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} />
                  <Text
                    style={[
                      styles.galleryActionBtnText,
                      { color: theme.colors.primary, fontFamily: 'Nunito_700Bold' },
                    ]}
                  >
                    Ver Detalhes & Genealogia
                  </Text>
                </TouchableOpacity>

                {char.keyVerses[0] && (
                  <TouchableOpacity
                    style={[
                      styles.galleryReadBtn,
                      { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={() =>
                      handleOpenVerseInReader(
                        char.keyVerses[0].bookId,
                        char.keyVerses[0].chapter,
                        char.keyVerses[0].verse
                      )
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Ler versículo de ${char.name}`}
                  >
                    <Ionicons name="book-outline" size={16} color="#FFFFFF" />
                    <Text
                      style={[
                        styles.galleryReadBtnText,
                        { color: '#FFFFFF', fontFamily: 'Nunito_700Bold' },
                      ]}
                    >
                      Ler Versículo
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          ))}
        </ScrollView>
      )}

      {/* Detail Modal with Hero Illustration */}
      {selectedCharacter && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedCharacter(null)}
        >
          <View style={styles.modalOverlay}>
            <Card variant="surface" style={styles.modalCard}>
              {/* Modal Close Button */}
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedCharacter(null)}
                accessibilityRole="button"
                accessibilityLabel="Fechar detalhes"
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>

              {/* Hero Illustrated Banner */}
              <View style={styles.modalHeroBanner}>
                <View
                  style={[
                    styles.modalIllustrationFrame,
                    {
                      borderColor: selectedCharacter.color,
                      backgroundColor: theme.isDark ? '#1E293B' : '#F1F5F9',
                    },
                  ]}
                >
                  <CharacterIllustration id={selectedCharacter.id} size={106} />
                </View>

                <View style={styles.modalBadges}>
                  <View
                    style={[
                      styles.pillBadge,
                      {
                        backgroundColor:
                          selectedCharacter.testament === 'NT'
                            ? theme.colors.cardPastelBlue
                            : theme.colors.cardPastelYellow,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillBadgeText,
                        {
                          color:
                            selectedCharacter.testament === 'NT'
                              ? theme.colors.primary
                              : '#B45309',
                          fontFamily: 'Nunito_700Bold',
                        },
                      ]}
                    >
                      {selectedCharacter.testament === 'NT' ? 'Novo Testamento' : 'Antigo Testamento'}
                    </Text>
                  </View>
                  {selectedCharacter.era && (
                    <View style={[styles.pillBadge, { backgroundColor: theme.colors.surfaceMuted }]}>
                      <Text style={[styles.pillBadgeText, { color: theme.colors.textSecondary, fontFamily: 'Nunito_600SemiBold' }]}>
                        {selectedCharacter.era}
                      </Text>
                    </View>
                  )}
                </View>

                <Text
                  style={[
                    styles.modalTitle,
                    { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' },
                  ]}
                >
                  {selectedCharacter.name}
                </Text>
                <Text
                  style={[
                    styles.modalSub,
                    { color: theme.colors.primary, fontFamily: 'Nunito_700Bold' },
                  ]}
                >
                  {selectedCharacter.title}
                </Text>

                {selectedCharacter.symbolLabel && (
                  <View style={styles.symbolLabelRow}>
                    <Ionicons name="sparkles" size={15} color="#F59E0B" />
                    <Text
                      style={[
                        styles.modalSymbolText,
                        { color: theme.colors.textMuted, fontFamily: 'Nunito_600SemiBold' },
                      ]}
                    >
                      {selectedCharacter.symbolLabel}
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.modalBio,
                  { color: theme.colors.text, fontFamily: 'Nunito_400Regular' },
                ]}
              >
                {selectedCharacter.bio}
              </Text>

              {/* Key Verses */}
              <Text
                style={[
                  styles.versesTitle,
                  { color: theme.colors.text, fontFamily: 'Nunito_700Bold' },
                ]}
              >
                Versículos Chave:
              </Text>

              <ScrollView style={styles.versesScroll}>
                {selectedCharacter.keyVerses.map((v) => (
                  <TouchableOpacity
                    key={`${v.bookId}-${v.chapter}-${v.verse}`}
                    style={[
                      styles.verseItem,
                      {
                        backgroundColor: theme.colors.surfaceMuted,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={() => handleOpenVerseInReader(v.bookId, v.chapter, v.verse)}
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir ${v.bookName} ${v.chapter}:${v.verse} no leitor`}
                  >
                    <View style={styles.verseRefRow}>
                      <Text
                        style={[
                          styles.verseRef,
                          { color: theme.colors.primary, fontFamily: 'Nunito_700Bold' },
                        ]}
                      >
                        {v.bookName} {v.chapter}:{v.verse}
                      </Text>
                      <Ionicons name="open-outline" size={16} color={theme.colors.primary} />
                    </View>
                    <Text
                      style={[
                        styles.verseQuote,
                        { color: theme.colors.text, fontFamily: 'Nunito_400Regular' },
                      ]}
                    >
                      &ldquo;{v.text}&rdquo;
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Card>
          </View>
        </Modal>
      )}
    </SafeAreaView>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitleGroup: {
    flex: 1,
  },
  title: {
    fontSize: 20,
  },
  sub: {
    fontSize: 12,
    marginTop: 2,
  },
  zoomGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  zoomBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeSwitcherContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    padding: 4,
    borderRadius: 12,
  },
  modeSwitchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  modeSwitchBtnActive: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modeSwitchText: {
    fontSize: 13,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 6,
    paddingHorizontal: 12,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipActive: {
    borderWidth: 0,
  },
  filterChipText: {
    fontSize: 12,
  },
  canvasContainer: {
    padding: 16,
    alignItems: 'center',
  },
  canvasWrapper: {
    width: 400,
    height: 1280,
    position: 'relative',
  },
  nodeContainer: {
    position: 'absolute',
    width: 76,
    alignItems: 'center',
  },
  nodeAvatarWrapper: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  nodeTag: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    maxWidth: 90,
  },
  nodeName: {
    fontSize: 11,
    textAlign: 'center',
  },
  nodeEraText: {
    fontSize: 9,
    textAlign: 'center',
  },
  galleryScroll: {
    flex: 1,
  },
  galleryContainer: {
    padding: 16,
    gap: 14,
  },
  galleryCard: {
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  galleryCardHeader: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  galleryIllustrationWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryCardInfo: {
    flex: 1,
    gap: 2,
  },
  galleryBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  pillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pillBadgeText: {
    fontSize: 10,
  },
  galleryCardName: {
    fontSize: 18,
  },
  galleryCardTitle: {
    fontSize: 13,
  },
  symbolLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  symbolLabelText: {
    fontSize: 12,
  },
  galleryBio: {
    fontSize: 14,
    lineHeight: 20,
  },
  galleryActionRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  galleryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  galleryActionBtnText: {
    fontSize: 12,
  },
  galleryReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 4,
  },
  galleryReadBtnText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxHeight: '85%',
    padding: 20,
    borderRadius: 20,
    position: 'relative',
    gap: 12,
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 10,
    padding: 6,
  },
  modalHeroBanner: {
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  modalIllustrationFrame: {
    width: 114,
    height: 114,
    borderRadius: 57,
    borderWidth: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  modalBadges: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 4,
  },
  modalTitle: {
    fontSize: 24,
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalSymbolText: {
    fontSize: 13,
  },
  modalBio: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  versesTitle: {
    fontSize: 15,
    marginTop: 4,
  },
  versesScroll: {
    maxHeight: 180,
  },
  verseItem: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    gap: 6,
  },
  verseRefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verseRef: {
    fontSize: 14,
  },
  verseQuote: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
