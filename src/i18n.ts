import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "next_prayer_in": "Next Prayer in",
      "it_is_time_for": "It is time for",
      "test_adhan": "Test Adhan",
      "settings": "Settings",
      "location_method": "Location & Method",
      "latitude": "Latitude",
      "longitude": "Longitude",
      "city_name": "City Name (Optional)",
      "calculation_method": "Calculation Method",
      "detect_location": "Detect My Location",
      "adhan_audio": "Adhan Audio",
      "upload_mp3": "Upload MP3",
      "mosque_video": "Mosque Video",
      "upload_mp4": "Upload Video",
      "enter_url": "Enter URL",
      "reset_all": "Reset All Settings",
      "confirm_reset": "Are you sure you want to reset all settings to default?",
      "theme": "Theme & Appearance",
      "background_color": "Background Color",
      "text_color": "Text Color",
      "accent_color": "Accent Color",
      "mute_video": "Mute video sound (recommended if using separate Adhan audio)",
      "cancel": "Cancel",
      "save_changes": "Save Changes",
      "language": "Language",
      "prayers": {
        "Fajr": "Fajr",
        "Sunrise": "Sunrise",
        "Dhuhr": "Dhuhr",
        "Asr": "Asr",
        "Maghrib": "Maghrib",
        "Isha": "Isha",
        "Test": "Test Prayer"
      },
      "next_prayer_label": "Next Prayer",
      "share": "Share",
      "link_copied": "Link copied to clipboard"
    }
  },
  fr: {
    translation: {
      "next_prayer_in": "Prochaine prière dans",
      "it_is_time_for": "Il est l'heure de",
      "test_adhan": "Tester l'Adhan",
      "settings": "Paramètres",
      "location_method": "Localisation & Méthode",
      "latitude": "Latitude",
      "longitude": "Longitude",
      "city_name": "Nom de la ville (Optionnel)",
      "calculation_method": "Méthode de calcul",
      "detect_location": "Détecter ma position",
      "adhan_audio": "Audio de l'Adhan",
      "upload_mp3": "Télécharger MP3",
      "mosque_video": "Vidéo de la Mosquée",
      "upload_mp4": "Télécharger Vidéo",
      "enter_url": "Entrer l'URL",
      "reset_all": "Réinitialiser tout",
      "confirm_reset": "Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?",
      "theme": "Thème & Apparence",
      "background_color": "Couleur de fond",
      "text_color": "Couleur du texte",
      "accent_color": "Couleur d'accentuation",
      "mute_video": "Couper le son de la vidéo (recommandé si audio séparé)",
      "cancel": "Annuler",
      "save_changes": "Enregistrer",
      "language": "Langue",
      "prayers": {
        "Fajr": "Fajr",
        "Sunrise": "Chourouq",
        "Dhuhr": "Dhuhr",
        "Asr": "Asr",
        "Maghrib": "Maghrib",
        "Isha": "Isha",
        "Test": "Prière de Test"
      },
      "next_prayer_label": "Prochaine Prière",
      "share": "Partager",
      "link_copied": "Lien copié dans le presse-papier"
    }
  },
  ar: {
    translation: {
      "next_prayer_in": "الصلاة القادمة بعد",
      "it_is_time_for": "حان وقت صلاة",
      "test_adhan": "تجربة الأذان",
      "settings": "الإعدادات",
      "location_method": "الموقع وطريقة الحساب",
      "latitude": "خط العرض",
      "longitude": "خط الطول",
      "city_name": "اسم المدينة (اختياري)",
      "calculation_method": "طريقة الحساب",
      "detect_location": "تحديد موقعي",
      "adhan_audio": "صوت الأذان",
      "upload_mp3": "رفع ملف MP3",
      "mosque_video": "فيديو المسجد",
      "upload_mp4": "رفع فيديو",
      "enter_url": "أدخل الرابط",
      "reset_all": "إعادة تعيين الكل",
      "confirm_reset": "هل أنت متأكد أنك تريد إعادة تعيين جميع الإعدادات؟",
      "theme": "المظهر والألوان",
      "background_color": "لون الخلفية",
      "text_color": "لون النص",
      "accent_color": "لون التمييز",
      "mute_video": "كتم صوت الفيديو (موصى به إذا كان هناك صوت أذان منفصل)",
      "cancel": "إلغاء",
      "save_changes": "حفظ التغييرات",
      "language": "اللغة",
      "prayers": {
        "Fajr": "الفجر",
        "Sunrise": "الشروق",
        "Dhuhr": "الظهر",
        "Asr": "العصر",
        "Maghrib": "المغرب",
        "Isha": "العشاء",
        "Test": "صلاة تجريبية"
      },
      "next_prayer_label": "الصلاة القادمة",
      "share": "مشاركة",
      "link_copied": "تم نسخ الرابط"
    }
  },
  es: {
    translation: {
      "next_prayer_in": "Próxima oración en",
      "it_is_time_for": "Es hora de",
      "test_adhan": "Probar Adhan",
      "settings": "Ajustes",
      "location_method": "Ubicación y Método",
      "latitude": "Latitud",
      "longitude": "Longitud",
      "city_name": "Nombre de la ciudad (Opcional)",
      "calculation_method": "Método de cálculo",
      "detect_location": "Detectar mi ubicación",
      "adhan_audio": "Audio del Adhan",
      "upload_mp3": "Subir MP3",
      "mosque_video": "Video de la Mezquita",
      "upload_mp4": "Subir Video",
      "enter_url": "Introducir URL",
      "reset_all": "Restablecer todo",
      "confirm_reset": "¿Estás seguro de que quieres restablecer todos los ajustes?",
      "theme": "Tema y Apariencia",
      "background_color": "Color de fondo",
      "text_color": "Color del texto",
      "accent_color": "Color de acento",
      "mute_video": "Silenciar video (recomendado si hay audio separado)",
      "cancel": "Cancelar",
      "save_changes": "Guardar cambios",
      "language": "Idioma",
      "prayers": {
        "Fajr": "Fajr",
        "Sunrise": "Amanecer",
        "Dhuhr": "Dhuhr",
        "Asr": "Asr",
        "Maghrib": "Maghrib",
        "Isha": "Isha",
        "Test": "Oración de prueba"
      },
      "next_prayer_label": "Próxima Oración",
      "share": "Compartir",
      "link_copied": "Enlace copiado al portapapeles"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
