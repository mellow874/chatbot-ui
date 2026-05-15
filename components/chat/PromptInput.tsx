"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Paperclip, Mic } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { useToast } from "@/components/ui/use-toast";

interface PromptInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function PromptInput({ onSendMessage, isLoading }: PromptInputProps) {
  const [input, setInput] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const { toast } = useToast();

  // Cmd/Ctrl + / focuses the input from anywhere
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, []);

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

  const handleStub = (feature: string) => {
    toast({
      title: "Coming soon",
      description: `${feature} will be available in a future update.`,
    });
  };

  const hasInput = input.trim().length > 0;

  return (
    <div className={`w-full flex flex-col items-center px-4 ${isMobile ? 'pb-2' : 'pb-4'} pt-2`}>
      {/* Floating pill container */}
      <div
        className="w-full max-w-[768px] rounded-2xl transition-all duration-200"
        style={{
          background: "var(--obsidian-2)",
          border: "1px solid var(--hairline)",
          padding: "12px 12px 12px 20px",
        }}
        onFocus={(e) => {
          const container = e.currentTarget;
          container.style.borderColor = "var(--hairline-bright)";
          container.style.boxShadow =
            "0 0 0 1px rgba(124,58,237,0.15), 0 12px 48px -16px rgba(124,58,237,0.35)";
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            const container = e.currentTarget;
            container.style.borderColor = "var(--hairline)";
            container.style.boxShadow = "none";
          }
        }}
      >
        <div className="flex items-end gap-2">
          {/* Textarea */}
          <TextareaAutosize
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Dan…"
            minRows={1}
            maxRows={5}
            disabled={isLoading}
            className="flex-1 resize-none bg-transparent border-none text-[var(--ink-100)] placeholder-[var(--ink-30)] text-sm leading-relaxed focus:outline-none focus:ring-0 min-h-[24px] py-1"
            style={{ caretColor: "var(--violet-mist)" }}
          />

          {/* Action buttons */}
          <div className="flex items-end gap-1.5 flex-shrink-0 pb-0.5">
            {/* Paperclip (stub) */}
            <button
              type="button"
              onClick={() => handleStub("File attachments")}
              className="w-8 h-8 rounded-md flex items-center justify-center transition-colors duration-150"
              style={{ color: "var(--ink-50)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--ink-100)";
                e.currentTarget.style.background = "var(--obsidian-3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--ink-50)";
                e.currentTarget.style.background = "transparent";
              }}
              aria-label="Attach file"
              title="Attach"
            >
              <Paperclip size={16} />
            </button>

            {/* Mic (stub) */}
            <button
              type="button"
              onClick={() => handleStub("Voice input")}
              className="w-8 h-8 rounded-md flex items-center justify-center transition-colors duration-150"
              style={{ color: "var(--ink-50)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--ink-100)";
                e.currentTarget.style.background = "var(--obsidian-3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--ink-50)";
                e.currentTarget.style.background = "transparent";
              }}
              aria-label="Voice input"
              title="Voice"
            >
              <Mic size={16} />
            </button>

            {/* Send button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={!hasInput || isLoading}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                background: hasInput && !isLoading
                  ? "var(--grad-ember-button)"
                  : "var(--obsidian-3)",
                color: hasInput && !isLoading ? "#ffffff" : "var(--ink-30)",
                cursor: hasInput && !isLoading ? "pointer" : "not-allowed",
                boxShadow: hasInput && !isLoading
                  ? "0 4px 16px -4px var(--ember)"
                  : "none",
              }}
              onMouseEnter={(e) => {
                if (hasInput && !isLoading) {
                  e.currentTarget.style.filter = "brightness(1.1)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "brightness(1)";
              }}
              onMouseDown={(e) => {
                if (hasInput && !isLoading) {
                  e.currentTarget.style.transform = "scale(0.95)";
                }
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
              aria-label="Send message"
            >
              {isLoading ? (
                <div
                  className="w-4 h-4 border-2 rounded-full animate-spin"
                  style={{
                    borderColor: "var(--ink-30)",
                    borderTopColor: "var(--ink-100)",
                  }}
                />
              ) : (
                <ArrowUp size={18} strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Command hint row */}
      {!isMobile && (
        <div
          className="mt-2.5 text-center font-mono"
          style={{
            fontSize: "11px",
            color: "var(--ink-30)",
            letterSpacing: "0.02em",
          }}
        >
          <span>Enter to send</span>
          <span className="mx-2 opacity-40">·</span>
          <span>Shift+Enter for new line</span>
          <span className="mx-2 opacity-40">·</span>
          <span>⌘K for commands</span>
        </div>
      )}
    </div>
  );
}
