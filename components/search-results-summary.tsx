import { SearchSummary, Track } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music2, Users, Disc, Activity } from 'lucide-react';

interface SearchResultsSummaryProps {
  summary: SearchSummary;
  topTracks: Track[];
  onPlayTrack: (track: Track) => void;
  onAddToSetlist: (track: Track) => void;
}

export function SearchResultsSummary({ 
  summary, 
  topTracks,
  onPlayTrack, 
  onAddToSetlist 
}: SearchResultsSummaryProps) {
  return (
    <div className="space-y-4">
      {/* Header with total count */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Music2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">
            Found {summary.total.toLocaleString()} tracks
          </h3>
          <p className="text-sm text-muted-foreground">
            Showing top {summary.showing} results
          </p>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Top Artists */}
        {summary.topArtists.length > 0 && (
          <Card className="bg-background/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Top Artists
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {summary.topArtists.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="truncate flex-1">{item.artist}</span>
                  <Badge variant="secondary" className="ml-2 font-mono text-xs">
                    {item.count}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Top Albums */}
        {summary.topAlbums.length > 0 && (
          <Card className="bg-background/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Disc className="h-4 w-4 text-primary" />
                Top Albums
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {summary.topAlbums.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="truncate flex-1">{item.album}</span>
                  <Badge variant="secondary" className="ml-2 font-mono text-xs">
                    {item.count}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* BPM Stats */}
        {summary.bpmStats && (
          <Card className="bg-background/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                BPM Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-primary">{summary.bpmStats.min}</div>
                  <div className="text-xs text-muted-foreground">Min</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-primary">{summary.bpmStats.avg}</div>
                  <div className="text-xs text-muted-foreground">Avg</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-primary">{summary.bpmStats.max}</div>
                  <div className="text-xs text-muted-foreground">Max</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Refinement Suggestions */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Too many results?</strong> Try asking me to:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground ml-4">
            {summary.topArtists.length > 0 && (
              <li>• Show tracks by <strong>{summary.topArtists[0].artist}</strong></li>
            )}
            {summary.bpmStats && (
              <li>• Filter by a specific BPM range (e.g., {summary.bpmStats.min}-{summary.bpmStats.avg})</li>
            )}
            {summary.topAlbums.length > 0 && (
              <li>• Show the album <strong>{summary.topAlbums[0].album}</strong></li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
