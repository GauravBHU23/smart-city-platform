import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { colors } from "../theme";

const ACTIONS = [
  { key: "Report", icon: "📝", labelKey: "reportComplaint", screen: "ReportComplaint" },
  { key: "My", icon: "📋", labelKey: "myComplaints", screen: "MyComplaints" },
  { key: "Weather", icon: "🌤️", labelKey: "weather", screen: "Weather" },
  { key: "Profile", icon: "👤", labelKey: "profile", screen: "Profile" },
];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { t } = useI18n();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.hi}>{t("hello")}</Text>
      <Text style={styles.name}>{user?.full_name || t("citizen")} 👋</Text>

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>{t("bannerTitle")}</Text>
        <Text style={styles.bannerText}>{t("bannerText")}</Text>
        <TouchableOpacity
          style={styles.bannerBtn}
          onPress={() => navigation.navigate("ReportComplaint")}
        >
          <Text style={styles.bannerBtnText}>{t("reportNow")}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.section}>{t("quickActions")}</Text>
      <View style={styles.grid}>
        {ACTIONS.map((a) => (
          <TouchableOpacity
            key={a.key}
            style={styles.tile}
            onPress={() => navigation.navigate(a.screen)}
          >
            <Text style={styles.tileIcon}>{a.icon}</Text>
            <Text style={styles.tileLabel}>{t(a.labelKey)}</Text>
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
