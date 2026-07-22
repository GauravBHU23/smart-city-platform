import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "./src/context/AuthContext";
import { ToastProvider } from "./src/context/ToastContext";
import { I18nProvider } from "./src/i18n";
import RootNavigation from "./src/navigation";

export default function App() {
  return (
    <SafeAreaProvider>
      <I18nProvider>
        <ToastProvider>
          <AuthProvider>
            <StatusBar style="light" />
            <RootNavigation />
          </AuthProvider>
        </ToastProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}
