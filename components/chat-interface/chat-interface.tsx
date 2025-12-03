'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Track } from '@/types';
import { Play, RotateCcw } from 'lucide-react';
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion';
import { Loader } from '@/components/ai-elements/loader';
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from '@/components/ai-elements/tool';
import { SearchResultsSummary } from '@/components/search-results-summary';
import { TrackList } from '@/components/track-list';
import { useChatLogic } from './hooks/useChatLogic';
import { cn } from '@/lib/utils';

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
  const { state, actions } = useChatLogic({ onPlayTrack, onAddToSetlist });
  const { messages, input, isLoading, error, scrollRef } = state;

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
                      onClick={actions.handleSuggestionClick}
                      className="bg-card hover:bg-accent/50 border-border/50 transition-all hover:scale-[1.02]"
                    />
                  ))}
                </Suggestions>
              </div>
            ) : (
              messages.map((m: any) => (
                <div key={m.id} className={cn("flex animate-in slide-in-from-bottom-2 duration-300", m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div 
                    className={cn(
                      "max-w-[85%] rounded-2xl p-4 shadow-sm",
                      m.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-br-sm' 
                        : 'bg-card border border-border/50 rounded-bl-sm'
                    )}
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
                                    {/* Handle search and filter tools with smart responses */}
                                    {(toolName === 'searchMusic' || toolName === 'filterByBpm' || 
                                      toolName === 'filterByArtist' || toolName === 'filterByAlbum' || 
                                      toolName === 'sortResults') && (
                                      <div className="p-4 space-y-3">
                                        {/* Check if response is a summary type */}
                                        {part.output?.type === 'summary' && part.output?.summary && (
                                          <>
                                            <SearchResultsSummary
                                              summary={part.output.summary}
                                              topTracks={part.output.topTracks || []}
                                              onPlayTrack={onPlayTrack}
                                              onAddToSetlist={onAddToSetlist}
                                            />
                                            {part.output.topTracks && part.output.topTracks.length > 0 && (
                                              <div className="mt-4">
                                                <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide flex items-center gap-2 mb-3">
                                                  <div className="h-1 w-1 rounded-full bg-primary"></div>
                                                  Top {part.output.topTracks.length} Matches
                                                </h4>
                                                <TrackList
                                                  tracks={part.output.topTracks}
                                                  onPlayTrack={onPlayTrack}
                                                  onAddToSetlist={onAddToSetlist}
                                                  maxHeight="300px"
                                                />
                                              </div>
                                            )}
                                          </>
                                        )}
                                        
                                        {/* Check if response is full type with tracks */}
                                        {part.output?.type === 'full' && part.output?.tracks && (
                                          <>
                                            <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide flex items-center gap-2">
                                              <div className="h-1 w-1 rounded-full bg-primary"></div>
                                              Found {part.output.total} Track{part.output.total !== 1 ? 's' : ''}
                                            </h4>
                                            <TrackList
                                              tracks={part.output.tracks}
                                              onPlayTrack={onPlayTrack}
                                              onAddToSetlist={onAddToSetlist}
                                              grouped={part.output.grouped}
                                              maxHeight="400px"
                                            />
                                          </>
                                        )}
                                        
                                        {/* Fallback for old array format (backward compatibility) */}
                                        {Array.isArray(part.output) && (
                                          <>
                                            <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide flex items-center gap-2">
                                              <div className="h-1 w-1 rounded-full bg-primary"></div>
                                              Found Tracks
                                            </h4>
                                            <TrackList
                                              tracks={part.output}
                                              onPlayTrack={onPlayTrack}
                                              onAddToSetlist={onAddToSetlist}
                                              maxHeight="400px"
                                            />
                                          </>
                                        )}
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
          <form onSubmit={actions.handleSubmit} className="relative flex items-center">
            <Input 
              value={input} 
              onChange={actions.handleInputChange} 
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
                  onClick={actions.handleReset} 
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
