import { PrayerTime, ThemeSettings } from '../hooks/usePrayerTimes';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface PrayerListProps {
  prayers: PrayerTime[];
  nextPrayer: PrayerTime | null;
  theme?: ThemeSettings;
}

export function PrayerList({ prayers, nextPrayer, theme }: PrayerListProps) {
  const { t } = useTranslation();
  
  // Helper to get rgba from hex for transparency
  const getRgba = (hex: string, alpha: number) => {
    if (!hex) return `rgba(255, 255, 255, ${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const accentColor = theme?.accentColor || '#10b981';
  const textColor = theme?.textColor || '#ffffff';

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
      {prayers.map((prayer) => {
        const isNext = nextPrayer?.name === prayer.name;
        
        return (
          <motion.div
            key={prayer.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`
              relative overflow-hidden rounded-2xl p-6 backdrop-blur-md border transition-all duration-300
              ${isNext ? 'scale-105 z-10' : 'hover:bg-white/5'}
            `}
            style={{
              backgroundColor: isNext ? getRgba(accentColor, 0.2) : 'rgba(0,0,0,0.4)',
              borderColor: isNext ? getRgba(accentColor, 0.5) : 'rgba(255,255,255,0.1)',
              boxShadow: isNext ? `0 0 30px ${getRgba(accentColor, 0.2)}` : 'none',
            }}
          >
            <div className="flex justify-between items-center relative z-10">
              <div>
                <h3 className="text-xl font-medium" style={{ color: isNext ? accentColor : getRgba(textColor, 0.7) }}>
                  {t(`prayers.${prayer.name}`)}
                </h3>
                {isNext && (
                  <span className="text-xs font-bold uppercase tracking-wider mt-1 block" style={{ color: accentColor }}>
                    {t('next_prayer_label')}
                  </span>
                )}
              </div>
              <span className="text-3xl font-light font-mono" style={{ color: isNext ? textColor : getRgba(textColor, 0.9) }}>
                {format(prayer.time, 'HH:mm')}
              </span>
            </div>
            
            {/* Background glow for next prayer */}
            {isNext && (
              <div 
                className="absolute inset-0 pointer-events-none" 
                style={{ background: `linear-gradient(to bottom right, ${getRgba(accentColor, 0.1)}, transparent)` }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
