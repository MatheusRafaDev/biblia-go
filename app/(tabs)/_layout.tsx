import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/shared/hooks/useTheme';

export default function TabLayout() {
  const theme = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBg,
          borderTopColor: theme.colors.tabBarBorder,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: 'Nunito_600SemiBold',
          fontSize: 12,
        },
        tabBarItemStyle: {
          minHeight: 44,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ler',
          tabBarAccessibilityLabel: 'Aba Leitor da Bíblia',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'book' : 'book-outline'} size={size} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="compare"
        options={{
          title: 'Comparar',
          tabBarAccessibilityLabel: 'Aba Comparador de Traduções',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'git-compare' : 'git-compare-outline'} size={size} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plano',
          tabBarAccessibilityLabel: 'Aba Plano de Leitura',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: 'Quiz',
          tabBarAccessibilityLabel: 'Aba Quiz Bíblico',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'help-circle' : 'help-circle-outline'} size={size} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="characters"
        options={{
          title: 'Personagens',
          tabBarAccessibilityLabel: 'Aba Grafo de Personagens e Genealogias',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={size} color={String(color)} />
          ),
        }}
      />
    </Tabs>
  );
}
