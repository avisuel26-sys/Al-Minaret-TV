import { useState, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, MapPin, Music, Video, Save, Globe, RotateCcw, Palette, Bell } from 'lucide-react';
import { LocationSettings, MediaSettings, ThemeSettings, DEFAULT_MEDIA, DEFAULT_LOCATION, DEFAULT_THEME } from '../hooks/usePrayerTimes';
import { useTranslation } from 'react-i18next';
import { fetchCityName, getIpLocation } from '../utils/location';

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
    name: 'Midnight Gold',
    theme: {
      backgroundColor: '#0f172a', // slate-900
      textColor: '#f8fafc',
      accentColor: '#fbbf24', // amber-400
    },
  },
  {
    name: 'Royal Emerald',
    theme: {
      backgroundColor: '#022c22', // emerald-950
      textColor: '#ecfdf5',
      accentColor: '#34d399', // emerald-400
    },
  },
  {
    name: 'Desert Sand',
    theme: {
      backgroundColor: '#292524', // stone-800
      textColor: '#fafaf9',
      accentColor: '#fdba74', // orange-300
    },
  },
  {
    name: 'Obsidian Rose',
    theme: {
      backgroundColor: '#000000', // black
      textColor: '#fff1f2',
      accentColor: '#fb7185', // rose-400
    },
  },
  {
    name: 'Majestic Purple',
    theme: {
      backgroundColor: '#2e1065', // violet-950
      textColor: '#f5f3ff',
      accentColor: '#a78bfa', // violet-400
    },
  },
  {
    name: 'Ocean Blue',
    theme: {
      backgroundColor: '#0c4a6e', // sky-900
      textColor: '#f0f9ff',
      accentColor: '#38bdf8', // sky-400
    },
  },
];

const PRESET_ADHANS = [
  { name: 'Rabeh Ibn Darah Al Jazairi', url: 'https://media.assabile.com/assabile/adhan_3435370/0bf83c80b583.mp3' },
  { name: 'Muhammad Al Damradash', url: 'https://media.assabile.com/assabile/adhan_3435370/cd17c7200df5.mp3' },
];

