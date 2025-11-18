import AsyncStorage from "@react-native-async-storage/async-storage";

const GAMIFICATION_KEY = "@datawork_gamification";

// Configurações de XP
const XP_REWARDS = {
  TASK_COMPLETED: 10,
  TASK_HIGH_PRIORITY: 20,
  TASK_MEDIUM_PRIORITY: 15,
  TASK_LOW_PRIORITY: 10,
  DAILY_LOGIN: 5,
  STREAK_BONUS_7: 100,
  STREAK_BONUS_30: 500,
  ALL_TASKS_COMPLETED: 50,
};

// Níveis e títulos
const LEVELS = [
  { level: 1, xpRequired: 0, title: "Iniciante" },
  { level: 2, xpRequired: 100, title: "Aprendiz" },
  { level: 3, xpRequired: 250, title: "Dedicado" },
  { level: 4, xpRequired: 500, title: "Consistente" },
  { level: 5, xpRequired: 1000, title: "Produtivo" },
  { level: 6, xpRequired: 2000, title: "Mestre" },
  { level: 7, xpRequired: 4000, title: "Especialista" },
  { level: 8, xpRequired: 7000, title: "Lendário" },
  { level: 9, xpRequired: 12000, title: "Épico" },
  { level: 10, xpRequired: 20000, title: "Imortal" },
];

// Definição de conquistas
const ACHIEVEMENTS = [
  {
    id: "first_task",
    title: "Primeiro Passo",
    description: "Complete sua primeira tarefa",
    icon: "🎯",
    xpBonus: 50,
    requirement: (stats) => stats.totalCompleted >= 1,
  },
  {
    id: "task_10",
    title: "Trabalhador",
    description: "Complete 10 tarefas",
    icon: "💪",
    xpBonus: 100,
    requirement: (stats) => stats.totalCompleted >= 10,
  },
  {
    id: "task_50",
    title: "Dedicado",
    description: "Complete 50 tarefas",
    icon: "🏆",
    xpBonus: 250,
    requirement: (stats) => stats.totalCompleted >= 50,
  },
  {
    id: "task_100",
    title: "Centurião",
    description: "Complete 100 tarefas",
    icon: "⚡",
    xpBonus: 500,
    requirement: (stats) => stats.totalCompleted >= 100,
  },
  {
    id: "streak_7",
    title: "Consistente",
    description: "Mantenha 7 dias de streak",
    icon: "🔥",
    xpBonus: 150,
    requirement: (stats) => stats.currentStreak >= 7,
  },
  {
    id: "streak_30",
    title: "Imparável",
    description: "Mantenha 30 dias de streak",
    icon: "🚀",
    xpBonus: 1000,
    requirement: (stats) => stats.currentStreak >= 30,
  },
  {
    id: "speedster",
    title: "Velocista",
    description: "Complete 10 tarefas em 1 dia",
    icon: "⚡",
    xpBonus: 200,
    requirement: (stats) => stats.tasksCompletedToday >= 10,
  },
  {
    id: "perfectionist",
    title: "Perfeccionista",
    description: "Complete todas as tarefas do dia 5 vezes",
    icon: "✨",
    xpBonus: 300,
    requirement: (stats) => stats.perfectDays >= 5,
  },
  {
    id: "early_bird",
    title: "Madrugador",
    description: "Complete uma tarefa antes das 8h",
    icon: "🌅",
    xpBonus: 100,
    requirement: (stats) => stats.earlyBirdTasks >= 1,
  },
  {
    id: "night_owl",
    title: "Coruja Noturna",
    description: "Complete uma tarefa após 22h",
    icon: "🦉",
    xpBonus: 100,
    requirement: (stats) => stats.nightOwlTasks >= 1,
  },
];

/**
 * Inicializa os dados de gamificação
 */
