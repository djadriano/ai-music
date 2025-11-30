export interface Track {
  id: string;
  filePath: string;
  filename: string;
  title?: string;
  artist?: string;
  album?: string;
  bpm?: number;
  key?: string;
  duration?: number;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
}

export interface SearchSummary {
  total: number;
  showing: number;
  topArtists: { artist: string; count: number }[];
  topAlbums: { album: string; count: number }[];
  bpmStats: { min: number; max: number; avg: number } | null;
  decades: { decade: string; count: number }[];
}

export interface SearchResult {
  type: 'full' | 'summary';
  tracks?: Track[];
  summary?: SearchSummary;
  topTracks?: Track[];
}
