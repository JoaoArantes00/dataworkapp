import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { loadTasks } from "../storage/taskStorage";
import {
  loadGamification,
  getLevelInfo,
  getAllAchievements,
} from "../services/gamificationService";

export default function DashboardScreen() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pendente: 0,
    andamento: 0,
    concluida: 0,
    percentConcluida: 0,
  });
  const [gamification, setGamification] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carrega tarefas
      const storedTasks = await loadTasks();
      const validTasks = Array.isArray(storedTasks) ? storedTasks : [];
      setTasks(validTasks);
      calculateStats(validTasks);
      
      // Carrega gamificação
      const gamificationData = await loadGamification();
      setGamification(gamificationData);
      
      // Carrega conquistas
      const allAchievements = await getAllAchievements();
      setAchievements(allAchievements);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      setTasks([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (taskList) => {
    const total = taskList.length;
    const pendente = taskList.filter((t) => t.status === "pendente").length;
    const andamento = taskList.filter((t) => t.status === "andamento").length;
    const concluida = taskList.filter((t) => t.status === "concluida").length;
    const percentConcluida = total > 0 ? Math.round((concluida / total) * 100) : 0;

    setStats({
      total,
      pendente,
      andamento,
      concluida,
      percentConcluida,
    });
  };

  const getInsight = () => {
    if (stats.total === 0) {
      return "📝 Adicione tarefas para começar a acompanhar sua produtividade!";
    }

    if (stats.percentConcluida === 100) {
      return "🎉 Parabéns! Você completou todas as suas tarefas!";
    }

    if (stats.percentConcluida >= 70) {
      return "🔥 Excelente! Você está muito produtivo hoje!";
    }

    if (stats.percentConcluida >= 50) {
      return "💪 Bom trabalho! Continue assim!";
    }

    if (stats.percentConcluida >= 25) {
      return "⚡ Você está progredindo! Vamos continuar?";
    }

    return "🚀 Comece a marcar tarefas como concluídas!";
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Carregando dashboard...</Text>
      </View>
    );
  }

  const levelInfo = gamification ? getLevelInfo(gamification.xp) : null;
  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const lockedAchievements = achievements.filter((a) => !a.unlocked);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Gamification Card */}
        {gamification && levelInfo && (
          <View style={styles.gamificationCard}>
            <View style={styles.levelHeader}>
              <View>
                <Text style={styles.levelTitle}>
                  Nível {levelInfo.currentLevel}
                </Text>
                <Text style={styles.levelSubtitle}>
                  {levelInfo.currentTitle}
                </Text>
              </View>
              <View style={styles.xpBadge}>
                <Text style={styles.xpBadgeText}>{levelInfo.currentXP}</Text>
                <Text style={styles.xpBadgeLabel}>XP</Text>
              </View>
            </View>

            {/* Barra de Progresso XP */}
            <View style={styles.xpProgressContainer}>
              <View style={styles.xpProgressBar}>
                <View
                  style={[
                    styles.xpProgressFill,
                    { width: `${Math.min(levelInfo.progressPercent, 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.xpProgressText}>
                {levelInfo.xpProgress} / {levelInfo.xpForNextLevel - levelInfo.xpForCurrentLevel} XP
                {levelInfo.nextLevel && ` (Nível ${levelInfo.nextLevel})`}
              </Text>
            </View>

            {/* Streak */}
            <View style={styles.streakContainer}>
              <View style={styles.streakItem}>
                <Text style={styles.streakIcon}>🔥</Text>
                <Text style={styles.streakNumber}>{gamification.currentStreak}</Text>
                <Text style={styles.streakLabel}>Dias seguidos</Text>
              </View>
              <View style={styles.streakDivider} />
              <View style={styles.streakItem}>
                <Text style={styles.streakIcon}>🏆</Text>
                <Text style={styles.streakNumber}>{gamification.longestStreak}</Text>
                <Text style={styles.streakLabel}>Melhor streak</Text>
              </View>
              <View style={styles.streakDivider} />
              <View style={styles.streakItem}>
                <Text style={styles.streakIcon}>✅</Text>
                <Text style={styles.streakNumber}>{gamification.totalCompleted}</Text>
                <Text style={styles.streakLabel}>Completadas</Text>
              </View>
            </View>
          </View>
        )}

        {/* Conquistas */}
        <View style={styles.achievementsSection}>
          <View style={styles.achievementsHeader}>
            <Text style={styles.achievementsTitle}>
              🏆 Conquistas ({unlockedAchievements.length}/{achievements.length})
            </Text>
            <TouchableOpacity
              onPress={() => setShowAllAchievements(!showAllAchievements)}
            >
              <Text style={styles.toggleText}>
                {showAllAchievements ? "Ver menos" : "Ver todas"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.achievementsScroll}
          >
            {(showAllAchievements ? achievements : unlockedAchievements.slice(0, 3)).map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  !achievement.unlocked && styles.achievementCardLocked,
                ]}
              >
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
                {achievement.unlocked ? (
                  <Text style={styles.achievementXP}>+{achievement.xpBonus} XP</Text>
                ) : (
                  <Text style={styles.achievementLocked}>🔒 Bloqueado</Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📊 Estatísticas</Text>
        </View>

        {/* Insight Card */}
        <View style={styles.insightCard}>
          <Text style={styles.insightText}>{getInsight()}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>
            Progresso Geral: {stats.percentConcluida}%
          </Text>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${stats.percentConcluida}%` },
              ]}
            />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: "#1976d2" }]}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#fbc02d" }]}>
            <Text style={styles.statNumber}>{stats.pendente}</Text>
            <Text style={styles.statLabel}>Pendentes</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#1976d2" }]}>
            <Text style={styles.statNumber}>{stats.andamento}</Text>
            <Text style={styles.statLabel}>Em Andamento</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#2e7d32" }]}>
            <Text style={styles.statNumber}>{stats.concluida}</Text>
            <Text style={styles.statLabel}>Concluídas</Text>
          </View>
        </View>

        {/* Breakdown */}
        <View style={styles.breakdownSection}>
          <Text style={styles.breakdownTitle}>Detalhamento</Text>

          <View style={styles.breakdownItem}>
            <View style={[styles.breakdownDot, { backgroundColor: "#fbc02d" }]} />
            <Text style={styles.breakdownLabel}>Pendentes</Text>
            <Text style={styles.breakdownValue}>{stats.pendente}</Text>
          </View>

          <View style={styles.breakdownItem}>
            <View style={[styles.breakdownDot, { backgroundColor: "#1976d2" }]} />
            <Text style={styles.breakdownLabel}>Em Andamento</Text>
            <Text style={styles.breakdownValue}>{stats.andamento}</Text>
          </View>

          <View style={styles.breakdownItem}>
            <View style={[styles.breakdownDot, { backgroundColor: "#2e7d32" }]} />
            <Text style={styles.breakdownLabel}>Concluídas</Text>
            <Text style={styles.breakdownValue}>{stats.concluida}</Text>
          </View>
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
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#757575",
  },
  content: {
    padding: 16,
  },
  gamificationCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1976d2",
  },
  levelSubtitle: {
    fontSize: 14,
    color: "#757575",
  },
  xpBadge: {
    backgroundColor: "#1976d2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  xpBadgeText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  xpBadgeLabel: {
    color: "#fff",
    fontSize: 10,
    opacity: 0.9,
  },
  xpProgressContainer: {
    marginBottom: 16,
  },
  xpProgressBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  xpProgressFill: {
    height: "100%",
    backgroundColor: "#1976d2",
  },
  xpProgressText: {
    fontSize: 12,
    color: "#757575",
    textAlign: "center",
  },
  streakContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  streakItem: {
    alignItems: "center",
  },
  streakIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  streakNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#212121",
  },
  streakLabel: {
    fontSize: 12,
    color: "#757575",
  },
  streakDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
  },
  achievementsSection: {
    marginBottom: 16,
  },
  achievementsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212121",
  },
  toggleText: {
    fontSize: 14,
    color: "#1976d2",
    fontWeight: "600",
  },
  achievementsScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  achievementCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 140,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  achievementCardLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212121",
    textAlign: "center",
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 11,
    color: "#757575",
    textAlign: "center",
    marginBottom: 8,
  },
  achievementXP: {
    fontSize: 12,
    color: "#1976d2",
    fontWeight: "600",
  },
  achievementLocked: {
    fontSize: 12,
    color: "#757575",
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#212121",
  },
  insightCard: {
    backgroundColor: "#e3f2fd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#1976d2",
  },
  insightText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1565c0",
    textAlign: "center",
  },
  progressSection: {
    marginBottom: 24,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#424242",
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 24,
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#1976d2",
    borderRadius: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    width: "48%",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    opacity: 0.9,
  },
  breakdownSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 16,
  },
  breakdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  breakdownDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  breakdownLabel: {
    flex: 1,
    fontSize: 16,
    color: "#424242",
  },
  breakdownValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212121",
  },
});