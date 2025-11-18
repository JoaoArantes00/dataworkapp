import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  getTaskAnalytics,
  getProductivityTrends,
  getAdvancedInsights,
  getCategoryChartData,
  getTrendsChartData,
  getProductivityScore,
  getComparison,
} from "../services/analyticsService";
import { getBestTimeOfDay } from "../services/timeTrackingService";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function AnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [insights, setInsights] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [trendsData, setTrendsData] = useState([]);
  const [score, setScore] = useState(0);
  const [comparison, setComparison] = useState(null);
  const [bestTime, setBestTime] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      loadAllAnalytics();
    }, [])
  );

  const loadAllAnalytics = async () => {
    try {
      setLoading(true);
      
      const [
        taskAnalytics,
        productivityTrends,
        advancedInsights,
        categoryChart,
        trendsChart,
        productivityScore,
        weekComparison,
        bestTimeOfDay,
      ] = await Promise.all([
        getTaskAnalytics(),
        getProductivityTrends(),
        getAdvancedInsights(),
        getCategoryChartData(),
        getTrendsChartData(),
        getProductivityScore(),
        getComparison(),
        getBestTimeOfDay(),
      ]);
      
      setAnalytics(taskAnalytics);
      setTrends(productivityTrends);
      setInsights(advancedInsights);
      setCategoryData(categoryChart);
      setTrendsData(trendsChart);
      setScore(productivityScore);
      setComparison(weekComparison);
      setBestTime(bestTimeOfDay);
    } catch (error) {
      console.error("Erro ao carregar analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Analisando seus dados...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Score de Produtividade */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Score de Produtividade</Text>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>{score}</Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
          <View style={styles.scoreBar}>
            <View
              style={[
                styles.scoreBarFill,
                {
                  width: `${score}%`,
                  backgroundColor: score >= 70 ? "#4caf50" : score >= 40 ? "#ff9800" : "#e53935",
                },
              ]}
            />
          </View>
          {comparison && (
            <Text style={styles.comparisonText}>
              {comparison.improving ? "📈" : "📉"} {Math.abs(comparison.change)}%{" "}
              {comparison.improving ? "melhor" : "pior"} que semana passada
            </Text>
          )}
        </View>

        {/* Insights Automáticos */}
        {insights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 Insights</Text>
            {insights.map((insight, index) => (
              <View
                key={index}
                style={[
                  styles.insightCard,
                  {
                    backgroundColor:
                      insight.type === "success"
                        ? "#e8f5e9"
                        : insight.type === "warning"
                        ? "#fff3e0"
                        : "#e3f2fd",
                    borderLeftColor:
                      insight.type === "success"
                        ? "#4caf50"
                        : insight.type === "warning"
                        ? "#ff9800"
                        : "#1976d2",
                  },
                ]}
              >
                <Text style={styles.insightIcon}>{insight.icon}</Text>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <Text style={styles.insightMessage}>{insight.message}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Gráfico de Tendências (7 dias) */}
        {trendsData.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 Tendência (7 dias)</Text>
            <View style={styles.chartCard}>
              <View style={styles.barChart}>
                {trendsData.map((day, index) => {
                  const maxCompleted = Math.max(...trendsData.map((d) => d.completed), 1);
                  const height = (day.completed / maxCompleted) * 120;
                  
                  return (
                    <View key={index} style={styles.barContainer}>
                      <View style={styles.barWrapper}>
                        <View
                          style={[
                            styles.bar,
                            {
                              height,
                              backgroundColor: day.completed > 0 ? "#1976d2" : "#e0e0e0",
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.barLabel}>{day.dayName}</Text>
                      <Text style={styles.barValue}>{day.completed}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Produtividade por Categoria */}
        {categoryData.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Por Categoria</Text>
            <View style={styles.chartCard}>
              {categoryData.map((cat, index) => (
                <View key={index} style={styles.categoryRow}>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                    <Text style={styles.categoryLabel}>{cat.label}</Text>
                  </View>
                  <View style={styles.categoryStats}>
                    <View style={styles.categoryBar}>
                      <View
                        style={[
                          styles.categoryBarFill,
                          {
                            width: `${cat.percentage}%`,
                            backgroundColor: cat.color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.categoryPercentage}>{cat.percentage}%</Text>
                  </View>
                  <Text style={styles.categoryCount}>
                    {cat.completed}/{cat.total}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Melhor Horário */}
        {bestTime && bestTime.sessions >= 3 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏰ Melhor Horário</Text>
            <View style={styles.bestTimeCard}>
              <View style={styles.bestTimeIcon}>
                <Text style={styles.bestTimeEmoji}>
                  {bestTime.hour >= 5 && bestTime.hour < 12
                    ? "🌅"
                    : bestTime.hour >= 12 && bestTime.hour < 18
                    ? "☀️"
                    : bestTime.hour >= 18 && bestTime.hour < 22
                    ? "🌆"
                    : "🌙"}
                </Text>
              </View>
              <View style={styles.bestTimeInfo}>
                <Text style={styles.bestTimePeriod}>{bestTime.period}</Text>
                <Text style={styles.bestTimeDetail}>
                  Às {bestTime.hour}:00 ({bestTime.sessions} sessões)
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Estatísticas Detalhadas */}
        {analytics && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Estatísticas</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{analytics.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: "#4caf50" }]}>
                  {analytics.completed}
                </Text>
                <Text style={styles.statLabel}>Completadas</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: "#ff9800" }]}>
                  {analytics.inProgress}
                </Text>
                <Text style={styles.statLabel}>Em Andamento</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: "#e53935" }]}>
                  {analytics.pending}
                </Text>
                <Text style={styles.statLabel}>Pendentes</Text>
              </View>
            </View>

            <View style={styles.statsDetails}>
              <View style={styles.statDetail}>
                <Text style={styles.statDetailLabel}>Hoje</Text>
                <Text style={styles.statDetailValue}>
                  {analytics.today.completed} completadas
                </Text>
              </View>
              <View style={styles.statDetail}>
                <Text style={styles.statDetailLabel}>Esta Semana</Text>
                <Text style={styles.statDetailValue}>
                  {analytics.thisWeek.completed} completadas
                </Text>
              </View>
              <View style={styles.statDetail}>
                <Text style={styles.statDetailLabel}>Este Mês</Text>
                <Text style={styles.statDetailValue}>
                  {analytics.thisMonth.completed} completadas
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Médias */}
        {trends && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Médias</Text>
            <View style={styles.averagesCard}>
              <View style={styles.averageItem}>
                <Text style={styles.averageNumber}>{trends.averages.daily}</Text>
                <Text style={styles.averageLabel}>Tarefas/Dia</Text>
              </View>
              <View style={styles.averageDivider} />
              <View style={styles.averageItem}>
                <Text style={styles.averageNumber}>{trends.averages.weekly}</Text>
                <Text style={styles.averageLabel}>Tarefas/Semana</Text>
              </View>
            </View>
          </View>
        )}
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
  scoreCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 16,
  },
  scoreCircle: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  scoreNumber: {
    fontSize: 72,
    fontWeight: "700",
    color: "#1976d2",
  },
  scoreMax: {
    fontSize: 24,
    color: "#757575",
    marginLeft: 4,
  },
  scoreBar: {
    width: "100%",
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  comparisonText: {
    fontSize: 14,
    color: "#757575",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 12,
  },
  insightCard: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 4,
  },
  insightMessage: {
    fontSize: 14,
    color: "#424242",
  },
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  barChart: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 160,
  },
  barContainer: {
    alignItems: "center",
    flex: 1,
  },
  barWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
  },
  bar: {
    width: "80%",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    fontSize: 12,
    color: "#757575",
    marginTop: 4,
  },
  barValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#212121",
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    width: 120,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryLabel: {
    fontSize: 14,
    color: "#212121",
    fontWeight: "500",
  },
  categoryStats: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  categoryBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
    marginRight: 8,
  },
  categoryBarFill: {
    height: "100%",
  },
  categoryPercentage: {
    fontSize: 12,
    fontWeight: "600",
    color: "#757575",
    width: 40,
  },
  categoryCount: {
    fontSize: 12,
    color: "#757575",
    width: 40,
    textAlign: "right",
  },
  bestTimeCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  bestTimeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e3f2fd",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  bestTimeEmoji: {
    fontSize: 32,
  },
  bestTimeInfo: {
    flex: 1,
  },
  bestTimePeriod: {
    fontSize: 20,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 4,
  },
  bestTimeDetail: {
    fontSize: 14,
    color: "#757575",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statBox: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1976d2",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#757575",
  },
  statsDetails: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  statDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  statDetailLabel: {
    fontSize: 14,
    color: "#757575",
  },
  statDetailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212121",
  },
  averagesCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  averageItem: {
    alignItems: "center",
  },
  averageNumber: {
    fontSize: 40,
    fontWeight: "700",
    color: "#1976d2",
    marginBottom: 8,
  },
  averageLabel: {
    fontSize: 14,
    color: "#757575",
  },
  averageDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
  },
});