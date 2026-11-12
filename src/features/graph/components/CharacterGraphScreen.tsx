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
import Svg, { Line, Circle, Text as SvgText, G } from 'react-native-svg';
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

export function CharacterGraphScreen() {
  const theme = useAppTheme();
  const goToPassage = useReaderStore((s) => s.goToPassage);

  const [selectedCharacter, setSelectedCharacter] = useState<CharacterNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTestament, setSelectedTestament] = useState<'ALL' | 'OT' | 'NT'>('ALL');
  const [zoomLevel, setZoomLevel] = useState(1);

  const filteredCharacters = THEOGRAPHIC_CHARACTERS.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase());
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
            Grafo Theographic de Adão a Jesus Cristo
          </Text>
        </View>

        {/* Zoom Controls */}
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
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Ionicons name="search" size={20} color={theme.colors.textMuted} style={styles.searchIcon} />
        <TextInput
          placeholder="Buscar personagem (ex: Abraão, Davi, Moisés)..."
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
            Antigo Testamento
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
            Novo Testamento
          </Text>
        </TouchableOpacity>
      </View>

      {/* Interactive SVG Canvas */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.canvasContainer}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[styles.canvasWrapper, { transform: [{ scale: zoomLevel }] }]}>
            <Svg width={400} height={1280}>
              {/* Edges */}
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
                    stroke={isEdgeActive ? (theme.isDark ? '#60A5FA' : '#3B6EF5') : (theme.isDark ? '#334155' : '#E2E8F0')}
                    strokeWidth={isEdgeActive ? 2.5 : 1}
                    strokeDasharray={edge.relationship === 'irmao_de' ? '4,4' : undefined}
                    opacity={isEdgeActive ? 0.9 : 0.25}
                  />
                );
              })}

              {/* Nodes */}
              {THEOGRAPHIC_CHARACTERS.map((node) => {
                const isMatch = activeIds.has(node.id);
                return (
                  <G
                    key={node.id}
                    onPress={() => setSelectedCharacter(node)}
                    opacity={isMatch ? 1 : 0.25}
                  >
                    <Circle
                      cx={node.x}
                      cy={node.y}
                      r={isMatch ? 28 : 22}
                      fill={node.color}
                      stroke={theme.colors.surface}
                      strokeWidth={3}
                    />
                    <SvgText
                      x={node.x}
                      y={node.y + 5}
                      fontSize={11}
                      fontWeight="bold"
                      fill="#26244A"
                      textAnchor="middle"
                    >
                      {node.name}
                    </SvgText>
                  </G>
                );
              })}
            </Svg>
          </View>
        </ScrollView>
      </ScrollView>

      {/* Detail Modal */}
      {selectedCharacter && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedCharacter(null)}
        >
          <View style={styles.modalOverlay}>
            <Card variant="surface" style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleGroup}>
                  <Text style={[styles.modalTitle, { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' }]}>
                    {selectedCharacter.name}
                  </Text>
                  <Text style={[styles.modalSub, { color: theme.colors.primary, fontFamily: 'Nunito_700Bold' }]}>
                    {selectedCharacter.title}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedCharacter(null)}
                  accessibilityRole="button"
                  accessibilityLabel="Fechar detalhes"
                >
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalBio, { color: theme.colors.text, fontFamily: 'Nunito_400Regular' }]}>
                {selectedCharacter.bio}
              </Text>

              {/* Key Verses */}
              <Text style={[styles.versesTitle, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                Versículos Chave:
              </Text>

              <ScrollView style={styles.versesScroll}>
                {selectedCharacter.keyVerses.map((v) => (
                  <TouchableOpacity
                    key={`${v.bookId}-${v.chapter}-${v.verse}`}
                    style={[styles.verseItem, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}
                    onPress={() => handleOpenVerseInReader(v.bookId, v.chapter, v.verse)}
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir ${v.bookName} ${v.chapter}:${v.verse} no leitor`}
                  >
                    <View style={styles.verseRefRow}>
                      <Text style={[styles.verseRef, { color: theme.colors.primary, fontFamily: 'Nunito_700Bold' }]}>
                        {v.bookName} {v.chapter}:{v.verse}
                      </Text>
                      <Ionicons name="open-outline" size={16} color={theme.colors.primary} />
                    </View>
                    <Text style={[styles.verseQuote, { color: theme.colors.text, fontFamily: 'Nunito_400Regular' }]}>
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxHeight: '80%',
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  modalTitleGroup: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 22,
  },
  modalSub: {
    fontSize: 14,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBio: {
    fontSize: 15,
    lineHeight: 22,
  },
  versesTitle: {
    fontSize: 15,
    marginTop: 8,
  },
  versesScroll: {
    maxHeight: 200,
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
