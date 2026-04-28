import { ConversationView } from './components/ConversationView';
import { LandingExperience } from './components/LandingExperience';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavigation } from './components/layout/TopNavigation';
import { usePreviewChat } from './hooks/usePreviewChat';

function App() {
  const { hasConversation, isLoading, messages, sendMessage } = usePreviewChat();

  return (
    <main className="h-screen overflow-x-hidden overflow-y-scroll bg-[#111110] text-zinc-100">
      <Sidebar />

      <div className="flex h-screen flex-col pl-[244px]">
        <TopNavigation />

        <section className="mx-auto flex h-[calc(100vh-52px)] w-full max-w-[800px] flex-col overflow-hidden px-0 pb-0">
          {hasConversation ? (
            <ConversationView
              isLoading={isLoading}
              messages={messages}
              onSendMessage={sendMessage}
            />
          ) : (
            <LandingExperience isLoading={isLoading} onSendMessage={sendMessage} />
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
