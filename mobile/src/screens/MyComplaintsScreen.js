import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { api } from "../api/client";
import { colors, priorityColor, statusColor } from "../theme";

function Badge({ text, color }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + "22" }]}>
      <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
  );
}

export default function MyComplaintsScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await api.myComplaints();
      setItems(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Reload every time the screen comes into focus (e.g. after submitting).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function onRefresh() {
    setRefreshing(true);
    load();
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: 16, flexGrow: 1 }}
      data={items}
      keyExtractor={(item) => String(item.id)}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>
            {error || "No complaints yet. Report one from Home."}
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate("ReportComplaint")}
          >
            <Text style={styles.emptyBtnText}>+ Report Complaint</Text>
          </TouchableOpacity>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate("ComplaintDetail", { id: item.id })
          }
        >
          <View style={styles.cardTop}>
            <Text style={styles.cat}>{item.category}</Text>
            <Badge
              text={item.status.replace("_", " ")}
              color={statusColor[item.status] || colors.muted}
            />
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.desc} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.cardBottom}>
            <Badge
              text={item.priority}
              color={priorityColor[item.priority] || colors.muted}
            />
            <Text style={styles.date}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cat: { fontSize: 12, fontWeight: "800", color: colors.muted, letterSpacing: 1 },
  title: { fontSize: 17, fontWeight: "700", color: colors.text },
  desc: { color: colors.muted, marginTop: 4, lineHeight: 19 },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  date: { color: colors.muted, fontSize: 13 },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: "800" },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: colors.muted, textAlign: "center", marginTop: 12 },
  emptyBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 20,
  },
  emptyBtnText: { color: "#fff", fontWeight: "700" },
});
