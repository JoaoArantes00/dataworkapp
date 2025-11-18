import { loadTasks } from "../storage/taskStorage";
import { loadGamification } from "./gamificationService";
import { loadTimeTracking, getBestTimeOfDay, getProductivityByWeekday } from "./timeTrackingService";

/**
 * Obtém estatísticas detalhadas de tarefas
 */
export async function getTaskAnalytics() {
  try {
    const tasks = await loadTasks();
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Estatísticas básicas
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "concluida").length;
    const pending = tasks.filter((t) => t.status === "pendente").length;
    const inProgress = tasks.filter((t) => t.status === "andamento").length;
    
    // Por prioridade
    const highPriority = tasks.filter((t) => t.priority === "alta").length;
    const mediumPriority = tasks.filter((t) => t.priority === "media").length;
    const lowPriority = tasks.filter((t) => t.priority === "baixa").length;
    
    // Por categoria
    const categoryStats = {};
    tasks.forEach((task) => {
      const cat = task.category || "geral";
      if (!categoryStats[cat]) {
        categoryStats[cat] = { total: 0, completed: 0 };
      }
      categoryStats[cat].total++;
      if (task.status === "concluida") {
        categoryStats[cat].completed++;
      }
    });
    
    // Tarefas criadas hoje
    const createdToday = tasks.filter((t) => {
      const createdDate = new Date(t.createdAt).toISOString().split("T")[0];
      return createdDate === today;
    }).length;
    
    // Tarefas completadas hoje
    const completedToday = tasks.filter((t) => {
      if (t.status !== "concluida" || !t.updatedAt) return false;
      const completedDate = new Date(t.updatedAt).toISOString().split("T")[0];
      return completedDate === today;
    }).length;
    
    // Tarefas completadas esta semana
    const completedThisWeek = tasks.filter((t) => {
      if (t.status !== "concluida" || !t.updatedAt) return false;
      const completedDate = new Date(t.updatedAt);
      return completedDate >= thisWeekStart;
    }).length;
    
    // Tarefas completadas este mês
    const completedThisMonth = tasks.filter((t) => {
      if (t.status !== "concluida" || !t.updatedAt) return false;
      const completedDate = new Date(t.updatedAt);
      return completedDate >= thisMonthStart;
    }).length;
    
    // Taxa de conclusão
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      total,
      completed,
      pending,
      inProgress,
      completionRate,
      byPriority: {
        high: highPriority,
        medium: mediumPriority,
        low: lowPriority,
      },
      byCategory: categoryStats,
      today: {
        created: createdToday,
        completed: completedToday,
      },
      thisWeek: {
        completed: completedThisWeek,
      },
      thisMonth: {
        completed: completedThisMonth,
      },
    };
  } catch (error) {
    console.warn("Erro ao obter analytics de tarefas:", error);
    return null;
  }
}

/**
 * Obtém tendências de produtividade
 */
export async function getProductivityTrends() {
  try {
    const tasks = await loadTasks();
    const now = new Date();
    
    // Últimos 7 dias
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      const completedOnDay = tasks.filter((t) => {
        if (t.status !== "concluida" || !t.updatedAt) return false;
        const completedDate = new Date(t.updatedAt).toISOString().split("T")[0];
        return completedDate === dateStr;
      }).length;
      
      last7Days.push({
        date: dateStr,
        dayName: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][date.getDay()],
        completed: completedOnDay,
      });
    }
    
    // Últimas 4 semanas
    const last4Weeks = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (now.getDay() + i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const completedInWeek = tasks.filter((t) => {
        if (t.status !== "concluida" || !t.updatedAt) return false;
        const completedDate = new Date(t.updatedAt);
        return completedDate >= weekStart && completedDate <= weekEnd;
      }).length;
      
      last4Weeks.push({
        weekStart: weekStart.toISOString().split("T")[0],
        weekEnd: weekEnd.toISOString().split("T")[0],
        completed: completedInWeek,
      });
    }
    
    // Média diária
    const avgDaily = Math.round(
      last7Days.reduce((sum, day) => sum + day.completed, 0) / 7
    );
    
    // Média semanal
    const avgWeekly = Math.round(
      last4Weeks.reduce((sum, week) => sum + week.completed, 0) / 4
    );
    
    return {
      last7Days,
      last4Weeks,
      averages: {
        daily: avgDaily,
        weekly: avgWeekly,
      },
    };
  } catch (error) {
    console.warn("Erro ao obter tendências:", error);
    return null;
  }
}

