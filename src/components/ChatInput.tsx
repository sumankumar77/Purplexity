import { FormEvent, useRef, useState } from 'react';
import { ArrowUp, CornerDownLeft, Globe2, Paperclip, Sparkles } from 'lucide-react';

type ChatInputProps = {
  isLoading: boolean;
  onSendMessage: (message: string) => Promise<void>;
};

const SUBMIT_KEYS = {
  enter: 'Enter',
};

export function ChatInput({ isLoading, onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isWebEnabled, setIsWebEnabled] = useState(true);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canSubmit = message.trim().length > 0 && !isLoading;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage || !canSubmit) {
      return;
    }

    setMessage('');
    await onSendMessage(trimmedMessage);
  };

  return (
    <form
      className="min-h-[122px] rounded-[16px] border border-zinc-100 bg-[#101010] px-[20px] py-[20px] shadow-[0_30px_80px_rgba(85,47,145,0.28)]"
      onSubmit={handleSubmit}
    >
      <input
        className="sr-only"
        ref={fileInputRef}
        type="file"
        onChange={(event) => {
          setAttachmentName(event.target.files?.[0]?.name ?? null);
        }}
      />

      <label className="sr-only" htmlFor="message">
        Ask Purplexity
      </label>

      <div className="flex items-start gap-4">
        <Sparkles className="mt-1 shrink-0 text-zinc-100" size={18} strokeWidth={1.8} />
        <textarea
          className="min-h-[42px] w-full resize-none border-0 bg-transparent p-0 text-[18px] font-semibold leading-7 text-zinc-100 outline-none placeholder:text-[#777]"
          id="message"
          placeholder="What do you want to know?"
          rows={1}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === SUBMIT_KEYS.enter && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <button
            aria-pressed={isWebEnabled}
            className={`inline-flex h-[32px] items-center gap-2 rounded-full border border-zinc-100 px-3 text-[13px] font-bold transition ${
              isWebEnabled
                ? 'bg-white text-zinc-950'
                : 'text-zinc-100 hover:bg-white hover:text-zinc-950'
            }`}
            type="button"
            onClick={() => setIsWebEnabled((currentValue) => !currentValue)}
          >
            <Globe2 size={15} strokeWidth={1.8} aria-hidden="true" />
            Web
          </button>

          <button
            className="inline-flex h-[32px] max-w-[190px] items-center gap-2 rounded-full border border-zinc-100 px-3 text-[13px] font-bold text-zinc-100 transition hover:bg-white hover:text-zinc-950"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip size={15} strokeWidth={1.8} aria-hidden="true" />
            <span className="truncate">{attachmentName ?? 'Attach'}</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 text-[13px] font-semibold text-zinc-100 md:inline-flex">
            <kbd className="grid h-6 min-w-6 place-items-center rounded border border-zinc-100 px-1 text-[11px]">
              <CornerDownLeft size={13} strokeWidth={1.8} aria-hidden="true" />
            </kbd>
            to send
          </span>
          <span className="hidden text-zinc-500 md:inline">-</span>
          <span className="hidden items-center gap-2 text-[13px] font-semibold text-zinc-100 md:inline-flex">
            <kbd className="grid h-6 min-w-[78px] place-items-center rounded border border-zinc-100 px-1 text-[11px]">
              Shift Enter
            </kbd>
            new line
          </span>
          <button
            aria-label="Send message"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-0 bg-transparent p-0 text-zinc-100 transition hover:bg-white hover:text-zinc-950 disabled:cursor-not-allowed disabled:text-zinc-600"
            disabled={!canSubmit}
            type="submit"
          >
            <ArrowUp size={20} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </div>
      </div>
    </form>
  );
}
