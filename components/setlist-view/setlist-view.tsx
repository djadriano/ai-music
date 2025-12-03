import { Track } from '@/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Play } from 'lucide-react';

interface SetlistViewProps {
  setlist: Track[];
  onRemove: (id: string) => void;
  onPlay: (track: Track) => void;
}

export function SetlistView({ setlist, onRemove, onPlay }: SetlistViewProps) {
  return (
    <div className="h-full flex flex-col bg-sidebar text-sidebar-foreground">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold text-primary tracking-tight mb-1">
          AI DJ
        </h1>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          Workspace
        </p>
      </div>
      
      <div className="p-4 flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
            Setlist
          </h2>
          <span className="text-xs text-muted-foreground bg-sidebar-accent px-2 py-0.5 rounded-full">
            {setlist.length}
          </span>
        </div>
        
        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="space-y-1">
            {setlist.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <p>No tracks in setlist.</p>
                <p className="text-xs mt-1 opacity-70">Ask AI to add some!</p>
              </div>
            )}
            {setlist.map((track) => (
              <div 
                key={track.id} 
                className="group flex items-center justify-between p-2 rounded-md hover:bg-sidebar-accent/50 transition-colors border border-transparent hover:border-sidebar-border"
              >
                <div className="flex flex-col overflow-hidden mr-2">
                  <span className="font-medium truncate text-sm group-hover:text-primary transition-colors">{track.title}</span>
                  <span className="text-xs text-muted-foreground truncate">{track.artist}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 hover:bg-primary hover:text-primary-foreground" 
                    onClick={() => onPlay(track)}
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 hover:bg-destructive hover:text-destructive-foreground" 
                    onClick={() => onRemove(track.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
