import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { api, imageUrl } from "../api/client";
import { useToast } from "../context/ToastContext";
import { useI18n } from "../i18n";
import { colors, priorityColor, statusColor } from "../theme";

function Badge({ text, color }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + "22" }]}>
      <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
  );
}

function Stars({ value, onChange, size = 34 }) {
  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity
          key={n}
          onPress={onChange ? () => onChange(n) : undefined}
          disabled={!onChange}
        >
          <Text style={{ fontSize: size }}>{n <= value ? "⭐" : "☆"}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function ComplaintDetailScreen({ route }) {
  const { id } = route.params;
  const toast = useToast();
  const { t } = useI18n();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");

  // Feedback form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(() => {
    api.getComplaint(id).then(setItem).catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function onSubmitFeedback() {
    if (!rating) {
      toast.error(t("selectRating"));
      return;
    }
    setSending(true);
    try {
      const updated = await api.submitFeedback(id, rating, comment.trim());
      setItem({ ...item, ...updated });
      toast.success(t("feedbackThanks"));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  }

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

  const img = imageUrl(item.image_url);
  const history = item.history || [];
  const isResolved = item.status === "RESOLVED" || item.status === "CLOSED";
  const hasFeedback = item.feedback_rating != null;

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

      <View style={styles.statusRow}>
        <Text style={styles.infoLabel}>{t("currentStatus")}</Text>
        <Badge
          text={item.status.replace("_", " ")}
          color={statusColor[item.status] || colors.muted}
        />
      </View>

      {item.resolution_note ? (
        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>{t("deptNote")}</Text>
          <Text style={styles.noteText}>{item.resolution_note}</Text>
        </View>
      ) : null}

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
        <Text style={styles.infoLabel}>{t("reported")}</Text>
        <Text style={styles.infoValue}>
          {new Date(item.created_at).toLocaleString()}
        </Text>
      </View>

      {/* Real audit-trail timeline from the backend */}
      <Text style={styles.section}>{t("progressHistory")}</Text>
      <View style={styles.timeline}>
        {history.length === 0 ? (
          <Text style={{ color: colors.muted }}>{t("noUpdates")}</Text>
        ) : (
          history.map((h, i) => (
            <View key={h.id} style={styles.tlRow}>
              <View style={styles.tlLeft}>
                <View
                  style={[
                    styles.tlDot,
                    {
                      backgroundColor:
                        statusColor[h.new_status] || colors.primary,
                    },
                  ]}
                />
                {i < history.length - 1 && <View style={styles.tlLine} />}
              </View>
              <View style={styles.tlBody}>
                <Text style={styles.tlStatus}>
                  {h.new_status.replace("_", " ")}
                </Text>
                {h.note ? <Text style={styles.tlNote}>{h.note}</Text> : null}
                <Text style={styles.tlDate}>
                  {new Date(h.created_at).toLocaleString()}
                  {h.changed_by_name ? ` • ${h.changed_by_name}` : ""}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Feedback: only after resolution */}
      {isResolved && (
        <View style={styles.feedbackCard}>
          <Text style={styles.section}>
            {hasFeedback ? t("yourFeedback") : t("rateResolution")}
          </Text>
          {hasFeedback ? (
            <View>
              <Stars value={item.feedback_rating} size={28} />
              {item.feedback_comment ? (
                <Text style={styles.fbComment}>
                  “{item.feedback_comment}”
                </Text>
              ) : null}
              <Text style={styles.fbThanks}>{t("feedbackHelp")}</Text>
            </View>
          ) : (
            <View>
              <Stars value={rating} onChange={setRating} />
              <TextInput
                style={styles.fbInput}
                placeholder={t("commentsOptional")}
                placeholderTextColor={colors.muted}
                value={comment}
                onChangeText={setComment}
                multiline
              />
              <TouchableOpacity
                style={styles.fbButton}
                onPress={onSubmitFeedback}
                disabled={sending}
              >
                {sending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.fbButtonText}>{t("submitFeedback")}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
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
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  noteBox: {
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + "44",
    padding: 14,
    marginTop: 16,
  },
  noteTitle: { fontWeight: "800", color: colors.primary, marginBottom: 4 },
  noteText: { color: colors.text, lineHeight: 20 },
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
  tlRow: { flexDirection: "row" },
  tlLeft: { alignItems: "center", marginRight: 14, width: 14 },
  tlDot: { width: 14, height: 14, borderRadius: 7 },
  tlLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  tlBody: { flex: 1, paddingBottom: 18 },
  tlStatus: { fontWeight: "800", color: colors.text, fontSize: 15 },
  tlNote: { color: colors.text, marginTop: 2, lineHeight: 19 },
  tlDate: { color: colors.muted, fontSize: 12, marginTop: 4 },
  feedbackCard: { marginBottom: 20 },
  fbInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    minHeight: 70,
    textAlignVertical: "top",
    color: colors.text,
  },
  fbButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 12,
  },
  fbButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  fbComment: { color: colors.text, marginTop: 10, fontStyle: "italic" },
  fbThanks: { color: colors.muted, marginTop: 10 },
});
