import Fuse from 'fuse.js';
import { Track } from '@/types';

export class SearchEngine {
  private fuse!: Fuse<Track>;
  private tracks: Track[];

  constructor(tracks: Track[]) {
    this.tracks = tracks;
    this.initFuse();
  }

  setTracks(tracks: Track[]) {
    this.tracks = tracks;
    this.initFuse();
  }

  private initFuse() {
    this.fuse = new Fuse(this.tracks, {
      keys: ['title', 'artist', 'album', 'filename'],
      threshold: 0.3, // Adjust for fuzziness
    });
  }

  search(query: string): Track[] {
    return this.fuse.search(query).map(result => result.item);
  }

  filterByBpm(min: number, max: number): Track[] {
    return this.tracks.filter(track => {
      return track.bpm && track.bpm >= min && track.bpm <= max;
    });
  }
  
  getAllTracks(): Track[] {
      return this.tracks;
  }
}
