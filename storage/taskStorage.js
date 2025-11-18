import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@datawork_tasks";

/**
 * Salva a lista de tarefas no AsyncStorage
 * @param {Array} tasks - Lista de tarefas
 */
export async function saveTasks(tasks) {
  try {
    // Garante que tasks é um array
    const validTasks = Array.isArray(tasks) ? tasks : [];
    const json = JSON.stringify(validTasks);
    await AsyncStorage.setItem(STORAGE_KEY, json);
    return true;
  } catch (error) {
    console.warn("Erro ao salvar tarefas:", error);
    return false;
  }
}

/**
 * Carrega a lista de tarefas do AsyncStorage
 * @returns {Promise<Array>} - Lista de tarefas ou array vazio
 */
export async function loadTasks() {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    
    // Se não houver dados, retorna array vazio
    if (!json) {
      return [];
    }
    
    const tasks = JSON.parse(json);
    
    // Garante que o retorno é sempre um array
    return Array.isArray(tasks) ? tasks : [];
  } catch (error) {
    console.warn("Erro ao carregar tarefas:", error);
    return [];
  }
}

/**
 * Limpa todas as tarefas do AsyncStorage
 */
export async function clearTasks() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.warn("Erro ao limpar tarefas:", error);
    return false;
  }
}

/**
 * Adiciona uma nova tarefa
 * @param {Object} newTask - Nova tarefa a ser adicionada
 * @returns {Promise<Array>} - Lista atualizada de tarefas
 */
export async function addTask(newTask) {
  try {
    const tasks = await loadTasks();
    
    // Garante que a tarefa tem os campos necessários
    const taskWithDefaults = {
      id: newTask.id || Date.now().toString(),
      title: newTask.title || "Sem título",
      description: newTask.description || "",
      status: newTask.status || "pendente",
      category: newTask.category || "geral",
      priority: newTask.priority || "media",
      createdAt: newTask.createdAt || new Date().toISOString(),
      dueDate: newTask.dueDate || null,
      ...newTask,
    };
    
    const updatedTasks = [...tasks, taskWithDefaults];
    await saveTasks(updatedTasks);
    return updatedTasks;
  } catch (error) {
    console.warn("Erro ao adicionar tarefa:", error);
    return [];
  }
}

/**
 * Remove uma tarefa pelo ID
 * @param {string} taskId - ID da tarefa a ser removida
 * @returns {Promise<Array>} - Lista atualizada de tarefas
 */
export async function removeTask(taskId) {
  try {
    const tasks = await loadTasks();
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    await saveTasks(updatedTasks);
    return updatedTasks;
  } catch (error) {
    console.warn("Erro ao remover tarefa:", error);
    return [];
  }
}

/**
 * Atualiza uma tarefa existente
 * @param {string} taskId - ID da tarefa a ser atualizada
 * @param {Object} updates - Objeto com os campos a serem atualizados
 * @returns {Promise<Array>} - Lista atualizada de tarefas
 */
export async function updateTask(taskId, updates) {
  try {
    const tasks = await loadTasks();
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, ...updates };
      }
      return task;
    });
    await saveTasks(updatedTasks);
    return updatedTasks;
  } catch (error) {
    console.warn("Erro ao atualizar tarefa:", error);
    return [];
  }
}