import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppTheme } from '@/src/shared/hooks/useTheme';
import { Card } from '@/src/shared/components/Card';
import { useReaderStore } from '@/src/shared/stores/useReaderStore';
import {
  useReadingPlans,
  useReadingPlanProgress,
  usePlanDayReadings,
  useToggleDayCompleted,
} from '../hooks/useReadingPlan';
import { ReadingNotificationService } from '../services/notificationService';
import { CANONICAL_BOOKS } from '@/src/shared/constants/books';

export function ReadingPlanScreen() {
  const theme = useAppTheme();
  const [activePlanId, setActivePlanId] = useState<string>('nt_90_days');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const goToPassage = useReaderStore((s) => s.goToPassage);

  const { data: plans } = useReadingPlans();
  const { data: progress } = useReadingPlanProgress(activePlanId);
  const { data: dayReadings, isLoading } = usePlanDayReadings(activePlanId);
  const toggleDayMutation = useToggleDayCompleted(activePlanId);

  const handleToggleReminder = async (val: boolean) => {
    setReminderEnabled(val);
    if (val) {
      await ReadingNotificationService.scheduleDailyReminder(8, 0);
    } else {
      await ReadingNotificationService.cancelDailyReminder();
    }
  };

  const handleOpenPassage = (passageRef: string) => {
    // Extract book name and chapter from passageRef, e.g. "Mateus 1-3" or "Salmos 23"
    const match = passageRef.match(/^(.+?)\s+(\d+)/);
    if (match) {
      const bookName = match[1].trim();
      const chapter = Number(match[2]);
      const foundBook = CANONICAL_BOOKS.find(
        (b) => b.name.toLowerCase() === bookName.toLowerCase() || b.abbrev.toLowerCase() === bookName.toLowerCase()
      );
      if (foundBook) {
        goToPassage(foundBook.id, chapter);
        router.push('/(tabs)');
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' }]}>
          Planos de Leitura
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Plan Switcher Tabs */}
        <View style={[styles.planTabs, { backgroundColor: theme.colors.surfaceMuted }]}>
          {plans?.map((plan) => {
            const isActive = plan.id === activePlanId;
            return (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planTabBtn,
                  isActive && [styles.planTabBtnActive, { backgroundColor: theme.colors.surface }],
                ]}
                onPress={() => setActivePlanId(plan.id)}
                accessibilityRole="tab"
                accessibilityLabel={plan.title}
              >
                <Text
                  style={[
                    styles.planTabText,
                    {
                      color: isActive ? theme.colors.primary : theme.colors.textMuted,
                      fontFamily: isActive ? 'Nunito_700Bold' : 'Nunito_600SemiBold',
                    },
                  ]}
                >
                  {plan.total_days} Dias
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Hero Progress & Streak Card */}
        <Card variant="pastelGreen" style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={[styles.heroPlanTitle, { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' }]}>
                {plans?.find((p) => p.id === activePlanId)?.title ?? 'Plano de Leitura'}
              </Text>
              <Text style={[styles.heroSub, { color: theme.colors.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
                {progress?.completedDays ?? 0} de {progress?.totalDays ?? 0} dias concluídos
              </Text>
            </View>

            {/* Streak Badge */}
            <View style={[styles.streakBadge, { backgroundColor: '#FFEDD5' }]}>
              <Text style={[styles.streakText, { color: '#C2410C', fontFamily: 'Nunito_700Bold' }]}>
                🔥 {progress?.streak ?? 0} dias
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={[styles.progressBarTrack, { backgroundColor: theme.colors.surface }]}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(progress?.percent ?? 0, 100)}%`, backgroundColor: theme.colors.primary },
              ]}
            />
          </View>
          <Text style={[styles.percentLabel, { color: theme.colors.textMuted, fontFamily: 'Nunito_700Bold' }]}>
            {progress?.percent ?? 0}% Concluído
          </Text>
        </Card>

        {/* Daily Reminder Card */}
        <Card variant="surface" style={styles.reminderCard}>
          <View style={styles.reminderInfo}>
            <Ionicons name="notifications-outline" size={24} color={theme.colors.primary} />
            <View style={styles.reminderTextGroup}>
              <Text style={[styles.reminderTitle, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                Lembrete Diário
              </Text>
              <Text style={[styles.reminderSub, { color: theme.colors.textMuted, fontFamily: 'Nunito_400Regular' }]}>
                Notificação todos os dias às 08:00
              </Text>
            </View>
          </View>

          <Switch
            value={reminderEnabled}
            onValueChange={handleToggleReminder}
            trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
            thumbColor={reminderEnabled ? theme.colors.primary : '#F4F3F4'}
            accessibilityLabel="Ativar lembrete diário de leitura"
          />
        </Card>

        {/* Days Checklist */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
          Cronograma de Leitura
        </Text>

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loading} />
        ) : (
          <View style={styles.daysList}>
            {dayReadings?.map((item) => {
              const isDone = item.is_completed === 1;
              return (
                <View
                  key={item.id}
                  style={[
                    styles.dayRow,
                    {
                      backgroundColor: isDone ? theme.colors.cardPastelGreen : theme.colors.surface,
                      borderColor: isDone ? '#A7F3D0' : theme.colors.border,
                    },
                  ]}
                >
                  {/* Left: Checkbox */}
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: isDone ? theme.colors.primary : 'transparent',
                        borderColor: isDone ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    onPress={() => toggleDayMutation.mutate(item.day_number)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isDone }}
                    accessibilityLabel={`Marcar dia ${item.day_number} como lido`}
                  >
                    {isDone && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                  </TouchableOpacity>

                  {/* Middle: Day info and Passage reference */}
                  <TouchableOpacity
                    style={styles.dayInfo}
                    onPress={() => handleOpenPassage(item.passage_reference)}
                    accessibilityRole="button"
                    accessibilityLabel={`Ler dia ${item.day_number}: ${item.passage_reference}`}
                  >
                    <Text style={[styles.dayBadge, { color: theme.colors.primary, fontFamily: 'Nunito_700Bold' }]}>
                      Dia {item.day_number}
                    </Text>
                    <Text
                      style={[
                        styles.passageName,
                        {
                          color: theme.colors.text,
                          fontFamily: 'Nunito_600SemiBold',
                          textDecorationLine: isDone ? 'line-through' : 'none',
                        },
                      ]}
                    >
                      {item.passage_reference}
                    </Text>
                  </TouchableOpacity>

                  {/* Right: Open in Reader arrow */}
                  <TouchableOpacity
                    style={styles.openBtn}
                    onPress={() => handleOpenPassage(item.passage_reference)}
                    accessibilityRole="button"
                    accessibilityLabel="Abrir no leitor"
                  >
                    <Ionicons name="book-outline" size={20} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
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
  planTabs: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  planTabBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planTabBtnActive: {
    elevation: 2,
  },
  planTabText: {
    fontSize: 14,
  },
  heroCard: {
    padding: 18,
    gap: 12,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroPlanTitle: {
    fontSize: 18,
  },
  heroSub: {
    fontSize: 13,
    marginTop: 2,
  },
  streakBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: {
    fontSize: 13,
  },
  progressBarTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  percentLabel: {
    fontSize: 12,
    textAlign: 'right',
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reminderTextGroup: {
    gap: 2,
  },
  reminderTitle: {
    fontSize: 15,
  },
  reminderSub: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 8,
  },
  loading: {
    marginVertical: 24,
  },
  daysList: {
    gap: 10,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 60,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dayInfo: {
    flex: 1,
  },
  dayBadge: {
    fontSize: 12,
  },
  passageName: {
    fontSize: 16,
    marginTop: 2,
  },
  openBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

