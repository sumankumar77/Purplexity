export type ChatRole = 'user' | 'assistant';

export type Source = {
  citation_number: number;
  title: string;
  url: string;
  snippet: string;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  followUpQuestions?: string[];
  sources?: Source[];
};

export type ChatThread = {
  id: string | null;
  title: string;
  messages: ChatMessage[];
};

export type SearchResponse = {
  conversation_id: string;
  query: string;
  answer: string;
  sources: Source[];
  follow_up_questions: string[];
};

export type SearchStreamEvent =
  | {
      type: 'metadata';
      conversation_id: string;
    }
  | {
      type: 'sources';
      sources: Source[];
    }
  | {
      type: 'chunk';
      content: string;
    }
  | {
      type: 'done';
      follow_up_questions: string[];
    };

export type ConversationSummary = {
  conversation_id: string;
  title: string;
};

export type ConversationDetail = {
  conversation_id: string;
  messages: Array<{
    role: ChatRole;
    content: string;
    sources: Source[];
    follow_up_questions: string[];
  }>;
};
