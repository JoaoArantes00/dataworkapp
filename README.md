# 📋 DataWork - Personal Productivity Analyzer

<div align="center">

![DataWork Logo](https://img.shields.io/badge/DataWork-Productivity-blue?style=for-the-badge)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)

**Um aplicativo simples e criativo para gerenciar suas tarefas diárias com gamificação e análise de produtividade!**

[Features](#-features) • [Instalação](#-instalação) • [Como Usar](#-como-usar) • [Tecnologias](#-tecnologias) • [Estrutura](#-estrutura-do-projeto)

</div>

---

## 📖 Sobre o Projeto

**DataWork** é um aplicativo mobile de produtividade pessoal desenvolvido em React Native com Expo que permite aos usuários:

- ✅ Registrar e gerenciar tarefas diárias
- 📊 Visualizar estatísticas e análises de produtividade
- 🎮 Ganhar XP, subir de nível e desbloquear conquistas
- 🔥 Manter streaks de produtividade
- 📈 Acompanhar progresso em tempo real
- 🎯 Organizar tarefas por categorias e prioridades

O app salva todos os dados localmente usando **AsyncStorage**, garantindo que suas informações estejam sempre disponíveis, mesmo offline.

---

## ✨ Features

### 🎯 Gerenciamento de Tarefas

- **CRUD Completo**: Criar, visualizar, editar e deletar tarefas
- **Categorias**: Organize por Trabalho, Estudos, Saúde, Pessoal, Compras, etc.
- **Prioridades**: Defina tarefas como Baixa, Média ou Alta prioridade
- **Status**: Pendente, Em Andamento ou Concluída
- **Descrições**: Adicione detalhes e contexto às suas tarefas
- **Swipe Actions**: Deslize para completar ou deletar rapidamente

### 🔍 Busca e Filtros

- **Busca em Tempo Real**: Encontre tarefas por título instantaneamente
- **Filtro por Categoria**: Visualize apenas tarefas de categorias específicas
- **Filtro por Status**: Veja pendentes, em andamento ou concluídas
- **Ordenação**: Organize por prioridade, data de criação ou nome

### 📊 Dashboard & Analytics

- **Estatísticas em Tempo Real**:
  - Total de tarefas
  - Taxa de conclusão (%)
  - Barra de progresso visual
  - Distribuição por status
  - Insights automáticos

- **Análise de Produtividade**:
  - "Seu dia está 75% produtivo"
  - "Você completou 8 tarefas hoje"
  - Motivação contextual baseada no desempenho

### 🎮 Sistema de Gamificação

- **Sistema de XP e Níveis**:
  - Ganhe +10 XP por tarefa concluída
  - +20 XP por tarefas de alta prioridade
  - Suba de nível e ganhe novos títulos
  - Títulos: Iniciante → Aprendiz → Produtivo → Master → Lenda

- **Conquistas (Achievements)**:
  - 🏆 **Primeiro Passo**: Complete sua primeira tarefa
  - 🏆 **Produtivo**: Complete 10 tarefas
  - 🏆 **Imparável**: Complete 50 tarefas
  - 🏆 **Lenda**: Complete 100 tarefas
  - 🏆 **Streak Master**: Mantenha 30 dias consecutivos
  - E muitas outras para desbloquear!

- **Sistema de Streaks**:
  - 🔥 Contador de dias consecutivos usando o app
  - Registro do melhor streak alcançado
  - Motivação para manter a consistência

### 💾 Persistência de Dados

- **AsyncStorage**: Todos os dados salvos localmente
- **Auto-save**: Salvamento automático a cada ação
- **Restauração**: Dados restaurados automaticamente ao abrir o app
- **Sem necessidade de internet**: Funciona 100% offline

---

## 📱 Screenshots

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Dashboard     │  │  Lista Tarefas  │  │  Adicionar      │
│                 │  │                 │  │                 │
│  📊 Analytics   │  │  ✅ Tarefa 1    │  │  📝 Título      │
│  🎮 XP: 1250    │  │  📝 Tarefa 2    │  │  🏷️ Categoria   │
│  🔥 Streak: 12  │  │  ⏰ Tarefa 3    │  │  ⚡ Prioridade  │
│  🏆 Conquistas  │  │  🎯 Tarefa 4    │  │  💬 Descrição   │
│                 │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 🚀 Instalação

### Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (v14 ou superior) - [Download](https://nodejs.org/)
- **npm** ou **yarn** - Vem com Node.js
- **Expo CLI** - Será instalado com o projeto
- **Expo Go** (no seu celular) - [iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Passo a Passo

1. **Clone o repositório**

```bash
git clone https://github.com/seu-usuario/datawork-app.git
cd datawork-app
```

2. **Instale as dependências**

```bash
npm install
# ou
yarn install
```

3. **Inicie o projeto**

```bash
npm start
# ou
expo start
```

4. **Execute no seu dispositivo**

   - **Celular**: Abra o Expo Go e escaneie o QR Code que aparece no terminal
   - **Emulador Android**: Pressione `a` no terminal
   - **Simulador iOS**: Pressione `i` no terminal (somente macOS)

---

## 💡 Como Usar

### 1️⃣ Criar uma Tarefa

1. Toque no botão **"+ Nova Tarefa"**
2. Preencha os campos:
   - **Título**: Nome da tarefa (obrigatório)
   - **Categoria**: Selecione uma categoria
   - **Prioridade**: Baixa, Média ou Alta
   - **Descrição**: Detalhes opcionais
3. Toque em **"Adicionar Tarefa"**

### 2️⃣ Gerenciar Tarefas

- **Completar**: Deslize a tarefa para a direita ou toque no círculo de status
- **Editar**: Toque na tarefa para abrir os detalhes e editar
- **Deletar**: Deslize a tarefa para a esquerda

### 3️⃣ Filtrar e Buscar

- **Busca**: Digite no campo de busca no topo
- **Categoria**: Toque nos chips de categoria para filtrar
- **Ordenação**: Use o menu de ordenação para organizar

### 4️⃣ Acompanhar Progresso

- Veja suas estatísticas no **Dashboard**
- Acompanhe seu **XP e Nível** no topo
- Mantenha seu **Streak** usando o app diariamente
- Desbloqueie **Conquistas** completando tarefas

---

## 🛠️ Tecnologias

### Core

- **[React Native](https://reactnative.dev/)** - Framework mobile
- **[Expo](https://expo.dev/)** - Plataforma de desenvolvimento
- **[AsyncStorage](https://react-native-async-storage.github.io/async-storage/)** - Armazenamento local
- **[React Navigation](https://reactnavigation.org/)** - Navegação entre telas

### Bibliotecas Principais

```json
{
  "react": "18.2.0",
  "react-native": "0.74.5",
  "expo": "~51.0.28",
  "@react-native-async-storage/async-storage": "1.23.1",
  "@react-navigation/native": "^6.x",
  "react-native-gesture-handler": "~2.16.1"
}
```

### Recursos do React Native

- **FlatList** - Listas performáticas
- **Modal** - Diálogos e overlays
- **TextInput** - Entrada de dados
- **TouchableOpacity** - Botões interativos
- **ScrollView** - Scroll suave

---

## 📁 Estrutura do Projeto

```
DataWork/
├── App.js                      # Componente principal e navegação
├── app.json                    # Configurações do Expo
├── package.json                # Dependências do projeto
│
├── components/                 # Componentes reutilizáveis
│   ├── TaskItem.js            # Card individual de tarefa
│   ├── TaskFilters.js         # Barra de filtros e busca
│   ├── TaskForm.js            # Formulário de criar/editar
│   ├── StatsCard.js           # Card de estatísticas
│   ├── AchievementCard.js     # Card de conquistas
│   └── ProgressBar.js         # Barra de progresso visual
│
├── screens/                    # Telas do aplicativo
│   ├── HomeScreen.js          # Tela principal com lista
│   ├── DashboardScreen.js     # Tela de analytics
│   ├── AddTaskScreen.js       # Tela de adicionar tarefa
│   ├── EditTaskScreen.js      # Tela de editar tarefa
│   └── AchievementsScreen.js  # Tela de conquistas
│
├── storage/                    # Lógica de persistência
│   ├── taskStorage.js         # CRUD de tarefas
│   ├── gamificationStorage.js # Sistema de XP/conquistas
│   └── streakStorage.js       # Sistema de streaks
│
├── utils/                      # Funções auxiliares
│   ├── constants.js           # Constantes (categorias, status)
│   ├── helpers.js             # Funções utilitárias
│   ├── gamification.js        # Lógica de XP e níveis
│   └── achievements.js        # Definição de conquistas
│
└── assets/                     # Recursos estáticos
    ├── adaptive-icon.png
    ├── icon.png
    └── splash.png
```

---

## 🎮 Sistema de Gamificação

### 💎 Como Ganhar XP

| Ação | XP Ganho |
|------|----------|
| Completar tarefa (Baixa prioridade) | +10 XP |
| Completar tarefa (Média prioridade) | +15 XP |
| Completar tarefa (Alta prioridade) | +20 XP |
| Manter streak de 7 dias | +50 XP |
| Manter streak de 30 dias | +200 XP |

### 🏅 Níveis e Títulos

| Nível | XP Necessário | Título |
|-------|---------------|--------|
| 1 | 0 | Iniciante |
| 2 | 100 | Aprendiz |
| 3 | 300 | Produtivo |
| 4 | 600 | Dedicado |
| 5 | 1000 | Master |
| 6 | 1500 | Elite |
| 7+ | 2000+ | Lenda |

### 🏆 Conquistas Disponíveis

- **Primeiro Passo** - Complete 1 tarefa
- **Começando** - Complete 5 tarefas
- **Produtivo** - Complete 10 tarefas
- **Dedicado** - Complete 25 tarefas
- **Imparável** - Complete 50 tarefas
- **Lenda** - Complete 100 tarefas
- **Streak 7** - Mantenha 7 dias consecutivos
- **Streak 30** - Mantenha 30 dias consecutivos
- **Prioridade Alta** - Complete 10 tarefas de alta prioridade
- **Organizado** - Use todas as categorias disponíveis

---

## 🔄 Funcionalidades Futuras (Roadmap)

### 📅 Fase 1 - Gestão de Tempo
- [ ] Data de vencimento para tarefas
- [ ] Notificações de lembretes
- [ ] Timer Pomodoro integrado
- [ ] Estimativa de tempo por tarefa

### ☁️ Fase 2 - Cloud & Sync
- [ ] Backup na nuvem (Firebase/Supabase)
- [ ] Sincronização multi-dispositivo
- [ ] Login e autenticação de usuário
- [ ] Compartilhamento de listas

### 📊 Fase 3 - Analytics Avançado
- [ ] Gráficos de produtividade
- [ ] Relatórios semanais/mensais
- [ ] Análise de padrões de comportamento
- [ ] Exportação de dados (CSV, PDF)

### 🎨 Fase 4 - Personalização
- [ ] Temas personalizados (claro/escuro)
- [ ] Categorias customizáveis
- [ ] Widgets para tela inicial
- [ ] Atalhos rápidos

### 🤝 Fase 5 - Colaboração
- [ ] Listas compartilhadas
- [ ] Delegação de tarefas
- [ ] Comentários e menções
- [ ] Integração com Google Calendar

---

## 🐛 Solução de Problemas

### Erro ao instalar dependências

```bash
# Limpe o cache do npm
npm cache clean --force

# Delete node_modules e package-lock.json
rm -rf node_modules package-lock.json

# Reinstale
npm install
```

### App não inicia no Expo

```bash
# Limpe o cache do Expo
npm start -- --clear

# Ou
expo start -c
```

### Erro "Unable to resolve module"

```bash
# Reinicie o Metro Bundler
npm start -- --reset-cache
```

### Dados não estão sendo salvos

- Verifique as permissões do app nas configurações do dispositivo
- Certifique-se de que o AsyncStorage está instalado corretamente
- Teste em outro dispositivo ou emulador

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga os passos abaixo:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

### Diretrizes de Contribuição

- Mantenha o código limpo e bem documentado
- Siga o padrão de código existente
- Adicione testes quando aplicável
- Atualize a documentação conforme necessário

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**João Silva**

- GitHub: [@joaosilva](https://github.com/joaosilva)
- LinkedIn: [João Silva](https://linkedin.com/in/joaosilva)
- Email: joao@exemplo.com

---

## 🙏 Agradecimentos

- **Anthropic Claude** - Assistência no desenvolvimento
- **Expo Team** - Framework incrível
- **React Native Community** - Suporte e bibliotecas
- **Você** - Por usar o DataWork! 🚀

---

## 📞 Suporte

Encontrou um bug? Tem uma sugestão? Abra uma [issue](https://github.com/seu-usuario/datawork-app/issues)!

---

<div align="center">

**⭐ Se este projeto te ajudou, considere dar uma estrela! ⭐**

**Desenvolvido com ❤️ usando React Native + Expo**

</div>
# dataworkapp
# dataworkapp
# dataworkapp
