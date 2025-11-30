'use client';

import { useState } from 'react';
import { ChatInterface } from '@/components/chat-interface';
import { SetlistView } from '@/components/setlist-view';
import { MusicPlayer } from '@/components/music-player';
import { useSetlist } from '@/hooks/use-setlist';
import { Track } from '@/types';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

export default function Home() {
  const { setlist, addToSetlist, removeFromSetlist } = useSetlist();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

  const handlePlay = (track: Track) => {
    setCurrentTrack(track);
  };

  const handleNext = () => {
    if (!currentTrack) return;
    const currentIndex = setlist.findIndex(t => t.id === currentTrack.id);
    if (currentIndex >= 0 && currentIndex < setlist.length - 1) {
      setCurrentTrack(setlist[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (!currentTrack) return;
    const currentIndex = setlist.findIndex(t => t.id === currentTrack.id);
    if (currentIndex > 0) {
      setCurrentTrack(setlist[currentIndex - 1]);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
      <div className="flex-1 overflow-hidden pb-24"> {/* Padding for player */}
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="border-r">
            <div className="h-full p-4">
              <SetlistView 
                setlist={setlist} 
                onRemove={removeFromSetlist} 
                onPlay={handlePlay} 
              />
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={75}>
            <div className="h-full">
              <ChatInterface 
                onPlayTrack={handlePlay} 
                onAddToSetlist={addToSetlist} 
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <MusicPlayer 
        currentTrack={currentTrack} 
        onNext={handleNext} 
        onPrev={handlePrev} 
      />
    </div>
  );
}
