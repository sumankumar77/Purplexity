import { useState } from 'react';
import { Layers3, MessageCircle, Sparkles } from 'lucide-react';
import type { ChatMessage } from '../types/chat';

type MessageBubbleProps = {
  message: ChatMessage;
  onFollowUpClick: (message: string) => Promise<void>;
};

type OutputTab = 'answer' | 'sources';

const CITATION_PATTERN = /\[(\d+)\]/g;

function renderCitedText(content: string) {
  const parts = content.split(CITATION_PATTERN);

  return parts.map((part, index) => {
    const isCitation = index % 2 === 1;

    if (!isCitation) {
      return part;
    }

    return (
      <a
        className="mx-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded bg-[#deddda] px-1.5 text-[11px] font-semibold leading-none text-zinc-950 hover:bg-white"
        href={`#source-${part}`}
        key={`${part}-${index}`}
      >
        {part}
      </a>
    );
  });
}

function getSourceHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function MessageBubble({ message, onFollowUpClick }: MessageBubbleProps) {
  const [activeTab, setActiveTab] = useState<OutputTab>('answer');
  const isUser = message.role === 'user';
  const hasSources = !isUser && message.sources && message.sources.length > 0;
  const hasFollowUps =
    !isUser && message.followUpQuestions && message.followUpQuestions.length > 0;

  const visibleTab = hasSources && message.content.length === 0 ? 'sources' : activeTab;

  if (isUser) {
    return (
      <article className="flex justify-end">
        <div className="max-w-[85%] rounded-[10px] border border-zinc-100 bg-zinc-100 px-4 py-3 text-sm font-semibold leading-6 text-zinc-950">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="w-full text-zinc-100">
      <div className="mb-7 flex items-center gap-5 border-b border-zinc-100/30">
        <button
          className={`flex h-10 items-center gap-2 border-b px-1 text-[12px] font-bold uppercase tracking-[0.35em] transition ${
            visibleTab === 'answer'
              ? 'border-zinc-100 text-zinc-100'
              : 'border-transparent text-zinc-500 hover:text-zinc-100'
          }`}
          type="button"
          onClick={() => setActiveTab('answer')}
        >
          <Sparkles size={16} strokeWidth={1.8} aria-hidden="true" />
          Answer
        </button>

        {hasSources && (
          <button
            className={`flex h-10 items-center gap-2 border-b px-1 text-[12px] font-bold uppercase tracking-[0.35em] transition ${
                visibleTab === 'sources'
                ? 'border-zinc-100 text-zinc-100'
                : 'border-transparent text-zinc-500 hover:text-zinc-100'
            }`}
            type="button"
            onClick={() => setActiveTab('sources')}
          >
            <Layers3 size={16} strokeWidth={1.8} aria-hidden="true" />
            Sources - {String(message.sources?.length ?? 0).padStart(2, '0')}
          </button>
        )}
      </div>

      {visibleTab === 'sources' && hasSources ? (
        <section>
          <div className="grid gap-3 md:grid-cols-2">
            {message.sources?.map((source) => (
              <a
                className="min-h-[118px] rounded-[10px] border border-zinc-100 bg-[#101010] p-4 text-zinc-100 transition hover:bg-[#171717]"
                href={source.url}
                id={`source-${source.citation_number}`}
                key={source.url}
                rel="noreferrer"
                target="_blank"
              >
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em]">
                  {String(source.citation_number).padStart(2, '0')} / Source
                </p>
                <p className="truncate text-[14px] font-bold">
                  {getSourceHost(source.url)}
                </p>
                <p className="mt-2 line-clamp-2 text-[13px] font-semibold leading-5 text-zinc-100/80">
                  {source.snippet || source.title}
                </p>
              </a>
            ))}
          </div>
        </section>
      ) : (
        <section>
          <div className="answer-copy max-w-[780px] whitespace-pre-wrap text-[18px] font-semibold leading-8 text-zinc-100">
            {message.content ? (
              renderCitedText(message.content)
            ) : (
              <span className="text-zinc-500">Reading sources...</span>
            )}
          </div>
        </section>
      )}

      {hasFollowUps && (
        <section className="mt-14">
          <div className="mb-4 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.35em] text-zinc-100">
            <MessageCircle size={16} strokeWidth={1.8} aria-hidden="true" />
            Related
          </div>
          <div className="overflow-hidden rounded-[12px] border border-zinc-100">
            {message.followUpQuestions?.map((question, index) => (
              <button
                className="grid min-h-[72px] w-full grid-cols-[54px_1fr_64px] items-center border-b border-zinc-100 bg-[#101010] px-5 text-left text-zinc-100 transition last:border-b-0 hover:bg-[#171717] max-md:grid-cols-[42px_1fr]"
                key={question}
                type="button"
                onClick={() => {
                  void onFollowUpClick(question);
                }}
              >
                <span className="text-[12px] font-bold">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-[18px] font-semibold italic leading-6">
                  {question}
                </span>
                <span className="text-right text-[13px] font-bold max-md:hidden">
                  ask -&gt;
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
