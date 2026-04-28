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
  return (
    <div className="flex flex-1 flex-col justify-end">
      <div className="mb-6">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      <ChatInput isLoading={isLoading} onSendMessage={onSendMessage} />
    </div>
  );
}
