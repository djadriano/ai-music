import { MusicManager } from './music-manager';
import { SearchEngine } from './search-engine';

// Global cache to prevent re-scanning on every request in dev mode
const globalForMusic = global as unknown as {
  musicManager: MusicManager | undefined;
  searchEngine: SearchEngine | undefined;
};

export const getMusicStore = async () => {
  if (!globalForMusic.musicManager) {
    // Default to a 'music' folder in the project root for now, or env var
    const musicDir = process.env.MUSIC_DIR || './music';
    console.log(`Initializing MusicManager for directory: ${musicDir}`);
    
    try {
      globalForMusic.musicManager = new MusicManager(musicDir);
      // Initialize with empty tracks first to allow app to start
      globalForMusic.searchEngine = new SearchEngine([]);
      
      // Start scanning in background
      console.log("Starting background music scan...");
      globalForMusic.musicManager.scanDirectory().then(tracks => {
        console.log(`Scan complete. Found ${tracks.length} tracks.`);
        if (globalForMusic.searchEngine) {
          globalForMusic.searchEngine.setTracks(tracks);
        }
      }).catch(err => {
        console.error("Background scan failed:", err);
      });
      
    } catch (error) {
      console.error("Failed to initialize music store:", error);
      // Initialize with empty to prevent crash
      globalForMusic.searchEngine = new SearchEngine([]);
      globalForMusic.musicManager = new MusicManager(musicDir);
    }
  }

  return {
    musicManager: globalForMusic.musicManager!,
    searchEngine: globalForMusic.searchEngine!,
  };
};
