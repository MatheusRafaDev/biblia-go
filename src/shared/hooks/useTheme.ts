import { useColorScheme } from 'react-native';
import { create } from 'zustand';
import { themeLight, themeDark, AppTheme } from '../constants/theme';

type ColorModePreference = 'system' | 'light' | 'dark';

interface ThemeStore {
  preference: ColorModePreference;
  setPreference: (preference: ColorModePreference) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  preference: 'system',
  setPreference: (preference) => set({ preference }),
}));

export function useAppTheme(): AppTheme {
  const systemScheme = useColorScheme();
  const preference = useThemeStore((state) => state.preference);

  if (preference === 'dark') return themeDark;
  if (preference === 'light') return themeLight;
  return systemScheme === 'dark' ? themeDark : themeLight;
}
