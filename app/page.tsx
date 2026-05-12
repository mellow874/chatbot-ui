"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Sidebar from "@/components/chat/Sidebar";
import ChatArea from "@/components/chat/ChatArea";
import {
  Conversation,
  Message,
  getConversations,
  getActiveConversationId,
  saveConversations,
  createConversation,
  getConversationTitle,
} from "@/lib/conversations";
import { mockChat } from "@/lib/mockBackend";

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const saved = getConversations();
    const activeId = getActiveConversationId();

    if (saved.length > 0) {
      setConversations(saved);
      setActiveId(activeId || saved[0].id);
    } else {
      // Create first conversation
      const newConv = createConversation(uuidv4(), "New Chat");
      setConversations([newConv]);
      setActiveId(newConv.id);
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      saveConversations(conversations, activeId);
    }
  }, [conversations, activeId]);

  const activeConversation = conversations.find((c) => c.id === activeId);

  const handleNewChat = () => {
    const newConv = createConversation(uuidv4(), "New Chat");
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    setActiveId(id);
  };

  const handleSendMessage = async (userInput: string) => {
    if (!activeId || isLoading) return;

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: userInput,
    };

    // Update conversation
    let updatedConvos = [...conversations];
    const convIdx = updatedConvos.findIndex((c) => c.id === activeId);
    if (convIdx === -1) return;

    // Update title if this is the first message
    if (updatedConvos[convIdx].messages.length === 0) {
      updatedConvos[convIdx].title = getConversationTitle(userInput);
    }

    // Add user message
    updatedConvos[convIdx].messages.push(userMessage);

    // Add empty assistant message placeholder
    updatedConvos[convIdx].messages.push({
      role: "assistant",
      content: "",
      sources: [],
    });

    setConversations(updatedConvos);
    setIsLoading(true);

    try {
      // Call mock or real backend
      const useMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";
      let response: Response;

      if (useMock) {
        const stream = await mockChat(userInput, updatedConvos[convIdx].messages.slice(0, -2));
        response = new Response(stream);
      } else {
        response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/chat`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_APP_PASSWORD}`,
            },
            body: JSON.stringify({
              message: userInput,
              conversation_history: updatedConvos[convIdx].messages.slice(0, -12),
              session_id: activeId,
            }),
          }
        );
      }

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No readable stream");

      const decoder = new TextDecoder();
      let assistantContent = "";
      let sources: any[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.trim() || !line.startsWith("data:")) continue;

          const dataStr = line.slice(5).trim();
          if (dataStr === "[DONE]") continue;

          try {
            const data = JSON.parse(dataStr);

            // Handle streaming text
            if (data.message) {
              assistantContent += data.message;

              // Update the assistant message in real time
              setConversations((prev) => {
                const updated = [...prev];
                const idx = updated.findIndex((c) => c.id === activeId);
                if (idx !== -1) {
                  const messages = updated[idx].messages;
                  messages[messages.length - 1] = {
                    role: "assistant",
                    content: assistantContent,
                    sources: sources.length > 0 ? sources : undefined,
                  };
                }
                return updated;
              });
            }

            // Handle sources
            if (data.sources) {
              sources = data.sources;
            }

            // Handle completion
            if (data.done) {
              setConversations((prev) => {
                const updated = [...prev];
                const idx = updated.findIndex((c) => c.id === activeId);
                if (idx !== -1) {
                  const messages = updated[idx].messages;
                  messages[messages.length - 1] = {
                    role: "assistant",
                    content: assistantContent,
                    sources: sources.length > 0 ? sources : undefined,
                  };
                }
                return updated;
              });
            }
          } catch (e) {
            // Silent fail on parse errors
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      // Add error message
      setConversations((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex((c) => c.id === activeId);
        if (idx !== -1) {
          const messages = updated[idx].messages;
          messages[messages.length - 1] = {
            role: "assistant",
            content: "Sorry, there was an issue processing your request. Please try again.",
            sources: [],
          };
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="flex h-screen w-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Chat Area */}
      <ChatArea
        messages={activeConversation?.messages || []}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onSuggestionClick={handleSuggestionClick}
      />
    </div>
  );
}
