export const palette = {
  // Light mode colors
  creamBg: '#FBF7EE',
  navyDark: '#26244A',
  navyMuted: '#4F4B72',
  navySubtle: '#7E7A9C',
  bluePrimary: '#3B6EF5',
  bluePrimaryHover: '#2A5CDD',
  blueLight: '#EBF2FE',
  borderLight: '#E8E2D5',
  cardBgLight: '#FFFFFF',

  // Pastel card accents
  pastelBlue: '#EAF2FF',
  pastelYellow: '#FEF8E7',
  pastelGreen: '#EAF8EE',
  pastelCoral: '#FDEEE9',
  pastelPurple: '#F2EEFC',

  // Highlight marker colors for verses
  highlightYellow: '#FFF59D',
  highlightGreen: '#C8E6C9',
  highlightBlue: '#BBDEFB',
  highlightCoral: '#FFCCBC',

  // Dark mode colors
  darkBg: '#151424',
  darkSurface: '#1F1D33',
  darkSurfaceElevated: '#2A2744',
  darkBorder: '#363258',
  darkTextPrimary: '#F6F4ED',
  darkTextSecondary: '#ABA7C6',
  darkTextMuted: '#777299',
  darkBluePrimary: '#5482FF',
  darkBlueLight: '#23294E',
};

export const themeLight = {
  isDark: false,
  colors: {
    background: palette.creamBg,
    surface: palette.cardBgLight,
    surfaceMuted: '#F5EFE3',
    surfaceSubtle: '#F0E9DA',
    border: palette.borderLight,
    text: palette.navyDark,
    textSecondary: palette.navyMuted,
    textMuted: palette.navySubtle,
    primary: palette.bluePrimary,
    primaryLight: palette.blueLight,
    cardPastelBlue: palette.pastelBlue,
    cardPastelYellow: palette.pastelYellow,
    cardPastelGreen: palette.pastelGreen,
    cardPastelCoral: palette.pastelCoral,
    cardPastelPurple: palette.pastelPurple,
    tabBarBg: '#FFFFFF',
    tabBarBorder: palette.borderLight,
    tabBarActive: palette.bluePrimary,
    tabBarInactive: palette.navySubtle,
    highContrastText: '#100E26',
    focusOutline: '#2A5CDD',
  },
};

export const themeDark = {
  isDark: true,
  colors: {
    background: palette.darkBg,
    surface: palette.darkSurface,
    surfaceMuted: palette.darkSurfaceElevated,
    surfaceSubtle: '#332F52',
    border: palette.darkBorder,
    text: palette.darkTextPrimary,
    textSecondary: palette.darkTextSecondary,
    textMuted: palette.darkTextMuted,
    primary: palette.darkBluePrimary,
    primaryLight: palette.darkBlueLight,
    cardPastelBlue: '#222B44',
    cardPastelYellow: '#3B3421',
    cardPastelGreen: '#1E362A',
    cardPastelCoral: '#3E2422',
    cardPastelPurple: '#2C2244',
    tabBarBg: palette.darkSurface,
    tabBarBorder: palette.darkBorder,
    tabBarActive: palette.darkBluePrimary,
    tabBarInactive: palette.darkTextMuted,
    highContrastText: '#FFFFFF',
    focusOutline: '#7DA2FF',
  },
};

export type AppTheme = typeof themeLight;
