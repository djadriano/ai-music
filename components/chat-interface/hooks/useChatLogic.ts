import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState } from 'react';
import { Track } from '@/types';

interface UseChatLogicProps {
  onPlayTrack: (track: Track) => void;
  onAddToSetlist: (track: Track) => void;
}

export const useChatLogic = ({ onPlayTrack, onAddToSetlist }: UseChatLogicProps) => {
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

  return {
    state: {
      messages,
      input,
      isLoading,
      error,
      scrollRef
    },
    actions: {
      handleInputChange,
      handleSubmit,
      handleSuggestionClick,
      handleReset
    }
  };
};
