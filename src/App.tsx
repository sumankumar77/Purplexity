import { ConversationView } from './components/ConversationView';
import { LandingExperience } from './components/LandingExperience';
import { Sidebar } from './components/layout/Sidebar';
import { usePreviewChat } from './hooks/usePreviewChat';

function App() {
  const {
    hasConversation,
    isLoading,
    messages,
    newChat,
    openChat,
    sendMessage,
    threads,
  } = usePreviewChat();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#111110] text-zinc-100">
      <Sidebar onNewChat={newChat} onOpenThread={openChat} threads={threads} />

      <div className="ml-[244px] flex min-h-screen flex-col">
        <section
          className="mx-auto flex min-h-screen w-full max-w-[800px] flex-col px-0 pb-0"
          id="new"
        >
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

        <div className="sr-only" id="computer">Computer</div>
        <div className="sr-only" id="spaces">Spaces</div>
        <div className="sr-only" id="customise">Customise</div>
        <div className="sr-only" id="history">History</div>
        <div className="sr-only" id="sign-in">Sign In</div>
      </div>
    </main>
  );
}

export default App;
