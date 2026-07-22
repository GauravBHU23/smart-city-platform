import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { api } from "../api/client";
import { useToast } from "../context/ToastContext";
import { useI18n } from "../i18n";
import { colors } from "../theme";

const CATEGORIES = [
  { key: "ROAD", labelKey: "catRoad" },
  { key: "WATER", labelKey: "catWater" },
  { key: "ELECTRICITY", labelKey: "catElectricity" },
  { key: "GARBAGE", labelKey: "catGarbage" },
  { key: "STREETLIGHT", labelKey: "catStreetlight" },
  { key: "OTHER", labelKey: "catOther" },
];

export default function ReportComplaintScreen({ navigation }) {
  const toast = useToast();
  const { t } = useI18n();
  const [category, setCategory] = useState("ROAD");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState("");
  const [photo, setPhoto] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Nearby open complaints of the same category (duplicate warning).
  const [duplicates, setDuplicates] = useState([]);
  const [dupWarned, setDupWarned] = useState(false);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      toast.error(t("photoPermission"));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.6,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0]);
    }
  }

  async function captureLocation() {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        toast.error(t("locationPermission"));
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      toast.success(t("locationToast"));

      // Check for nearby open complaints of the same category.
      try {
        const dups = await api.nearbyDuplicates(
          pos.coords.latitude,
          pos.coords.longitude,
          category
        );
        setDuplicates(dups);
        setDupWarned(false);
      } catch {
        // duplicate check is best-effort
      }

      // Reverse geocode to a human-readable address (best-effort).
      try {
        const places = await Location.reverseGeocodeAsync(pos.coords);
        if (places[0]) {
          const p = places[0];
          setAddress(
            [p.name, p.street, p.city, p.region].filter(Boolean).join(", ")
          );
        }
      } catch {
        // ignore reverse-geocode failures
      }
    } catch {
      toast.error(t("locationError"));
    } finally {
      setGpsLoading(false);
    }
  }

  async function onSubmit() {
    if (!title.trim() || !description.trim()) {
      toast.error(t("addTitleDesc"));
      return;
    }
    // If similar complaints exist nearby, warn once before submitting.
    if (duplicates.length > 0 && !dupWarned) {
      setDupWarned(true);
      toast.info(t("duplicateInfo"), 4500);
      return;
    }
    setSubmitting(true);
    try {
      // Upload the photo first (if any), then attach its URL to the complaint.
      let imageUrl = null;
      if (photo) {
        const up = await api.uploadImage(photo);
        imageUrl = up.image_url;
      }

      await api.createComplaint({
        category,
        title: title.trim(),
        description: description.trim(),
        image_url: imageUrl,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        address: address || null,
      });
      toast.success(t("submitted"));
      navigation.navigate("MyComplaints");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.label}>{t("category")}</Text>
        <View style={styles.catRow}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c.key}
              style={[styles.cat, category === c.key && styles.catActive]}
              onPress={() => setCategory(c.key)}
            >
              <Text
                style={[
                  styles.catText,
                  category === c.key && styles.catTextActive,
                ]}
              >
                {t(c.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t("title")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("titlePlaceholder")}
          value={title}
          onChangeText={setTitle}
          placeholderTextColor={colors.muted}
        />

        <Text style={styles.label}>{t("description")}</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder={t("descPlaceholder")}
          value={description}
          onChangeText={setDescription}
          multiline
          placeholderTextColor={colors.muted}
        />

        <Text style={styles.label}>{t("photoOptional")}</Text>
        {photo ? (
          <View>
            <Image source={{ uri: photo.uri }} style={styles.preview} />
            <TouchableOpacity onPress={() => setPhoto(null)}>
              <Text style={styles.removePhoto}>{t("removePhoto")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
            <Text style={styles.photoText}>{t("addPhoto")}</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.label}>{t("location")}</Text>
        <TouchableOpacity style={styles.gpsBtn} onPress={captureLocation}>
          {gpsLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.gpsText}>
              {coords ? `📍 ${t("locationCaptured")}` : t("captureLocation")}
            </Text>
          )}
        </TouchableOpacity>
        {coords ? (
          <Text style={styles.coords}>
            {address ||
              `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`}
          </Text>
        ) : null}

        {/* Duplicate warning: similar open complaints nearby */}
        {duplicates.length > 0 && (
          <View style={styles.dupBox}>
            <Text style={styles.dupTitle}>{t("duplicateWarning")}</Text>
            {duplicates.slice(0, 3).map((d) => (
              <Text key={d.id} style={styles.dupItem}>
                • #{d.id} {d.title} ({d.status.replace("_", " ")})
              </Text>
            ))}
            <Text style={styles.dupInfo}>{t("duplicateInfo")}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.submit}
          onPress={onSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>
              {duplicates.length > 0 && dupWarned
                ? t("submitAnyway")
                : t("submitComplaint")}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
    marginTop: 8,
  },
  catRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  cat: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  catActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catText: { color: colors.text, fontWeight: "600" },
  catTextActive: { color: "#fff" },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.text,
  },
  textarea: { height: 110, textAlignVertical: "top" },
  photoBtn: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
  },
  photoText: { color: colors.primary, fontWeight: "700" },
  preview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  removePhoto: {
    color: colors.danger,
    fontWeight: "700",
    marginTop: 8,
    textAlign: "center",
  },
  gpsBtn: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  gpsText: { color: colors.primary, fontWeight: "700" },
  coords: { marginTop: 8, color: colors.muted },
  dupBox: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#f59e0b",
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
  },
  dupTitle: { fontWeight: "800", color: "#b45309", marginBottom: 6 },
  dupItem: { color: "#78350f", marginTop: 2, fontSize: 13 },
  dupInfo: { color: "#92400e", marginTop: 8, fontSize: 12 },
  submit: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
