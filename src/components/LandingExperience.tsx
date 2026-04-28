import { ChatInput } from './ChatInput';
import { PromptSuggestions } from './PromptSuggestions';

type LandingExperienceProps = {
  isLoading: boolean;
  onSendMessage: (message: string) => Promise<void>;
};

export function LandingExperience({ isLoading, onSendMessage }: LandingExperienceProps) {
  return (
    <div className="landing-stack flex flex-1 flex-col">
      <div className="mb-[58px] text-center">
        <h1 className="text-[56px] font-normal leading-none tracking-normal text-[#deddda]">
          purplexity
        </h1>
      </div>

      <ChatInput isLoading={isLoading} onSendMessage={onSendMessage} />
      <PromptSuggestions />
    </div>
  );
}
