import { MessageBubble } from './MessageBubble';
import type { ChatMessage } from '../types/chat';

type MessageListProps = {
  messages: ChatMessage[];
  isLoading: boolean;
};

export function MessageList({ messages, isLoading }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#1d1c1a] px-4 py-3">
            <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-500" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-500 [animation-delay:150ms]" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-500 [animation-delay:300ms]" />
          </div>
        </div>
      )}
    </div>
  );
}
