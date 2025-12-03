import { openai } from '@ai-sdk/openai';
import { streamText, convertToCoreMessages } from 'ai';
import { systemPrompt } from '@/lib/ai/prompts';
import * as tools from '@/lib/ai/tools';

export const maxDuration = 30;

export async function POST(req: Request) {
  const body = await req.json();
  const messages = body.messages || [];

  const result = streamText({
    model: openai('gpt-5'),
    messages: convertToCoreMessages(messages),
    system: systemPrompt,
    tools: tools,
  });

  return result.toUIMessageStreamResponse();
}

