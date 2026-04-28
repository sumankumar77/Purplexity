export type SuggestedPrompt = {
  category: string;
  question: string;
};

export const SUGGESTED_QUESTIONS: SuggestedPrompt[] = [
  {
    category: 'Learn',
    question: "Explain transformers like I'm a physicist.",
  },
  {
    category: 'News',
    question: "What's the state of fusion energy in 2026?",
  },
  {
    category: 'Code',
    question: 'Compare React Server Components vs. Remix.',
  },
  {
    category: 'Travel',
    question: 'A weekend itinerary for Lisbon, under €400.',
  },
];
