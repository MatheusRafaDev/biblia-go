import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/shared/hooks/useTheme';
import { Card } from '@/src/shared/components/Card';
import { QUIZ_QUESTIONS, QuizQuestion } from '../data/questions';
import { useQuizStats, useQuizHistory, useSaveQuizResult } from '../hooks/useQuiz';
import { calculateQuizPoints, getRankTitle, QuizDifficulty } from '../utils/quizScoring';

type QuizMode = 'home' | 'playing' | 'result';

export function QuizScreen() {
  const theme = useAppTheme();
  const [mode, setMode] = useState<QuizMode>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  // Game state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);

  const { data: stats } = useQuizStats();
  const { data: history } = useQuizHistory();
  const saveResultMutation = useSaveQuizResult();

  const activeQuestions: QuizQuestion[] =
    selectedCategory === 'todos'
      ? QUIZ_QUESTIONS
      : QUIZ_QUESTIONS.filter((q) => q.category === selectedCategory);

  const currentQuestion = activeQuestions[currentQuestionIndex] ?? activeQuestions[0];

  const handleStartGame = (category: string) => {
    setSelectedCategory(category);
    setCurrentQuestionIndex(0);
    setSelectedAnswerIndex(null);
    setScore(0);
    setCorrectCount(0);
    setCurrentStreak(0);
    setIsAnswered(false);
    setMode('playing');
  };

  const handleSelectAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswerIndex(index);
    setIsAnswered(true);

    if (index === currentQuestion.correctIndex) {
      const nextStreak = currentStreak + 1;
      const pts = calculateQuizPoints({
        basePoints: 10,
        difficulty: (currentQuestion.difficulty as QuizDifficulty) || 'facil',
        currentStreak: nextStreak,
        timeSpentSeconds: 5,
      });
      setScore((prev) => prev + pts.totalPoints);
      setCurrentStreak(nextStreak);
      setCorrectCount((prev) => prev + 1);
    } else {
      setCurrentStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < activeQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswerIndex(null);
      setIsAnswered(false);
    } else {
      // Game ended
      saveResultMutation.mutate({
        category: selectedCategory,
        score,
        totalQuestions: activeQuestions.length,
      });
      setMode('result');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' }]}>
          Quiz Bíblico
        </Text>
      </View>

      {mode === 'home' && (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stats Card */}
          <Card variant="pastelYellow" style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="trophy-outline" size={26} color="#B78103" />
                <Text style={[styles.statValue, { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' }]}>
                  {stats?.highestScore ?? 0} pts
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted, fontFamily: 'Nunito_600SemiBold' }]}>
                  Recorde
                </Text>
              </View>

              <View style={styles.statItem}>
                <Ionicons name="game-controller-outline" size={26} color={theme.colors.primary} />
                <Text style={[styles.statValue, { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' }]}>
                  {stats?.totalGames ?? 0}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted, fontFamily: 'Nunito_600SemiBold' }]}>
                  Partidas
                </Text>
              </View>

              <View style={styles.statItem}>
                <Ionicons name="analytics-outline" size={26} color="#2E7D32" />
                <Text style={[styles.statValue, { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' }]}>
                  {stats?.averagePercent ?? 0}%
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted, fontFamily: 'Nunito_600SemiBold' }]}>
                  Média de Acertos
                </Text>
              </View>
            </View>
          </Card>

          {/* Rank Title & Mastery Card */}
          <Card variant="pastelBlue" style={styles.rankCard}>
            <View style={styles.rankRow}>
              <Ionicons name="ribbon-outline" size={30} color={theme.colors.primary} />
              <View style={styles.rankTextGroup}>
                <Text style={[styles.rankTitle, { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' }]}>
                  Nível Bíblico: {getRankTitle(stats?.highestScore ?? 0)}
                </Text>
                <Text style={[styles.rankSub, { color: theme.colors.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
                  {stats?.totalGames
                    ? `${stats.totalGames} partidas concluídas • Recorde: ${stats.highestScore} pts`
                    : 'Complete quizzes para desbloquear patamares de conhecimento bíblico!'}
                </Text>
              </View>
            </View>
          </Card>

          {/* Categories Section */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
            Escolha uma Categoria
          </Text>

          <View style={styles.categoriesGrid}>
            <TouchableOpacity
              style={[styles.categoryCard, { backgroundColor: theme.colors.cardPastelBlue, borderColor: theme.colors.border }]}
              onPress={() => handleStartGame('todos')}
              accessibilityRole="button"
              accessibilityLabel="Jogar todas as perguntas"
            >
              <Ionicons name="library-outline" size={32} color={theme.colors.primary} />
              <Text style={[styles.categoryTitle, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                Geral (Toda a Bíblia)
              </Text>
              <Text style={[styles.categorySub, { color: theme.colors.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
                {QUIZ_QUESTIONS.length} perguntas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryCard, { backgroundColor: theme.colors.cardPastelYellow, borderColor: theme.colors.border }]}
              onPress={() => handleStartGame('antigo_testamento')}
              accessibilityRole="button"
              accessibilityLabel="Jogar perguntas do Antigo Testamento"
            >
              <Ionicons name="document-text-outline" size={32} color="#B78103" />
              <Text style={[styles.categoryTitle, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                Antigo Testamento
              </Text>
              <Text style={[styles.categorySub, { color: theme.colors.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
                Criação, Êxodo, Reis
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryCard, { backgroundColor: theme.colors.cardPastelGreen, borderColor: theme.colors.border }]}
              onPress={() => handleStartGame('novo_testamento')}
              accessibilityRole="button"
              accessibilityLabel="Jogar perguntas do Novo Testamento"
            >
              <Ionicons name="heart-outline" size={32} color="#2E7D32" />
              <Text style={[styles.categoryTitle, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                Novo Testamento
              </Text>
              <Text style={[styles.categorySub, { color: theme.colors.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
                Evangelhos e Atos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryCard, { backgroundColor: theme.colors.cardPastelCoral, borderColor: theme.colors.border }]}
              onPress={() => handleStartGame('personagens')}
              accessibilityRole="button"
              accessibilityLabel="Jogar perguntas de Personagens"
            >
              <Ionicons name="people-outline" size={32} color="#D85A38" />
              <Text style={[styles.categoryTitle, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                Personagens Bíblicos
              </Text>
              <Text style={[styles.categorySub, { color: theme.colors.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
                Moisés, Davi, Paulo
              </Text>
            </TouchableOpacity>
          </View>

          {/* Recent Games History */}
          {history && history.length > 0 && (
            <View style={styles.historySection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                Histórico Recente
              </Text>
              <View style={styles.historyList}>
                {history.slice(0, 5).map((h) => (
                  <View
                    key={h.id}
                    style={[styles.historyRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                  >
                    <View>
                      <Text style={[styles.historyCategory, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                        {h.category.replace('_', ' ').toUpperCase()}
                      </Text>
                      <Text style={[styles.historyDate, { color: theme.colors.textMuted, fontFamily: 'Nunito_400Regular' }]}>
                        {h.played_at ? new Date(h.played_at).toLocaleDateString('pt-BR') : 'Hoje'}
                      </Text>
                    </View>
                    <View style={[styles.scoreBadge, { backgroundColor: theme.colors.primaryLight }]}>
                      <Text style={[styles.scoreBadgeText, { color: theme.colors.primary, fontFamily: 'Nunito_700Bold' }]}>
                        {h.score} / {h.total_questions}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {mode === 'playing' && currentQuestion && (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header indicator */}
          <View style={styles.gameTopBar}>
            <TouchableOpacity
              onPress={() => setMode('home')}
              style={styles.exitButton}
              accessibilityRole="button"
              accessibilityLabel="Sair do quiz"
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>

            <Text style={[styles.questionCounter, { color: theme.colors.primary, fontFamily: 'Nunito_700Bold' }]}>
              Pergunta {currentQuestionIndex + 1} de {activeQuestions.length}
            </Text>

            <View style={[styles.currentScoreBadge, { backgroundColor: theme.colors.primaryLight }]}>
              <Text style={[styles.currentScoreText, { color: theme.colors.primary, fontFamily: 'Nunito_700Bold' }]}>
                {score} pts
              </Text>
            </View>
          </View>

          {/* Streak bonus banner */}
          {currentStreak >= 2 && (
            <View style={[styles.streakBanner, { backgroundColor: '#FEF8E7', borderColor: '#F59E0B' }]}>
              <Ionicons name="flame" size={20} color="#D97706" />
              <Text style={[styles.streakBannerText, { color: '#B45309', fontFamily: 'Nunito_700Bold' }]}>
                Sequência de {currentStreak} acertos seguidos! Multiplicador de bônus ativo 🔥
              </Text>
            </View>
          )}

          {/* Question Card */}
          <Card variant="surface" style={styles.questionCard}>
            <Text style={[styles.questionText, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
              {currentQuestion.question}
            </Text>
          </Card>

          {/* Options */}
          <View style={styles.optionsList}>
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswerIndex === idx;
              const isCorrect = idx === currentQuestion.correctIndex;

              let bgColor = theme.colors.surface;
              let borderColor = theme.colors.border;

              if (isAnswered) {
                if (isCorrect) {
                  bgColor = theme.colors.cardPastelGreen;
                  borderColor = '#2E7D32';
                } else if (isSelected) {
                  bgColor = theme.colors.cardPastelCoral;
                  borderColor = '#D85A38';
                }
              }

              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.optionButton, { backgroundColor: bgColor, borderColor }]}
                  onPress={() => handleSelectAnswer(idx)}
                  disabled={isAnswered}
                  accessibilityRole="button"
                  accessibilityLabel={`Opção ${idx + 1}: ${option}`}
                >
                  <View style={[styles.optionLetter, { backgroundColor: theme.colors.surfaceMuted }]}>
                    <Text style={[styles.letterText, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                      {String.fromCharCode(65 + idx)}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, { color: theme.colors.text, fontFamily: 'Nunito_600SemiBold' }]}>
                    {option}
                  </Text>
                  {isAnswered && isCorrect && (
                    <Ionicons name="checkmark-circle" size={22} color="#2E7D32" style={styles.feedbackIcon} />
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <Ionicons name="close-circle" size={22} color="#D85A38" style={styles.feedbackIcon} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Explanation Banner */}
          {isAnswered && (
            <Card variant="pastelBlue" style={styles.explanationCard}>
              <View style={styles.expHeader}>
                <Ionicons name="book-outline" size={18} color={theme.colors.primary} />
                <Text style={[styles.expRef, { color: theme.colors.primary, fontFamily: 'Nunito_700Bold' }]}>
                  {currentQuestion.reference}
                </Text>
              </View>
              <Text style={[styles.expText, { color: theme.colors.text, fontFamily: 'Nunito_400Regular' }]}>
                {currentQuestion.explanation}
              </Text>
            </Card>
          )}

          {/* Next Button */}
          {isAnswered && (
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleNextQuestion}
              accessibilityRole="button"
              accessibilityLabel="Avançar para a próxima pergunta"
            >
              <Text style={[styles.nextButtonText, { color: '#FFFFFF', fontFamily: 'Nunito_700Bold' }]}>
                {currentQuestionIndex + 1 === activeQuestions.length ? 'Ver Resultado' : 'Próxima Pergunta'}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {mode === 'result' && (
        <View style={styles.resultContainer}>
          <Card variant="pastelYellow" style={styles.resultCard}>
            <Ionicons name="trophy" size={60} color="#B78103" />
            <Text style={[styles.resultTitle, { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' }]}>
              {getRankTitle(score)}
            </Text>
            <Text style={[styles.resultScore, { color: theme.colors.primary, fontFamily: 'Nunito_800ExtraBold' }]}>
              {score} Pontos
            </Text>
            <Text style={[styles.resultSub, { color: theme.colors.textSecondary, fontFamily: 'Nunito_600SemiBold' }]}>
              {correctCount} de {activeQuestions.length} perguntas corretas ({Math.round((correctCount / activeQuestions.length) * 100)}%)
            </Text>

            <TouchableOpacity
              style={[styles.replayButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setMode('home')}
              accessibilityRole="button"
              accessibilityLabel="Voltar ao início do quiz"
            >
              <Ionicons name="reload" size={18} color="#FFFFFF" />
              <Text style={[styles.replayText, { color: '#FFFFFF', fontFamily: 'Nunito_700Bold' }]}>
                Jogar Novamente
              </Text>
            </TouchableOpacity>
          </Card>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  statsCard: {
    padding: 16,
  },
  rankCard: {
    padding: 14,
    borderRadius: 14,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankTextGroup: {
    flex: 1,
    gap: 2,
  },
  rankTitle: {
    fontSize: 15,
  },
  rankSub: {
    fontSize: 12,
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  streakBannerText: {
    fontSize: 13,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 6,
  },
  categoriesGrid: {
    gap: 12,
  },
  categoryCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 80,
    justifyContent: 'center',
    gap: 4,
  },
  categoryTitle: {
    fontSize: 17,
  },
  categorySub: {
    fontSize: 13,
  },
  historySection: {
    marginTop: 10,
    gap: 10,
  },
  historyList: {
    gap: 8,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  historyCategory: {
    fontSize: 14,
  },
  historyDate: {
    fontSize: 12,
    marginTop: 2,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreBadgeText: {
    fontSize: 13,
  },
  gameTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  exitButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionCounter: {
    fontSize: 15,
  },
  currentScoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentScoreText: {
    fontSize: 13,
  },
  questionCard: {
    padding: 20,
    borderRadius: 16,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
  },
  optionsList: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    minHeight: 56,
    gap: 12,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: {
    fontSize: 14,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  feedbackIcon: {
    marginLeft: 6,
  },
  explanationCard: {
    padding: 16,
    borderRadius: 14,
    gap: 6,
  },
  expHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expRef: {
    fontSize: 14,
  },
  expText: {
    fontSize: 14,
    lineHeight: 20,
  },
  nextButton: {
    flexDirection: 'row',
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  nextButtonText: {
    fontSize: 16,
  },
  resultContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultCard: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    padding: 28,
    gap: 12,
  },
  resultTitle: {
    fontSize: 24,
    marginTop: 8,
  },
  resultScore: {
    fontSize: 36,
  },
  resultSub: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  replayButton: {
    flexDirection: 'row',
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    marginTop: 12,
    width: '100%',
  },
  replayText: {
    fontSize: 16,
  },
});
