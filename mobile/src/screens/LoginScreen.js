import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useI18n } from "../i18n";
import { colors } from "../theme";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const toast = useToast();
  const { t, lang, changeLang } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    setError("");
    if (!email || !password) {
      setError(t("enterEmailPassword"));
      toast.error(t("enterEmailPassword"));
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      // On success, AuthContext updates and the app switches to the main stack.
      toast.success(t("loginSuccess"));
    } catch (e) {
      setError(e.message);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.inner}>
        {/* Language toggle */}
        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => changeLang(lang === "en" ? "hi" : "en")}
        >
          <Text style={styles.langText}>
            {lang === "en" ? "🌐 हिंदी" : "🌐 English"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.logo}>🏙️</Text>
        <Text style={styles.title}>{t("appName")}</Text>
        <Text style={styles.subtitle}>{t("tagline")}</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder={t("email")}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor={colors.muted}
        />
        <TextInput
          style={styles.input}
          placeholder={t("password")}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor={colors.muted}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={onLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t("login")}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
          <Text style={styles.forgot}>{t("forgotPassword")}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.link}>
            {t("noAccount")} <Text style={styles.linkBold}>{t("register")}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { flex: 1, justifyContent: "center", padding: 24 },
  logo: { fontSize: 56, textAlign: "center" },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 28,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 14,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  link: { textAlign: "center", marginTop: 20, color: colors.muted },
  linkBold: { color: colors.primary, fontWeight: "700" },
  forgot: {
    textAlign: "center",
    marginTop: 16,
    color: colors.primary,
    fontWeight: "700",
  },
  langBtn: {
    position: "absolute",
    top: 60,
    right: 24,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  langText: { fontWeight: "700", color: colors.primary },
  error: {
    color: colors.danger,
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "600",
  },
});
