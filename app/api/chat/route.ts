import { openai } from '@ai-sdk/openai';
import { streamText, convertToCoreMessages } from 'ai';
import { systemPrompt } from '@/lib/ai/prompts';
import * as tools from '@/lib/ai/tools';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    
    console.log('Chat request received with', messages.length, 'messages');

    const result = streamText({
      model: openai('gpt-5'),
      messages: convertToCoreMessages(messages),
      system: systemPrompt,
      tools: tools,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat route error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

