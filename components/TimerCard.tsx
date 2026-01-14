import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  label: string;
  time: number;
};

export default function TimerCard({ label, time }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.time}>{time} mins</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    margin: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
  },
  label: { fontSize: 16, marginBottom: 5 },
  time: { fontSize: 20, fontWeight: "bold" },
});
