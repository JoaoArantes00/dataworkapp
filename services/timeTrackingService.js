import AsyncStorage from "@react-native-async-storage/async-storage";

const TIME_TRACKING_KEY = "@datawork_time_tracking";
const POMODORO_SESSIONS_KEY = "@datawork_pomodoro_sessions";

/**
 * Estrutura de dados de time tracking
 */
const DEFAULT_TIME_DATA = {
  tasks: {}, // { taskId: { estimated: 120, spent: 45, sessions: [] } }
  pomodoroSessions: [], // [{ taskId, start, end, duration, completed }]
  totalFocusTime: 0, // minutos totais focados
  todayFocusTime: 0,
};

/**
 * Carrega dados de time tracking
 */
export async function loadTimeTracking() {
  try {
    const data = await AsyncStorage.getItem(TIME_TRACKING_KEY);
    if (!data) {
      return DEFAULT_TIME_DATA;
    }
    return JSON.parse(data);
  } catch (error) {
    console.warn("Erro ao carregar time tracking:", error);
    return DEFAULT_TIME_DATA;
  }
}

/**
 * Salva dados de time tracking
 */
async function saveTimeTracking(data) {
  try {
    await AsyncStorage.setItem(TIME_TRACKING_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn("Erro ao salvar time tracking:", error);
    return false;
  }
}

/**
 * Define estimativa de tempo para uma tarefa
 */
export async function setTaskEstimate(taskId, minutes) {
  try {
    const data = await loadTimeTracking();
    
    if (!data.tasks[taskId]) {
      data.tasks[taskId] = {
        estimated: 0,
        spent: 0,
        sessions: [],
      };
    }
    
    data.tasks[taskId].estimated = minutes;
    await saveTimeTracking(data);
    return true;
  } catch (error) {
    console.warn("Erro ao definir estimativa:", error);
    return false;
  }
}

/**
 * Registra tempo gasto em uma tarefa
 */
export async function addTimeSpent(taskId, minutes) {
  try {
    const data = await loadTimeTracking();
    
    if (!data.tasks[taskId]) {
      data.tasks[taskId] = {
        estimated: 0,
        spent: 0,
        sessions: [],
      };
    }
    
    data.tasks[taskId].spent += minutes;
    data.totalFocusTime += minutes;
    
    await saveTimeTracking(data);
    return true;
  } catch (error) {
    console.warn("Erro ao adicionar tempo gasto:", error);
    return false;
  }
}

/**
 * Inicia sessão Pomodoro
 */
export async function startPomodoroSession(taskId, duration = 25) {
  try {
    const session = {
      id: Date.now().toString(),
      taskId,
      startTime: new Date().toISOString(),
      plannedDuration: duration,
      completed: false,
    };
    
    return session;
  } catch (error) {
    console.warn("Erro ao iniciar sessão Pomodoro:", error);
    return null;
  }
}

/**
 * Completa sessão Pomodoro
 */
export async function completePomodoroSession(session) {
  try {
    const data = await loadTimeTracking();
    
    const endTime = new Date();
    const startTime = new Date(session.startTime);
    const actualDuration = Math.round((endTime - startTime) / 1000 / 60); // minutos
    
    const completedSession = {
      ...session,
      endTime: endTime.toISOString(),
      actualDuration,
      completed: true,
    };
    
    // Adiciona a sessão ao histórico
    data.pomodoroSessions.push(completedSession);
    
    // Atualiza tempo gasto na tarefa
    if (session.taskId) {
      await addTimeSpent(session.taskId, actualDuration);
    }
    
    // Atualiza tempo de foco de hoje
    const today = new Date().toISOString().split("T")[0];
    const sessionDate = new Date(session.startTime).toISOString().split("T")[0];
    
    if (today === sessionDate) {
      data.todayFocusTime += actualDuration;
    }
    
    await saveTimeTracking(data);
    
    return completedSession;
  } catch (error) {
    console.warn("Erro ao completar sessão Pomodoro:", error);
    return null;
  }
}

/**
 * Cancela sessão Pomodoro
 */
export async function cancelPomodoroSession(session) {
  try {
    const data = await loadTimeTracking();
    
    const cancelledSession = {
      ...session,
      endTime: new Date().toISOString(),
      completed: false,
      cancelled: true,
    };
    
    data.pomodoroSessions.push(cancelledSession);
    await saveTimeTracking(data);
    
    return true;
  } catch (error) {
    console.warn("Erro ao cancelar sessão Pomodoro:", error);
    return false;
  }
}

/**
 * Obtém estatísticas de Pomodoro
 */
export async function getPomodoroStats() {
  try {
    const data = await loadTimeTracking();
    
    const completedSessions = data.pomodoroSessions.filter((s) => s.completed);
    const today = new Date().toISOString().split("T")[0];
    const todaySessions = completedSessions.filter(
      (s) => new Date(s.startTime).toISOString().split("T")[0] === today
    );
    
    return {
      totalSessions: completedSessions.length,
      todaySessions: todaySessions.length,
      totalFocusTime: data.totalFocusTime,
      todayFocusTime: data.todayFocusTime,
      averageSessionDuration:
        completedSessions.length > 0
          ? Math.round(
              completedSessions.reduce((sum, s) => sum + s.actualDuration, 0) /
                completedSessions.length
            )
          : 0,
    };
  } catch (error) {
    console.warn("Erro ao obter stats de Pomodoro:", error);
    return {
      totalSessions: 0,
      todaySessions: 0,
      totalFocusTime: 0,
      todayFocusTime: 0,
      averageSessionDuration: 0,
    };
  }
}

/**
 * Obtém tempo estimado vs gasto de uma tarefa
 */
export async function getTaskTimeInfo(taskId) {
  try {
    const data = await loadTimeTracking();
    const taskData = data.tasks[taskId];
    
    if (!taskData) {
      return {
        estimated: 0,
        spent: 0,
        remaining: 0,
        overrun: 0,
        efficiency: 100,
      };
    }
    
    const estimated = taskData.estimated || 0;
    const spent = taskData.spent || 0;
    const remaining = Math.max(0, estimated - spent);
    const overrun = Math.max(0, spent - estimated);
    const efficiency = estimated > 0 ? Math.round((estimated / spent) * 100) : 100;
    
    return {
      estimated,
      spent,
      remaining,
      overrun,
      efficiency,
    };
  } catch (error) {
    console.warn("Erro ao obter info de tempo:", error);
    return {
      estimated: 0,
      spent: 0,
      remaining: 0,
      overrun: 0,
      efficiency: 100,
    };
  }
}

/**
 * Obtém histórico de sessões Pomodoro
 */
export async function getPomodoroHistory(limit = 10) {
  try {
    const data = await loadTimeTracking();
    return data.pomodoroSessions
      .filter((s) => s.completed)
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .slice(0, limit);
  } catch (error) {
    console.warn("Erro ao obter histórico:", error);
    return [];
  }
}

/**
 * Reseta tempo de foco diário (chamar à meia-noite)
 */
export async function resetDailyFocusTime() {
  try {
    const data = await loadTimeTracking();
    data.todayFocusTime = 0;
    await saveTimeTracking(data);
    return true;
  } catch (error) {
    console.warn("Erro ao resetar tempo diário:", error);
    return false;
  }
}

/**
 * Obtém melhor horário do dia baseado em sessões completadas
 */
export async function getBestTimeOfDay() {
  try {
    const data = await loadTimeTracking();
    const completedSessions = data.pomodoroSessions.filter((s) => s.completed);
    
    if (completedSessions.length === 0) {
      return {
        period: "Manhã",
        hour: 9,
        sessions: 0,
      };
    }
    
    // Agrupa por hora do dia
    const hourCounts = {};
    completedSessions.forEach((session) => {
      const hour = new Date(session.startTime).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    // Encontra hora com mais sessões
    const bestHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
    const hour = parseInt(bestHour[0]);
    const sessions = bestHour[1];
    
    // Define período do dia
    let period;
    if (hour >= 5 && hour < 12) period = "Manhã";
    else if (hour >= 12 && hour < 18) period = "Tarde";
    else if (hour >= 18 && hour < 22) period = "Noite";
    else period = "Madrugada";
    
    return {
      period,
      hour,
      sessions,
    };
  } catch (error) {
    console.warn("Erro ao calcular melhor horário:", error);
    return {
      period: "Manhã",
      hour: 9,
      sessions: 0,
    };
  }
}

/**
 * Obtém produtividade por dia da semana
 */
export async function getProductivityByWeekday() {
  try {
    const data = await loadTimeTracking();
    const completedSessions = data.pomodoroSessions.filter((s) => s.completed);
    
    const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];
    
    completedSessions.forEach((session) => {
      const day = new Date(session.startTime).getDay();
      weekdayCounts[day]++;
    });
    
    return weekdays.map((day, index) => ({
      day,
      sessions: weekdayCounts[index],
    }));
  } catch (error) {
    console.warn("Erro ao calcular produtividade por dia:", error);
    return [];
  }
}

/**
 * Limpa dados de time tracking (para testes)
 */
export async function clearTimeTracking() {
  try {
    await AsyncStorage.removeItem(TIME_TRACKING_KEY);
    return true;
  } catch (error) {
    console.warn("Erro ao limpar time tracking:", error);
    return false;
  }
}