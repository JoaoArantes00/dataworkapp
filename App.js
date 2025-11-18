import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "./screens/HomeScreen";
import NewTaskScreen from "./screens/NewTaskScreen";
import EditTaskScreen from "./screens/EditTaskScreen";
import DashboardScreen from "./screens/DashboardScreen";
import SettingsScreen from "./screens/SettingsScreen";
import PomodoroScreen from "./screens/PomodoroScreen";
import AnalyticsScreen from "./screens/AnalyticsScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: "#1976d2" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "600" }
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "DataWork - Tarefas" }}
        />
        <Stack.Screen
          name="NewTask"
          component={NewTaskScreen}
          options={{ title: "Nova Tarefa" }}
        />
        <Stack.Screen
          name="EditTask"
          component={EditTaskScreen}
          options={{ title: "Editar Tarefa" }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: "Dashboard & Conquistas" }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: "Configurações" }}
        />
        <Stack.Screen
          name="Pomodoro"
          component={PomodoroScreen}
          options={{ title: "Timer Pomodoro" }}
        />
        <Stack.Screen
          name="Analytics"
          component={AnalyticsScreen}
          options={{ title: "Analytics Premium" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}