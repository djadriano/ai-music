import * as fs from 'fs/promises';
import * as path from 'path';
import { parseFile } from 'music-metadata';
import { Track } from '@/types';

export class MusicManager {
  private rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  async scanDirectory(): Promise<Track[]> {
    const tracks: Track[] = [];
    
    try {
      await fs.access(this.rootDir);
    } catch {
      console.warn(`Music directory not found: ${this.rootDir}`);
      return [];
    }
    
    async function scan(dir: string) {
      console.log(`Scanning directory: ${dir}`);
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        const filePromises = entries.map(async (entry) => {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            await scan(fullPath);
          } else if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.mp3') {
            // console.log(`Found MP3: ${entry.name}`); // Commented out to reduce log noise
            try {
              const metadata = await parseFile(fullPath);
              const common = metadata.common;
              const format = metadata.format;

              tracks.push({
                id: fullPath,
                filePath: fullPath,
                filename: entry.name,
                title: common.title || entry.name,
                artist: common.artist,
                album: common.album,
                bpm: common.bpm,
                key: common.key,
                duration: format.duration
              });
            } catch (error) {
              console.error(`Failed to parse ${fullPath}:`, error);
            }
          }
        });

        await Promise.all(filePromises);
      } catch (e) {
        console.error(`Error scanning directory ${dir}:`, e);
      }
    }

    await scan(this.rootDir);
    return tracks;
  }
}
