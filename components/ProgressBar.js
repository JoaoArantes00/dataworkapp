import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ProgressBar({ progress = 0, color = "#1976d2", height = 24, showLabel = true }) {
  // Garante que progress está entre 0 e 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={styles.container}>
      {showLabel && (
        <Text style={styles.label}>{normalizedProgress}%</Text>
      )}
      <View style={[styles.barContainer, { height }]}>
        <View
          style={[
            styles.barFill,
            {
              width: `${normalizedProgress}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#424242",
    marginBottom: 6,
  },
  barContainer: {
    width: "100%",
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 12,
    transition: "width 0.3s ease",
  },
});