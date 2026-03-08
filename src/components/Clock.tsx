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

  const hijriDate = new Intl.DateTimeFormat(i18n.language + '-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(time);

  return (
    <div className="flex flex-col items-center justify-center text-center" style={{ color: theme?.textColor || 'white' }}>
      <h1 className="text-6xl md:text-8xl font-bold tracking-tighter drop-shadow-lg font-mono transition-all duration-300">
        {format(time, 'HH:mm')}
      </h1>
      <p className="text-lg md:text-2xl font-light opacity-80 mt-2 uppercase tracking-widest transition-all duration-300">
        {format(time, 'EEEE, MMMM do, yyyy', { locale: currentLocale })}
      </p>
      <p className="text-base md:text-lg font-light opacity-60 mt-1 tracking-wider transition-all duration-300" style={{ color: theme?.accentColor }}>
        {hijriDate}
      </p>
    </div>
  );
}
