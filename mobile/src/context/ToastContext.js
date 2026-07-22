import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Dependency-free toast for the whole app.
// Wrap the app in <ToastProvider> and call useToast() → toast.success("...") etc.

const ToastContext = createContext(null);

const COLORS = {
  success: "#16a34a",
  error: "#dc2626",
  info: "#2563eb",
};

const ICONS = { success: "✅", error: "❌", info: "ℹ️" };

export function ToastProvider({ children }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState(null); // { type, message }
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef(null);

  const hide = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setToast(null));
  }, [opacity]);

  const show = useCallback(
    (type, message, duration = 3000) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setToast({ type, message });
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      hideTimer.current = setTimeout(hide, duration);
    },
    [opacity, hide]
  );

  const api = {
    success: (msg, d) => show("success", msg, d),
    error: (msg, d) => show("error", msg, d),
    info: (msg, d) => show("info", msg, d),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.toast,
            {
              top: insets.top + 12,
              backgroundColor: COLORS[toast.type],
              opacity,
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.text}>
            {ICONS[toast.type]} {toast.message}
          </Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: 16,
    right: 16,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 9999,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  text: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
});
