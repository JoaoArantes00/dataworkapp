export function analyzeTasks(tasks) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "concluida").length;
  const inProgress = tasks.filter((t) => t.status === "andamento").length;
  const pending = tasks.filter((t) => t.status === "pendente").length;

  const percentDone = total === 0 ? 0 : (done / total) * 100;

  let insight;
  if (total === 0) {
    insight = "Nenhuma tarefa registrada ainda. Comece adicionando uma!";
  } else if (percentDone === 0) {
    insight = "Você ainda não concluiu tarefas hoje. Bora começar!";
  } else if (percentDone < 50) {
    insight = "Bom começo, mas ainda tem espaço pra melhorar.";
  } else if (percentDone < 100) {
    insight = "Ótimo desempenho! Você está mandando bem.";
  } else {
    insight = "INCRÍVEL! Você concluiu 100% das suas tarefas.";
  }

  return {
    total,
    done,
    pending,
    inProgress,
    percentDone,
    insight
  };
}
