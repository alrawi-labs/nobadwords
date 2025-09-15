import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import tr from "./locales/tr/translation.json";
import en from "./locales/en/translation.json";
import ar from "./locales/ar/translation.json";
import es from "./locales/es/translation.json";
import de from "./locales/de/translation.json";
import fr from "./locales/fr/translation.json";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      tr: { translation: tr },
      en: { translation: en },
      ar: { translation: ar },
      es: { translation: es },
      de: { translation: de },
      fr: { translation: fr }
    },
    fallbackLng: "en",
    supportedLngs: ["tr", "en", "ar", "es", "de", "fr"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "nbw_i18n_lng"
    }
  });

// Update document attributes on language change
try {
  const applyDir = (lng: string) => {
    const lang = (lng || "").toLowerCase();
    const isRtl = lang.startsWith("ar");
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", lang);
      document.documentElement.setAttribute("dir", isRtl ? "rtl" : "ltr");
    }
  };
  applyDir(i18n.language as string);
  i18n.on("languageChanged", applyDir);
} catch {}

export default i18n;
