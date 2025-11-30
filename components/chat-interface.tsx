'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Track } from '@/types';
import { Play, Plus, RotateCcw } from 'lucide-react';
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion';
import { Loader } from '@/components/ai-elements/loader';
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from '@/components/ai-elements/tool';

interface ChatInterfaceProps {
  onPlayTrack: (track: Track) => void;
  onAddToSetlist: (track: Track) => void;
}

const suggestions = [
  'Find songs with 124 BPM',
  'Search for house music',
  'Show me tracks between 128-132 BPM',
  'Find techno tracks',
];

export function ChatInterface({ onPlayTrack, onAddToSetlist }: ChatInterfaceProps) {
  const { messages, status, sendMessage, error, setMessages } = useChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const isLoading = status === 'submitted' || status === 'streaming';

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Watch for tool results to trigger client actions
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.parts) {
      lastMessage.parts.forEach((part: any) => {
        if (part.type.startsWith('tool-') && part.state === 'output-available') {
          const result = part.output;
          if (result.action === 'add' && result.track) {
            onAddToSetlist(result.track);
          }
          if (result.action === 'play' && result.track) {
            onPlayTrack(result.track);
          }
        }
      });
    }
  }, [messages, onAddToSetlist, onPlayTrack]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    console.log('Form submitted', input);
    const currentInput = input;
    setInput('');
    
    await sendMessage({ text: currentInput });
  };

  const handleSuggestionClick = async (suggestion: string) => {
    await sendMessage({ text: suggestion });
  };

  const handleReset = () => {
    setMessages([]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-background/50">
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full px-4">
          <div className="max-w-3xl mx-auto py-8 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in duration-500">
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Play className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">
                    How can I help you DJ?
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    I can find tracks, filter by BPM, or manage your setlist.
                  </p>
                </div>
                <Suggestions className="max-w-2xl w-full grid grid-cols-2 gap-3">
                  {suggestions.map((suggestion) => (
                    <Suggestion
                      key={suggestion}
                      suggestion={suggestion}
                      onClick={handleSuggestionClick}
                      className="bg-card hover:bg-accent/50 border-border/50 transition-all hover:scale-[1.02]"
                    />
                  ))}
                </Suggestions>
              </div>
            ) : (
              messages.map((m: any) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                  <div 
                    className={`
                      max-w-[85%] rounded-2xl p-4 shadow-sm
                      ${m.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-br-sm' 
                        : 'bg-card border border-border/50 rounded-bl-sm'
                      }
                    `}
                  >
                    {/* Render Text Parts */}
                    {m.parts ? (
                      m.parts.map((part: any, index: number) => {
                        if (part.type === 'text') {
                          return <div key={index} className="whitespace-pre-wrap leading-relaxed">{part.text}</div>;
                        }
                        if (part.type.startsWith('tool-')) {
                          const toolName = part.type.replace('tool-', '');
                          
                          // Use Tool component for professional visualization
                          return (
                            <Tool key={part.toolCallId} defaultOpen={true} className="mt-3 bg-background/50 rounded-xl border-none">
                              <ToolHeader 
                                title={toolName}
                                type={part.type}
                                state={part.state}
                                className="border-b border-border/50"
                              />
                              <ToolContent>
                                {part.input && <ToolInput input={part.input} />}
                                {part.state === 'output-available' && (
                                  <>
                                    {(toolName === 'searchMusic' || toolName === 'filterByBpm') && (
                                      <div className="p-4 space-y-3">
                                        <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide flex items-center gap-2">
                                          <div className="h-1 w-1 rounded-full bg-primary"></div>
                                          Found Tracks
                                        </h4>
                                        <div className="space-y-2">
                                          {Array.isArray(part.output) && part.output.map((track: Track) => (
                                            <div key={track.id} className="group flex items-center justify-between bg-background p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                                              <div className="truncate flex-1 mr-3">
                                                <div className="font-semibold text-sm">{track.title}</div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                  <span>{track.artist}</span>
                                                  {track.bpm && (
                                                    <>
                                                      <span className="h-1 w-1 rounded-full bg-muted-foreground/30"></span>
                                                      <span className="font-mono text-[10px] bg-secondary px-1.5 py-0.5 rounded-full">{Math.round(track.bpm)} BPM</span>
                                                    </>
                                                  )}
                                                </div>
                                              </div>
                                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => onPlayTrack(track)}>
                                                  <Play className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => onAddToSetlist(track)}>
                                                  <Plus className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {toolName === 'addToSetlist' && (
                                      <ToolOutput output="Track added to setlist successfully" errorText={undefined} />
                                    )}
                                    {toolName === 'playMusic' && (
                                      <ToolOutput output="Track is now playing" errorText={undefined} />
                                    )}
                                  </>
                                )}
                                {part.state === 'input-available' && (
                                  <div className="p-4 flex items-center gap-3 text-sm text-muted-foreground">
                                    <Loader size={16} className="text-primary" />
                                    <span>Executing {toolName}...</span>
                                  </div>
                                )}
                              </ToolContent>
                            </Tool>
                          );
                        }
                        return null;
                      })
                    ) : (
                      <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                    )}
                  </div>
                </div>
              ))
            )}
            {/* Show loader when streaming */}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                <div className="max-w-[80%] rounded-2xl rounded-bl-sm p-4 bg-card border border-border/50 flex items-center gap-3 shadow-sm">
                  <Loader size={18} className="text-primary" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} className="h-4" />
          </div>
        </ScrollArea>
      </div>
      
      <div className="p-4">
        <div className="max-w-3xl mx-auto relative">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <Input 
              value={input} 
              onChange={handleInputChange} 
              placeholder="Ask for music..." 
              disabled={isLoading}
              className="pr-24 pl-6 py-6 rounded-full bg-background border-border/50 shadow-lg focus-visible:ring-primary/20 text-base"
            />
            <div className="absolute right-2 flex items-center gap-1">
              {messages.length > 0 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  onClick={handleReset} 
                  disabled={isLoading}
                  title="Reset chat"
                  className="rounded-full h-10 w-10 hover:bg-destructive/10 hover:text-destructive"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()} 
                size="icon"
                className="rounded-full h-10 w-10 shadow-md"
              >
                <Play className="h-4 w-4 ml-0.5" />
              </Button>
            </div>
          </form>
          {error && (
            <div className="absolute -top-8 left-0 right-0 text-center text-sm text-destructive animate-in fade-in">
              Error: {error.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
