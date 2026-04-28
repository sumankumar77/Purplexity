import { SUGGESTED_QUESTIONS } from '../constants/prompts';

type PromptSuggestionsProps = {
  onSendMessage: (message: string) => Promise<void>;
};

export function PromptSuggestions({ onSendMessage }: PromptSuggestionsProps) {
  return (
    <div className="mt-9 grid grid-cols-1 gap-3 md:grid-cols-2">
      {SUGGESTED_QUESTIONS.map((prompt) => (
        <button
          className="grid min-h-[70px] grid-cols-[54px_1fr] items-center rounded-[10px] border border-zinc-100 bg-[#101010] px-[18px] text-left transition hover:bg-[#171717]"
          key={prompt.question}
          type="button"
          onClick={() => {
            void onSendMessage(prompt.question);
          }}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-100">
            {prompt.category}
          </span>
          <span className="text-[16px] font-semibold leading-5 text-zinc-100">
            {prompt.question}
          </span>
        </button>
      ))}
    </div>
  );
}
