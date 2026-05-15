"use client";

import { useRef, useEffect, useState } from "react";
import { Menu, X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MessageComponent from "./Message";
import EmptyState from "./EmptyState";
import PromptInput from "./PromptInput";
import { Message } from "@/lib/conversations";

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onSuggestionClick?: (suggestion: string) => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
}

export default function ChatArea({
  messages,
  isLoading,
  onSendMessage,
  onSuggestionClick,
  sidebarOpen,
  onToggleSidebar,
  onNewChat,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
      {/* ── MOBILE HEADER ── */}
      {isMobile && (
        <header 
          className="h-14 flex items-center justify-between px-4 z-30"
          style={{ 
            background: "rgba(12, 10, 20, 0.8)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--hairline)"
          }}
        >
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-2 rounded-lg transition-colors"
            style={{ color: "var(--ink-70)" }}
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-2">
            <img 
              src="/brand/logo.png" 
              alt="QLA" 
              className="w-5 h-5 object-contain" 
              style={{ mixBlendMode: 'screen' }}
            />
            <span className="font-display font-semibold text-sm tracking-tight" style={{ color: "var(--ink-100)" }}>
              QLA Mentor
            </span>
          </div>

          <button
            onClick={onNewChat}
            className="p-2 -mr-2 rounded-lg transition-colors"
            style={{ color: "var(--ink-70)" }}
          >
            <Plus size={22} />
          </button>
        </header>
      )}

      {/* Backdrop (mobile) */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            style={{
              background: "rgba(7, 6, 10, 0.7)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
            onClick={onToggleSidebar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* ── ATMOSPHERIC LAYER: SCRIMS (FULL-WIDTH) ── */}
      <div
        className="absolute top-0 left-0 right-0 h-16 z-20 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, var(--obsidian-1) 0%, transparent 100%)",
          top: isMobile ? "56px" : "0",
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
      <div className={`flex-1 flex flex-col w-full max-w-[768px] xl:max-w-[820px] mx-auto px-4 md:px-6 relative z-10 overflow-hidden ${isMobile ? 'pt-2' : ''}`}>
        
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
