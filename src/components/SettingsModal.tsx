import { useState, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, MapPin, Music, Video, Save, Globe, RotateCcw, Palette } from 'lucide-react';
import { LocationSettings, MediaSettings, ThemeSettings, DEFAULT_MEDIA, DEFAULT_LOCATION, DEFAULT_THEME } from '../hooks/usePrayerTimes';
import { useTranslation } from 'react-i18next';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationSettings;
  setLocation: (loc: LocationSettings) => void;
  media: MediaSettings;
  setMedia: (media: MediaSettings) => void;
  theme: ThemeSettings;
  setTheme: (theme: ThemeSettings) => void;
}

const CALCULATION_METHODS = [
  'MuslimWorldLeague',
  'Egyptian',
  'Karachi',
  'UmmAlQura',
  'Dubai',
  'MoonsightingCommittee',
  'NorthAmerica',
  'Kuwait',
  'Qatar',
  'Singapore',
  'Tehran',
  'Turkey',
];

const PRESET_THEMES: { name: string; theme: ThemeSettings }[] = [
  {
    name: 'Emerald (Default)',
    theme: {
      backgroundColor: '#09090b',
      textColor: '#ffffff',
      accentColor: '#10b981',
    },
  },
  {
    name: 'Sapphire',
    theme: {
      backgroundColor: '#020617',
      textColor: '#f8fafc',
      accentColor: '#38bdf8',
    },
  },
  {
    name: 'Amethyst',
    theme: {
      backgroundColor: '#1e1b4b',
      textColor: '#e0e7ff',
      accentColor: '#818cf8',
    },
  },
  {
    name: 'Ruby',
    theme: {
      backgroundColor: '#280505',
      textColor: '#ffe4e6',
      accentColor: '#fb7185',
    },
  },
  {
    name: 'Gold',
    theme: {
      backgroundColor: '#1c1917',
      textColor: '#f5f5f4',
      accentColor: '#fbbf24',
    },
  },
];

const PRESET_ADHANS = [
  { name: 'Local File (assets/audio/adhan.mp3)', url: '/assets/audio/adhan.mp3' },
  { name: 'Makkah', url: 'https://server10.mp3quran.net/adhan/01.mp3' },
  { name: 'Madina', url: 'https://server10.mp3quran.net/adhan/02.mp3' },
  { name: 'Al-Aqsa', url: 'https://server10.mp3quran.net/adhan/03.mp3' },
  { name: 'Egypt', url: 'https://server10.mp3quran.net/adhan/04.mp3' },
  { name: 'Abdul Basit', url: 'https://server10.mp3quran.net/adhan/05.mp3' },
  { name: 'Mishary Rashid', url: 'https://server10.mp3quran.net/adhan/06.mp3' },
];

