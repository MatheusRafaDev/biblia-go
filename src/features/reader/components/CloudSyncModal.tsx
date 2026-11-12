import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/shared/hooks/useTheme';
import { useAuthStore } from '@/src/shared/stores/useAuthStore';
import {
  useDatabase,
  useFavoritesRepository,
  useReadingPlanRepository,
} from '@/src/shared/db/client';
import { api } from '@/src/shared/api/client';
import {
  exportLocalUserData,
  validateBackupData,
  importLocalUserData,
} from '@/src/shared/utils/backupManager';
import { offlineQueue } from '@/src/shared/api/offlineQueue';

interface CloudSyncModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CloudSyncModal({ visible, onClose }: CloudSyncModalProps) {
  const theme = useAppTheme();
  const { db } = useDatabase();
  const { user, isAuthenticated, setUser, logout, lastSyncedAt, setLastSyncedAt } = useAuthStore();
  const favRepo = useFavoritesRepository();
  const planRepo = useReadingPlanRepository();

  const [activeSection, setActiveSection] = useState<'cloud' | 'local'>('cloud');

  // Cloud Auth & Sync state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Local Backup & Queue state
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportBox, setShowImportBox] = useState(false);
  const [backupJsonInput, setBackupJsonInput] = useState('');
  const [queueCount, setQueueCount] = useState(offlineQueue.length);

  const handleAuth = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3333/api';

    try {
      if (authMode === 'register') {
        const res = await fetch(`${baseUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro no cadastro');
        setUser(data.user, data.token);
        setSuccessMessage('Conta criada com sucesso!');
      } else {
        const res = await fetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Email ou senha incorretos');
        setUser(data.user, data.token);
        setSuccessMessage('Login realizado com sucesso!');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Falha na conexão com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncNow = async () => {
    if (!user) return;
    setIsSyncing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // 1. Gather local SQLite data
      const localFavs = await favRepo.getFavorites();
      const localPlanDays = await planRepo.getDayReadings('nt_90_days');

      // 2. Send to Fastify sync endpoint
      const result = await api.syncCloudProgress({
        userId: user.id,
        lastSyncedAt: lastSyncedAt ?? new Date().toISOString(),
        favorites: localFavs.map((f) => ({
          translationId: f.translation_id,
          bookId: f.book_id,
          chapter: f.chapter,
          verse: f.verse,
          highlightColor: f.highlight_color,
          note: f.note,
        })),
        readingProgress: localPlanDays.map((d) => ({
          planId: d.plan_id,
          dayNumber: d.day_number,
          isCompleted: d.is_completed === 1,
        })),
      });

      setLastSyncedAt(result.syncedAt);
      setSuccessMessage('Progresso e favoritos sincronizados com sucesso na nuvem!');
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Falha ao sincronizar com o servidor Fastify'
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportBackup = async () => {
    if (!db) {
      setErrorMessage('Banco SQLite local ainda não inicializado.');
      return;
    }
    setIsExporting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const backup = await exportLocalUserData(db);
      const jsonString = JSON.stringify(backup, null, 2);
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(jsonString);
      }
      setSuccessMessage(
        `Backup exportado com sucesso! (${backup.favorites.length} favoritos, ${backup.readingProgress.length} dias de plano, ${backup.quizScores.length} pontuações de quiz). O JSON foi copiado para a área de transferência.`
      );
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Falha ao exportar backup local.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportBackup = async () => {
    if (!db) {
      setErrorMessage('Banco SQLite local ainda não inicializado.');
      return;
    }
    if (!backupJsonInput.trim()) {
      setErrorMessage('Cole o conteúdo JSON do backup para importar.');
      return;
    }
    setIsImporting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const parsed = JSON.parse(backupJsonInput.trim());
      const validated = validateBackupData(parsed);
      const summary = await importLocalUserData(db, validated);
      setSuccessMessage(
        `Backup restaurado com sucesso! ${summary.favoritesImported} favoritos, ${summary.progressImported} dias de leitura e ${summary.quizScoresImported} recordes de quiz importados.`
      );
      setBackupJsonInput('');
      setShowImportBox(false);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? `Erro ao restaurar backup: ${err.message}`
          : 'Formato de backup JSON inválido.'
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleDrainQueue = async () => {
    if (offlineQueue.length === 0) return;
    setIsSyncing(true);
    try {
      const result = await offlineQueue.drain(async (_item) => true);
      setQueueCount(offlineQueue.length);
      setSuccessMessage(
        `Fila processada: ${result.succeeded} sincronizados, ${result.remaining} restantes.`
      );
    } catch {
      setErrorMessage('Falha ao processar fila offline.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearQueue = () => {
    offlineQueue.clear();
    setQueueCount(0);
    setSuccessMessage('Fila offline descartada com sucesso.');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' }]}>
            Central de Dados & Nuvem
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Fechar sincronização"
          >
            <Ionicons name="close" size={26} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Section Switcher Tabs */}
        <View style={[styles.sectionTabs, { backgroundColor: theme.colors.surfaceMuted }]}>
          <TouchableOpacity
            style={[
              styles.sectionTab,
              activeSection === 'cloud' && [styles.sectionTabActive, { backgroundColor: theme.colors.surface }],
            ]}
            onPress={() => {
              setActiveSection('cloud');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            accessibilityRole="tab"
          >
            <Ionicons
              name="cloud-outline"
              size={18}
              color={activeSection === 'cloud' ? theme.colors.primary : theme.colors.textMuted}
            />
            <Text
              style={[
                styles.sectionTabText,
                {
                  color: activeSection === 'cloud' ? theme.colors.primary : theme.colors.textMuted,
                  fontFamily: activeSection === 'cloud' ? 'Nunito_700Bold' : 'Nunito_600SemiBold',
                },
              ]}
            >
              Nuvem Fastify
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sectionTab,
              activeSection === 'local' && [styles.sectionTabActive, { backgroundColor: theme.colors.surface }],
            ]}
            onPress={() => {
              setActiveSection('local');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            accessibilityRole="tab"
          >
            <Ionicons
              name="file-tray-full-outline"
              size={18}
              color={activeSection === 'local' ? theme.colors.primary : theme.colors.textMuted}
            />
            <Text
              style={[
                styles.sectionTabText,
                {
                  color: activeSection === 'local' ? theme.colors.primary : theme.colors.textMuted,
                  fontFamily: activeSection === 'local' ? 'Nunito_700Bold' : 'Nunito_600SemiBold',
                },
              ]}
            >
              Backup & Offline
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Feedback messages */}
          {successMessage && (
            <View style={[styles.messageBanner, { backgroundColor: theme.colors.cardPastelGreen, borderColor: '#A7F3D0' }]}>
              <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
              <Text style={[styles.successText, { color: '#1B5E20', fontFamily: 'Nunito_600SemiBold' }]}>
                {successMessage}
              </Text>
            </View>
          )}

          {errorMessage && (
            <View style={[styles.messageBanner, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
              <Ionicons name="alert-circle" size={18} color="#D85A38" />
              <Text style={[styles.errorText, { color: '#B91C1C', fontFamily: 'Nunito_600SemiBold' }]}>
                {errorMessage}
              </Text>
            </View>
          )}

          {activeSection === 'cloud' ? (
            isAuthenticated && user ? (
              /* Logged in state */
              <View style={styles.loggedContainer}>
                <View
                  style={[
                    styles.profileCard,
                    { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                  ]}
                >
                  <View style={[styles.avatarCircle, { backgroundColor: theme.colors.primaryLight }]}>
                    <Text style={[styles.avatarInitials, { color: theme.colors.primary, fontFamily: 'Nunito_800ExtraBold' }]}>
                      {user.name.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.profileText}>
                    <Text style={[styles.profileName, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                      {user.name}
                    </Text>
                    <Text style={[styles.profileEmail, { color: theme.colors.textMuted, fontFamily: 'Nunito_400Regular' }]}>
                      {user.email}
                    </Text>
                  </View>
                </View>

                {/* Sync Status Box */}
                <View
                  style={[
                    styles.syncBox,
                    { backgroundColor: theme.colors.cardPastelGreen, borderColor: '#A7F3D0' },
                  ]}
                >
                  <Ionicons name="cloud-done-outline" size={28} color="#2E7D32" />
                  <View style={styles.syncTextGroup}>
                    <Text style={[styles.syncStatusTitle, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                      Servidor Fastify Conectado
                    </Text>
                    <Text style={[styles.syncStatusSub, { color: theme.colors.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
                      {lastSyncedAt
                        ? `Última sincronização: ${new Date(lastSyncedAt).toLocaleTimeString('pt-BR')}`
                        : 'Nenhuma sincronização realizada nesta sessão.'}
                    </Text>
                  </View>
                </View>

                {/* Sync Button */}
                <TouchableOpacity
                  style={[styles.syncNowBtn, { backgroundColor: theme.colors.primary }]}
                  onPress={handleSyncNow}
                  disabled={isSyncing}
                  accessibilityRole="button"
                  accessibilityLabel="Sincronizar agora"
                >
                  {isSyncing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="sync-outline" size={20} color="#FFFFFF" />
                      <Text style={[styles.syncNowText, { color: '#FFFFFF', fontFamily: 'Nunito_700Bold' }]}>
                        Sincronizar Agora (Fastify / SQLite)
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Logout */}
                <TouchableOpacity
                  style={[styles.logoutBtn, { borderColor: theme.colors.border }]}
                  onPress={logout}
                  accessibilityRole="button"
                  accessibilityLabel="Sair da conta"
                >
                  <Text style={[styles.logoutText, { color: theme.colors.textMuted, fontFamily: 'Nunito_600SemiBold' }]}>
                    Desconectar Conta
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Authentication form */
              <View style={styles.authContainer}>
                <View style={[styles.tabSelector, { backgroundColor: theme.colors.surfaceMuted }]}>
                  <TouchableOpacity
                    style={[styles.tabBtn, authMode === 'login' && [styles.tabBtnActive, { backgroundColor: theme.colors.surface }]]}
                    onPress={() => setAuthMode('login')}
                    accessibilityRole="tab"
                  >
                    <Text
                      style={[
                        styles.tabBtnText,
                        {
                          color: authMode === 'login' ? theme.colors.primary : theme.colors.textMuted,
                          fontFamily: authMode === 'login' ? 'Nunito_700Bold' : 'Nunito_600SemiBold',
                        },
                      ]}
                    >
                      Entrar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.tabBtn, authMode === 'register' && [styles.tabBtnActive, { backgroundColor: theme.colors.surface }]]}
                    onPress={() => setAuthMode('register')}
                    accessibilityRole="tab"
                  >
                    <Text
                      style={[
                        styles.tabBtnText,
                        {
                          color: authMode === 'register' ? theme.colors.primary : theme.colors.textMuted,
                          fontFamily: authMode === 'register' ? 'Nunito_700Bold' : 'Nunito_600SemiBold',
                        },
                      ]}
                    >
                      Criar Conta
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.formSub, { color: theme.colors.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
                  Sincronize seus versículos favoritos, anotações de estudo e progresso de leitura entre dispositivos através do back-end Fastify.
                </Text>

                {authMode === 'register' && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                      Nome Completo
                    </Text>
                    <TextInput
                      placeholder="Seu nome..."
                      placeholderTextColor={theme.colors.textMuted}
                      value={name}
                      onChangeText={setName}
                      style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                    />
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                    Email
                  </Text>
                  <TextInput
                    placeholder="exemplo@email.com"
                    placeholderTextColor={theme.colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                    Senha
                  </Text>
                  <TextInput
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor={theme.colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: theme.colors.primary }]}
                  onPress={handleAuth}
                  disabled={isLoading}
                  accessibilityRole="button"
                  accessibilityLabel={authMode === 'login' ? 'Entrar' : 'Criar conta'}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={[styles.submitText, { color: '#FFFFFF', fontFamily: 'Nunito_700Bold' }]}>
                      {authMode === 'login' ? 'Entrar com JWT' : 'Cadastrar Usuário'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )
          ) : (
            /* Local Backup & Offline Queue Section */
            <View style={styles.localContainer}>
              {/* Backup Local Box */}
              <View
                style={[
                  styles.backupCard,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
              >
                <View style={styles.cardHeaderRow}>
                  <Ionicons name="save-outline" size={22} color={theme.colors.primary} />
                  <Text style={[styles.cardTitle, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                    Backup Local em JSON
                  </Text>
                </View>

                <Text style={[styles.cardDesc, { color: theme.colors.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
                  Exporte ou restaure todos os seus dados locais do SQLite (favoritos, destaques coloridos, anotações de estudo, progresso de leitura e recordes do quiz) em formato JSON validado com Zod.
                </Text>

                <View style={styles.backupActions}>
                  <TouchableOpacity
                    style={[styles.backupBtn, { backgroundColor: theme.colors.primary }]}
                    onPress={handleExportBackup}
                    disabled={isExporting}
                    accessibilityRole="button"
                    accessibilityLabel="Exportar dados locais para JSON"
                  >
                    {isExporting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="download-outline" size={18} color="#FFFFFF" />
                        <Text style={[styles.backupBtnText, { color: '#FFFFFF', fontFamily: 'Nunito_700Bold' }]}>
                          Exportar Backup (Copiar JSON)
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.backupBtnSecondary, { borderColor: theme.colors.border }]}
                    onPress={() => setShowImportBox(!showImportBox)}
                    accessibilityRole="button"
                    accessibilityLabel="Restaurar dados locais a partir de JSON"
                  >
                    <Ionicons name="refresh-circle-outline" size={20} color={theme.colors.text} />
                    <Text style={[styles.backupBtnSecondaryText, { color: theme.colors.text, fontFamily: 'Nunito_600SemiBold' }]}>
                      {showImportBox ? 'Cancelar Restauração' : 'Restaurar de JSON...'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {showImportBox && (
                  <View style={styles.importBox}>
                    <Text style={[styles.importLabel, { color: theme.colors.text, fontFamily: 'Nunito_600SemiBold' }]}>
                      Cole o JSON de backup abaixo:
                    </Text>
                    <TextInput
                      style={[
                        styles.importInput,
                        {
                          color: theme.colors.text,
                          borderColor: theme.colors.border,
                          backgroundColor: theme.colors.surfaceMuted,
                        },
                      ]}
                      placeholder='{"version": 1, "favorites": [...]}'
                      placeholderTextColor={theme.colors.textMuted}
                      multiline
                      numberOfLines={4}
                      value={backupJsonInput}
                      onChangeText={setBackupJsonInput}
                    />

                    <TouchableOpacity
                      style={[styles.confirmImportBtn, { backgroundColor: '#2E7D32' }]}
                      onPress={handleImportBackup}
                      disabled={isImporting}
                      accessibilityRole="button"
                      accessibilityLabel="Confirmar importação de backup"
                    >
                      {isImporting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
                          <Text style={[styles.confirmImportText, { color: '#FFFFFF', fontFamily: 'Nunito_700Bold' }]}>
                            Validar e Restaurar Dados
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Offline Request Queue Card */}
              <View
                style={[
                  styles.backupCard,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
              >
                <View style={styles.cardHeaderRow}>
                  <Ionicons name="wifi-outline" size={22} color={theme.colors.primary} />
                  <Text style={[styles.cardTitle, { color: theme.colors.text, fontFamily: 'Nunito_700Bold' }]}>
                    Fila Offline de Requisições
                  </Text>
                </View>

                <Text style={[styles.cardDesc, { color: theme.colors.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
                  Quando o dispositivo estiver sem internet, alterações são enfileiradas localmente com política de retentativa automática.
                </Text>

                <View style={styles.queueStatusRow}>
                  <Text style={[styles.queueCountLabel, { color: theme.colors.text, fontFamily: 'Nunito_600SemiBold' }]}>
                    Itens pendentes na fila:
                  </Text>
                  <View style={[styles.queueBadge, { backgroundColor: theme.colors.primaryLight }]}>
                    <Text style={[styles.queueBadgeText, { color: theme.colors.primary, fontFamily: 'Nunito_700Bold' }]}>
                      {queueCount}
                    </Text>
                  </View>
                </View>

                {queueCount > 0 && (
                  <View style={styles.queueActionsRow}>
                    <TouchableOpacity
                      style={[styles.drainBtn, { backgroundColor: theme.colors.primary }]}
                      onPress={handleDrainQueue}
                      disabled={isSyncing}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.drainBtnText, { color: '#FFFFFF', fontFamily: 'Nunito_700Bold' }]}>
                        Processar Fila Agora
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.clearQueueBtn, { borderColor: theme.colors.border }]}
                      onPress={handleClearQueue}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.clearQueueText, { color: '#D85A38', fontFamily: 'Nunito_600SemiBold' }]}>
                        Descartar
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
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
  title: {
    fontSize: 18,
  },
  closeBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTabs: {
    flexDirection: 'row',
    padding: 4,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
  },
  sectionTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
    borderRadius: 9,
    gap: 8,
  },
  sectionTabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTabText: {
    fontSize: 13,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  messageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  loggedContainer: {
    gap: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 18,
  },
  profileText: {
    gap: 2,
  },
  profileName: {
    fontSize: 17,
  },
  profileEmail: {
    fontSize: 14,
  },
  syncBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  syncTextGroup: {
    flex: 1,
    gap: 2,
  },
  syncStatusTitle: {
    fontSize: 15,
  },
  syncStatusSub: {
    fontSize: 13,
  },
  syncNowBtn: {
    flexDirection: 'row',
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  syncNowText: {
    fontSize: 15,
  },
  logoutBtn: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  logoutText: {
    fontSize: 14,
  },
  authContainer: {
    gap: 14,
  },
  tabSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 14,
  },
  formSub: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    minHeight: 46,
    fontSize: 15,
  },
  submitBtn: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitText: {
    fontSize: 15,
  },
  successText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  localContainer: {
    gap: 16,
  },
  backupCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
  backupActions: {
    gap: 8,
  },
  backupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: 10,
    gap: 8,
  },
  backupBtnText: {
    fontSize: 14,
  },
  backupBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  backupBtnSecondaryText: {
    fontSize: 14,
  },
  importBox: {
    marginTop: 8,
    gap: 8,
  },
  importLabel: {
    fontSize: 13,
  },
  importInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    height: 90,
    fontSize: 12,
    textAlignVertical: 'top',
    fontFamily: 'monospace',
  },
  confirmImportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
    borderRadius: 8,
    gap: 6,
  },
  confirmImportText: {
    fontSize: 14,
  },
  queueStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  queueCountLabel: {
    fontSize: 14,
  },
  queueBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  queueBadgeText: {
    fontSize: 13,
  },
  queueActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  drainBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drainBtnText: {
    fontSize: 13,
  },
  clearQueueBtn: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearQueueText: {
    fontSize: 13,
  },
});
