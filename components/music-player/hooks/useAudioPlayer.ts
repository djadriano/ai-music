import { useState, useRef, useEffect } from 'react';
import { Track } from '@/types';

export const useAudioPlayer = (currentTrack: Track | null, onNext?: () => void) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      // Reset time and duration for new track
      setCurrentTime(0);
      setDuration(0);
      
      audioRef.current.src = `/api/stream?path=${encodeURIComponent(currentTrack.filePath)}`;
      audioRef.current.play().catch(e => console.error("Playback failed", e));
      setIsPlaying(true);
    }
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('durationchange', updateDuration);
    };
  }, [currentTrack]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    state: {
      audioRef,
      isPlaying,
      currentTime,
      duration,
      setIsPlaying
    },
    actions: {
      togglePlay,
      handleSeek,
      formatTime
    }
  };
};
