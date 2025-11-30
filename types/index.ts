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
