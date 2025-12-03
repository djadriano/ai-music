import { Track } from '@/types';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useAudioPlayer } from './hooks/useAudioPlayer';

interface MusicPlayerProps {
  currentTrack: Track | null;
  onNext?: () => void;
  onPrev?: () => void;
}

export function MusicPlayer({ currentTrack, onNext, onPrev }: MusicPlayerProps) {
  const { state, actions } = useAudioPlayer(currentTrack, onNext);
  const { audioRef, isPlaying, currentTime, duration, setIsPlaying } = state;
  const { togglePlay, handleSeek, formatTime } = actions;

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-50">
      <Card className="bg-background/80 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
        <CardContent className="flex flex-col gap-2 p-4">
          {/* Progress Bar */}
          <div className="flex items-center gap-3 group">
            <span className="text-xs text-muted-foreground w-10 text-right font-mono">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="flex-1 cursor-pointer"
            />
            <span className="text-xs text-muted-foreground w-10 font-mono">
              {formatTime(duration)}
            </span>
          </div>

          {/* Track Info and Controls */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-10 w-10 rounded-md bg-primary/20 flex items-center justify-center">
                <Play className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold truncate text-sm">{currentTrack.title}</span>
                <span className="text-xs text-muted-foreground truncate">{currentTrack.artist}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary" onClick={onPrev}>
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button 
                size="icon" 
                className="h-12 w-12 rounded-full shadow-lg hover:scale-105 transition-transform" 
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary" onClick={onNext}>
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 flex justify-end">
              {/* Volume or other controls could go here */}
            </div>
          </div>

          <audio 
            ref={audioRef} 
            onEnded={onNext}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
