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

import { api } from "../api/client";
import { useToast } from "../context/ToastContext";
import { useI18n } from "../i18n";
import { colors } from "../theme";

export default function ForgotPasswordScreen({ navigation }) {
  const toast = useToast();
  const { t } = useI18n();

  const [step, setStep] = useState(1); // 1 = email, 2 = otp + new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSendCode() {
    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes("@")) {
      toast.error(t("enterEmailPassword"));
      return;
    }
    setLoading(true);
    try {
      await api.forgotPassword(clean);
      toast.success(t("codeSent"));
      setStep(2);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function onReset() {
    if (otp.trim().length !== 6) {
      toast.error(t("enterOtp"));
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t("passwordTooShort"));
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword(email.trim().toLowerCase(), otp.trim(), newPassword);
      toast.success(t("resetSuccess"));
      navigation.goBack();
    } catch (e) {
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
        <Text style={styles.logo}>🔑</Text>
        <Text style={styles.title}>{t("resetPassword")}</Text>
        <Text style={styles.subtitle}>{t("resetInfo")}</Text>

        <TextInput
          style={styles.input}
          placeholder={t("email")}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          editable={step === 1}
          placeholderTextColor={colors.muted}
        />

        {step === 2 && (
          <>
            <TextInput
              style={styles.input}
              placeholder={t("enterOtp")}
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              placeholderTextColor={colors.muted}
            />
            <TextInput
              style={styles.input}
              placeholder={t("newPassword")}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholderTextColor={colors.muted}
            />
          </>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={step === 1 ? onSendCode : onReset}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {step === 1 ? t("sendCode") : t("setNewPassword")}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>{t("backToLogin")}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { flex: 1, justifyContent: "center", padding: 24 },
  logo: { fontSize: 52, textAlign: "center" },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 20,
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
  link: { textAlign: "center", marginTop: 20, color: colors.primary, fontWeight: "700" },
});
