import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, VolumeX, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PrayerTime } from '../hooks/usePrayerTimes';

interface AdhanOverlayProps {
  isOpen: boolean;
  currentPrayer: PrayerTime | null;
  videoUrl: string;
  audioUrl: string;
  onClose: () => void;
  isVideoMuted?: boolean;
}

export function AdhanOverlay({
  isOpen,
  currentPrayer,
  videoUrl,
  audioUrl,
  onClose,
  isVideoMuted = true,
}: AdhanOverlayProps) {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  
  const prayerName = currentPrayer?.name || 'Prayer Time';

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
        videoRef.current.play().catch(e => console.error("Video play failed", e));
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
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-black opacity-80" />
          )}

          {/* Overlay Gradient - Optimized for TV (removed heavy backdrop-blur) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/40" />

          {/* Content */}
          <div className="relative z-10 text-center text-white p-8 flex flex-col items-center gap-8">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              style={{ willChange: 'transform, opacity' }}
            >
              <h2 className="text-3xl font-light tracking-[0.2em] uppercase text-emerald-400 mb-2">
                {t('it_is_time_for')}
              </h2>
              <h1 className="text-8xl md:text-9xl font-bold font-serif tracking-tight drop-shadow-2xl">
                {t(`prayers.${prayerName}`, { defaultValue: prayerName })}
              </h1>
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="w-32 h-1 bg-emerald-500 rounded-full opacity-50"
            />

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              onClick={handleShare}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 rounded-full transition-all text-sm font-medium tracking-widest uppercase hover:scale-105 focus:ring-4 focus:ring-emerald-500"
            >
              <Share2 className="w-4 h-4" />
              {t('share')}
            </motion.button>
          </div>

          {/* Controls */}
          <div className="absolute top-8 right-8 flex gap-4 z-20">
            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.muted = !isMuted;
                  setIsMuted(!isMuted);
                }
              }}
              className="p-4 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 transition-colors focus:ring-4 focus:ring-emerald-500"
            >
              {isMuted ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
            </button>
            
            <button
              onClick={onClose}
              className="p-4 rounded-full bg-zinc-900/80 hover:bg-red-900/50 hover:text-red-400 border border-white/10 transition-colors focus:ring-4 focus:ring-red-500"
            >
              <X className="w-8 h-8" />
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
