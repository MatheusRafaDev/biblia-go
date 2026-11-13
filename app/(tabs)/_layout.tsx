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
        tabBarActiveTintColor: theme.colors.gold,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBg,
          borderTopColor: theme.colors.tabBarBorder,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: 'Nunito_700Bold',
          fontSize: 11,
        },
        tabBarItemStyle: {
          minHeight: 44,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Bíblia',
          tabBarAccessibilityLabel: 'Aba Leitura da Bíblia Sagrada',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'book' : 'book-outline'} size={size} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Planos',
          tabBarAccessibilityLabel: 'Aba Planos de Leitura e Devocionais',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="characters"
        options={{
          title: 'Linhagens',
          tabBarAccessibilityLabel: 'Aba Genealogias e Personagens Bíblicos',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'git-network' : 'git-network-outline'} size={size} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="compare"
        options={{
          title: 'Concordância',
          tabBarAccessibilityLabel: 'Aba Concordância e Comparação de Traduções',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'git-compare' : 'git-compare-outline'} size={size} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: 'Estudo',
          tabBarAccessibilityLabel: 'Aba Estudo Bíblico e Conhecimento',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'school' : 'school-outline'} size={size} color={String(color)} />
          ),
        }}
      />
    </Tabs>
  );
}
