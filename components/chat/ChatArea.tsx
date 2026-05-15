"use client";

import { useRef, useEffect, useState } from "react";
import { ArrowUp, Menu, Plus } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { motion, AnimatePresence } from "framer-motion";
import MessageComponent from "./Message";
import EmptyState from "./EmptyState";
import { Message } from "@/lib/conversations";
import VoidShader from "@/components/ui/VoidShader";

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
  const [input, setInput] = useState("");
  const [inputFocused, setInputFocused] = useState(false);

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

  const showEmptyState = messages.length === 0;

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden relative"
      style={{ background: "var(--void)" }}
    >
      {/* Background shader — below everything */}
      <div className="absolute inset-0 z-0">
        <VoidShader />
      </div>

      {/* ── MOBILE HEADER ── */}
      {isMobile && (
        <header 
          className="h-14 flex items-center justify-between px-4 z-30 relative"
          style={{ 
            background: "rgba(3, 3, 5, 0.8)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--border-subtle)"
          }}
        >
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-2 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-sm tracking-tight" style={{ color: "var(--bone)" }}>
              QLA Mentor
            </span>
          </div>

          <button
            onClick={onNewChat}
            className="p-2 -mr-2 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            <Plus size={22} />
          </button>
        </header>
      )}

      {/* Backdrop (mobile) */}
      <AnimatePresence initial={false}>
        {isMobile && sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            style={{
              background: "rgba(3, 3, 5, 0.7)",
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

      {/* ── Messages ── */}
      <div
        className="relative z-10 flex-1 overflow-y-auto"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="max-w-[680px] mx-auto w-full px-5 py-8 h-full flex flex-col">
          {showEmptyState ? (
            <EmptyState onSuggestionClick={handleSuggestion} />
          ) : (
            <div className="space-y-1 pb-6">
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, ease: [0.15,0,0,1] }}
                  >
                    <MessageComponent
                      message={msg}
                      isStreaming={isStreaming && idx === messages.length - 1 && msg.role === "assistant"}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* ── Input Zone ── */}
      <div
        className="relative z-10 pb-5 px-5"
        style={{
          background: "linear-gradient(to top, var(--void) 65%, transparent 100%)",
          paddingTop: "24px",
        }}
      >
        <div className="max-w-[680px] mx-auto w-full">

          {/* Thinking indicator — above input */}
          <AnimatePresence>
            {isStreaming && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -2 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex items-center gap-2 mb-3 px-1"
              >
                <span className="type-label" style={{ color: "var(--text-ghost)" }}>THINKING</span>
                <span
                  className="inline-flex gap-[3px]"
                  aria-hidden="true"
                >
                  {[0,1,2].map(i => (
                    <span
                      key={i}
                      className="inline-block w-1 h-1 rounded-full"
                      style={{
                        background: "var(--violet-text)",
                        animation: `cursorBlink 1.4s ${i * 0.22}s step-end infinite`,
                      }}
                    />
                  ))}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input slab */}
          <div
            className="surface-input rounded-lg transition-all duration-200"
            style={{
              borderRadius: "8px",
              background: "var(--void-2)",
            }}
          >
            <div className="px-4 pt-3.5 pb-2">
              <TextareaAutosize
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Ask Dan anything..."
                maxRows={8}
                disabled={isLoading}
                className="w-full resize-none bg-transparent focus:outline-none text-sm leading-relaxed"
                style={{
                  color: "var(--bone)",
                  caretColor: "var(--violet)",
                  fontFamily: "inherit",
                  fontSize: "14px",
                }}
              />
            </div>

            {/* Toolbar */}
            <div
              className="flex items-center justify-between px-3 pb-2.5 pt-1"
              style={{ borderTop: "1px solid var(--border-ghost)" }}
            >
              <div className="flex items-center">
                <span
                  className="type-mono text-[9px]"
                  style={{
                    color: "var(--text-ghost)",
                    letterSpacing: "0.1em",
                    userSelect: "none",
                  }}
                >
                  ↵ SEND · ⇧↵ BREAK
                </span>
              </div>

              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150"
                style={{
                  background: !input.trim() || isLoading
                    ? "transparent"
                    : "var(--violet)",
                  color: !input.trim() || isLoading
                    ? "var(--text-ghost)"
                    : "white",
                  opacity: !input.trim() || isLoading ? 0.5 : 1,
                }}
              >
                <ArrowUp size={13} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Caption */}
          <p
            className="type-label text-center mt-2.5"
            style={{ color: "var(--text-ghost)", fontSize: "8px" }}
          >
            DAN PEÑA · QLA METHODOLOGY · PRIVATE ACCESS · MELSOFT HOLDINGS
          </p>
        </div>
      </div>
    </div>
  );
}
