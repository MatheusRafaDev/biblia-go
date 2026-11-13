import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DatabaseProvider, useDatabase } from '@/src/shared/db/client';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppTheme } from '@/src/shared/hooks/useTheme';
import { LoadingState, ErrorState } from '@/src/shared/components/FeedbackStates';
import { BibleSyncService } from '@/src/features/reader/services/bibleSyncService';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function AppContent() {
  const theme = useAppTheme();
  const { isReady, error, bibleRepository } = useDatabase();

  useEffect(() => {
    if (isReady && bibleRepository) {
      // Ensure initial offline starter content is seeded
      const syncService = new BibleSyncService(bibleRepository);
      syncService.ensureStarterContent('ACF11').catch(() => {
        // Ignored; reader handles offline graceful fallback
      });
    }
  }, [isReady, bibleRepository]);

  if (error) {
    return (
      <ErrorState
        title="Erro ao inicializar o banco de dados"
        message={error.message}
        onRetry={() => {
          if (typeof window !== 'undefined' && window.location) {
            window.location.reload();
          }
        }}
      />
    );
  }

  if (!isReady) {
    return <LoadingState message="Inicializando Bíblia Go..." />;
  }

  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <DatabaseProvider>
          <AppContent />
        </DatabaseProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
