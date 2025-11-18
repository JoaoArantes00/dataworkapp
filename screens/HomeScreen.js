import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import TaskItem from "../components/TaskItem";
import { loadTasks, saveTasks } from "../storage/taskStorage";
import {
  loadGamification,
  onTaskCompleted,
  updateDailyStreak,
  getLevelInfo,
} from "../services/gamificationService";

export default function HomeScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gamificationData, setGamificationData] = useState(null);
  const [filterStatus, setFilterStatus] = useState("todas"); // todas, pendente, andamento, concluida
  const [sortBy, setSortBy] = useState("criacao"); // criacao, prioridade, categoria

  // Carrega as tarefas quando o componente monta
  useEffect(() => {
    loadTasksFromStorage();
    loadGamificationData();
  }, []);

  // Recarrega as tarefas toda vez que a tela recebe foco
  useFocusEffect(
    React.useCallback(() => {
      loadTasksFromStorage();
      loadGamificationData();
    }, [])
  );

  // Aplica filtros e ordenação sempre que as tarefas ou filtros mudarem
  useEffect(() => {
    applyFiltersAndSort();
  }, [tasks, filterStatus, sortBy]);

  const loadGamificationData = async () => {
    try {
      await updateDailyStreak(); // Atualiza streak ao abrir o app
      const data = await loadGamification();
      setGamificationData(data);
    } catch (error) {
      console.error("Erro ao carregar gamificação:", error);
    }
  };

  const loadTasksFromStorage = async () => {
    try {
      setLoading(true);
      const storedTasks = await loadTasks();
      setTasks(Array.isArray(storedTasks) ? storedTasks : []);
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...tasks];

    // Aplicar filtro de status
    if (filterStatus !== "todas") {
      filtered = filtered.filter((task) => task.status === filterStatus);
    }

    // Aplicar ordenação
    if (sortBy === "prioridade") {
      const priorityOrder = { alta: 0, media: 1, baixa: 2 };
      filtered.sort((a, b) => {
        const aPriority = priorityOrder[a.priority] || 1;
        const bPriority = priorityOrder[b.priority] || 1;
        return aPriority - bPriority;
      });
    } else if (sortBy === "categoria") {
      filtered.sort((a, b) => {
        const aCategory = a.category || "geral";
        const bCategory = b.category || "geral";
        return aCategory.localeCompare(bCategory);
      });
    } else {
      // Ordenar por criação (mais recente primeiro)
      filtered.sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return bTime - aTime;
      });
    }

    setFilteredTasks(filtered);
  };

  const handleToggleStatus = async (taskId) => {
    const statusCycle = {
      pendente: "andamento",
      andamento: "concluida",
      concluida: "pendente",
    };

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newStatus = statusCycle[task.status] || "pendente";
    const wasCompleted = newStatus === "concluida" && task.status !== "concluida";

    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    await saveTasks(updatedTasks);

    // Se completou a tarefa, adiciona XP
    if (wasCompleted) {
      const result = await onTaskCompleted(task);
      if (result.success) {
        // Mostrar feedback de XP ganho
        let message = `+${result.xpGained} XP!`;
        
        if (result.levelUp) {
          message = `🎉 Level Up! Agora você é ${result.newTitle} (Nível ${result.newLevel})!\n+${result.xpGained} XP`;
        }

        if (result.newAchievements && result.newAchievements.length > 0) {
          const achievements = result.newAchievements.map((a) => `${a.icon} ${a.title}`).join("\n");
          message += `\n\n🏆 Novas Conquistas:\n${achievements}`;
        }

        Alert.alert("Tarefa Concluída!", message);
        loadGamificationData(); // Recarrega dados de gamificação
      }
    }
  };

  const handleDelete = async (taskId) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir esta tarefa?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            const updatedTasks = tasks.filter((task) => task.id !== taskId);
            setTasks(updatedTasks);
            await saveTasks(updatedTasks);
          },
        },
      ]
    );
  };

  const handleEdit = (taskId) => {
    navigation.navigate("EditTask", { taskId });
  };

  const renderTask = ({ item }) => {
    if (!item) return null;

    return (
      <TaskItem
        task={item}
        onToggleStatus={() => handleToggleStatus(item.id)}
        onDelete={() => handleDelete(item.id)}
        onEdit={() => handleEdit(item.id)}
      />
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Carregando tarefas...</Text>
      </View>
    );
  }

  const levelInfo = gamificationData ? getLevelInfo(gamificationData.xp) : null;

  return (
    <View style={styles.container}>
      {/* Header de Gamificação */}
      {gamificationData && levelInfo && (
        <View style={styles.gamificationHeader}>
          <View style={styles.levelInfo}>
            <Text style={styles.levelText}>
              Nível {levelInfo.currentLevel} - {levelInfo.currentTitle}
            </Text>
            <Text style={styles.xpText}>
              {levelInfo.currentXP} XP ({Math.round(levelInfo.progressPercent)}%)
            </Text>
          </View>
          <TouchableOpacity
            style={styles.streakButton}
            onPress={() => navigation.navigate("Dashboard")}
          >
            <Text style={styles.streakText}>
              🔥 {gamificationData.currentStreak} dias
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === "todas" && styles.filterChipActive]}
            onPress={() => setFilterStatus("todas")}
          >
            <Text style={[styles.filterText, filterStatus === "todas" && styles.filterTextActive]}>
              Todas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === "pendente" && styles.filterChipActive]}
            onPress={() => setFilterStatus("pendente")}
          >
            <Text style={[styles.filterText, filterStatus === "pendente" && styles.filterTextActive]}>
              ⏳ Pendente
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === "andamento" && styles.filterChipActive]}
            onPress={() => setFilterStatus("andamento")}
          >
            <Text style={[styles.filterText, filterStatus === "andamento" && styles.filterTextActive]}>
              🔄 Em Andamento
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === "concluida" && styles.filterChipActive]}
            onPress={() => setFilterStatus("concluida")}
          >
            <Text style={[styles.filterText, filterStatus === "concluida" && styles.filterTextActive]}>
              ✅ Concluída
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Ordenação */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Ordenar por:</Text>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === "criacao" && styles.sortButtonActive]}
          onPress={() => setSortBy("criacao")}
        >
          <Text style={[styles.sortText, sortBy === "criacao" && styles.sortTextActive]}>
            Data
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === "prioridade" && styles.sortButtonActive]}
          onPress={() => setSortBy("prioridade")}
        >
          <Text style={[styles.sortText, sortBy === "prioridade" && styles.sortTextActive]}>
            Prioridade
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === "categoria" && styles.sortButtonActive]}
          onPress={() => setSortBy("categoria")}
        >
          <Text style={[styles.sortText, sortBy === "categoria" && styles.sortTextActive]}>
            Categoria
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Tarefas */}
      {filteredTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            {filterStatus === "todas" ? "📋 Nenhuma tarefa ainda" : "Nenhuma tarefa encontrada"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {filterStatus === "todas"
              ? "Comece adicionando sua primeira tarefa!"
              : "Tente outro filtro"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Botões */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("NewTask")}
        >
          <Text style={styles.buttonText}>➕ Nova Tarefa</Text>
        </TouchableOpacity>

        <View style={styles.secondaryButtonsRow}>
          <TouchableOpacity
            style={[styles.secondaryButton, { flex: 1, marginRight: 8 }]}
            onPress={() => navigation.navigate("Dashboard")}
          >
            <Text style={styles.secondaryButtonText}>📊 Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { flex: 1 }]}
            onPress={() => navigation.navigate("Pomodoro")}
          >
            <Text style={styles.secondaryButtonText}>🍅 Pomodoro</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.secondaryButtonsRow}>
          <TouchableOpacity
            style={[styles.secondaryButton, { flex: 1, marginRight: 8 }]}
            onPress={() => navigation.navigate("Analytics")}
          >
            <Text style={styles.secondaryButtonText}>📈 Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { flex: 1 }]}
            onPress={() => navigation.navigate("Settings")}
          >
            <Text style={styles.secondaryButtonText}>⚙️ Config</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
  gamificationHeader: {
    backgroundColor: "#1976d2",
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  levelInfo: {
    flex: 1,
  },
  levelText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  xpText: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.9,
  },
  streakButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  streakText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  filtersContainer: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#f5f5f5",
  },
  filterChipActive: {
    backgroundColor: "#1976d2",
  },
  filterText: {
    fontSize: 14,
    color: "#616161",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#fff",
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  sortLabel: {
    fontSize: 12,
    color: "#757575",
    marginRight: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    backgroundColor: "#f5f5f5",
  },
  sortButtonActive: {
    backgroundColor: "#7b1fa2",
  },
  sortText: {
    fontSize: 12,
    color: "#616161",
    fontWeight: "500",
  },
  sortTextActive: {
    color: "#fff",
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#424242",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#757575",
    textAlign: "center",
  },
  buttonsContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  primaryButton: {
    backgroundColor: "#1976d2",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1976d2",
    marginBottom: 10,
  },
  secondaryButtonsRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: "#1976d2",
    fontSize: 16,
    fontWeight: "600",
  },
});