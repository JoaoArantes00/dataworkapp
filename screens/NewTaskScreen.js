import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { loadTasks, saveTasks } from "../storage/taskStorage";

const CATEGORIES = [
  { value: "trabalho", label: "💼 Trabalho", color: "#1976d2" },
  { value: "estudos", label: "📚 Estudos", color: "#7b1fa2" },
  { value: "saude", label: "💪 Saúde", color: "#388e3c" },
  { value: "casa", label: "🏠 Casa", color: "#f57c00" },
  { value: "pessoal", label: "🎯 Pessoal", color: "#c2185b" },
  { value: "geral", label: "📋 Geral", color: "#616161" },
];

const PRIORITIES = [
  { value: "alta", label: "🔴 Alta", color: "#d32f2f" },
  { value: "media", label: "🟡 Média", color: "#fbc02d" },
  { value: "baixa", label: "🟢 Baixa", color: "#388e3c" },
];

export default function NewTaskScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("pendente");
  const [selectedCategory, setSelectedCategory] = useState("geral");
  const [selectedPriority, setSelectedPriority] = useState("media");

  const statusOptions = [
    { value: "pendente", label: "⏳ Pendente", color: "#fbc02d" },
    { value: "andamento", label: "🔄 Em Andamento", color: "#1976d2" },
    { value: "concluida", label: "✅ Concluída", color: "#2e7d32" },
  ];

  const handleSave = async () => {
    // Validação
    if (!title.trim()) {
      Alert.alert("Erro", "Por favor, insira um título para a tarefa.");
      return;
    }

    try {
      // Carrega tarefas existentes
      const existingTasks = await loadTasks();
      
      // Cria nova tarefa
      const newTask = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim(),
        status: selectedStatus,
        category: selectedCategory,
        priority: selectedPriority,
        createdAt: new Date().toISOString(),
      };

      // Adiciona nova tarefa
      const updatedTasks = [...existingTasks, newTask];
      
      // Salva no storage
      await saveTasks(updatedTasks);

      // Feedback e navegação
      Alert.alert("Sucesso", "Tarefa criada com sucesso!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
      Alert.alert("Erro", "Não foi possível salvar a tarefa. Tente novamente.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Título */}
        <Text style={styles.label}>Título da Tarefa *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Estudar React Native"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        {/* Descrição */}
        <Text style={styles.label}>Descrição (opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Adicione detalhes sobre a tarefa..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          maxLength={300}
        />

        {/* Categoria */}
        <Text style={styles.label}>Categoria</Text>
        <View style={styles.optionsContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.option,
                selectedCategory === cat.value && {
                  backgroundColor: cat.color,
                  borderColor: cat.color,
                },
              ]}
              onPress={() => setSelectedCategory(cat.value)}
            >
              <Text
                style={[
                  styles.optionLabel,
                  selectedCategory === cat.value && styles.optionLabelSelected,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Prioridade */}
        <Text style={styles.label}>Prioridade</Text>
        <View style={styles.optionsContainer}>
          {PRIORITIES.map((priority) => (
            <TouchableOpacity
              key={priority.value}
              style={[
                styles.option,
                selectedPriority === priority.value && {
                  backgroundColor: priority.color,
                  borderColor: priority.color,
                },
              ]}
              onPress={() => setSelectedPriority(priority.value)}
            >
              <Text
                style={[
                  styles.optionLabel,
                  selectedPriority === priority.value && styles.optionLabelSelected,
                ]}
              >
                {priority.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Status */}
        <Text style={styles.label}>Status Inicial</Text>
        <View style={styles.optionsContainer}>
          {statusOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                selectedStatus === option.value && {
                  backgroundColor: option.color,
                  borderColor: option.color,
                },
              ]}
              onPress={() => setSelectedStatus(option.value)}
            >
              <Text
                style={[
                  styles.optionLabel,
                  selectedStatus === option.value && styles.optionLabelSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Botões */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>💾 Salvar Tarefa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>❌ Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#424242",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#212121",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  optionsContainer: {
    marginTop: 8,
    gap: 8,
  },
  option: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#757575",
  },
  optionLabelSelected: {
    color: "#fff",
  },
  saveButton: {
    backgroundColor: "#1976d2",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cancelButtonText: {
    color: "#757575",
    fontSize: 16,
    fontWeight: "600",
  },
});