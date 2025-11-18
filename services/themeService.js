import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_KEY = "@datawork_theme";
const PREFERENCES_KEY = "@datawork_preferences";

// Temas predefinidos
export const THEMES = {
  light: {
    id: "light",
    name: "Claro",
    colors: {
      primary: "#1976d2",
      secondary: "#7b1fa2",
      background: "#f5f5f5",
      card: "#ffffff",
      text: "#212121",
      textSecondary: "#757575",
      border: "#e0e0e0",
      success: "#2e7d32",
      warning: "#fbc02d",
      error: "#e53935",
      info: "#1976d2",
    },
  },
  dark: {
    id: "dark",
    name: "Escuro",
    colors: {
      primary: "#42a5f5",
      secondary: "#ab47bc",
      background: "#121212",
      card: "#1e1e1e",
      text: "#ffffff",
      textSecondary: "#b0b0b0",
      border: "#2c2c2c",
      success: "#4caf50",
      warning: "#ffb74d",
      error: "#ef5350",
      info: "#42a5f5",
    },
  },
  ocean: {
    id: "ocean",
    name: "Oceano",
    colors: {
      primary: "#006064",
      secondary: "#00838f",
      background: "#e0f7fa",
      card: "#ffffff",
      text: "#004d40",
      textSecondary: "#00695c",
      border: "#b2ebf2",
      success: "#00897b",
      warning: "#ffa726",
      error: "#e53935",
      info: "#0097a7",
    },
  },
  sunset: {
    id: "sunset",
    name: "Pôr do Sol",
    colors: {
      primary: "#d84315",
      secondary: "#f4511e",
      background: "#fff3e0",
      card: "#ffffff",
      text: "#bf360c",
      textSecondary: "#e64a19",
      border: "#ffe0b2",
      success: "#689f38",
      warning: "#ffa000",
      error: "#c62828",
      info: "#ff6f00",
    },
  },
  forest: {
    id: "forest",
    name: "Floresta",
    colors: {
      primary: "#2e7d32",
      secondary: "#558b2f",
      background: "#f1f8e9",
      card: "#ffffff",
      text: "#1b5e20",
      textSecondary: "#33691e",
      border: "#dcedc8",
      success: "#43a047",
      warning: "#fdd835",
      error: "#d32f2f",
      info: "#66bb6a",
    },
  },
  midnight: {
    id: "midnight",
    name: "Meia-Noite",
    colors: {
      primary: "#5e35b1",
      secondary: "#7e57c2",
      background: "#1a1a2e",
      card: "#16213e",
      text: "#eee",
      textSecondary: "#b4b4c5",
      border: "#0f3460",
      success: "#66bb6a",
      warning: "#ffca28",
      error: "#ef5350",
      info: "#9575cd",
    },
  },
};

// Preferências padrão
const DEFAULT_PREFERENCES = {
  theme: "light",
  fontSize: "medium", // small, medium, large
  density: "comfortable", // compact, comfortable, spacious
  showCompletedTasks: true,
  enableSounds: true,
  enableVibration: true,
  pomodoroWorkDuration: 25, // minutos
  pomodoroBreakDuration: 5, // minutos
  pomodoroLongBreakDuration: 15, // minutos
  pomodoroSessionsBeforeLongBreak: 4,
  defaultTaskPriority: "media",
  defaultTaskCategory: "geral",
  showXPAnimations: true,
  showStreakReminders: true,
};

/**
 * Carrega o tema atual
 */
export async function loadTheme() {
  try {
    const themeId = await AsyncStorage.getItem(THEME_KEY);
    if (!themeId) {
      return THEMES.light;
    }
    return THEMES[themeId] || THEMES.light;
  } catch (error) {
    console.warn("Erro ao carregar tema:", error);
    return THEMES.light;
  }
}

/**
 * Salva o tema
 */
export async function saveTheme(themeId) {
  try {
    if (!THEMES[themeId]) {
      console.warn("Tema inválido:", themeId);
      return false;
    }
    await AsyncStorage.setItem(THEME_KEY, themeId);
    return true;
  } catch (error) {
    console.warn("Erro ao salvar tema:", error);
    return false;
  }
}

/**
 * Carrega as preferências
 */
export async function loadPreferences() {
  try {
    const prefsJson = await AsyncStorage.getItem(PREFERENCES_KEY);
    if (!prefsJson) {
      return DEFAULT_PREFERENCES;
    }
    const prefs = JSON.parse(prefsJson);
    return { ...DEFAULT_PREFERENCES, ...prefs };
  } catch (error) {
    console.warn("Erro ao carregar preferências:", error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Salva as preferências
 */
export async function savePreferences(preferences) {
  try {
    const mergedPrefs = { ...DEFAULT_PREFERENCES, ...preferences };
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(mergedPrefs));
    return true;
  } catch (error) {
    console.warn("Erro ao salvar preferências:", error);
    return false;
  }
}

/**
 * Atualiza uma preferência específica
 */
export async function updatePreference(key, value) {
  try {
    const prefs = await loadPreferences();
    prefs[key] = value;
    await savePreferences(prefs);
    return true;
  } catch (error) {
    console.warn("Erro ao atualizar preferência:", error);
    return false;
  }
}

/**
 * Reseta as preferências para os valores padrão
 */
export async function resetPreferences() {
  try {
    await AsyncStorage.removeItem(PREFERENCES_KEY);
    await AsyncStorage.removeItem(THEME_KEY);
    return true;
  } catch (error) {
    console.warn("Erro ao resetar preferências:", error);
    return false;
  }
}

/**
 * Obtém tamanhos de fonte baseado na preferência
 */
export function getFontSizes(fontSize = "medium") {
  const sizes = {
    small: {
      tiny: 10,
      small: 12,
      medium: 14,
      large: 16,
      xlarge: 18,
      xxlarge: 22,
      title: 26,
    },
    medium: {
      tiny: 11,
      small: 13,
      medium: 15,
      large: 17,
      xlarge: 20,
      xxlarge: 24,
      title: 28,
    },
    large: {
      tiny: 12,
      small: 14,
      medium: 16,
      large: 18,
      xlarge: 22,
      xxlarge: 26,
      title: 30,
    },
  };

  return sizes[fontSize] || sizes.medium;
}

/**
 * Obtém espaçamentos baseado na densidade
 */
export function getSpacing(density = "comfortable") {
  const spacing = {
    compact: {
      tiny: 4,
      small: 8,
      medium: 12,
      large: 16,
      xlarge: 20,
    },
    comfortable: {
      tiny: 6,
      small: 12,
      medium: 16,
      large: 20,
      xlarge: 24,
    },
    spacious: {
      tiny: 8,
      small: 16,
      medium: 20,
      large: 24,
      xlarge: 32,
    },
  };

  return spacing[density] || spacing.comfortable;
}

/**
 * Cria um tema customizado
 */
export function createCustomTheme(name, colors) {
  return {
    id: `custom_${Date.now()}`,
    name,
    colors: {
      ...THEMES.light.colors,
      ...colors,
    },
    custom: true,
  };
}