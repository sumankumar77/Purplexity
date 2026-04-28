import { Monitor } from 'lucide-react';
import { PROMPT_MODES, SUGGESTED_QUESTIONS } from '../constants/prompts';
import { classNames } from '../lib/classNames';

export function PromptSuggestions() {
  return (
    <div className="mt-[39px] h-[263px] overflow-hidden rounded-[13px] border border-[#2a2927] bg-[#151513]">
      <div className="h-[53px] border-b border-[#2a2927] bg-[#232220] px-[13px] pt-[15px] text-[18px] text-[#aaa7a2]">
        <span className="inline-flex items-center gap-[8px]">
          <Monitor size={19} strokeWidth={1.6} aria-hidden="true" />
          Try Computer
        </span>
      </div>

      <div className="px-[18px] py-[15px]">
        <div className="relative overflow-hidden">
          <div className="flex w-max gap-[10px]">
            {PROMPT_MODES.map((prompt) => {
              const Icon = prompt.icon;

              return (
                <button
                  className={classNames(
                    'inline-flex h-[41px] shrink-0 items-center gap-[9px] rounded-full border px-[17px] text-[16px] font-semibold',
                    prompt.isActive
                      ? 'border-transparent bg-[#242321] text-[#d8d6d2]'
                      : 'border-[#33312e] bg-transparent text-[#aaa7a2]',
                  )}
                  key={prompt.label}
                  type="button"
                >
                  <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
                  {prompt.label}
                </button>
              );
            })}
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#151513] to-transparent" />
        </div>

        <div className="mt-[21px] space-y-[23px]">
          {SUGGESTED_QUESTIONS.map((prompt) => (
            <button
              className="block w-full p-0 text-left text-[16px] leading-none text-[#b9b7b2] transition hover:text-zinc-100"
              key={prompt}
              type="button"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
