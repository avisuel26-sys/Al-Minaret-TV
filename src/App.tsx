/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, CSSProperties } from 'react';
import { Settings, Play, MapPin, Maximize, Minimize } from 'lucide-react';
import { usePrayerTimes } from './hooks/usePrayerTimes';
import { Clock } from './components/Clock';
import { PrayerList } from './components/PrayerList';
import { AdhanOverlay } from './components/AdhanOverlay';
import { SettingsModal } from './components/SettingsModal';
import { useTranslation } from 'react-i18next';
import { fetchCityName, getIpLocation } from './utils/location';

function App() {
  const { t, i18n } = useTranslation();
  const {
    location,
    setLocation,
    media,
    setMedia,
    theme,
    setTheme,
    prayers,
    nextDayPrayers,
    nextPrayer,
    timeToNextPrayer,
    isAdhanActive,
    currentPrayer,
    closeAdhan,
    triggerAdhanTest
  } = usePrayerTimes();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showTestButton, setShowTestButton] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Auto-detect location on first visit
  useEffect(() => {
    const savedLocation = localStorage.getItem('prayer_location');
    if (!savedLocation) {
      console.log("First visit detected, attempting auto-location...");
      
      const handleSuccess = async (lat: number, lng: number) => {
        const city = await fetchCityName(lat, lng, i18n.language);
        setLocation({
          ...location,
          latitude: lat,
          longitude: lng,
          city: city || '',
        });
      };

      const handleError = async () => {
        try {
          const data = await getIpLocation();
          await handleSuccess(data.latitude, data.longitude);
        } catch (e) {
          console.error("Auto-location failed completely", e);
        }
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => handleSuccess(position.coords.latitude, position.coords.longitude),
          (error) => {
            console.warn("GPS auto-detect failed", error);
            handleError();
          },
          { timeout: 10000 }
        );
      } else {
        handleError();
      }
    }
  }, []); // Run once on mount

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    // Show the install prompt
    installPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    setInstallPrompt(null);
  };

  // Show test button on hover/interaction (for cleaner TV UI)
  useEffect(() => {
    const handleMouseMove = () => {
      setShowTestButton(true);
      const timer = setTimeout(() => setShowTestButton(false), 3000);
      return () => clearTimeout(timer);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle fullscreen change events (e.g. user presses Esc)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Attempt auto-fullscreen on first interaction (common for Kiosk/TV apps)
  // Removed as per user request to avoid unwanted fullscreen transitions
  /* 
  useEffect(() => {
    const handleFirstInteraction = async () => {
      // ... code removed ...
    };
    // ... listeners removed ...
  }, []);
  */

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Error toggling fullscreen:", err);
    }
  };

  return (
    <div 
      className="min-h-screen overflow-hidden relative font-sans"
      style={{ 
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        '--accent-color': theme.accentColor,
      } as CSSProperties}
    >
      <style>{`
        ::selection {
          background-color: ${theme.accentColor}4d; /* 30% opacity */
          color: ${theme.textColor};
        }
      `}</style>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${encodeURIComponent(theme.accentColor)}' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
           }}
      />
      
      {/* Ambient Gradient */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: `linear-gradient(to bottom, ${theme.backgroundColor}80, ${theme.backgroundColor})`
        }}
      />

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-2 md:p-8 transition-all duration-300">
        
        {/* Header / Location Info */}
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="absolute top-2 left-2 md:top-8 md:left-8 flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity z-20 text-left" 
          style={{ color: theme.textColor }}
          title={t('location_method')}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-sm tracking-wider uppercase">
            {location.city || `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`}
          </span>
        </button>

        {/* Top Right Controls */}
        <div className="absolute top-2 right-2 md:top-8 md:right-8 flex gap-2 md:gap-4 z-20">
          {installPrompt && (
            <button
              onClick={handleInstallClick}
              className="p-2 md:p-3 rounded-full transition-all backdrop-blur-sm animate-pulse"
              style={{ 
                backgroundColor: `${theme.accentColor}33`, // 20% opacity
                color: theme.accentColor 
              }}
              title={t('install_app')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-2 md:p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all backdrop-blur-sm"
            style={{ color: theme.textColor }}
            title={isFullscreen ? t('exit_fullscreen') : t('enter_fullscreen')}
          >
            {isFullscreen ? <Minimize className="w-5 h-5 md:w-6 md:h-6" /> : <Maximize className="w-5 h-5 md:w-6 md:h-6" />}
          </button>
          
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="group relative p-2 md:p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all backdrop-blur-sm"
            style={{ color: theme.textColor }}
            aria-label={t('settings')}
          >
            <Settings className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-500 group-hover:rotate-90" />
            
            {/* Custom Tooltip */}
            <span className="absolute top-full mt-2 right-0 px-3 py-1.5 bg-black/80 backdrop-blur-md border border-white/10 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
              {t('settings')}
            </span>
          </button>
        </div>

        {/* Clock Section */}
        <div className="mb-4 md:mb-12 transition-all duration-300 mt-12 md:mt-0">
          <Clock theme={theme} />
        </div>

        {/* Next Prayer Countdown */}
        {nextPrayer && (
          <div className="mb-6 md:mb-16 text-center transition-all duration-300">
            <p className="uppercase tracking-[0.2em] text-[10px] md:text-sm mb-1 md:mb-2" style={{ color: theme.textColor, opacity: 0.6 }}>{t('next_prayer_in')}</p>
            <div className="text-3xl md:text-5xl font-light font-mono tracking-wider" style={{ color: theme.accentColor }}>
              {timeToNextPrayer}
            </div>
            <p className="mt-1 md:mt-2 text-sm md:text-lg" style={{ color: theme.textColor, opacity: 0.8 }}>{t(`prayers.${nextPrayer.name}`, { defaultValue: nextPrayer.name })}</p>
          </div>
        )}

        {/* Prayer List */}
        <PrayerList prayers={prayers} nextDayPrayers={nextDayPrayers} nextPrayer={nextPrayer} theme={theme} />

        {/* Test Button (Hidden unless active) */}
        <div className={`fixed bottom-8 right-8 transition-opacity duration-500 ${showTestButton ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={triggerAdhanTest}
            className="flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-sm border transition-all text-sm"
            style={{ 
              backgroundColor: `${theme.accentColor}20`, 
              borderColor: `${theme.accentColor}40`,
              color: theme.accentColor
            }}
          >
            <Play className="w-4 h-4" /> {t('test_adhan')}
          </button>
        </div>

      </main>

      {/* Overlays */}
      <AdhanOverlay
        isOpen={isAdhanActive}
        currentPrayer={currentPrayer}
        videoUrl={media.mosqueVideo}
        audioUrl={media.adhanAudio}
        onClose={closeAdhan}
        isVideoMuted={media.isVideoMuted}
        theme={theme}
      />

      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          location={location}
          setLocation={setLocation}
          media={media}
          setMedia={setMedia}
          theme={theme}
          setTheme={setTheme}
        />
      )}
    </div>
  );
}

export default App;

