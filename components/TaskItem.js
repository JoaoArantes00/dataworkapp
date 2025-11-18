import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const STATUS_LABELS = {
  pendente: "Pendente",
  andamento: "Em andamento",
  concluida: "Concluída",
};

const STATUS_COLORS = {
  pendente: "#fbc02d",
  andamento: "#1976d2",
  concluida: "#2e7d32",
};

const CATEGORY_ICONS = {
  trabalho: "💼",
  estudos: "📚",
  saude: "💪",
  casa: "🏠",
  pessoal: "🎯",
  geral: "📋",
};

const PRIORITY_LABELS = {
  alta: "🔴 Alta",
  media: "🟡 Média",
  baixa: "🟢 Baixa",
};

export default function TaskItem({ task, onToggleStatus, onDelete, onEdit }) {

  // 🔒 BLINDAGEM — evita crashes se vier undefined
  if (!task) {
    return (
      <View style={styles.invalidContainer}>
        <Text style={styles.invalidText}>
          Erro: tarefa não encontrada ou inválida.
        </Text>
      </View>
    );
  }

  const statusLabel = STATUS_LABELS[task.status] || "Pendente";
  const statusColor = STATUS_COLORS[task.status] || "#fbc02d";
  const categoryIcon = CATEGORY_ICONS[task.category] || "📋";
  const priorityLabel = PRIORITY_LABELS[task.priority] || "🟡 Média";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.categoryPriorityRow}>
          <Text style={styles.categoryIcon}>{categoryIcon}</Text>
          <Text style={styles.priorityLabel}>{priorityLabel}</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{task.title}</Text>

        {task.description ? (
          <Text style={styles.description}>{task.description}</Text>
        ) : null}

        <Text style={styles.meta}>
          Status: <Text style={{ fontWeight: "600" }}>{statusLabel}</Text>
        </Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton} onPress={onToggleStatus}>
          <Text style={styles.actionText}>Alterar status</Text>
        </TouchableOpacity>

        {onEdit && (
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={onEdit}
          >
            <Text style={styles.actionText}>Editar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={onDelete}
        >
          <Text style={[styles.actionText, { color: "#fff" }]}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryPriorityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryIcon: {
    fontSize: 18,
  },
  priorityLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  content: {
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: "#616161",
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: "#757575",
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 8,
    justifyContent: "flex-end",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#1976d2",
  },
  actionText: {
    fontSize: 12,
    color: "#1976d2",
    fontWeight: "600",
  },
  editButton: {
    borderColor: "#7b1fa2",
  },
  deleteButton: {
    backgroundColor: "#e53935",
    borderColor: "#e53935",
  },

  // 🔒 styles para erros
  invalidContainer: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    backgroundColor: "#ffebee",
    borderWidth: 1,
    borderColor: "#c62828",
  },
  invalidText: {
    color: "#c62828",
    fontWeight: "600",
  },
});