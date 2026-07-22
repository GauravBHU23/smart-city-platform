import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { colors } from "../theme";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { t, lang, changeLang } = useI18n();

  const initials = (user?.full_name || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <Text style={styles.name}>{user?.full_name}</Text>
      <Text style={styles.role}>{user?.role}</Text>

      <View style={styles.card}>
        <Row label={t("email")} value={user?.email} />
        <Row label="Phone" value={user?.phone || "—"} />
        <Row label="User ID" value={String(user?.id)} />
      </View>

      {/* Language switch */}
      <View style={[styles.card, { marginTop: 16 }]}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t("language")}</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              style={[styles.langOpt, lang === "en" && styles.langOptActive]}
              onPress={() => changeLang("en")}
            >
              <Text
                style={[
                  styles.langOptText,
                  lang === "en" && styles.langOptTextActive,
                ]}
              >
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langOpt, lang === "hi" && styles.langOptActive]}
              onPress={() => changeLang("hi")}
            >
              <Text
                style={[
                  styles.langOptText,
                  lang === "hi" && styles.langOptTextActive,
                ]}
              >
                हिंदी
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>{t("logout")}</Text>
      </TouchableOpacity>
    </View>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, alignItems: "center", padding: 24 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  avatarText: { color: "#fff", fontSize: 30, fontWeight: "800" },
  name: { fontSize: 22, fontWeight: "800", color: colors.text, marginTop: 14 },
  role: {
    color: colors.primary,
    fontWeight: "700",
    marginTop: 4,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 8,
    width: "100%",
    marginTop: 28,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: { color: colors.muted, fontWeight: "600" },
  rowValue: { color: colors.text, fontWeight: "600" },
  logout: {
    marginTop: 32,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  logoutText: { color: colors.danger, fontWeight: "800" },
  langOpt: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  langOptActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  langOptText: { fontWeight: "700", color: colors.text },
  langOptTextActive: { color: "#fff" },
});
