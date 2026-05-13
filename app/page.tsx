"use client";

import { useState } from "react";
import Sidebar from "@/components/chat/Sidebar";
import ChatArea from "@/components/chat/ChatArea";
import { useChat } from "@/hooks/useChat";

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    conversations,
    activeId,
    messages,
    isStreaming,
    sendMessage,
    newConversation,
    switchConversation,
  } = useChat();

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <div className="flex h-screen w-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onNewChat={() => {
          newConversation();
          setSidebarOpen(false);
        }}
        onSelectConversation={switchConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Chat Area */}
      <ChatArea
        messages={messages}
        isLoading={isStreaming}
        onSendMessage={sendMessage}
        onSuggestionClick={handleSuggestionClick}
      />
    </div>
  );
}