/**
 * Obtém insights automáticos avançados
 */
export async function getAdvancedInsights() {
  try {
    const taskAnalytics = await getTaskAnalytics();
    const trends = await getProductivityTrends();
    const gamification = await loadGamification();
    const bestTime = await getBestTimeOfDay();
    const weekdayProd = await getProductivityByWeekday();
    
    const insights = [];
    
    // Insight 1: Taxa de conclusão
    if (taskAnalytics.completionRate >= 80) {
      insights.push({
        type: "success",
        icon: "🎯",
        title: "Excelente Taxa de Conclusão",
        message: `Você está completando ${taskAnalytics.completionRate}% das suas tarefas! Continue assim!`,
      });
    } else if (taskAnalytics.completionRate < 50) {
      insights.push({
        type: "warning",
        icon: "⚠️",
        title: "Taxa de Conclusão Baixa",
        message: `Apenas ${taskAnalytics.completionRate}% das tarefas estão completas. Foque em finalizar tarefas pendentes!`,
      });
    }
    
    // Insight 2: Melhor horário
    if (bestTime.sessions >= 3) {
      insights.push({
        type: "info",
        icon: "⏰",
        title: "Seu Melhor Horário",
        message: `Você é mais produtivo durante a ${bestTime.period} (às ${bestTime.hour}h). Agende tarefas importantes nesse horário!`,
      });
    }
    
    // Insight 3: Categoria mais usada
    const topCategory = Object.entries(taskAnalytics.byCategory).sort(
      (a, b) => b[1].total - a[1].total
    )[0];
    if (topCategory && topCategory[1].total >= 5) {
      const catName = topCategory[0];
      const catStats = topCategory[1];
      const catRate = Math.round((catStats.completed / catStats.total) * 100);
      
      insights.push({
        type: "info",
        icon: "📊",
        title: "Categoria Favorita",
        message: `${catStats.total} tarefas em "${catName}" (${catRate}% completadas).`,
      });
    }
    
    // Insight 4: Prioridades
    if (taskAnalytics.byPriority.high >= 5) {
      const highCompleted = await countCompletedByPriority("alta");
      const highRate = Math.round((highCompleted / taskAnalytics.byPriority.high) * 100);
      
      if (highRate < 60) {
        insights.push({
          type: "warning",
          icon: "🔴",
          title: "Atenção: Tarefas de Alta Prioridade",
          message: `Você tem ${taskAnalytics.byPriority.high} tarefas de alta prioridade, mas só completou ${highRate}%.`,
        });
      }
    }
    
    // Insight 5: Tendência de produtividade
    const recentDays = trends.last7Days.slice(-3);
    const avgRecent = recentDays.reduce((sum, d) => sum + d.completed, 0) / 3;
    const olderDays = trends.last7Days.slice(0, 3);
    const avgOlder = olderDays.reduce((sum, d) => sum + d.completed, 0) / 3;
    
    if (avgRecent > avgOlder * 1.2) {
      insights.push({
        type: "success",
        icon: "📈",
        title: "Produtividade em Alta",
        message: `Você está completando 20% mais tarefas nos últimos dias! Continue assim!`,
      });
    } else if (avgRecent < avgOlder * 0.8) {
      insights.push({
        type: "warning",
        icon: "📉",
        title: "Produtividade em Queda",
        message: `Sua produtividade caiu 20% nos últimos dias. Que tal reorganizar suas prioridades?`,
      });
    }
    
    // Insight 6: Streak
    if (gamification.currentStreak >= 7) {
      insights.push({
        type: "success",
        icon: "🔥",
        title: "Streak Incrível",
        message: `${gamification.currentStreak} dias consecutivos! Você está no caminho certo!`,
      });
    } else if (gamification.currentStreak === 0 && gamification.longestStreak >= 7) {
      insights.push({
        type: "warning",
        icon: "💔",
        title: "Streak Perdido",
        message: `Você perdeu seu streak de ${gamification.longestStreak} dias. Comece de novo hoje!`,
      });
    }
    
    // Insight 7: Melhor dia da semana
    const bestDay = weekdayProd.sort((a, b) => b.sessions - a.sessions)[0];
    if (bestDay && bestDay.sessions >= 3) {
      insights.push({
        type: "info",
        icon: "📅",
        title: "Seu Melhor Dia",
        message: `${bestDay.day} é seu dia mais produtivo! Planeje tarefas importantes para esse dia.`,
      });
    }
    
    return insights;
  } catch (error) {
    console.warn("Erro ao gerar insights:", error);
    return [];
  }
}

