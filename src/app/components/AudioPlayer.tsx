'use client';

import { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  surahNumber: number;
  ayahNumber: number;
  reciter?: string;
}

// Default reciter set here
const DEFAULT_RECITER = 'husary';

export default function AudioPlayer({ surahNumber, ayahNumber, reciter = DEFAULT_RECITER }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Format surah and ayah numbers for URL
  const formattedSurah = surahNumber.toString().padStart(3, '0');
  const formattedAyah = ayahNumber.toString().padStart(3, '0');
  
  // Construct audio URL using the provided or default reciter
  const audioUrl = `https://everyayah.com/data/${reciter}/${formattedSurah}${formattedAyah}.mp3`;

  // Reset player state when ayah changes
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0); // Reset duration too
    setIsLoading(false); // Reset loading state

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      // Setting src again might be needed to ensure reload
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }
  }, [surahNumber, ayahNumber, reciter, audioUrl]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        setIsLoading(true);
        // Attempt to play
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(_ => {
            // Autoplay started!
            setIsLoading(false);
          }).catch(error => {
            // Autoplay was prevented.
            console.error('Error playing audio:', error);
            setIsLoading(false);
            setIsPlaying(false); // Ensure state reflects that it didn't play
          });
        }
      }
      // Optimistically set playing state, corrected in catch if needed
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setCurrentTime(current);
      setDuration(duration); // Ensure duration is set here too
      setProgress(duration > 0 ? (current / duration) * 100 : 0);
    }
  };

  const handleLoadedData = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
      setIsLoading(false); // Ready to play
    }
  };

  const handleWaiting = () => {
    setIsLoading(true);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    // Optionally: move to next ayah?
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && audioRef.current && duration > 0) {
      const rect = progressRef.current.getBoundingClientRect();
      // Adjust calculation for RTL: (rect.right - e.clientX) / rect.width
      const pos = (rect.right - e.clientX) / rect.width;
      const newTime = pos * duration;
      
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(pos * 100);
    }
  };

  // Format time using Arabic numerals
  const formatTime = (time: number) => {
    if (isNaN(time) || time === 0) return (0).toLocaleString('ar-EG') + ":" + (0).toLocaleString('ar-EG').padStart(2, (0).toLocaleString('ar-EG'));
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toLocaleString('ar-EG')}:${seconds.toLocaleString('ar-EG').padStart(2, (0).toLocaleString('ar-EG'))}`;
  };

  return (
    <div className="py-2 px-3">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={handleLoadedData}
        onEnded={handleEnded}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        preload="auto"
      />

      <div className="flex items-center gap-3">
        <button
          onClick={handlePlayPause}
          className="icon-button flex-shrink-0 w-10 h-10 bg-primary text-white hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
          disabled={isLoading && !isPlaying}
          aria-label={isPlaying ? "إيقاف" : "تشغيل"}
        >
          {isLoading && !isPlaying ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>

        <div className="flex-1 flex flex-col justify-center">
           <div
            ref={progressRef}
            className="w-full h-2 bg-border-color rounded-full overflow-hidden cursor-pointer mb-1"
            onClick={handleProgressClick}
            dir="ltr"
          >
            <div
              className="h-full bg-primary transition-width duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-foreground/70 font-mono" dir="ltr">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 