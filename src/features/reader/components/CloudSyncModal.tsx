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
import { useFavoritesRepository, useReadingPlanRepository } from '@/src/shared/db/client';
import { api } from '@/src/shared/api/client';

interface CloudSyncModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CloudSyncModal({ visible, onClose }: CloudSyncModalProps) {
  const theme = useAppTheme();
  const { user, isAuthenticated, setUser, logout, lastSyncedAt, setLastSyncedAt } = useAuthStore();
  const favRepo = useFavoritesRepository();
  const planRepo = useReadingPlanRepository();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: 'Nunito_800ExtraBold' }]}>
            Sincronização em Nuvem (Fase 2)
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

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {isAuthenticated && user ? (
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

              {/* Feedback messages */}
              {successMessage && (
                <Text style={[styles.successText, { color: '#2E7D32', fontFamily: 'Nunito_600SemiBold' }]}>
                  {successMessage}
                </Text>
              )}
              {errorMessage && (
                <Text style={[styles.errorText, { color: '#D85A38', fontFamily: 'Nunito_600SemiBold' }]}>
                  {errorMessage}
                </Text>
              )}

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

              {errorMessage && (
                <Text style={[styles.errorText, { color: '#D85A38', fontFamily: 'Nunito_600SemiBold' }]}>
                  {errorMessage}
                </Text>
              )}

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
  content: {
    padding: 20,
    gap: 16,
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
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
  },
});
