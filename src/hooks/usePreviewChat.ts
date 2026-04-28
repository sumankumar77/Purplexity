import { useMemo, useState } from 'react';
import type { ChatMessage } from '../types/chat';

const PREVIEW_RESPONSE =
  'This is a Phase 1 preview response. Backend connection, Gemini, Tavily, citations, and auth are not wired into the UI yet.';

const createMessage = (role: ChatMessage['role'], content: string): ChatMessage => ({
  id: crypto.randomUUID(),
  role,
  content,
});

export function usePreviewChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const hasConversation = useMemo(() => messages.length > 1, [messages.length]);

  const sendMessage = async (content: string) => {
    setMessages((currentMessages) => [
      ...currentMessages,
      createMessage('user', content),
    ]);
    setIsLoading(true);

    await new Promise((resolve) => {
      window.setTimeout(resolve, 900);
    });

    setMessages((currentMessages) => [
      ...currentMessages,
      createMessage('assistant', PREVIEW_RESPONSE),
    ]);
    setIsLoading(false);
  };

  return {
    hasConversation,
    isLoading,
    messages,
    sendMessage,
  };
}
