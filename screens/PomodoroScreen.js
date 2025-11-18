import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { loadTasks } from "../storage/taskStorage";
import {
  startPomodoroSession,
  completePomodoroSession,
  cancelPomodoroSession,
  getPomodoroStats,
  getPomodoroHistory,
} from "../services/timeTrackingService";
import { loadPreferences } from "../services/themeService";
import { onTaskCompleted } from "../services/gamificationService";

export default function PomodoroScreen({ route, navigation }) {
  const { taskId } = route.params || {};
  
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [session, setSession] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutos em segundos
  const [duration, setDuration] = useState(25);
  const [isBreak, setIsBreak] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [preferences, setPreferences] = useState(null);
  
  const intervalRef = useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [])
  );

  useEffect(() => {
    if (taskId && tasks.length > 0) {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        setSelectedTask(task);
      }
    }
  }, [taskId, tasks]);

  useEffect(() => {
    if (preferences) {
      const workDuration = preferences.pomodoroWorkDuration || 25;
      setDuration(workDuration);
      if (!isRunning) {
        setTimeLeft(workDuration * 60);
      }
    }
  }, [preferences]);

  const loadData = async () => {
    const loadedTasks = await loadTasks();
    setTasks(loadedTasks.filter((t) => t.status !== "concluida"));
    
    const pomodoroStats = await getPomodoroStats();
    setStats(pomodoroStats);
    
    const pomodoroHistory = await getPomodoroHistory(5);
    setHistory(pomodoroHistory);
    
    const prefs = await loadPreferences();
    setPreferences(prefs);
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleStart = async () => {
    if (!isBreak && !selectedTask) {
      Alert.alert("Selecione uma Tarefa", "Escolha uma tarefa para focar.");
      return;
    }

    const newSession = await startPomodoroSession(
      isBreak ? null : selectedTask.id,
      duration
    );
    
    setSession(newSession);
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    Alert.alert(
      "Parar Timer",
      "Tem certeza que deseja parar o timer? O progresso será perdido.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Parar",
          style: "destructive",
          onPress: async () => {
            if (session) {
              await cancelPomodoroSession(session);
            }
            resetTimer();
          },
        },
      ]
    );
  };

  const handleTimerComplete = async () => {
    setIsRunning(false);
    
    if (!isBreak && session) {
      // Completa sessão de trabalho
      await completePomodoroSession(session);
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);
      
      // Verifica se deve fazer pausa longa
      const sessionsBeforeLongBreak = preferences?.pomodoroSessionsBeforeLongBreak || 4;
      const isLongBreak = newCount % sessionsBeforeLongBreak === 0;
      const breakDuration = isLongBreak
        ? preferences?.pomodoroLongBreakDuration || 15
        : preferences?.pomodoroBreakDuration || 5;
      
      Alert.alert(
        "🎉 Pomodoro Completo!",
        `Parabéns! Tempo para uma pausa de ${breakDuration} minutos.`,
        [
          {
            text: "Iniciar Pausa",
            onPress: () => startBreak(breakDuration),
          },
          { text: "Pular", onPress: resetTimer },
        ]
      );
    } else {
      // Completa pausa
      Alert.alert(
        "✅ Pausa Completa!",
        "Hora de voltar ao trabalho!",
        [{ text: "OK", onPress: resetTimer }]
      );
    }
    
    await loadData();
  };

  const startBreak = (breakDuration) => {
    setIsBreak(true);
    setDuration(breakDuration);
    setTimeLeft(breakDuration * 60);
    setSession(null);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setSession(null);
    const workDuration = preferences?.pomodoroWorkDuration || 25;
    setDuration(workDuration);
    setTimeLeft(workDuration * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const renderTask = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.taskCard,
        selectedTask?.id === item.id && styles.taskCardSelected,
      ]}
      onPress={() => setSelectedTask(item)}
      disabled={isRunning}
    >
      <Text style={styles.taskTitle}>{item.title}</Text>
      <Text style={styles.taskCategory}>
        {item.category || "geral"} • {item.priority || "media"}
      </Text>
    </TouchableOpacity>
  );

  const renderHistory = ({ item }) => {
    const task = tasks.find((t) => t.id === item.taskId);
    const date = new Date(item.startTime);
    
    return (
      <View style={styles.historyCard}>
        <Text style={styles.historyTime}>
          {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </Text>
        <Text style={styles.historyTask}>
          {task?.title || "Pausa"}
        </Text>
        <Text style={styles.historyDuration}>
          {item.actualDuration} min
        </Text>
      </View>
    );
  };

  const progress = duration > 0 ? ((duration * 60 - timeLeft) / (duration * 60)) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Timer Principal */}
      <View style={styles.timerSection}>
        <Text style={styles.timerLabel}>
          {isBreak ? "☕ Pausa" : "🍅 Pomodoro"}
        </Text>
        
        <View style={styles.timerCircle}>
          <View style={[styles.progressRing, { opacity: 0.2 }]} />
          <View
            style={[
              styles.progressRing,
              {
                borderColor: isBreak ? "#4caf50" : "#e53935",
                borderTopWidth: 8,
                borderRightWidth: progress > 25 ? 8 : 0,
                borderBottomWidth: progress > 50 ? 8 : 0,
                borderLeftWidth: progress > 75 ? 8 : 0,
              },
            ]}
          />
          <View style={styles.timerInner}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            <Text style={styles.timerSubtext}>
              {duration} minutos
            </Text>
          </View>
        </View>

        {/* Controles */}
        <View style={styles.controls}>
          {!isRunning && timeLeft === duration * 60 ? (
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
              <Text style={styles.startButtonText}>▶️ Iniciar</Text>
            </TouchableOpacity>
          ) : !isRunning ? (
            <>
              <TouchableOpacity style={styles.resumeButton} onPress={handleResume}>
                <Text style={styles.resumeButtonText}>▶️ Continuar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
                <Text style={styles.stopButtonText}>⏹️ Parar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
                <Text style={styles.pauseButtonText}>⏸️ Pausar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
                <Text style={styles.stopButtonText}>⏹️ Parar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Estatísticas */}
      {stats && (
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.todaySessions}</Text>
            <Text style={styles.statLabel}>Hoje</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalSessions}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{Math.round(stats.todayFocusTime / 60)}h</Text>
            <Text style={styles.statLabel}>Foco Hoje</Text>
          </View>
        </View>
      )}

      {/* Seleção de Tarefa */}
      {!isBreak && !isRunning && (
        <View style={styles.tasksSection}>
          <Text style={styles.sectionTitle}>Selecione uma Tarefa</Text>
          <FlatList
            data={tasks}
            renderItem={renderTask}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tasksList}
          />
        </View>
      )}

      {/* Histórico */}
      {history.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Histórico Recente</Text>
          <FlatList
            data={history}
            renderItem={renderHistory}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  timerSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  timerLabel: {
    fontSize: 20,
    fontWeight: "600",
    color: "#757575",
    marginBottom: 24,
  },
  timerCircle: {
    width: 240,
    height: 240,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  progressRing: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 8,
    borderColor: "#e0e0e0",
  },
  timerInner: {
    alignItems: "center",
  },
  timerText: {
    fontSize: 56,
    fontWeight: "700",
    color: "#212121",
  },
  timerSubtext: {
    fontSize: 16,
    color: "#757575",
    marginTop: 4,
  },
  controls: {
    flexDirection: "row",
    gap: 16,
  },
  startButton: {
    backgroundColor: "#e53935",
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  pauseButton: {
    backgroundColor: "#ff9800",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
  },
  pauseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resumeButton: {
    backgroundColor: "#4caf50",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
  },
  resumeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  stopButton: {
    backgroundColor: "#616161",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
  },
  stopButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  statCard: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1976d2",
  },
  statLabel: {
    fontSize: 12,
    color: "#757575",
    marginTop: 4,
  },
  tasksSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 12,
  },
  tasksList: {
    paddingRight: 16,
  },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 160,
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  taskCardSelected: {
    borderColor: "#1976d2",
    backgroundColor: "#e3f2fd",
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 8,
  },
  taskCategory: {
    fontSize: 12,
    color: "#757575",
  },
  historySection: {
    marginBottom: 16,
  },
  historyCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  historyTime: {
    fontSize: 14,
    color: "#757575",
    width: 60,
  },
  historyTask: {
    flex: 1,
    fontSize: 14,
    color: "#212121",
    fontWeight: "500",
  },
  historyDuration: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1976d2",
  },
});