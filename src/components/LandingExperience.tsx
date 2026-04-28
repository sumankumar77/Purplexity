import { ChatInput } from './ChatInput';
import { PromptSuggestions } from './PromptSuggestions';

type LandingExperienceProps = {
  isLoading: boolean;
  onSendMessage: (message: string) => Promise<void>;
};

export function LandingExperience({ isLoading, onSendMessage }: LandingExperienceProps) {
  return (
    <div className="landing-stack flex flex-1 flex-col">
      <div className="mb-12 text-center">
        <p className="mb-7 text-[12px] font-bold uppercase tracking-[0.48em] text-zinc-100">
          A quieter search
        </p>
        <h1 className="text-[88px] font-normal italic leading-none tracking-normal text-zinc-50 max-md:text-[56px]">
          Ask anything.
        </h1>
        <p className="mx-auto mt-7 max-w-[720px] text-[18px] font-semibold leading-7 text-zinc-100 max-md:text-[15px]">
          Welcome back. Purplexity scours the open web, then writes you back in
          full sentences, with every source receipt attached.
        </p>
      </div>

      <ChatInput isLoading={isLoading} onSendMessage={onSendMessage} />
      <PromptSuggestions onSendMessage={onSendMessage} />

      <p className="mt-12 text-center text-[11px] font-bold uppercase tracking-[0.42em] text-zinc-100">
        Powered by Tavily · OpenAI · Gemini
      </p>
    </div>
  );
}
