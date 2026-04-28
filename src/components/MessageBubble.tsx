import type { ChatMessage } from '../types/chat';

type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <article className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={
          isUser
            ? 'max-w-[85%] rounded-lg bg-zinc-200 px-4 py-3 text-sm leading-6 text-zinc-950'
            : 'max-w-[85%] rounded-lg border border-white/[0.08] bg-[#1d1c1a] px-4 py-3 text-sm leading-6 text-zinc-200'
        }
      >
        {message.content}
      </div>
    </article>
  );
}
