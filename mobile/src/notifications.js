import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { api } from "./api/client";

// Show notifications as banners even when the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Ask permission, get this device's Expo push token, and save it to the
 * backend so status-change notifications reach this phone.
 * Best-effort: any failure is silently ignored (e.g. emulator, denied).
 */
export async function registerForPushNotifications() {
  try {
    if (!Device.isDevice) return; // push doesn't work on emulators

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (existing !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== "granted") return;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData?.data;
    if (token) {
      await api.savePushToken(token);
    }
  } catch (e) {
    // Never block the app over notifications.
    console.log("Push registration skipped:", e?.message);
  }
}
