import { useState, useEffect, useCallback, useRef } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import i18n from '../i18n';

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
  notificationMinutes: number; // 0 for off
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
  backgroundColor: '#0f172a', // slate-900
  textColor: '#f8fafc',
  accentColor: '#fbbf24', // amber-400
};

// Default media (placeholders)
export const DEFAULT_MEDIA: MediaSettings = {
  // Rabeh Ibn Darah Al Jazairi
  adhanAudio: 'https://media.assabile.com/assabile/adhan_3435370/0bf83c80b583.mp3', 
  // Local video (downloaded via script)
  mosqueVideo: '/assets/video/background.mp4', 
  isVideoMuted: true,
  notificationMinutes: 0, // Default off
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
  const [nextDayPrayers, setNextDayPrayers] = useState<PrayerTime[]>([]);
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [currentPrayer, setCurrentPrayer] = useState<PrayerTime | null>(null);
  const [isAdhanActive, setIsAdhanActive] = useState(false);
  const [timeToNextPrayer, setTimeToNextPrayer] = useState<string>('');

  // Refs to access latest state inside interval without triggering re-renders
  const prayersRef = useRef(prayers);
  const nextPrayerRef = useRef(nextPrayer);
  const isAdhanActiveRef = useRef(isAdhanActive);
  const mediaRef = useRef(media);
  const lastNotifiedPrayerId = useRef<string | null>(null);

  useEffect(() => {
    prayersRef.current = prayers;
  }, [prayers]);

  useEffect(() => {
    nextPrayerRef.current = nextPrayer;
  }, [nextPrayer]);

  useEffect(() => {
    isAdhanActiveRef.current = isAdhanActive;
  }, [isAdhanActive]);

  useEffect(() => {
    mediaRef.current = media;
    // Request notification permission if enabled
    if (media.notificationMinutes > 0 && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [media]);

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

    // Calculate tomorrow's prayers
    const tomorrow = new Date(date);
    tomorrow.setDate(date.getDate() + 1);
    const tomorrowPrayers = new PrayerTimes(coordinates, tomorrow, params);
    
    const nextDayList: PrayerTime[] = [
      { name: 'Fajr', time: tomorrowPrayers.fajr, id: 'fajr_next' },
      { name: 'Sunrise', time: tomorrowPrayers.sunrise, id: 'sunrise_next' },
      { name: 'Dhuhr', time: tomorrowPrayers.dhuhr, id: 'dhuhr_next' },
      { name: 'Asr', time: tomorrowPrayers.asr, id: 'asr_next' },
      { name: 'Maghrib', time: tomorrowPrayers.maghrib, id: 'maghrib_next' },
      { name: 'Isha', time: tomorrowPrayers.isha, id: 'isha_next' },
    ];
    setNextDayPrayers(nextDayList);

    // Determine next prayer
    const now = new Date();
    let next = list.find(p => p.time > now);
    
    if (!next) {
       // Use tomorrow's Fajr from the calculated list
       next = nextDayList[0];
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
      const currentMedia = mediaRef.current;
      
      // Update countdown
      if (currentNextPrayer) {
        const diff = currentNextPrayer.time.getTime() - now.getTime();
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeToNextPrayer(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

          // Notification Logic
          if (currentMedia.notificationMinutes > 0) {
            const diffMinutes = diff / (1000 * 60);
            // Trigger if within the window (e.g. <= 15 min) and not already notified
            if (diffMinutes <= currentMedia.notificationMinutes && diffMinutes > 0) {
              // Include notificationMinutes in the ID so changing the setting re-enables notification if applicable
              const prayerInstanceId = `${currentNextPrayer.name}-${currentNextPrayer.time.getDate()}-${currentMedia.notificationMinutes}`;
              
              if (lastNotifiedPrayerId.current !== prayerInstanceId) {
                if (Notification.permission === 'granted') {
                   const prayerName = i18n.t(`prayers.${currentNextPrayer.name}`);
                   const time = Math.ceil(diffMinutes);
                   const body = i18n.t('prayer_starting_in', { prayer: prayerName, time });

                   new Notification(i18n.t('notifications'), {
                      body: body,
                   });
                }
                lastNotifiedPrayerId.current = prayerInstanceId;
              }
            }
          }

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
    nextDayPrayers,
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
