import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { describeWeather, getWeather } from "../api/weather";
import { colors } from "../theme";

export default function WeatherScreen() {
  const [data, setData] = useState(null);
  const [place, setPlace] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission is needed to show local weather.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const w = await getWeather(pos.coords.latitude, pos.coords.longitude);
      setData(w);
      try {
        const p = await Location.reverseGeocodeAsync(pos.coords);
        if (p[0]) setPlace([p[0].city, p[0].region].filter(Boolean).join(", "));
      } catch {}
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity style={styles.retry} onPress={load}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cur = data.current;
  const [desc, icon] = describeWeather(cur.weather_code);
  const days = data.daily;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <View style={styles.hero}>
        <Text style={styles.place}>{place || "Your location"}</Text>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.temp}>{Math.round(cur.temperature_2m)}°C</Text>
        <Text style={styles.desc}>{desc}</Text>
        <Text style={styles.feels}>
          Feels like {Math.round(cur.apparent_temperature)}°C
        </Text>
      </View>

      <View style={styles.metricsRow}>
        <Metric label="Humidity" value={`${cur.relative_humidity_2m}%`} icon="💧" />
        <Metric label="Wind" value={`${cur.wind_speed_10m} km/h`} icon="💨" />
      </View>

      <Text style={styles.section}>Next days</Text>
      {days.time.slice(0, 5).map((d, i) => {
        const [, dayIcon] = describeWeather(days.weather_code[i]);
        return (
          <View key={d} style={styles.dayRow}>
            <Text style={styles.dayName}>
              {new Date(d).toLocaleDateString(undefined, { weekday: "short" })}
            </Text>
            <Text style={styles.dayIcon}>{dayIcon}</Text>
            <Text style={styles.dayTemp}>
              {Math.round(days.temperature_2m_min[i])}° /{" "}
              {Math.round(days.temperature_2m_max[i])}°
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

function Metric({ label, value, icon }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricIcon}>{icon}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  error: { color: colors.danger, textAlign: "center", marginBottom: 16 },
  retry: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: { color: "#fff", fontWeight: "700" },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
  },
  place: { color: "#dbeafe", fontSize: 16, fontWeight: "600" },
  icon: { fontSize: 64, marginVertical: 6 },
  temp: { color: "#fff", fontSize: 54, fontWeight: "800" },
  desc: { color: "#fff", fontSize: 18, fontWeight: "600" },
  feels: { color: "#dbeafe", marginTop: 4 },
  metricsRow: { flexDirection: "row", gap: 12, marginTop: 16 },
  metric: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricIcon: { fontSize: 26 },
  metricValue: { fontSize: 20, fontWeight: "800", color: colors.text, marginTop: 4 },
  metricLabel: { color: colors.muted, fontSize: 13 },
  section: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayName: { fontWeight: "700", color: colors.text, width: 50 },
  dayIcon: { fontSize: 24 },
  dayTemp: { color: colors.text, fontWeight: "600" },
});
