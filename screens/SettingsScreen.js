import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  THEMES,
  loadTheme,
  saveTheme,
  loadPreferences,
  savePreferences,
  resetPreferences,
} from "../services/themeService";

export default function SettingsScreen({ navigation }) {
  const [currentTheme, setCurrentTheme] = useState(THEMES.light);
  const [preferences, setPreferences] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      loadSettings();
    }, [])
  );

  const loadSettings = async () => {
    const theme = await loadTheme();
    const prefs = await loadPreferences();
    setCurrentTheme(theme);
    setPreferences(prefs);
  };

  const handleThemeChange = async (themeId) => {
    await saveTheme(themeId);
    setCurrentTheme(THEMES[themeId]);
    Alert.alert("Tema Alterado", "Reinicie o app para aplicar completamente o novo tema.");
  };

  const handlePreferenceChange = async (key, value) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    await savePreferences(newPrefs);
  };

  const handleReset = () => {
    Alert.alert(
      "Resetar Configurações",
      "Tem certeza que deseja resetar todas as configurações para os valores padrão?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Resetar",
          style: "destructive",
          onPress: async () => {
            await resetPreferences();
            await loadSettings();
            Alert.alert("Sucesso", "Configurações resetadas!");
          },
        },
      ]
    );
  };

  if (!preferences) {
    return (
      <View style={styles.centerContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Seção: Temas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Tema</Text>
          <Text style={styles.sectionSubtitle}>
            Escolha o tema visual do aplicativo
          </Text>

          <View style={styles.themesGrid}>
            {Object.values(THEMES).map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.themeCard,
                  currentTheme.id === theme.id && styles.themeCardActive,
                  { borderColor: theme.colors.primary },
                ]}
                onPress={() => handleThemeChange(theme.id)}
              >
                <View
                  style={[
                    styles.themePreview,
                    { backgroundColor: theme.colors.background },
                  ]}
                >
                  <View
                    style={[
                      styles.themePreviewBar,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  />
                  <View
                    style={[
                      styles.themePreviewCard,
                      { backgroundColor: theme.colors.card },
                    ]}
                  />
                </View>
                <Text style={styles.themeName}>{theme.name}</Text>
                {currentTheme.id === theme.id && (
                  <Text style={styles.themeActive}>✓ Ativo</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Seção: Aparência */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Aparência</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Tamanho da Fonte</Text>
              <Text style={styles.settingDescription}>
                Ajuste o tamanho do texto
              </Text>
            </View>
            <View style={styles.segmentControl}>
              {["small", "medium", "large"].map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.segmentButton,
                    preferences.fontSize === size && styles.segmentButtonActive,
                  ]}
                  onPress={() => handlePreferenceChange("fontSize", size)}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      preferences.fontSize === size && styles.segmentTextActive,
                    ]}
                  >
                    {size === "small" ? "P" : size === "medium" ? "M" : "G"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Densidade</Text>
              <Text style={styles.settingDescription}>
                Espaçamento entre elementos
              </Text>
            </View>
            <View style={styles.segmentControl}>
              {["compact", "comfortable", "spacious"].map((density) => (
                <TouchableOpacity
                  key={density}
                  style={[
                    styles.segmentButton,
                    preferences.density === density && styles.segmentButtonActive,
                  ]}
                  onPress={() => handlePreferenceChange("density", density)}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      preferences.density === density && styles.segmentTextActive,
                    ]}
                  >
                    {density === "compact" ? "C" : density === "comfortable" ? "M" : "E"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Seção: Pomodoro */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🍅 Pomodoro</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Duração do Trabalho</Text>
              <Text style={styles.settingDescription}>Minutos de foco</Text>
            </View>
            <View style={styles.pomodoroButtons}>
              {[15, 25, 30, 45].map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={[
                    styles.pomodoroButton,
                    preferences.pomodoroWorkDuration === minutes &&
                      styles.pomodoroButtonActive,
                  ]}
                  onPress={() =>
                    handlePreferenceChange("pomodoroWorkDuration", minutes)
                  }
                >
                  <Text
                    style={[
                      styles.pomodoroText,
                      preferences.pomodoroWorkDuration === minutes &&
                        styles.pomodoroTextActive,
                    ]}
                  >
                    {minutes}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Duração da Pausa</Text>
              <Text style={styles.settingDescription}>Minutos de descanso</Text>
            </View>
            <View style={styles.pomodoroButtons}>
              {[5, 10, 15].map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={[
                    styles.pomodoroButton,
                    preferences.pomodoroBreakDuration === minutes &&
                      styles.pomodoroButtonActive,
                  ]}
                  onPress={() =>
                    handlePreferenceChange("pomodoroBreakDuration", minutes)
                  }
                >
                  <Text
                    style={[
                      styles.pomodoroText,
                      preferences.pomodoroBreakDuration === minutes &&
                        styles.pomodoroTextActive,
                    ]}
                  >
                    {minutes}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Seção: Preferências Gerais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Geral</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Mostrar Tarefas Concluídas</Text>
              <Text style={styles.settingDescription}>
                Exibir tarefas completas na lista
              </Text>
            </View>
            <Switch
              value={preferences.showCompletedTasks}
              onValueChange={(value) =>
                handlePreferenceChange("showCompletedTasks", value)
              }
              trackColor={{ false: "#ccc", true: "#1976d2" }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Sons</Text>
              <Text style={styles.settingDescription}>
                Efeitos sonoros do app
              </Text>
            </View>
            <Switch
              value={preferences.enableSounds}
              onValueChange={(value) =>
                handlePreferenceChange("enableSounds", value)
              }
              trackColor={{ false: "#ccc", true: "#1976d2" }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Vibração</Text>
              <Text style={styles.settingDescription}>
                Feedback tátil
              </Text>
            </View>
            <Switch
              value={preferences.enableVibration}
              onValueChange={(value) =>
                handlePreferenceChange("enableVibration", value)
              }
              trackColor={{ false: "#ccc", true: "#1976d2" }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Animações de XP</Text>
              <Text style={styles.settingDescription}>
                Mostrar animações ao ganhar XP
              </Text>
            </View>
            <Switch
              value={preferences.showXPAnimations}
              onValueChange={(value) =>
                handlePreferenceChange("showXPAnimations", value)
              }
              trackColor={{ false: "#ccc", true: "#1976d2" }}
            />
          </View>
        </View>

        {/* Botão de Reset */}
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>🔄 Resetar Configurações</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>DataWork v1.0.0</Text>
          <Text style={styles.footerText}>madebyarantes</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 16,
  },
  themesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  themeCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  themeCardActive: {
    borderWidth: 3,
  },
  themePreview: {
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  themePreviewBar: {
    height: 20,
  },
  themePreviewCard: {
    flex: 1,
    margin: 8,
    borderRadius: 4,
  },
  themeName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 4,
  },
  themeActive: {
    fontSize: 12,
    color: "#1976d2",
    fontWeight: "600",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: "#757575",
  },
  segmentControl: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 4,
  },
  segmentButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  segmentButtonActive: {
    backgroundColor: "#1976d2",
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#757575",
  },
  segmentTextActive: {
    color: "#fff",
  },
  pomodoroButtons: {
    flexDirection: "row",
    gap: 8,
  },
  pomodoroButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  pomodoroButtonActive: {
    backgroundColor: "#1976d2",
    borderColor: "#1976d2",
  },
  pomodoroText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#757575",
  },
  pomodoroTextActive: {
    color: "#fff",
  },
  resetButton: {
    backgroundColor: "#e53935",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 16,
  },
  footerText: {
    fontSize: 12,
    color: "#9e9e9e",
    marginBottom: 4,
  },
});