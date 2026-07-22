import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";

const ACTIONS = [
  { key: "Report", icon: "📝", label: "Report Complaint", screen: "ReportComplaint" },
  { key: "My", icon: "📋", label: "My Complaints", screen: "MyComplaints" },
  { key: "Weather", icon: "🌤️", label: "Weather", screen: "Weather" },
  { key: "Profile", icon: "👤", label: "Profile", screen: "Profile" },
];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.hi}>Hello,</Text>
      <Text style={styles.name}>{user?.full_name || "Citizen"} 👋</Text>

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Make your city better</Text>
        <Text style={styles.bannerText}>
          Spotted a problem? Report it with a photo and location — we&apos;ll
          route it to the right department.
        </Text>
        <TouchableOpacity
          style={styles.bannerBtn}
          onPress={() => navigation.navigate("ReportComplaint")}
        >
          <Text style={styles.bannerBtnText}>+ Report now</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.section}>Quick actions</Text>
      <View style={styles.grid}>
        {ACTIONS.map((a) => (
          <TouchableOpacity
            key={a.key}
            style={styles.tile}
            onPress={() => navigation.navigate(a.screen)}
          >
            <Text style={styles.tileIcon}>{a.icon}</Text>
            <Text style={styles.tileLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  hi: { fontSize: 16, color: colors.muted },
  name: { fontSize: 26, fontWeight: "800", color: colors.text, marginBottom: 20 },
  banner: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
  },
  bannerTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  bannerText: { color: "#dbeafe", marginTop: 8, lineHeight: 20 },
  bannerBtn: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 16,
  },
  bannerBtnText: { color: colors.primary, fontWeight: "700" },
  section: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    width: "47%",
    borderWidth: 1,
    borderColor: colors.border,
  },
  tileIcon: { fontSize: 32 },
  tileLabel: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
});
