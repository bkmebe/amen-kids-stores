import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en/common.json';
import am from '../locales/am/common.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      am: { translation: am },
    },
    lng: localStorage.getItem('amen-ui')
      ? JSON.parse(localStorage.getItem('amen-ui')!).state?.language || 'en'
      : 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
