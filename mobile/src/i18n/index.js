import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { translations } from "./translations";

const LANG_KEY = "smartcity_lang";
const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState("en");

  // Load the saved language on startup.
  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((saved) => {
      if (saved === "hi" || saved === "en") setLang(saved);
    });
  }, []);

  const changeLang = useCallback((next) => {
    setLang(next);
    AsyncStorage.setItem(LANG_KEY, next).catch(() => {});
  }, []);

  const t = useCallback(
    (key) => translations[lang]?.[key] ?? translations.en[key] ?? key,
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
