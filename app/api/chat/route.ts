import { openai } from '@ai-sdk/openai';
import { streamText, convertToCoreMessages, tool } from 'ai';
import { z } from 'zod';
import { getMusicStore } from '@/lib/store';

export const maxDuration = 30;

export async function POST(req: Request) {
  const body = await req.json();
  const messages = body.messages || [];
  const { searchEngine } = await getMusicStore();

  const result = streamText({
    model: openai('gpt-5'),
    messages: convertToCoreMessages(messages),
    system: `You are a helpful music assistant. You can search for music, filter by BPM, add tracks to setlists, and play music.
    
    When searching or filtering music:
    - If you find a LARGE number of results (>50), present a summary with statistics and offer refinement options
    - Suggest specific artists, albums, or BPM ranges the user can explore
    - Be conversational and guide users to narrow down results naturally
    - When presenting summaries, highlight the most interesting findings
    
    When a user asks to find music, use the searchMusic or filterByBpm tools.
    When a user asks to add a song to the setlist, use the addToSetlist tool.
    When a user asks to play a song, use the playMusic tool.
    When a user wants to refine results, use filterByArtist, filterByAlbum, or other refinement tools.
    
    Be concise, friendly, and helpful. Guide users through their music discovery journey.`,
    tools: {
      searchMusic: tool({
        description: 'Search for music by title, artist, or album',
        inputSchema: z.object({
          query: z.string().describe('The search query'),
        }),
        execute: async ({ query }) => {
          console.log(`Searching for: ${query}`);
          const results = searchEngine.search(query);
          console.log(`Found ${results.length} results`);
          
          // Smart response based on result size
          if (results.length > 50) {
            // Large result set - return summary
            const topTracks = results.slice(0, 10);
            const topArtists = searchEngine.getTopArtists(results, 5);
            const topAlbums = searchEngine.getTopAlbums(results, 5);
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
          } else if (results.length > 10) {
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
      }),
      filterByBpm: tool({
        description: 'Filter music by BPM range',
        inputSchema: z.object({
          min: z.number().describe('Minimum BPM'),
          max: z.number().describe('Maximum BPM'),
        }),
        execute: async ({ min, max }) => {
          console.log(`Filtering by BPM: ${min}-${max}`);
          const results = searchEngine.filterByBpm(min, max);
          console.log(`Found ${results.length} results`);
          
          // Smart response based on result size
          if (results.length > 50) {
            const topTracks = results.slice(0, 10);
            const topArtists = searchEngine.getTopArtists(results, 5);
            const topAlbums = searchEngine.getTopAlbums(results, 5);
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
          } else if (results.length > 10) {
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
      }),
      filterByArtist: tool({
        description: 'Filter music by a specific artist name',
        inputSchema: z.object({
          artist: z.string().describe('The artist name to filter by'),
        }),
        execute: async ({ artist }) => {
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
      }),
      filterByAlbum: tool({
        description: 'Filter music by a specific album name',
        inputSchema: z.object({
          album: z.string().describe('The album name to filter by'),
        }),
        execute: async ({ album }) => {
          console.log(`Filtering by album: ${album}`);
          const results = searchEngine.filterByAlbum(album);
          console.log(`Found ${results.length} results`);
          
          return {
            type: 'full',
            total: results.length,
            tracks: results
          };
        },
      }),
      sortResults: tool({
        description: 'Sort tracks by a specific field',
        inputSchema: z.object({
          sortBy: z.enum(['title', 'artist', 'bpm', 'album']).describe('Field to sort by'),
          order: z.enum(['asc', 'desc']).describe('Sort order (ascending or descending)'),
          trackIds: z.array(z.string()).describe('Array of track IDs to sort'),
        }),
        execute: async ({ sortBy, order, trackIds }) => {
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
      }),
      addToSetlist: tool({
        description: 'Add a track to the setlist',
        inputSchema: z.object({
          trackId: z.string().describe('The ID of the track to add'),
        }),
        execute: async ({ trackId }) => {
          const track = searchEngine.getAllTracks().find(t => t.id === trackId);
          if (!track) return { error: 'Track not found' };
          return { action: 'add', track };
        },
      }),
      playMusic: tool({
        description: 'Play a specific track',
        inputSchema: z.object({
          trackId: z.string().describe('The ID of the track to play'),
        }),
        execute: async ({ trackId }) => {
          const track = searchEngine.getAllTracks().find(t => t.id === trackId);
          if (!track) return { error: 'Track not found' };
          return { action: 'play', track };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
