import { useState, useEffect } from 'react';
import { Track } from '@/types';

const STORAGE_KEY = 'dj-setlist';

export function useSetlist() {
  const [setlist, setSetlist] = useState<Track[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSetlist(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse setlist', e);
      }
    }
  }, []);

  const addToSetlist = (track: Track) => {
    setSetlist((prev) => {
      if (prev.some((t) => t.id === track.id)) return prev;
      const updated = [...prev, track];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromSetlist = (trackId: string) => {
    setSetlist((prev) => {
      const updated = prev.filter((t) => t.id !== trackId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { setlist, addToSetlist, removeFromSetlist };
}
