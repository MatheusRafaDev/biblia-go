import { create } from 'zustand';
import { themeLight, themeDark, AppTheme } from '../constants/theme';

type ColorModePreference = 'system' | 'light' | 'dark';

interface ThemeStore {
  preference: ColorModePreference;
  setPreference: (preference: ColorModePreference) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  preference: 'light',
  setPreference: (preference) => set({ preference }),
}));

export function useAppTheme(): AppTheme {
  const preference = useThemeStore((state) => state.preference);

  if (preference === 'dark') return themeDark;
  return themeLight;
}
