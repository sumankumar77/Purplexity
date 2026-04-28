import { ChevronRight, LayoutPanelLeft, Sparkles, UserCircle } from 'lucide-react';
import { SIDEBAR_ITEMS } from '../../constants/navigation';
import { classNames } from '../../lib/classNames';
import type { ChatThread } from '../../types/chat';

type SidebarProps = {
  onNewChat: () => void;
  onOpenThread: (threadId: string | null) => void;
  threads: ChatThread[];
};

export function Sidebar({ onNewChat, onOpenThread, threads }: SidebarProps) {
  return (
    <aside className="fixed bottom-0 left-0 top-0 z-20 flex h-screen max-h-screen w-[244px] shrink-0 flex-col overflow-hidden border-r border-[#2d2c2a] bg-[#1e1d1b]">
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex h-[61px] items-center justify-between px-[16px]">
          <div className="grid h-8 w-8 place-items-center text-[#dddcd8]">
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
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.label}>
                  <button
                    className={classNames(
                      'flex h-[49px] w-full items-center gap-[14px] rounded-[12px] px-[9px] text-left text-[16px] transition',
                      item.isActive
                        ? 'bg-[#242321] text-zinc-100 shadow-[0_13px_34px_rgba(0,0,0,0.22)]'
                        : 'text-[#a09f9b] hover:bg-white/[0.03] hover:text-zinc-200',
                    )}
                    type="button"
                    onClick={() => {
                      if (item.label === 'New') {
                        onNewChat();
                        return;
                      }

                      window.location.hash = item.path;
                    }}
                  >
                    <Icon size={19} strokeWidth={1.65} aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-[7px] px-[24px]">
          {threads.length > 0 ? (
            <div className="space-y-[15px] pt-1">
              <p className="pb-1 text-[11px] font-bold uppercase tracking-[0.24em] text-[#77746f]">
                History
              </p>
              {threads.map((thread) => (
                <button
                  className="block w-full truncate text-left text-[13px] text-[#aaa7a2] transition hover:text-zinc-300"
                  key={thread.id ?? thread.title}
                  type="button"
                  onClick={() => onOpenThread(thread.id)}
                >
                  {thread.title}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-[15px] text-[#8d8a85]">No chat history</p>
          )}
        </div>
      </div>

      <div className="mt-auto shrink-0 border-t border-[#2d2c2a] bg-[#1e1d1b] p-2">
        <a
          className="flex h-[54px] w-full items-center justify-between rounded-lg px-1 text-left text-[15px] text-[#4fb8c4] transition hover:bg-white/[0.04]"
          href="#sign-in"
        >
          <span className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#62c6d1] text-zinc-950">
              <UserCircle size={20} aria-hidden="true" />
            </span>
            Sign In
          </span>
          <ChevronRight size={16} aria-hidden="true" />
        </a>
      </div>
    </aside>
  );
}
