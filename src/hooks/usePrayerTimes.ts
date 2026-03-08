import { useState, useEffect, useCallback, useRef } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';

export interface PrayerTime {
  name: string;
  time: Date;
  id: string;
}

export interface LocationSettings {
  latitude: number;
  longitude: number;
  method: keyof typeof CalculationMethod; // e.g. 'MuslimWorldLeague', 'Egyptian', etc.
  city?: string;
}

export interface MediaSettings {
  adhanAudio: string; // URL
  mosqueVideo: string; // URL
  isVideoMuted: boolean;
}

export interface ThemeSettings {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

export const DEFAULT_LOCATION: LocationSettings = {
  latitude: 21.4225, // Mecca
  longitude: 39.8262,
  method: 'MuslimWorldLeague',
  city: 'Mecca',
};

export const DEFAULT_THEME: ThemeSettings = {
  backgroundColor: '#09090b', // zinc-950
  textColor: '#ffffff',
  accentColor: '#10b981', // emerald-500
};

// Default media (placeholders)
export const DEFAULT_MEDIA: MediaSettings = {
  // Alternative Adhan source (MP3Quran is very reliable)
  adhanAudio: 'https://server10.mp3quran.net/adhan/01.mp3', 
  // Local video (downloaded via script)
  mosqueVideo: '/assets/video/background.mp4', 
  isVideoMuted: true, 
};

export function usePrayerTimes() {
  const [location, setLocation] = useState<LocationSettings>(() => {
    const saved = localStorage.getItem('prayer_location');
    return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
  });

  const [media, setMedia] = useState<MediaSettings>(() => {
    const saved = localStorage.getItem('prayer_media');
    return saved ? JSON.parse(saved) : DEFAULT_MEDIA;
  });

  const [theme, setTheme] = useState<ThemeSettings>(() => {
    const saved = localStorage.getItem('prayer_theme');
    return saved ? JSON.parse(saved) : DEFAULT_THEME;
  });

  const [prayers, setPrayers] = useState<PrayerTime[]>([]);
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [currentPrayer, setCurrentPrayer] = useState<PrayerTime | null>(null);
  const [isAdhanActive, setIsAdhanActive] = useState(false);
  const [timeToNextPrayer, setTimeToNextPrayer] = useState<string>('');

  // Refs to access latest state inside interval without triggering re-renders
  const prayersRef = useRef(prayers);
  const nextPrayerRef = useRef(nextPrayer);
  const isAdhanActiveRef = useRef(isAdhanActive);

  useEffect(() => {
    prayersRef.current = prayers;
  }, [prayers]);

  useEffect(() => {
    nextPrayerRef.current = nextPrayer;
  }, [nextPrayer]);

  useEffect(() => {
    isAdhanActiveRef.current = isAdhanActive;
  }, [isAdhanActive]);

  // Save settings
  useEffect(() => {
    localStorage.setItem('prayer_location', JSON.stringify(location));
  }, [location]);

  useEffect(() => {
    localStorage.setItem('prayer_media', JSON.stringify(media));
  }, [media]);

  useEffect(() => {
    localStorage.setItem('prayer_theme', JSON.stringify(theme));
  }, [theme]);

  // Calculate prayers - Separated from timer loop
  const calculatePrayers = useCallback(() => {
    const coordinates = new Coordinates(location.latitude, location.longitude);
    const date = new Date();
    const params = CalculationMethod[location.method as keyof typeof CalculationMethod]();
    
    const prayerTimes = new PrayerTimes(coordinates, date, params);
    
    const list: PrayerTime[] = [
      { name: 'Fajr', time: prayerTimes.fajr, id: 'fajr' },
      { name: 'Sunrise', time: prayerTimes.sunrise, id: 'sunrise' },
      { name: 'Dhuhr', time: prayerTimes.dhuhr, id: 'dhuhr' },
      { name: 'Asr', time: prayerTimes.asr, id: 'asr' },
      { name: 'Maghrib', time: prayerTimes.maghrib, id: 'maghrib' },
      { name: 'Isha', time: prayerTimes.isha, id: 'isha' },
    ];

    setPrayers(list);

    // Determine next prayer
    const now = new Date();
    let next = list.find(p => p.time > now);
    
    if (!next) {
       // Calculate tomorrow's Fajr
       const tomorrow = new Date(date);
       tomorrow.setDate(date.getDate() + 1);
       const tomorrowPrayers = new PrayerTimes(coordinates, tomorrow, params);
       next = { name: 'Fajr', time: tomorrowPrayers.fajr, id: 'fajr' };
    }
    
    setNextPrayer(next || null);
  }, [location]);

  // Initial calculation and recalculation on location change
  useEffect(() => {
    calculatePrayers();
  }, [calculatePrayers]);

  // Timer loop for countdown and triggers
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentNextPrayer = nextPrayerRef.current;
      const currentPrayers = prayersRef.current;
      const currentIsAdhanActive = isAdhanActiveRef.current;
      
      // Update countdown
      if (currentNextPrayer) {
        const diff = currentNextPrayer.time.getTime() - now.getTime();
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeToNextPrayer(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        } else {
          // Time passed, recalculate prayers (e.g. moved to next prayer or next day)
          calculatePrayers();
        }
      }

      // Check for Adhan trigger
      currentPrayers.forEach(p => {
        if (p.name === 'Sunrise') return; // No Adhan for Sunrise
        
        const diff = Math.abs(now.getTime() - p.time.getTime());
        // Trigger if within 1 second and not already active
        if (diff < 1500 && !currentIsAdhanActive) {
             setCurrentPrayer(p);
             setIsAdhanActive(true);
        }
      });

    }, 1000);

    return () => clearInterval(interval);
  }, [calculatePrayers]); // Only depend on calculatePrayers (which depends on location)

  const closeAdhan = () => {
    setIsAdhanActive(false);
  };

  return {
    location,
    setLocation,
    media,
    setMedia,
    theme,
    setTheme,
    prayers,
    nextPrayer,
    timeToNextPrayer,
    isAdhanActive,
    currentPrayer,
    closeAdhan,
    triggerAdhanTest: () => {
      // Use the next prayer name for the test, or Maghrib as a fallback
      // Skip Sunrise as it typically doesn't have Adhan
      const testName = (nextPrayer && nextPrayer.name !== 'Sunrise') ? nextPrayer.name : 'Maghrib';
      setCurrentPrayer({ name: testName, time: new Date(), id: 'test' });
      setIsAdhanActive(true);
    }
  };
}
