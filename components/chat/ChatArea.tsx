"use client";

import { useRef, useEffect, useState } from "react";
import MessageComponent from "./Message";
import EmptyState from "./EmptyState";
import PromptInput from "./PromptInput";
import { Message } from "@/lib/conversations";

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onSuggestionClick?: (suggestion: string) => void;
}

export default function ChatArea({
  messages,
  isLoading,
  onSendMessage,
  onSuggestionClick,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setIsStreaming(isLoading);
  }, [isLoading]);

  const handleSuggestion = (suggestion: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
  };

  const showEmptyState = messages.length === 0;

  const lastMsg = messages[messages.length - 1];
  const showShimmer =
    isStreaming &&
    lastMsg?.role === "assistant" &&
    lastMsg.content.length === 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-transparent relative">
      {/* ── ATMOSPHERIC LAYER: SCRIMS (FULL-WIDTH) ── */}
      <div
        className="absolute top-0 left-0 right-0 h-16 z-20 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, var(--obsidian-1) 0%, transparent 100%)",
        }}
      />

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-20"
        style={{
          height: "100px",
          background:
            "linear-gradient(to top, var(--obsidian-1) 20%, transparent 100%)",
          backdropFilter: "blur(8px)",
          maskImage:
            "linear-gradient(to top, black 30%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to top, black 30%, transparent 100%)",
        }}
      />

      {/* ── CONTENT LAYER: CENTERED COLUMN ── */}
      <div className="flex-1 flex flex-col w-full max-w-[768px] xl:max-w-[820px] mx-auto px-4 md:px-6 relative z-10 overflow-hidden">
        
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto pt-6 pb-4 space-y-4 relative custom-scrollbar">
          {showEmptyState ? (
            <EmptyState onSuggestionClick={handleSuggestion} />
          ) : (
            <>
              {messages.map((msg, idx) => (
                <MessageComponent
                  key={idx}
                  message={msg}
                  isStreaming={
                    isStreaming &&
                    idx === messages.length - 1 &&
                    msg.role === "assistant"
                  }
                />
              ))}

              {showShimmer && (
                <div className="max-w-[720px] px-4 py-3">
                  <div
                    className="h-4 rounded-md overflow-hidden relative"
                    style={{
                      background: "var(--obsidian-2)",
                      width: "60%",
                    }}
                  >
                    <div
                      className="absolute inset-0 animate-shimmer"
                      style={{
                        background:
                          "linear-gradient(90deg, var(--obsidian-2), var(--obsidian-3), var(--obsidian-2))",
                        backgroundSize: "200% 100%",
                      }}
                    />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Prompt Input area */}
        <div className="relative z-30 pb-4 pt-2">
          <PromptInput onSendMessage={onSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
