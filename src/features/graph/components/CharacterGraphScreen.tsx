import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Modal,
} from 'react-native';
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
  const [zoomLevel, setZoomLevel] = useState(1);

  const filteredCharacters = THEOGRAPHIC_CHARACTERS.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

                return (
                  <G key={edge.id}>
                    <Line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={theme.isDark ? '#4F4B72' : '#C7C2DD'}
                      strokeWidth={3}
                      strokeDasharray="4 4"
                    />
                  </G>
                );
              })}

              {/* Nodes */}
              {THEOGRAPHIC_CHARACTERS.map((node) => {
                const isMatch = filteredCharacters.some((c) => c.id === node.id);
                return (
                  <G
                    key={node.id}
                    onPress={() => setSelectedCharacter(node)}
                    opacity={isMatch ? 1 : 0.25}
                  >
                    <Circle
                      cx={node.x}
                      cy={node.y}
                      r={32}
                      fill={node.color}
                      stroke={theme.isDark ? '#FFFFFF' : '#26244A'}
                      strokeWidth={node.id === 'jesus' ? 3 : 1.5}
                    />
                    <SvgText
                      x={node.x}
                      y={node.y + 4}
                      fill="#1E1C38"
                      fontSize={13}
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {node.name.length > 8 ? node.name.slice(0, 7) + '.' : node.name}
                    </SvgText>
                  </G>
                );
              })}
            </Svg>
          </View>
        </ScrollView>
      </ScrollView>

      {/* Character Details Modal */}
      {selectedCharacter && (
        <Modal
          visible={Boolean(selectedCharacter)}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setSelectedCharacter(null)}
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.modalHeaderInfo}>
                <Text style={[styles.modalName, { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' }]}>
                  {selectedCharacter.name}
                </Text>
                <Text style={[styles.modalTitle, { color: theme.colors.primary, fontFamily: 'Nunito_700Bold' }]}>
                  {selectedCharacter.title}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setSelectedCharacter(null)}
                style={styles.closeBtn}
                accessibilityRole="button"
                accessibilityLabel="Fechar detalhes do personagem"
              >
                <Ionicons name="close" size={26} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Bio Card */}
              <Card variant="surface" style={styles.bioCard}>
                <Text style={[styles.bioLabel, { color: theme.colors.textMuted, fontFamily: 'Nunito_700Bold' }]}>
                  HISTÓRIA & SIGNIFICADO
                </Text>
                <Text style={[styles.bioText, { color: theme.colors.text, fontFamily: 'Nunito_400Regular' }]}>
                  {selectedCharacter.bio}
                </Text>
              </Card>

              {/* Related Key Verses */}
              <Text style={[styles.versesSectionTitle, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                Passagens Bíblicas Relacionadas
              </Text>

              {selectedCharacter.keyVerses.map((v, i) => (
                <Card key={i} variant="pastelBlue" style={styles.verseCard}>
                  <View style={styles.verseCardHeader}>
                    <Text style={[styles.verseRef, { color: theme.colors.primary, fontFamily: 'Nunito_700Bold' }]}>
                      {v.bookName} {v.chapter}:{v.verse}
                    </Text>
                    <TouchableOpacity
                      style={[styles.readVerseBtn, { backgroundColor: theme.colors.primary }]}
                      onPress={() => handleOpenVerseInReader(v.bookId, v.chapter, v.verse)}
                      accessibilityRole="button"
                      accessibilityLabel={`Ler ${v.bookName} ${v.chapter}:${v.verse} no leitor`}
                    >
                      <Text style={[styles.readVerseText, { color: '#FFFFFF', fontFamily: 'Nunito_700Bold' }]}>
                        Ler no Leitor
                      </Text>
                      <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.verseQuote, { color: theme.colors.text, fontFamily: 'Nunito_400Regular' }]}>
                    {`"${v.text}"`}
                  </Text>
                </Card>
              ))}
            </ScrollView>
          </SafeAreaView>
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
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 10,
    minHeight: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  canvasContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  canvasWrapper: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalHeaderInfo: {
    flex: 1,
  },
  modalName: {
    fontSize: 24,
  },
  modalTitle: {
    fontSize: 15,
    marginTop: 2,
  },
  closeBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  bioCard: {
    padding: 18,
    gap: 8,
  },
  bioLabel: {
    fontSize: 12,
  },
  bioText: {
    fontSize: 15,
    lineHeight: 24,
  },
  versesSectionTitle: {
    fontSize: 17,
    marginTop: 6,
  },
  verseCard: {
    padding: 16,
    gap: 10,
  },
  verseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verseRef: {
    fontSize: 15,
  },
  readVerseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    minHeight: 38,
    borderRadius: 19,
  },
  readVerseText: {
    fontSize: 13,
  },
  verseQuote: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
});
