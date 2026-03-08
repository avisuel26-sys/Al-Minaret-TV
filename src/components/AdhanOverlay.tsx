import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, VolumeX, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PrayerTime, ThemeSettings } from '../hooks/usePrayerTimes';

interface AdhanOverlayProps {
  isOpen: boolean;
  currentPrayer: PrayerTime | null;
  videoUrl: string;
  audioUrl: string;
  onClose: () => void;
  isVideoMuted?: boolean;
  theme?: ThemeSettings;
}

export function AdhanOverlay({
  isOpen,
  currentPrayer,
  videoUrl,
  audioUrl,
  onClose,
  isVideoMuted = true,
  theme,
}: AdhanOverlayProps) {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  
  const prayerName = currentPrayer?.name || 'Prayer Time';

  // Subtitle Logic
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(-1);

  const ADHAN_PHRASES = [
    { ar: "الله أكبر", en: "God is the Greatest", fr: "Dieu est le plus Grand", duration: 15000 },
    { ar: "الله أكبر", en: "God is the Greatest", fr: "Dieu est le plus Grand", duration: 15000 },
    { ar: "أشهد أن لا إله إلا الله", en: "I bear witness that there is no god but God", fr: "J'atteste qu'il n'y a de dieu que Dieu", duration: 15000 },
    { ar: "أشهد أن لا إله إلا الله", en: "I bear witness that there is no god but God", fr: "J'atteste qu'il n'y a de dieu que Dieu", duration: 15000 },
    { ar: "أشهد أن محمدا رسول الله", en: "I bear witness that Muhammad is the Messenger of God", fr: "J'atteste que Muhammad est le Messager de Dieu", duration: 15000 },
    { ar: "أشهد أن محمدا رسول الله", en: "I bear witness that Muhammad is the Messenger of God", fr: "J'atteste que Muhammad est le Messager de Dieu", duration: 15000 },
    { ar: "حي على الصلاة", en: "Hasten to the prayer", fr: "Venez à la prière", duration: 15000 },
    { ar: "حي على الصلاة", en: "Hasten to the prayer", fr: "Venez à la prière", duration: 15000 },
    { ar: "حي على الفلاح", en: "Hasten to success", fr: "Venez à la félicité", duration: 15000 },
    { ar: "حي على الفلاح", en: "Hasten to success", fr: "Venez à la félicité", duration: 15000 },
    // Fajr extra phrase would go here if needed
    { ar: "الله أكبر", en: "God is the Greatest", fr: "Dieu est le plus Grand", duration: 10000 },
    { ar: "لا إله إلا الله", en: "There is no god but God", fr: "Il n'y a de dieu que Dieu", duration: 10000 },
  ];

  // Adjust for Fajr
  const getPhrases = () => {
    if (currentPrayer?.name === 'Fajr') {
       // Insert "Prayer is better than sleep" after "Hasten to success"
       const fajrPhrases = [...ADHAN_PHRASES];
       fajrPhrases.splice(10, 0, 
         { ar: "الصلاة خير من النوم", en: "Prayer is better than sleep", fr: "La prière vaut mieux que le sommeil", duration: 10000 },
         { ar: "الصلاة خير من النوم", en: "Prayer is better than sleep", fr: "La prière vaut mieux que le sommeil", duration: 10000 }
       );
       return fajrPhrases;
    }
    return ADHAN_PHRASES;
  };

  const phrases = getPhrases();

  useEffect(() => {
    if (isOpen) {
      setCurrentPhraseIndex(0);
      let phraseIndex = 0;
      let timeoutId: NodeJS.Timeout;
      
      const showNextPhrase = () => {
        if (phraseIndex < phrases.length - 1) {
          phraseIndex++;
          setCurrentPhraseIndex(phraseIndex);
          // Recursively call for next phrase
          timeoutId = setTimeout(showNextPhrase, phrases[phraseIndex].duration);
        } else {
           // End of subtitles
           setCurrentPhraseIndex(-1);
        }
      };

      // Start the sequence
      timeoutId = setTimeout(showNextPhrase, phrases[0].duration);

      return () => clearTimeout(timeoutId);
    } else {
      setCurrentPhraseIndex(-1);
    }
  }, [isOpen, currentPrayer]); // Re-run if prayer changes (e.g. Fajr)

  useEffect(() => {
    if (isOpen) {
      // Reset error state on open
      setVideoError(false);
      setAudioError(false);
      
      // Reset and play
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.error("Audio play failed", e);
            // Don't set error immediately on autoplay block, only on load error
          });
        }
      }
      
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
           playPromise.catch(e => {
             // Ignore "The play() request was interrupted" error which happens if component unmounts or src changes
             if (e.name !== 'AbortError') {
                console.error("Video play failed", e);
             }
           });
        }
      }
    } else {
      // Stop
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  }, [isOpen]);

  // Auto-close when audio ends
  const handleAudioEnded = () => {
    onClose();
  };

  const handleAudioError = (e: any) => {
    console.error("Audio error:", e.currentTarget.error);
    setAudioError(true);
  };

  const handleShare = async () => {
    const text = `${t('it_is_time_for')} ${t(`prayers.${prayerName}`, { defaultValue: prayerName })}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Prayer Time',
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(`${text} - ${window.location.href}`);
        alert(t('link_copied'));
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black"
        >
          {/* Video Background */}
          {!videoError && (
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover opacity-80"
              loop
              muted={isVideoMuted}
              playsInline
              preload="auto"
              onError={(e) => {
                console.error("Video error:", e.currentTarget.error);
                setVideoError(true);
              }}
              style={{ willChange: 'opacity' }}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
          
          {/* Fallback Background if video fails */}
          {videoError && (
            <div 
              className="absolute inset-0 bg-gradient-to-br opacity-80" 
              style={{ backgroundImage: `linear-gradient(to bottom right, ${theme?.backgroundColor || '#022c22'}, #000000)` }}
            />
          )}

          {/* Overlay Gradient - Optimized for TV (removed heavy backdrop-blur) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/40" />

          {/* Content */}
          <div className="relative z-10 text-center text-white p-8 flex flex-col items-center gap-8 h-full justify-center">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              style={{ willChange: 'transform, opacity' }}
            >
              <h2 className="text-xl md:text-3xl font-light tracking-[0.2em] uppercase mb-2" style={{ color: theme?.accentColor }}>
                {t('it_is_time_for')}
              </h2>
              <h1 className="text-5xl md:text-9xl font-bold font-serif tracking-tight drop-shadow-2xl">
                {t(`prayers.${prayerName}`, { defaultValue: prayerName })}
              </h1>
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="w-16 md:w-32 h-1 rounded-full opacity-50"
              style={{ backgroundColor: theme?.accentColor }}
            />

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              onClick={handleShare}
              className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 rounded-full transition-all text-xs md:text-sm font-medium tracking-widest uppercase hover:scale-105 focus:ring-4"
              style={{ '--tw-ring-color': theme?.accentColor } as any}
            >
              <Share2 className="w-3 h-3 md:w-4 md:h-4" />
              {t('share')}
            </motion.button>
            
            {/* Subtitles */}
            <div className="absolute bottom-12 md:bottom-20 left-0 right-0 px-4 md:px-8 text-center space-y-2">
               <AnimatePresence mode="wait">
                 {currentPhraseIndex >= 0 && phrases[currentPhraseIndex] && (
                   <motion.div
                     key={currentPhraseIndex}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                     transition={{ duration: 0.5 }}
                     className="flex flex-col items-center gap-1"
                   >
                     <p className="text-2xl md:text-4xl font-bold text-white drop-shadow-md font-serif" dir="rtl">
                       {phrases[currentPhraseIndex].ar}
                     </p>
                     <div className="flex flex-col md:flex-row gap-1 md:gap-4 text-base md:text-xl font-medium mt-2" style={{ color: `${theme?.accentColor}e6` }}>
                        <span>{phrases[currentPhraseIndex].en}</span>
                        <span className="hidden md:inline text-white/30">•</span>
                        <span>{phrases[currentPhraseIndex].fr}</span>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </div>

          {/* Controls */}
          <div className="absolute top-4 right-4 md:top-8 md:right-8 flex gap-2 md:gap-4 z-20">
            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.muted = !isMuted;
                  setIsMuted(!isMuted);
                }
              }}
              className="p-2 md:p-4 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 transition-colors focus:ring-4"
              style={{ '--tw-ring-color': theme?.accentColor } as any}
            >
              {isMuted ? <VolumeX className="w-5 h-5 md:w-8 md:h-8" /> : <Volume2 className="w-5 h-5 md:w-8 md:h-8" />}
            </button>
            
            <button
              onClick={onClose}
              className="p-2 md:p-4 rounded-full bg-zinc-900/80 hover:bg-red-900/50 hover:text-red-400 border border-white/10 transition-colors focus:ring-4 focus:ring-red-500"
            >
              <X className="w-5 h-5 md:w-8 md:h-8" />
            </button>
          </div>

          {/* Hidden Audio Player */}
          <audio
            ref={audioRef}
            onEnded={handleAudioEnded}
            className="hidden"
            onError={handleAudioError}
          >
            <source src={audioUrl} type="audio/mpeg" />
            <source src={audioUrl} type="audio/mp3" />
          </audio>
          
          {audioError && (
             <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-red-500/80 text-white px-4 py-2 rounded-full text-sm backdrop-blur-md">
               Audio unavailable
             </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
