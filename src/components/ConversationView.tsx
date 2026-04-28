import { useEffect, useMemo, useRef } from 'react';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';
import type { ChatMessage } from '../types/chat';

type ConversationViewProps = {
  isLoading: boolean;
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
};

export function ConversationView({
  isLoading,
  messages,
  onSendMessage,
}: ConversationViewProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const scrollKey = useMemo(
    () =>
      messages
        .map((message) => `${message.id}:${message.content.length}`)
        .join('|'),
    [messages],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [scrollKey, isLoading]);

  return (
    <div className="flex flex-1 flex-col justify-end py-10">
      <div className="mb-8">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          onFollowUpClick={onSendMessage}
        />
        <div ref={bottomRef} />
      </div>

      <ChatInput isLoading={isLoading} onSendMessage={onSendMessage} />
    </div>
  );
}
