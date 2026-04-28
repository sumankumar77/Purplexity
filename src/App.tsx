import { useMemo, useState } from 'react';
import {
  ChevronRight,
  Code2,
  History,
  LayoutPanelLeft,
  Lightbulb,
  ListChecks,
  MailPlus,
  Monitor,
  Plus,
  Settings,
  Sparkles,
  SquareLibrary,
  UserCircle,
} from 'lucide-react';
import { ChatInput } from './components/ChatInput';
import { MessageList } from './components/MessageList';
import type { ChatMessage } from './types/chat';

const initialMessages: ChatMessage[] = [];

const topNavItems = ['Discover', 'Finance', 'Health', 'Academic', 'Patents'];

const sidebarItems = [
  { label: 'New', icon: Plus, isActive: true },
  { label: 'Computer', icon: Monitor },
  { label: 'Spaces', icon: SquareLibrary },
  { label: 'Customize', icon: Settings },
  { label: 'History', icon: History },
];

const recentThreads = [
  'whats the best way to learn react',
  'create a simple todo website',
];

const promptModes = [
  { label: 'Help me learn', icon: Lightbulb, isActive: true },
  { label: 'Create a prototype', icon: Code2 },
  { label: 'Organise my life', icon: ListChecks },
  { label: 'Lead generation', icon: MailPlus },
];

const followUpQuestions = [
  'Compare tools or frameworks and recommend one',
  'Quiz me until I can recall it confidently',
  'Help me deeply understand a confusing topic',
];

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);

  const hasConversation = useMemo(() => messages.length > 1, [messages.length]);

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setIsLoading(true);

    await new Promise((resolve) => {
      window.setTimeout(resolve, 900);
    });

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content:
        'This is a preview response. Backend search, Gemini answers, citations, and follow-ups will arrive in later phases.',
    };

    setMessages((currentMessages) => [...currentMessages, assistantMessage]);
    setIsLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#111110] text-zinc-100">
      <aside className="fixed inset-y-0 left-0 hidden w-[244px] flex-col border-r border-[#2d2c2a] bg-[#1e1d1b] md:flex">
        <div className="flex h-[66px] items-center justify-between px-[15px]">
          <div className="grid h-8 w-8 place-items-center text-zinc-200">
            <Sparkles size={25} strokeWidth={1.55} aria-hidden="true" />
          </div>
          <button
            aria-label="Collapse sidebar"
            className="grid h-8 w-8 place-items-center rounded-md text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-100"
            type="button"
          >
            <LayoutPanelLeft size={17} aria-hidden="true" />
          </button>
        </div>

        <nav className="px-[10px]">
          <ul className="space-y-[7px]">
            {sidebarItems.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.label}>
                  <button
                    className={`flex h-[49px] w-full items-center gap-[14px] rounded-[12px] px-[9px] text-left text-[16px] transition ${
                      item.isActive
                        ? 'bg-[#242321] text-zinc-100 shadow-[0_13px_34px_rgba(0,0,0,0.22)]'
                        : 'text-[#a09f9b] hover:bg-white/[0.03] hover:text-zinc-200'
                    }`}
                    type="button"
                  >
                    <Icon size={19} strokeWidth={1.65} aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-[7px] px-[19px]">
          {recentThreads.length > 0 ? (
            <div className="space-y-[15px] pt-1">
              {recentThreads.map((thread) => (
                <button
                  className="block w-full truncate text-left text-[13px] text-[#aaa7a2] transition hover:text-zinc-300"
                  key={thread}
                  type="button"
                >
                  {thread}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#8d8a85]">No recent threads</p>
          )}
        </div>

        <div className="mt-auto border-t border-[#2d2c2a] p-2">
          <button
            className="flex h-12 w-full items-center justify-between rounded-lg px-1 text-left text-[15px] text-[#4fb8c4] transition hover:bg-white/[0.04]"
            type="button"
          >
            <span className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#62c6d1] text-zinc-950">
                <UserCircle size={20} aria-hidden="true" />
              </span>
              Sign In
            </span>
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col md:pl-[244px]">
        <header className="flex h-[62px] items-center justify-center px-4">
          <nav aria-label="Search categories" className="hidden sm:block">
            <ul className="flex items-center gap-[23px] text-[16px] font-medium text-[#aaa7a2]">
              {topNavItems.map((item) => (
                <li key={item}>
                  <button className="transition hover:text-zinc-100" type="button">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <section className="mx-auto flex w-full max-w-[832px] flex-1 flex-col px-4 pb-8">
          <div
            className={
              hasConversation
                ? 'flex flex-1 flex-col justify-end'
                : 'flex flex-1 flex-col pt-[202px] lg:pt-[210px]'
            }
          >
            {!hasConversation && (
              <div className="mb-[58px] text-center">
                <div className="mb-5 flex justify-center md:hidden">
                  <Sparkles size={28} strokeWidth={1.6} aria-hidden="true" />
                </div>
                <h1 className="text-[46px] font-normal leading-none tracking-normal text-[#deddda] sm:text-[58px]">
                  purplexity
                </h1>
              </div>
            )}

            {hasConversation && (
              <div className="mb-6">
                <MessageList messages={messages} isLoading={isLoading} />
              </div>
            )}

            <ChatInput isLoading={isLoading} onSendMessage={handleSendMessage} />

            {!hasConversation && (
              <div className="mt-[39px] h-[263px] overflow-hidden rounded-[13px] border border-[#2a2927] bg-[#151513]">
                <div className="h-[53px] border-b border-[#2a2927] bg-[#232220] px-[13px] pt-[15px] text-[16px] text-[#aaa7a2]">
                  <span className="inline-flex items-center gap-[8px]">
                    <Monitor size={18} strokeWidth={1.6} aria-hidden="true" />
                    Try Computer
                  </span>
                </div>
                <div className="px-[18px] py-[15px]">
                  <div className="relative overflow-hidden">
                    <div className="flex w-max gap-[10px]">
                      {promptModes.map((prompt) => {
                        const Icon = prompt.icon;

                        return (
                        <button
                          className={`inline-flex h-[41px] shrink-0 items-center gap-[9px] rounded-full border px-[17px] text-[16px] font-semibold ${
                            prompt.isActive
                              ? 'border-transparent bg-[#242321] text-[#d8d6d2]'
                              : 'border-[#33312e] bg-transparent text-[#aaa7a2]'
                          }`}
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
                  <div className="mt-[18px] space-y-[21px]">
                    {followUpQuestions.map((prompt) => (
                      <button
                        className="block w-full text-left text-[16px] leading-none text-[#b9b7b2] transition hover:text-zinc-100"
                        key={prompt}
                        type="button"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
