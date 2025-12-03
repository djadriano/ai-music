import { MusicManager } from './lib/music-manager';
import { SearchEngine } from './lib/search-engine';

async function debugFolders() {
  const musicDir = process.env.MUSIC_DIR || './music';
  console.log(`Using music directory: ${musicDir}`);
  
  const manager = new MusicManager(musicDir);
  console.log('Scanning music...');
  const tracks = await manager.scanDirectory();
  console.log(`Scan complete. Found ${tracks.length} tracks.\n`);
  
  const searchEngine = new SearchEngine(tracks);
  
  // Get unique folders
  const folders = new Set<string>();
  tracks.forEach(track => {
    if (track.folder) {
      folders.add(track.folder);
    }
  });
  
  // Filter folders with @ symbol
  const atFolders = Array.from(folders).filter(f => f.includes('@')).sort();
  
  console.log('=== Folders with @ symbol ===');
  atFolders.slice(0, 20).forEach(folder => {
    console.log(`"${folder}"`);
  });
  
  console.log(`\nTotal unique folders: ${folders.size}`);
  console.log(`Folders with @: ${atFolders.length}`);
  
  // Test search
  const testQuery = 'activate';
  console.log(`\n=== Testing search for: "${testQuery}" ===`);
  const results = searchEngine.filterByFolder(testQuery);
  console.log(`Found ${results.length} results`);
  
  if (results.length > 0) {
    console.log('Sample results:');
    results.slice(0, 5).forEach(track => {
      console.log(`  - ${track.title} (folder: "${track.folder}")`);
    });
  }
}

debugFolders().catch(console.error);