async function initializeGamification() {
  const defaultData = {
    xp: 0,
    level: 1,
    totalCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastLoginDate: new Date().toISOString().split("T")[0],
    unlockedAchievements: [],
    stats: {
      tasksCompletedToday: 0,
      perfectDays: 0,
      earlyBirdTasks: 0,
      nightOwlTasks: 0,
    },
  };

  try {
    const data = await AsyncStorage.getItem(GAMIFICATION_KEY);
    if (!data) {
      await AsyncStorage.setItem(GAMIFICATION_KEY, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(data);
  } catch (error) {
    console.warn("Erro ao inicializar gamificação:", error);
    return defaultData;
  }
}

/**
 * Carrega os dados de gamificação
 */
export async function loadGamification() {
  try {
    const data = await AsyncStorage.getItem(GAMIFICATION_KEY);
    if (!data) {
      return await initializeGamification();
    }
    return JSON.parse(data);
  } catch (error) {
    console.warn("Erro ao carregar gamificação:", error);
    return await initializeGamification();
  }
}

/**
 * Salva os dados de gamificação
 */
async function saveGamification(data) {
  try {
    await AsyncStorage.setItem(GAMIFICATION_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn("Erro ao salvar gamificação:", error);
    return false;
  }
}

/**
 * Adiciona XP e verifica level up
 */
export async function addXP(amount, reason = "") {
  try {
    const data = await loadGamification();
    const oldLevel = data.level;
    data.xp += amount;

    // Verifica level up
    const newLevel = calculateLevel(data.xp);
    data.level = newLevel.level;

    await saveGamification(data);

    // Retorna se subiu de nível
    return {
      success: true,
      levelUp: newLevel.level > oldLevel,
      oldLevel,
      newLevel: newLevel.level,
      newTitle: newLevel.title,
      totalXP: data.xp,
      reason,
    };
  } catch (error) {
    console.warn("Erro ao adicionar XP:", error);
    return { success: false };
  }
}

/**
 * Calcula o nível baseado no XP
 */
function calculateLevel(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

/**
 * Obtém informações do nível atual
 */
export function getLevelInfo(xp) {
  const currentLevel = calculateLevel(xp);
  const nextLevelIndex = LEVELS.findIndex((l) => l.level === currentLevel.level) + 1;
  const nextLevel = nextLevelIndex < LEVELS.length ? LEVELS[nextLevelIndex] : null;

  return {
    currentLevel: currentLevel.level,
    currentTitle: currentLevel.title,
    currentXP: xp,
    xpForCurrentLevel: currentLevel.xpRequired,
    nextLevel: nextLevel ? nextLevel.level : null,
    nextTitle: nextLevel ? nextLevel.title : "MAX",
    xpForNextLevel: nextLevel ? nextLevel.xpRequired : xp,
    xpProgress: nextLevel ? xp - currentLevel.xpRequired : 0,
    xpNeeded: nextLevel ? nextLevel.xpRequired - xp : 0,
    progressPercent: nextLevel
      ? ((xp - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired)) * 100
      : 100,
  };
}

/**
 * Registra conclusão de tarefa e adiciona XP
 */
export async function onTaskCompleted(task) {
  try {
    const data = await loadGamification();

    // XP baseado na prioridade
    let xpGained = XP_REWARDS.TASK_COMPLETED;
    if (task.priority === "alta") {
      xpGained = XP_REWARDS.TASK_HIGH_PRIORITY;
    } else if (task.priority === "media") {
      xpGained = XP_REWARDS.TASK_MEDIUM_PRIORITY;
    }

    // Verifica horário
    const hour = new Date().getHours();
    if (hour < 8) {
      data.stats.earlyBirdTasks = (data.stats.earlyBirdTasks || 0) + 1;
    } else if (hour >= 22) {
      data.stats.nightOwlTasks = (data.stats.nightOwlTasks || 0) + 1;
    }

    // Atualiza estatísticas
    data.totalCompleted += 1;
    data.stats.tasksCompletedToday = (data.stats.tasksCompletedToday || 0) + 1;

    await saveGamification(data);

    // Adiciona XP
    const xpResult = await addXP(xpGained, `Tarefa concluída: ${task.title}`);

    // Verifica novas conquistas
    const newAchievements = await checkAchievements();

    return {
      ...xpResult,
      xpGained,
      newAchievements,
    };
  } catch (error) {
    console.warn("Erro ao processar conclusão de tarefa:", error);
    return { success: false };
  }
}

/**
 * Atualiza o streak diário
 */
export async function updateDailyStreak() {
  try {
    const data = await loadGamification();
    const today = new Date().toISOString().split("T")[0];
    const lastLogin = data.lastLoginDate;

    if (lastLogin === today) {
      // Já fez login hoje
      return { streakUpdated: false, currentStreak: data.currentStreak };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (lastLogin === yesterdayStr) {
      // Login consecutivo
      data.currentStreak += 1;
      data.longestStreak = Math.max(data.longestStreak, data.currentStreak);

      // Bônus de streak
      if (data.currentStreak === 7) {
        await addXP(XP_REWARDS.STREAK_BONUS_7, "7 dias de streak!");
      } else if (data.currentStreak === 30) {
        await addXP(XP_REWARDS.STREAK_BONUS_30, "30 dias de streak!");
      }
    } else {
      // Streak quebrado
      data.currentStreak = 1;
    }

    data.lastLoginDate = today;
    data.stats.tasksCompletedToday = 0; // Reset contador diário

    await saveGamification(data);
    await addXP(XP_REWARDS.DAILY_LOGIN, "Login diário");

    return {
      streakUpdated: true,
      currentStreak: data.currentStreak,
      longestStreak: data.longestStreak,
    };
  } catch (error) {
    console.warn("Erro ao atualizar streak:", error);
    return { streakUpdated: false };
  }
}

/**
 * Verifica e desbloqueia novas conquistas
 */
export async function checkAchievements() {
  try {
    const data = await loadGamification();
    const newAchievements = [];

    for (const achievement of ACHIEVEMENTS) {
      // Já foi desbloqueada?
      if (data.unlockedAchievements.includes(achievement.id)) {
        continue;
      }

      // Verifica requisito
      if (achievement.requirement(data.stats)) {
        data.unlockedAchievements.push(achievement.id);
        newAchievements.push(achievement);

        // Adiciona XP bônus
        await addXP(achievement.xpBonus, `Conquista: ${achievement.title}`);
      }
    }

    if (newAchievements.length > 0) {
      await saveGamification(data);
    }

    return newAchievements;
  } catch (error) {
    console.warn("Erro ao verificar conquistas:", error);
    return [];
  }
}

/**
 * Obtém todas as conquistas (desbloqueadas e bloqueadas)
 */
export async function getAllAchievements() {
  try {
    const data = await loadGamification();

    return ACHIEVEMENTS.map((achievement) => ({
      ...achievement,
      unlocked: data.unlockedAchievements.includes(achievement.id),
    }));
  } catch (error) {
    console.warn("Erro ao obter conquistas:", error);
    return [];
  }
}

/**
 * Registra dia perfeito (todas tarefas completadas)
 */
export async function onPerfectDay() {
  try {
    const data = await loadGamification();
    data.stats.perfectDays = (data.stats.perfectDays || 0) + 1;
    await saveGamification(data);
    await addXP(XP_REWARDS.ALL_TASKS_COMPLETED, "Dia perfeito! 🎉");

    // Verifica novas conquistas
    const newAchievements = await checkAchievements();
    return { success: true, newAchievements };
  } catch (error) {
    console.warn("Erro ao registrar dia perfeito:", error);
    return { success: false };
  }
}

/**
 * Reseta a gamificação (para testes)
 */
export async function resetGamification() {
  try {
    await AsyncStorage.removeItem(GAMIFICATION_KEY);
    return await initializeGamification();
  } catch (error) {
    console.warn("Erro ao resetar gamificação:", error);
    return null;
  }
}