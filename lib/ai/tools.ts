import { tool } from 'ai';
import { z } from 'zod';
import { getMusicStore } from '@/lib/store';
import { SEARCH_RESULTS } from './constants';

export const searchMusic = tool({
  description: 'Search for music by title, artist, or album',
  inputSchema: z.object({
    query: z.string().describe('The search query'),
  }),
  execute: async ({ query }) => {
    const { searchEngine } = await getMusicStore();
    console.log(`Searching for: ${query}`);
    const results = searchEngine.search(query);
    console.log(`Found ${results.length} results`);
    
    // Smart response based on result size
    if (results.length > SEARCH_RESULTS.SUMMARY_THRESHOLD) {
      // Large result set - return summary
      const topTracks = results.slice(0, SEARCH_RESULTS.TOP_TRACKS_LIMIT);
      const topArtists = searchEngine.getTopArtists(results, SEARCH_RESULTS.TOP_ARTISTS_LIMIT);
      const topAlbums = searchEngine.getTopAlbums(results, SEARCH_RESULTS.TOP_ALBUMS_LIMIT);
      const bpmStats = searchEngine.getBpmStats(results);
      
      return {
        type: 'summary',
        total: results.length,
        showing: topTracks.length,
        topTracks,
        summary: {
          total: results.length,
          showing: topTracks.length,
          topArtists,
          topAlbums,
          bpmStats,
          decades: []
        }
      };
    } else if (results.length > SEARCH_RESULTS.GROUPED_THRESHOLD) {
      // Medium result set - return all with grouping hint
      return {
        type: 'full',
        total: results.length,
        tracks: results,
        grouped: true
      };
    } else {
      // Small result set - return all
      return {
        type: 'full',
        total: results.length,
        tracks: results
      };
    }
  },
});

export const filterByBpm = tool({
  description: 'Filter music by BPM range',
  inputSchema: z.object({
    min: z.number().describe('Minimum BPM'),
    max: z.number().describe('Maximum BPM'),
  }),
  execute: async ({ min, max }) => {
    const { searchEngine } = await getMusicStore();
    console.log(`Filtering by BPM: ${min}-${max}`);
    const results = searchEngine.filterByBpm(min, max);
    console.log(`Found ${results.length} results`);
    
    // Smart response based on result size
    if (results.length > SEARCH_RESULTS.SUMMARY_THRESHOLD) {
      const topTracks = results.slice(0, SEARCH_RESULTS.TOP_TRACKS_LIMIT);
      const topArtists = searchEngine.getTopArtists(results, SEARCH_RESULTS.TOP_ARTISTS_LIMIT);
      const topAlbums = searchEngine.getTopAlbums(results, SEARCH_RESULTS.TOP_ALBUMS_LIMIT);
      const bpmStats = searchEngine.getBpmStats(results);
      
      return {
        type: 'summary',
        total: results.length,
        showing: topTracks.length,
        topTracks,
        summary: {
          total: results.length,
          showing: topTracks.length,
          topArtists,
          topAlbums,
          bpmStats,
          decades: []
        }
      };
    } else if (results.length > SEARCH_RESULTS.GROUPED_THRESHOLD) {
      return {
        type: 'full',
        total: results.length,
        tracks: results,
        grouped: true
      };
    } else {
      return {
        type: 'full',
        total: results.length,
        tracks: results
      };
    }
  },
});

export const filterByArtist = tool({
  description: 'Filter music by a specific artist name',
  inputSchema: z.object({
    artist: z.string().describe('The artist name to filter by'),
  }),
  execute: async ({ artist }) => {
    const { searchEngine } = await getMusicStore();
    console.log(`Filtering by artist: ${artist}`);
    const results = searchEngine.filterByArtist(artist);
    console.log(`Found ${results.length} results`);
    
    // Always return full results for artist filtering (usually reasonable size)
    return {
      type: 'full',
      total: results.length,
      tracks: results
    };
  },
});

export const filterByAlbum = tool({
  description: 'Filter music by a specific album name',
  inputSchema: z.object({
    album: z.string().describe('The album name to filter by'),
  }),
  execute: async ({ album }) => {
    const { searchEngine } = await getMusicStore();
    console.log(`Filtering by album: ${album}`);
    const results = searchEngine.filterByAlbum(album);
    console.log(`Found ${results.length} results`);
    
    return {
      type: 'full',
      total: results.length,
      tracks: results
    };
  },
});

export const sortResults = tool({
  description: 'Sort tracks by a specific field',
  inputSchema: z.object({
    sortBy: z.enum(['title', 'artist', 'bpm', 'album']).describe('Field to sort by'),
    order: z.enum(['asc', 'desc']).describe('Sort order (ascending or descending)'),
    trackIds: z.array(z.string()).describe('Array of track IDs to sort'),
  }),
  execute: async ({ sortBy, order, trackIds }) => {
    const { searchEngine } = await getMusicStore();
    console.log(`Sorting ${trackIds.length} tracks by ${sortBy} (${order})`);
    const allTracks = searchEngine.getAllTracks();
    const tracksToSort = allTracks.filter(t => trackIds.includes(t.id));
    const sorted = searchEngine.sortTracks(tracksToSort, sortBy, order);
    
    return {
      type: 'full',
      total: sorted.length,
      tracks: sorted
    };
  },
});

export const addToSetlist = tool({
  description: 'Add a track to the setlist',
  inputSchema: z.object({
    trackId: z.string().describe('The ID of the track to add'),
  }),
  execute: async ({ trackId }) => {
    const { searchEngine } = await getMusicStore();
    const track = searchEngine.getAllTracks().find(t => t.id === trackId);
    if (!track) return { error: 'Track not found' };
    return { action: 'add', track };
  },
});

export const playMusic = tool({
  description: 'Play a specific track',
  inputSchema: z.object({
    trackId: z.string().describe('The ID of the track to play'),
  }),
  execute: async ({ trackId }) => {
    const { searchEngine } = await getMusicStore();
    const track = searchEngine.getAllTracks().find(t => t.id === trackId);
    if (!track) return { error: 'Track not found' };
    return { action: 'play', track };
  },
});
