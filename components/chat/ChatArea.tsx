"use client";

import { useRef, useEffect, useState } from "react";
import { Send } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import MessageComponent from "./Message";
import EmptyState from "./EmptyState";
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
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update streaming state based on loading
  useEffect(() => {
    setIsStreaming(isLoading);
  }, [isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    onSendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (suggestion: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    } else {
      setInput(suggestion);
    }
  };

  const showEmptyState = messages.length === 0;

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-[#080810] via-[#0f0f1a] to-[#0a1733] overflow-hidden">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
        {showEmptyState ? (
          <EmptyState onSuggestionClick={handleSuggestion} />
        ) : (
          <>
            {messages.map((msg, idx) => (
              <MessageComponent
                key={idx}
                message={msg}
                isStreaming={isStreaming && idx === messages.length - 1 && msg.role === "assistant"}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="sticky bottom-0 border-t border-border-soft bg-gradient-to-t from-[#0a1733] to-[#0f0f1a] px-4 md:px-8 py-4">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <TextareaAutosize
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Dan a question..."
            maxRows={5}
            className="flex-1 resize-none bg-[#1a1a2e] text-white placeholder-text-dim border border-border-soft rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200 text-sm font-medium"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 font-bold ${
              !input.trim() || isLoading
                ? "bg-text-dim text-text-muted cursor-not-allowed"
                : "bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:brightness-110 active:scale-95"
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
