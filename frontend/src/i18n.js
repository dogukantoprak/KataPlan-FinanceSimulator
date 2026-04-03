import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  tr: {
    translation: {
      "nav": {
        "home": "Ana Sayfa",
        "calculate": "Finansman Hesapla",
        "compare": "Karşılaştırma",
        "about": "Hakkında"
      },
      "app": {
        "footer": "KataPlan © {{year}} — Eğitim Amaçlı Portfolyo Projesi. Finansal Tavsiye Değildir."
      }
    }
  },
  en: {
    translation: {
      "nav": {
        "home": "Home",
        "calculate": "Calculate",
        "compare": "Compare",
        "about": "About"
      },
      "app": {
        "footer": "KataPlan © {{year}} — Educational Portfolio Project. Not Financial Advice."
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "tr", // default language
    fallbackLng: "tr",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
