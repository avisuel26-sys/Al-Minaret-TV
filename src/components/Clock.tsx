import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { enUS, fr, ar } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { ThemeSettings } from '../hooks/usePrayerTimes';

const locales: Record<string, any> = {
  en: enUS,
  fr: fr,
  ar: ar,
};

interface ClockProps {
  theme?: ThemeSettings;
}

export function Clock({ theme }: ClockProps) {
  const [time, setTime] = useState(new Date());
  const { i18n } = useTranslation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentLocale = locales[i18n.language] || enUS;

  return (
    <div className="flex flex-col items-center justify-center" style={{ color: theme?.textColor || 'white' }}>
      <h1 className="text-8xl font-bold tracking-tighter drop-shadow-lg font-mono">
        {format(time, 'HH:mm')}
      </h1>
      <p className="text-2xl font-light opacity-80 mt-2 uppercase tracking-widest">
        {format(time, 'EEEE, MMMM do, yyyy', { locale: currentLocale })}
      </p>
    </div>
  );
}
