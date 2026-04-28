import { FormEvent, useState } from 'react';
import { ArrowUp, ChevronDown, Mic, Monitor, Plus, SlidersHorizontal } from 'lucide-react';

type ChatInputProps = {
  isLoading: boolean;
  onSendMessage: (message: string) => Promise<void>;
};

export function ChatInput({ isLoading, onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) {
      return;
    }

    setMessage('');
    await onSendMessage(trimmedMessage);
  };

  return (
    <form
      className="rounded-[18px] border border-[#393735] bg-[#1d1c1a] px-[26px] py-[21px] shadow-2xl shadow-black/20"
      onSubmit={handleSubmit}
    >
      <label className="sr-only" htmlFor="message">
        Ask Purplexity
      </label>
      <textarea
        className="max-h-40 min-h-[46px] w-full resize-none bg-transparent text-[19px] font-semibold leading-7 text-zinc-100 outline-none placeholder:text-[#85837f]"
        id="message"
        placeholder="Type / for search modes"
        rows={1}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
      />
      <div className="mt-[24px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-[17px]">
          <button
            aria-label="Add attachment"
            className="grid h-8 w-8 place-items-center rounded-md text-[#8d8a85] transition hover:bg-white/[0.05] hover:text-zinc-100"
            type="button"
          >
            <Plus size={22} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <button
            className="inline-flex h-[39px] items-center gap-[8px] rounded-full border border-[#2a2927] bg-[#1b1a18] px-[15px] text-[16px] font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] transition hover:bg-white/[0.04]"
            type="button"
          >
            <Monitor size={16} strokeWidth={1.7} aria-hidden="true" />
            Computer
            <Plus size={15} className="text-[#7d7a75]" strokeWidth={1.7} aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center gap-[17px]">
          <button
            className="hidden items-center gap-[6px] text-[16px] font-medium text-[#aaa7a2] transition hover:text-zinc-100 sm:inline-flex"
            type="button"
          >
            Model
            <ChevronDown size={15} strokeWidth={1.7} aria-hidden="true" />
          </button>
          <button
            aria-label="Voice input"
            className="grid h-8 w-8 place-items-center rounded-md text-[#8d8a85] transition hover:bg-white/[0.05] hover:text-zinc-100"
            type="button"
          >
            <Mic size={19} strokeWidth={1.65} aria-hidden="true" />
          </button>
          <button
            aria-label="Search settings"
            className="hidden h-8 w-8 place-items-center rounded-md text-[#8d8a85] transition hover:bg-white/[0.05] hover:text-zinc-100 sm:grid"
            type="button"
          >
            <SlidersHorizontal size={19} strokeWidth={1.65} aria-hidden="true" />
          </button>
          <button
            aria-label="Send message"
            className="grid h-[41px] w-[41px] shrink-0 place-items-center rounded-full bg-[#deddda] text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-[#deddda] disabled:text-zinc-950"
            disabled={isLoading || message.trim().length === 0}
            type="submit"
          >
            <ArrowUp size={18} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </div>
      </div>
    </form>
  );
}
