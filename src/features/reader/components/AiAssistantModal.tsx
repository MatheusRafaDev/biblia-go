import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/shared/hooks/useTheme';
import { Card } from '@/src/shared/components/Card';
import { useReaderStore } from '@/src/shared/stores/useReaderStore';
import { api } from '@/src/shared/api/client';
import { RagChatResponse } from '@/src/shared/api/types';

interface AiAssistantModalProps {
  visible: boolean;
  onClose: () => void;
}

const SUGGESTIONS = [
  'Como lidar com a ansiedade segundo a Bíblia?',
  'O que é ter fé segundo as Escrituras?',
  'Qual o propósito do perdão entre irmãos?',
  'O que a Bíblia ensina sobre a providência divina?',
];

export function AiAssistantModal({ visible, onClose }: AiAssistantModalProps) {
  const theme = useAppTheme();
  const goToPassage = useReaderStore((s) => s.goToPassage);

  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<RagChatResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAsk = async (queryText = question) => {
    if (!queryText.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.askAiAssistant(queryText.trim());
      setResponse(res);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Falha ao consultar o assistente bíblico Fastify'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCitation = (bookId: number, chapter: number, verse: number) => {
    goToPassage(bookId, chapter, verse);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.headerInfo}>
            <View style={styles.badgeRow}>
              <Ionicons name="sparkles" size={18} color={theme.colors.primary} />
              <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' }]}>
                Assistente Bíblico RAG
              </Text>
            </View>
            <Text style={[styles.headerSub, { color: theme.colors.textMuted, fontFamily: 'Nunito_400Regular' }]}>
              Respostas com fundamentação e citação estrita de versículos
            </Text>
          </View>

          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Fechar assistente"
          >
            <Ionicons name="close" size={26} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Question Input */}
          <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <TextInput
              placeholder="Pergunte sobre um tema ou passagem bíblica..."
              placeholderTextColor={theme.colors.textMuted}
              value={question}
              onChangeText={setQuestion}
              style={[styles.input, { color: theme.colors.text, fontFamily: 'Nunito_400Regular' }]}
              multiline
            />

            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => handleAsk()}
              disabled={isLoading || !question.trim()}
              accessibilityRole="button"
              accessibilityLabel="Enviar pergunta ao assistente"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          {/* Quick Suggestions Chips */}
          <View style={styles.suggestionsGroup}>
            <Text style={[styles.suggestionsLabel, { color: theme.colors.textMuted, fontFamily: 'Nunito_600SemiBold' }]}>
              Sugestões de Estudo:
            </Text>
            <View style={styles.suggestionsRow}>
              {SUGGESTIONS.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.suggestionChip, { backgroundColor: theme.colors.surfaceMuted }]}
                  onPress={() => {
                    setQuestion(s);
                    handleAsk(s);
                  }}
                  accessibilityRole="button"
                >
                  <Text style={[styles.suggestionText, { color: theme.colors.text, fontFamily: 'Nunito_600SemiBold' }]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Error Message */}
          {errorMessage && (
            <Card variant="pastelCoral" style={styles.errorCard}>
              <Text style={[styles.errorText, { color: '#D85A38', fontFamily: 'Nunito_600SemiBold' }]}>
                {errorMessage}
              </Text>
            </Card>
          )}

          {/* Response Display */}
          {response && (
            <View style={styles.responseSection}>
              <Card variant="surface" style={styles.answerCard}>
                <View style={styles.answerHeader}>
                  <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.colors.primary} />
                  <Text style={[styles.answerHeaderTitle, { color: theme.colors.primary, fontFamily: 'Nunito_700Bold' }]}>
                    Explicação Teológica & Pastoral
                  </Text>
                </View>
                <Text style={[styles.answerBody, { color: theme.colors.text, fontFamily: 'Nunito_400Regular' }]}>
                  {response.answer}
                </Text>
              </Card>

              {/* Citations */}
              <Text style={[styles.citationsTitle, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                Versículos Citados como Fonte
              </Text>

              {response.citations.map((c, idx) => (
                <Card key={idx} variant="pastelBlue" style={styles.citationCard}>
                  <View style={styles.citationHeader}>
                    <Text style={[styles.citationRef, { color: theme.colors.primary, fontFamily: 'Nunito_800ExtraBold' }]}>
                      {c.bookName} {c.chapter}:{c.verse}
                    </Text>
                    <TouchableOpacity
                      style={[styles.openCitationBtn, { backgroundColor: theme.colors.primary }]}
                      onPress={() => handleOpenCitation(c.bookId, c.chapter, c.verse)}
                      accessibilityRole="button"
                      accessibilityLabel={`Ler ${c.bookName} ${c.chapter}:${c.verse} no leitor`}
                    >
                      <Text style={[styles.openCitationText, { color: '#FFFFFF', fontFamily: 'Nunito_700Bold' }]}>
                        Ver no Leitor
                      </Text>
                      <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.citationText, { color: theme.colors.text, fontFamily: 'Nunito_400Regular' }]}>
                    {`"${c.text}"`}
                  </Text>
                </Card>
              ))}
            </View>
          )}
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
  headerInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 18,
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    minHeight: 80,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    minHeight: 56,
    textAlignVertical: 'top',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionsGroup: {
    gap: 8,
  },
  suggestionsLabel: {
    fontSize: 13,
  },
  suggestionsRow: {
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  suggestionText: {
    fontSize: 13,
  },
  errorCard: {
    padding: 14,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 14,
  },
  responseSection: {
    gap: 14,
    marginTop: 6,
  },
  answerCard: {
    padding: 18,
    borderRadius: 16,
    gap: 10,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  answerHeaderTitle: {
    fontSize: 15,
  },
  answerBody: {
    fontSize: 15,
    lineHeight: 24,
  },
  citationsTitle: {
    fontSize: 16,
    marginTop: 4,
  },
  citationCard: {
    padding: 16,
    borderRadius: 14,
    gap: 8,
  },
  citationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  citationRef: {
    fontSize: 15,
  },
  openCitationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    minHeight: 34,
    borderRadius: 17,
  },
  openCitationText: {
    fontSize: 12,
  },
  citationText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
});
