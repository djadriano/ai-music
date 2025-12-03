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
      keys: ['title', 'artist', 'album', 'filename', 'folder', 'folderPath'],
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

  filterByArtist(artist: string): Track[] {
    const lowerArtist = artist.toLowerCase();
    return this.tracks.filter(track => 
      track.artist?.toLowerCase().includes(lowerArtist)
    );
  }

  filterByAlbum(album: string): Track[] {
    const lowerAlbum = album.toLowerCase();
    return this.tracks.filter(track => 
      track.album?.toLowerCase().includes(lowerAlbum)
    );
  }

  filterByYear(minYear: number, maxYear: number): Track[] {
    return this.tracks.filter(track => {
      // Extract year from metadata if available
      // For now, this is a placeholder - you may need to add year to Track type
      return true; // TODO: implement when year metadata is available
    });
  }

  filterByFolder(folderName: string): Track[] {
    const lowerFolder = folderName.toLowerCase();
    return this.tracks.filter(track => 
      track.folder?.toLowerCase().includes(lowerFolder)
    );
  }

  filterByFolderPath(pathSegment: string): Track[] {
    const lowerPath = pathSegment.toLowerCase();
    return this.tracks.filter(track => 
      track.folderPath?.toLowerCase().includes(lowerPath)
    );
  }

  getTopFolders(tracks: Track[], limit: number = 10): { folder: string; count: number }[] {
    const folderCounts = new Map<string, number>();
    
    tracks.forEach(track => {
      if (track.folder) {
        const count = folderCounts.get(track.folder) || 0;
        folderCounts.set(track.folder, count + 1);
      }
    });

    return Array.from(folderCounts.entries())
      .map(([folder, count]) => ({ folder, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getTopArtists(tracks: Track[], limit: number = 10): { artist: string; count: number }[] {
    const artistCounts = new Map<string, number>();
    
    tracks.forEach(track => {
      if (track.artist) {
        const count = artistCounts.get(track.artist) || 0;
        artistCounts.set(track.artist, count + 1);
      }
    });

    return Array.from(artistCounts.entries())
      .map(([artist, count]) => ({ artist, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getTopAlbums(tracks: Track[], limit: number = 10): { album: string; count: number }[] {
    const albumCounts = new Map<string, number>();
    
    tracks.forEach(track => {
      if (track.album) {
        const count = albumCounts.get(track.album) || 0;
        albumCounts.set(track.album, count + 1);
      }
    });

    return Array.from(albumCounts.entries())
      .map(([album, count]) => ({ album, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getBpmStats(tracks: Track[]): { min: number; max: number; avg: number } | null {
    const tracksWithBpm = tracks.filter(track => track.bpm);
    
    if (tracksWithBpm.length === 0) {
      return null;
    }

    const bpms = tracksWithBpm.map(track => track.bpm!);
    const min = Math.min(...bpms);
    const max = Math.max(...bpms);
    const avg = bpms.reduce((sum, bpm) => sum + bpm, 0) / bpms.length;

    return { min: Math.round(min), max: Math.round(max), avg: Math.round(avg) };
  }

  getDecades(tracks: Track[]): { decade: string; count: number }[] {
    // Placeholder for decade grouping
    // This would require year metadata in tracks
    // For now, return empty array
    return [];
  }

  sortTracks(tracks: Track[], sortBy: 'title' | 'artist' | 'bpm' | 'album', order: 'asc' | 'desc' = 'asc'): Track[] {
    const sorted = [...tracks].sort((a, b) => {
      let aVal: string | number | undefined;
      let bVal: string | number | undefined;

      switch (sortBy) {
        case 'title':
          aVal = a.title?.toLowerCase() || '';
          bVal = b.title?.toLowerCase() || '';
          break;
        case 'artist':
          aVal = a.artist?.toLowerCase() || '';
          bVal = b.artist?.toLowerCase() || '';
          break;
        case 'album':
          aVal = a.album?.toLowerCase() || '';
          bVal = b.album?.toLowerCase() || '';
          break;
        case 'bpm':
          aVal = a.bpm || 0;
          bVal = b.bpm || 0;
          break;
      }

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }
  
  getAllTracks(): Track[] {
      return this.tracks;
  }
}