const PRESET_VIDEOS = [
  { name: 'Local File (assets/video/background.mp4)', url: '/assets/video/background.mp4' },
  { name: 'Nature (Default)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
  { name: 'Ocean', url: 'https://vjs.zencdn.net/v/oceans.mp4' },
  { name: 'Waterfall', url: 'https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4' },
];

export function SettingsModal({
  isOpen,
  onClose,
  location,
  setLocation,
  media,
  setMedia,
  theme,
  setTheme,
}: SettingsModalProps) {
  const { t, i18n } = useTranslation();
  const [localLocation, setLocalLocation] = useState(location);
  const [localMedia, setLocalMedia] = useState(media);
  const [localTheme, setLocalTheme] = useState(theme);
  const [isDetecting, setIsDetecting] = useState(false);

  const fetchCityName = async (lat: number, lng: number, lang?: string) => {
    const language = lang || i18n.language;
    try {
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=${language}`);
      const data = await response.json();
      return data.city || data.locality || data.principalSubdivision;
    } catch (error) {
      console.error('Error fetching city:', error);
      return undefined;
    }
  };

  const handleLanguageChange = async (lang: string) => {
    i18n.changeLanguage(lang);
    const city = await fetchCityName(localLocation.latitude, localLocation.longitude, lang);
    if (city) {
      setLocalLocation(prev => ({ ...prev, city }));
    }
  };

  const handleSave = () => {
    setLocation(localLocation);
    setMedia(localMedia);
    setTheme(localTheme);
    onClose();
  };

  const handleResetAll = () => {
    if (confirm(t('confirm_reset'))) {
      // Update local state so the UI reflects the reset immediately
      setLocalLocation({ ...DEFAULT_LOCATION });
      setLocalMedia({ ...DEFAULT_MEDIA });
      setLocalTheme({ ...DEFAULT_THEME });
      
      // We do NOT close the modal, so the user can see the reset values and then click "Save" to confirm.
      // This is more consistent with the "Cancel" / "Save" buttons.
      // If we closed it immediately, the user might be confused if they didn't mean to apply it yet (though they confirmed).
      // But typically "Reset" inside a modal just resets the form values.
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>, type: 'audio' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === 'audio') {
        setLocalMedia({ ...localMedia, adhanAudio: url });
      } else {
        setLocalMedia({ ...localMedia, mosqueVideo: url });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          <div className="flex justify-between items-center p-6 border-b border-zinc-800">
            <h2 className="text-2xl font-bold text-white">{t('settings')}</h2>
            <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Language Section */}
            <section>
              <h3 className="text-lg font-medium text-emerald-400 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" /> {t('language')}
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${i18n.language === 'en' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'}`}
                >
                  English
                </button>
                <button
                  onClick={() => handleLanguageChange('fr')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${i18n.language === 'fr' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'}`}
                >
                  Français
                </button>
                <button
                  onClick={() => handleLanguageChange('ar')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${i18n.language === 'ar' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'}`}
                >
                  العربية
                </button>
                <button
                  onClick={() => handleLanguageChange('es')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${i18n.language === 'es' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'}`}
                >
                  Español
                </button>
              </div>
            </section>

            {/* Theme Section */}
            <section>
              <h3 className="text-lg font-medium text-emerald-400 mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" /> {t('theme')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {PRESET_THEMES.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setLocalTheme(preset.theme)}
                    className={`
                      relative group flex flex-col items-center gap-2 p-3 rounded-xl border transition-all
                      ${JSON.stringify(localTheme) === JSON.stringify(preset.theme) 
                        ? 'border-emerald-500 bg-zinc-800 ring-2 ring-emerald-500/20' 
                        : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-600'
                      }
                    `}
                  >
                    <div 
                      className="w-full aspect-square rounded-lg shadow-lg relative overflow-hidden"
                      style={{ backgroundColor: preset.theme.backgroundColor }}
                    >
                      <div 
                        className="absolute inset-x-0 bottom-0 h-1/3"
                        style={{ backgroundColor: preset.theme.accentColor, opacity: 0.2 }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span 
                          className="text-xs font-bold"
                          style={{ color: preset.theme.textColor }}
                        >
                          Aa
                        </span>
                      </div>
                      <div 
                        className="absolute top-2 right-2 w-2 h-2 rounded-full"
                        style={{ backgroundColor: preset.theme.accentColor }}
                      />
                    </div>
                    <span className="text-xs text-zinc-400 font-medium truncate w-full text-center">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Location Section */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-emerald-400 flex items-center gap-2">
                  <MapPin className="w-5 h-5" /> {t('location_method')}
                </h3>
                <button
                  onClick={() => {
                    if (navigator.geolocation) {
                      setIsDetecting(true);
                      navigator.geolocation.getCurrentPosition(
                        async (position) => {
                          const lat = position.coords.latitude;
                          const lng = position.coords.longitude;
                          const city = await fetchCityName(lat, lng);
                          
                          setLocalLocation({
                            ...localLocation,
                            latitude: lat,
                            longitude: lng,
                            city: city || '', // Clear city if not found to avoid mismatch with new coordinates
                          });
                          setIsDetecting(false);
                        },
                        (error) => {
                          console.error("Geolocation error:", error);
                          alert('Error getting location: ' + error.message);
                          setIsDetecting(false);
                        }
                      );
                    } else {
                      alert('Geolocation is not supported by this browser.');
                    }
                  }}
                  disabled={isDetecting}
                  className="text-xs bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-emerald-400 px-3 py-1 rounded-full transition-colors flex items-center gap-1"
                >
                  {isDetecting ? (
                    <span className="animate-spin">⌛</span>
                  ) : (
                    <MapPin className="w-3 h-3" />
                  )}
                  {t('detect_location')}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-zinc-400 mb-1">{t('city_name')}</label>
                  <input
                    type="text"
                    value={localLocation.city || ''}
                    onChange={(e) => setLocalLocation({ ...localLocation, city: e.target.value })}
                    placeholder="e.g. Paris, Mecca, New York"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">{t('latitude')}</label>
                  <input
                    type="number"
                    value={localLocation.latitude}
                    onChange={(e) => setLocalLocation({ ...localLocation, latitude: parseFloat(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">{t('longitude')}</label>
                  <input
                    type="number"
                    value={localLocation.longitude}
                    onChange={(e) => setLocalLocation({ ...localLocation, longitude: parseFloat(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-zinc-400 mb-1">{t('calculation_method')}</label>
                  <select
                    value={localLocation.method}
                    onChange={(e) => setLocalLocation({ ...localLocation, method: e.target.value as any })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                  >
                    {CALCULATION_METHODS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Media Section */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-emerald-400 flex items-center gap-2">
                  <Music className="w-5 h-5" /> {t('adhan_audio')}
                </h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {PRESET_ADHANS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setLocalMedia({ ...localMedia, adhanAudio: preset.url })}
                    className={`
                      p-3 rounded-lg border text-sm font-medium transition-all text-left truncate
                      ${localMedia.adhanAudio === preset.url
                        ? 'bg-emerald-600 border-emerald-500 text-white' 
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600'
                      }
                    `}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>

              <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={localMedia.adhanAudio}
                    onChange={(e) => setLocalMedia({ ...localMedia, adhanAudio: e.target.value })}
                    placeholder={t('enter_url')}
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <label className="cursor-pointer bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 whitespace-nowrap">
                    <Upload className="w-4 h-4" /> {t('upload_mp3')}
                    <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileUpload(e, 'audio')} />
                  </label>
                </div>
              </div>
            </section>

            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-emerald-400 flex items-center gap-2">
                  <Video className="w-5 h-5" /> {t('mosque_video')}
                </h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {PRESET_VIDEOS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setLocalMedia({ ...localMedia, mosqueVideo: preset.url })}
                    className={`
                      p-3 rounded-lg border text-sm font-medium transition-all text-left truncate
                      ${localMedia.mosqueVideo === preset.url
                        ? 'bg-emerald-600 border-emerald-500 text-white' 
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600'
                      }
                    `}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>

              <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={localMedia.mosqueVideo}
                    onChange={(e) => setLocalMedia({ ...localMedia, mosqueVideo: e.target.value })}
                    placeholder={t('enter_url')}
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <label className="cursor-pointer bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 whitespace-nowrap">
                    <Upload className="w-4 h-4" /> {t('upload_mp4')}
                    <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'video')} />
                  </label>
                </div>
                <div className="mt-4 flex items-center gap-2">
                   <input 
                      type="checkbox" 
                      id="muteVideo"
                      checked={localMedia.isVideoMuted}
                      onChange={(e) => setLocalMedia({...localMedia, isVideoMuted: e.target.checked})}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                   />
                   <label htmlFor="muteVideo" className="text-sm text-zinc-300">{t('mute_video')}</label>
                </div>
              </div>
            </section>
          </div>

          <div className="p-6 border-t border-zinc-800 flex justify-between items-center gap-4">
             <button
              onClick={handleResetAll}
              className="px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors flex items-center gap-2 text-sm"
            >
              <RotateCcw className="w-4 h-4" /> {t('reset_all')}
            </button>
            <div className="flex gap-4 ml-auto">
                <button
                onClick={onClose}
                className="px-6 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                {t('cancel')}
                </button>
                <button
                onClick={handleSave}
                className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors flex items-center gap-2"
                >
                <Save className="w-4 h-4" /> {t('save_changes')}
                </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

