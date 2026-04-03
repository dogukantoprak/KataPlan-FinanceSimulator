import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  tr: {
    translation: {
      nav: {
        home: "Ana Sayfa",
        calculate: "Teklif Oluştur",
        compare: "Referans Karşılaştırma",
        about: "Hakkında",
      },
      app: {
        footer: "KataPlan © {{year}} — Dijital katılım finansmanı teklif prototipi.",
      },
    },
  },
  en: {
    translation: {
      nav: {
        home: "Home",
        calculate: "Create Quote",
        compare: "Reference Comparison",
        about: "About",
      },
      app: {
        footer: "KataPlan © {{year}} — Digital participation finance quote prototype.",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "tr",
  fallbackLng: "tr",
  interpolation: { escapeValue: false },
});

export default i18n;