/**
 * Função auxiliar para contar tarefas completadas por prioridade
 */
async function countCompletedByPriority(priority) {
  const tasks = await loadTasks();
  return tasks.filter((t) => t.status === "concluida" && t.priority === priority).length;
}

/**
 * Obtém dados para gráfico de produtividade por categoria
 */
export async function getCategoryChartData() {
  try {
    const analytics = await getTaskAnalytics();
    
    const categories = [
      { key: "trabalho", label: "Trabalho", icon: "💼", color: "#1976d2" },
      { key: "estudos", label: "Estudos", icon: "📚", color: "#7b1fa2" },
      { key: "saude", label: "Saúde", icon: "💪", color: "#388e3c" },
      { key: "casa", label: "Casa", icon: "🏠", color: "#f57c00" },
      { key: "pessoal", label: "Pessoal", icon: "🎯", color: "#c2185b" },
      { key: "geral", label: "Geral", icon: "📋", color: "#616161" },
    ];
    
    return categories.map((cat) => {
      const stats = analytics.byCategory[cat.key] || { total: 0, completed: 0 };
      const percentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
      
      return {
        ...cat,
        total: stats.total,
        completed: stats.completed,
        percentage,
      };
    }).filter((cat) => cat.total > 0); // Apenas categorias com tarefas
  } catch (error) {
    console.warn("Erro ao obter dados de gráfico:", error);
    return [];
  }
}

/**
 * Obtém dados para gráfico de tendências (7 dias)
 */
export async function getTrendsChartData() {
  try {
    const trends = await getProductivityTrends();
    return trends.last7Days;
  } catch (error) {
    console.warn("Erro ao obter dados de tendências:", error);
    return [];
  }
}

/**
 * Obtém score de produtividade (0-100)
 */
export async function getProductivityScore() {
  try {
    const analytics = await getTaskAnalytics();
    const gamification = await loadGamification();
    const trends = await getProductivityTrends();
    
    let score = 0;
    
    // Taxa de conclusão (40 pontos)
    score += Math.round(analytics.completionRate * 0.4);
    
    // Streak (20 pontos)
    const streakScore = Math.min(gamification.currentStreak * 2, 20);
    score += streakScore;
    
    // Consistência - tarefas nos últimos 7 dias (20 pontos)
    const daysWithTasks = trends.last7Days.filter((d) => d.completed > 0).length;
    score += Math.round((daysWithTasks / 7) * 20);
    
    // Média diária (20 pontos)
    const avgScore = Math.min(trends.averages.daily * 2, 20);
    score += avgScore;
    
    return Math.min(score, 100);
  } catch (error) {
    console.warn("Erro ao calcular score:", error);
    return 0;
  }
}

/**
 * Obtém comparação com período anterior
 */
export async function getComparison() {
  try {
    const tasks = await loadTasks();
    const now = new Date();
    
    // Semana atual vs semana passada
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setDate(thisWeekStart.getDate() - 1);
    
    const thisWeekCompleted = tasks.filter((t) => {
      if (t.status !== "concluida" || !t.updatedAt) return false;
      const completedDate = new Date(t.updatedAt);
      return completedDate >= thisWeekStart;
    }).length;
    
    const lastWeekCompleted = tasks.filter((t) => {
      if (t.status !== "concluida" || !t.updatedAt) return false;
      const completedDate = new Date(t.updatedAt);
      return completedDate >= lastWeekStart && completedDate <= lastWeekEnd;
    }).length;
    
    const weeklyChange =
      lastWeekCompleted > 0
        ? Math.round(((thisWeekCompleted - lastWeekCompleted) / lastWeekCompleted) * 100)
        : 0;
    
    return {
      thisWeek: thisWeekCompleted,
      lastWeek: lastWeekCompleted,
      change: weeklyChange,
      improving: weeklyChange > 0,
    };
  } catch (error) {
    console.warn("Erro ao calcular comparação:", error);
    return {
      thisWeek: 0,
      lastWeek: 0,
      change: 0,
      improving: false,
    };
  }
}