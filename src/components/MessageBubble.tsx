import type { ChatMessage } from '../types/chat';
import { classNames } from '../lib/classNames';

type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <article className={classNames('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={classNames(
          'max-w-[85%] rounded-lg px-4 py-3 text-sm leading-6',
          isUser
            ? 'bg-zinc-200 text-zinc-950'
            : 'border border-white/[0.08] bg-[#1d1c1a] text-zinc-200',
        )}
      >
        <p>{message.content}</p>
      </div>
    </article>
  );
}
