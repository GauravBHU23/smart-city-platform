import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { api, imageUrl } from "../api/client";
import { colors, priorityColor, statusColor } from "../theme";

const FLOW = [
  "PENDING",
  "UNDER_REVIEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

function Badge({ text, color }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + "22" }]}>
      <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
  );
}

export default function ComplaintDetailScreen({ route }) {
  const { id } = route.params;
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getComplaint(id).then(setItem).catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.danger }}>{error}</Text>
      </View>
    );
  }
  if (!item) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const currentIdx = FLOW.indexOf(item.status);
  const img = imageUrl(item.image_url);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      {img && <Image source={{ uri: img }} style={styles.image} />}

      <View style={styles.row}>
        <Text style={styles.cat}>{item.category}</Text>
        <Badge
          text={item.priority}
          color={priorityColor[item.priority] || colors.muted}
        />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc}>{item.description}</Text>

      {item.address ? (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📍 Location</Text>
          <Text style={styles.infoValue}>{item.address}</Text>
        </View>
      ) : item.latitude ? (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📍 Location</Text>
          <Text style={styles.infoValue}>
            {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
          </Text>
        </View>
      ) : null}

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>🗓️ Reported</Text>
        <Text style={styles.infoValue}>
          {new Date(item.created_at).toLocaleString()}
        </Text>
      </View>

      <Text style={styles.section}>Status</Text>
      <View style={styles.timeline}>
        {FLOW.map((step, i) => {
          const done = i <= currentIdx;
          const active = i === currentIdx;
          return (
            <View key={step} style={styles.tlRow}>
              <View
                style={[
                  styles.tlDot,
                  done && { backgroundColor: statusColor[item.status] },
                  active && styles.tlDotActive,
                ]}
              />
              <Text
                style={[
                  styles.tlLabel,
                  done && { color: colors.text, fontWeight: "700" },
                ]}
              >
                {step.replace("_", " ")}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    marginBottom: 16,
    backgroundColor: colors.border,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cat: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.muted,
    letterSpacing: 1,
  },
  title: { fontSize: 22, fontWeight: "800", color: colors.text, marginTop: 6 },
  desc: { color: colors.muted, marginTop: 8, lineHeight: 21, fontSize: 15 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  infoLabel: { color: colors.muted, fontWeight: "600" },
  infoValue: { color: colors.text, fontWeight: "600", flexShrink: 1, textAlign: "right" },
  section: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  timeline: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tlRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  tlDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.border,
    marginRight: 14,
  },
  tlDotActive: { transform: [{ scale: 1.3 }] },
  tlLabel: { color: colors.muted, fontSize: 15 },
});