const PRESET_VIDEOS = [
  { name: 'Ocean', url: 'https://vjs.zencdn.net/v/oceans.mp4' },
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
    // Update local state so the UI reflects the reset immediately
    setLocalLocation({ ...DEFAULT_LOCATION });
    setLocalMedia({ ...DEFAULT_MEDIA });
    setLocalTheme({ ...DEFAULT_THEME });
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
          <div className="flex justify-between items-center p-4 md:p-6 border-b border-zinc-800">
            <h2 className="text-xl md:text-2xl font-bold text-white">{t('settings')}</h2>
            <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-4 md:p-6 space-y-6 md:space-y-8">
            {/* Language Section */}
            <section>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2" style={{ color: localTheme.accentColor }}>
                <Globe className="w-5 h-5" /> {t('language')}
              </h3>
              <div className="flex gap-4">
                {['en', 'fr', 'ar', 'es'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      i18n.language === lang 
                        ? 'text-white' 
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                    }`}
                    style={{
                      backgroundColor: i18n.language === lang ? localTheme.accentColor : undefined,
                      borderColor: i18n.language === lang ? localTheme.accentColor : undefined,
                    }}
                  >
                    {lang === 'en' ? 'English' : lang === 'fr' ? 'Français' : lang === 'ar' ? 'العربية' : 'Español'}
                  </button>
                ))}
              </div>
            </section>

            {/* Theme Section */}
            <section>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2" style={{ color: localTheme.accentColor }}>
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
                        ? 'bg-zinc-800' 
                        : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-600'
                      }
                    `}
                    style={{
                      borderColor: JSON.stringify(localTheme) === JSON.stringify(preset.theme) ? localTheme.accentColor : undefined,
                      boxShadow: JSON.stringify(localTheme) === JSON.stringify(preset.theme) ? `0 0 0 2px ${localTheme.accentColor}33` : undefined
                    }}
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
                <h3 className="text-lg font-medium flex items-center gap-2" style={{ color: localTheme.accentColor }}>
                  <MapPin className="w-5 h-5" /> {t('location_method')}
                </h3>
                  <button
                  onClick={() => {
                    setIsDetecting(true);
                    
                    const handleSuccess = async (lat: number, lng: number) => {
                      const city = await fetchCityName(lat, lng);
                      setLocalLocation({
                        ...localLocation,
                        latitude: lat,
                        longitude: lng,
                        city: city || '',
                      });
                      setIsDetecting(false);
                    };

                    const handleError = async (error: GeolocationPositionError | null) => {
                      console.warn("Geolocation failed, trying IP fallback:", error?.message);
                      
                      try {
                        // Fallback to IP-based location
                        const data = await getIpLocation();
                        await handleSuccess(data.latitude, data.longitude);
                        // Optional: Notify user we used IP fallback
                      } catch (ipError) {
                        console.error("IP fallback error:", ipError);
                        alert(t('location_error', { defaultValue: 'Could not detect location. Please enter manually.' }));
                        setIsDetecting(false);
                      }
                    };

                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => handleSuccess(position.coords.latitude, position.coords.longitude),
                        (error) => handleError(error),
                        { timeout: 10000 }
                      );
                    } else {
                      handleError(null);
                    }
                  }}
                  disabled={isDetecting}
                  className="text-xs bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 px-3 py-1 rounded-full transition-colors flex items-center gap-1"
                  style={{ color: localTheme.accentColor }}
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
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:ring-2"
                    style={{ '--tw-ring-color': localTheme.accentColor } as any}
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">{t('latitude')}</label>
                  <input
                    type="number"
                    value={localLocation.latitude}
                    onChange={(e) => setLocalLocation({ ...localLocation, latitude: parseFloat(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:ring-2"
                    style={{ '--tw-ring-color': localTheme.accentColor } as any}
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">{t('longitude')}</label>
                  <input
                    type="number"
                    value={localLocation.longitude}
                    onChange={(e) => setLocalLocation({ ...localLocation, longitude: parseFloat(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:ring-2"
                    style={{ '--tw-ring-color': localTheme.accentColor } as any}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-zinc-400 mb-1">{t('calculation_method')}</label>
                  <select
                    value={localLocation.method}
                    onChange={(e) => setLocalLocation({ ...localLocation, method: e.target.value as any })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none appearance-none focus:ring-2"
                    style={{ '--tw-ring-color': localTheme.accentColor } as any}
                  >
                    {CALCULATION_METHODS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Notification Section */}
            <section>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2" style={{ color: localTheme.accentColor }}>
                <Bell className="w-5 h-5" /> {t('notifications')}
              </h3>
              <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                <label className="block text-sm text-zinc-300 mb-2">{t('notify_before_prayer')}</label>
                <div className="flex flex-wrap gap-2">
                  {[0, 5, 10, 15, 30].map((minutes) => (
                    <button
                      key={minutes}
                      onClick={() => {
                        setLocalMedia({ ...localMedia, notificationMinutes: minutes });
                        if (minutes > 0 && Notification.permission === 'default') {
                          Notification.requestPermission();
                        }
                      }}
                      className={`
                        px-4 py-2 rounded-lg border text-sm font-medium transition-all
                        ${localMedia.notificationMinutes === minutes
                          ? 'text-white'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600'
                        }
                      `}
                      style={{
                        backgroundColor: localMedia.notificationMinutes === minutes ? localTheme.accentColor : undefined,
                        borderColor: localMedia.notificationMinutes === minutes ? localTheme.accentColor : undefined,
                      }}
                    >
                      {minutes === 0 ? t('off') : `${minutes} ${t('minutes')}`}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  {t('notification_hint')}
                </p>
              </div>
            </section>

            {/* Media Section */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium flex items-center gap-2" style={{ color: localTheme.accentColor }}>
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
                        ? 'text-white' 
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600'
                      }
                    `}
                    style={{
                      backgroundColor: localMedia.adhanAudio === preset.url ? localTheme.accentColor : undefined,
                      borderColor: localMedia.adhanAudio === preset.url ? localTheme.accentColor : undefined,
                    }}
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
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm text-white outline-none focus:ring-2"
                    style={{ '--tw-ring-color': localTheme.accentColor } as any}
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
                <h3 className="text-lg font-medium flex items-center gap-2" style={{ color: localTheme.accentColor }}>
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
                        ? 'text-white' 
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600'
                      }
                    `}
                    style={{
                      backgroundColor: localMedia.mosqueVideo === preset.url ? localTheme.accentColor : undefined,
                      borderColor: localMedia.mosqueVideo === preset.url ? localTheme.accentColor : undefined,
                    }}
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
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm text-white outline-none focus:ring-2"
                    style={{ '--tw-ring-color': localTheme.accentColor } as any}
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
                      className="w-4 h-4 rounded border-gray-300 focus:ring-2"
                      style={{ color: localTheme.accentColor, '--tw-ring-color': localTheme.accentColor } as any}
                   />
                   <label htmlFor="muteVideo" className="text-sm text-zinc-300">{t('mute_video')}</label>
                </div>
              </div>
            </section>
          </div>

          <div className="p-4 md:p-6 border-t border-zinc-800 flex flex-col-reverse md:flex-row justify-between items-center gap-4">
             <button
              onClick={handleResetAll}
              className="w-full md:w-auto px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <RotateCcw className="w-4 h-4" /> {t('reset_all')}
            </button>
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto">
                <button
                onClick={onClose}
                className="w-full md:w-auto px-6 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-center"
                >
                {t('cancel')}
                </button>
                <button
                onClick={handleSave}
                className="w-full md:w-auto px-6 py-3 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
                style={{ backgroundColor: localTheme.accentColor }}
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

