import { Track } from '@/types';
import { Button } from '@/components/ui/button';
import { Play, Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TrackListProps {
  tracks: Track[];
  onPlayTrack: (track: Track) => void;
  onAddToSetlist: (track: Track) => void;
  grouped?: boolean;
  maxHeight?: string;
}

export function TrackList({ 
  tracks, 
  onPlayTrack, 
  onAddToSetlist,
  grouped = false,
  maxHeight = '400px'
}: TrackListProps) {
  // Group tracks by artist if grouped flag is true
  const groupedTracks = grouped ? groupByArtist(tracks) : null;

  if (grouped && groupedTracks) {
    return (
      <ScrollArea style={{ maxHeight }} className="pr-4">
        <div className="space-y-4">
          {Object.entries(groupedTracks).map(([artist, artistTracks]) => (
            <div key={artist} className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary"></div>
                {artist} ({artistTracks.length})
              </h4>
              <div className="space-y-2 pl-3">
                {artistTracks.map((track) => (
                  <TrackItem 
                    key={track.id} 
                    track={track} 
                    onPlay={onPlayTrack}
                    onAdd={onAddToSetlist}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea style={{ maxHeight }} className="pr-4">
      <div className="space-y-2">
        {tracks.map((track) => (
          <TrackItem 
            key={track.id} 
            track={track} 
            onPlay={onPlayTrack}
            onAdd={onAddToSetlist}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

interface TrackItemProps {
  track: Track;
  onPlay: (track: Track) => void;
  onAdd: (track: Track) => void;
}

function TrackItem({ track, onPlay, onAdd }: TrackItemProps) {
  return (
    <div className="group flex items-center justify-between bg-background p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
      <div className="truncate flex-1 mr-3">
        <div className="font-semibold text-sm">{track.title}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span>{track.artist}</span>
          {track.bpm && (
            <>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/30"></span>
              <span className="font-mono text-[10px] bg-secondary px-1.5 py-0.5 rounded-full">
                {Math.round(track.bpm)} BPM
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8 hover:bg-primary/10 hover:text-primary" 
          onClick={() => onPlay(track)}
        >
          <Play className="h-4 w-4" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8 hover:bg-primary/10 hover:text-primary" 
          onClick={() => onAdd(track)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function groupByArtist(tracks: Track[]): Record<string, Track[]> {
  return tracks.reduce((acc, track) => {
    const artist = track.artist || 'Unknown Artist';
    if (!acc[artist]) {
      acc[artist] = [];
    }
    acc[artist].push(track);
    return acc;
  }, {} as Record<string, Track[]>);
}
