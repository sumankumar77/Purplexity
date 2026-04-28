import { useEffect, useMemo, useState } from 'react';
import type { ChatMessage, ChatThread } from '../types/chat';
import { fetchConversation, fetchConversations, streamSearch } from '../lib/api';

const ERROR_RESPONSE =
  'I could not reach the backend search service. Make sure the FastAPI server is running and try again.';

const createMessage = (
  role: ChatMessage['role'],
  content: string,
  options: Pick<ChatMessage, 'followUpQuestions' | 'sources'> = {},
): ChatMessage => ({
  id: crypto.randomUUID(),
  role,
  content,
  ...options,
});

export function usePreviewChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const hasConversation = useMemo(() => messages.length > 0, [messages.length]);

  useEffect(() => {
    let isMounted = true;

    fetchConversations()
      .then((conversations) => {
        if (!isMounted) {
          return;
        }

        setThreads(
          conversations.map((conversation) => ({
            id: conversation.conversation_id,
            title: conversation.title,
            messages: [],
          })),
        );
      })
      .catch(() => {
        return undefined;
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const saveCurrentThread = (
    nextConversationId: string | null = conversationId,
    nextMessages: ChatMessage[] = messages,
  ) => {
    if (nextMessages.length === 0) {
      return;
    }

    const title =
      nextMessages.find((message) => message.role === 'user')?.content ?? 'New chat';
    const threadId = nextConversationId ?? `local-${nextMessages[0].id}`;

    setThreads((currentThreads) => {
      const existingThreadIndex = currentThreads.findIndex(
        (thread) => thread.id === threadId,
      );
      const nextThread = {
        id: threadId,
        title,
        messages: nextMessages,
      };

      if (existingThreadIndex === -1) {
        return [nextThread, ...currentThreads];
      }

      return currentThreads.map((thread, index) =>
        index === existingThreadIndex ? nextThread : thread,
      );
    });
  };

  const newChat = () => {
    saveCurrentThread();
    setMessages([]);
    setConversationId(null);
  };

  const openChat = async (threadId: string | null) => {
    saveCurrentThread();

    const thread = threads.find((currentThread) => currentThread.id === threadId);
    if (!thread) {
      return;
    }

    setConversationId(thread.id);

    if (thread.messages.length > 0 || !thread.id) {
      setMessages(thread.messages);
      return;
    }

    const conversation = await fetchConversation(thread.id);
    const loadedMessages = conversation.messages.map((message) =>
      createMessage(message.role, message.content, {
        followUpQuestions: message.follow_up_questions,
        sources: message.sources,
      }),
    );

    setMessages(loadedMessages);
    setThreads((currentThreads) =>
      currentThreads.map((currentThread) =>
        currentThread.id === thread.id
          ? { ...currentThread, messages: loadedMessages }
          : currentThread,
      ),
    );
  };

  const sendMessage = async (content: string) => {
    const userMessage = createMessage('user', content);
    const assistantMessageId = crypto.randomUUID();
    let activeConversationId = conversationId;
    let workingMessages: ChatMessage[] = [
      ...messages,
      userMessage,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
      },
    ];

    setMessages(workingMessages);
    setIsLoading(true);

    try {
      await streamSearch(content, conversationId, (event) => {
        if (event.type === 'metadata') {
          activeConversationId = event.conversation_id;
          setConversationId(event.conversation_id);
          return;
        }

        if (event.type === 'sources') {
          workingMessages = workingMessages.map((message) =>
            message.id === assistantMessageId
              ? { ...message, sources: event.sources }
              : message,
          );
          setMessages(workingMessages);
          return;
        }

        if (event.type === 'chunk') {
          workingMessages = workingMessages.map((message) =>
            message.id === assistantMessageId
              ? { ...message, content: `${message.content}${event.content}` }
              : message,
          );
          setMessages(workingMessages);
          return;
        }

        workingMessages = workingMessages.map((message) =>
            message.id === assistantMessageId
              ? { ...message, followUpQuestions: event.follow_up_questions }
              : message,
        );
        setMessages(workingMessages);
      });
      saveCurrentThread(activeConversationId, workingMessages);
    } catch {
      workingMessages = [
        ...workingMessages,
        createMessage('assistant', ERROR_RESPONSE),
      ];
      setMessages(workingMessages);
      saveCurrentThread(activeConversationId, workingMessages);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    hasConversation,
    isLoading,
    messages,
    newChat,
    openChat,
    sendMessage,
    threads,
  };
}
