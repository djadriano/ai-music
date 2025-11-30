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
    When a user asks to find music, use the searchMusic or filterByBpm tools.
    When a user asks to add a song to the setlist, use the addToSetlist tool.
    When a user asks to play a song, use the playMusic tool.
    Be concise and friendly.`,
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
          return results.slice(0, 100);
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
          return results.slice(0, 100);
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
