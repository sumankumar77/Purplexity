import type {
  ConversationDetail,
  ConversationSummary,
  SearchResponse,
  SearchStreamEvent,
} from '../types/chat';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

export async function search(query: string): Promise<SearchResponse> {
  const response = await fetch(`${API_BASE_URL}/api/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error('Search request failed.');
  }

  return response.json();
}

export async function streamSearch(
  query: string,
  conversationId: string | null,
  onEvent: (event: SearchStreamEvent) => void,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/search/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversation_id: conversationId,
      query,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error('Streaming search request failed.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }

      onEvent(JSON.parse(line) as SearchStreamEvent);
    }
  }

  if (buffer.trim()) {
    onEvent(JSON.parse(buffer) as SearchStreamEvent);
  }
}

export async function fetchConversations(): Promise<ConversationSummary[]> {
  const response = await fetch(`${API_BASE_URL}/api/conversations`);

  if (!response.ok) {
    throw new Error('Conversation history request failed.');
  }

  return response.json();
}

export async function fetchConversation(
  conversationId: string,
): Promise<ConversationDetail> {
  const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`);

  if (!response.ok) {
    throw new Error('Conversation detail request failed.');
  }

  return response.json();
}
