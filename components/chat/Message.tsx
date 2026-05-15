"use client";

import { useRef, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Message } from "@/lib/conversations";

interface MessageProps {
  message: Message;
  isStreaming?: boolean;
}

const messageVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number], // ease-out-expo
    },
  },
};

export default function MessageComponent({ message, isStreaming }: MessageProps) {
  const isUser = message.role === "user";
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll into view when message appears
  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [message.content]);

  const [displayedContent, setDisplayedContent] = useState("");

  // Typewriter effect for streaming
  useEffect(() => {
    if (!isStreaming) {
      setDisplayedContent(message.content);
      return;
    }

    if (displayedContent.length < message.content.length) {
      // Faster typing if we're lagging behind the stream
      const lag = message.content.length - displayedContent.length;
      const speed = lag > 50 ? 5 : 15; 
      
      const timeout = setTimeout(() => {
        setDisplayedContent(message.content.slice(0, displayedContent.length + 1));
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [message.content, displayedContent, isStreaming]);

  if (isUser) {
    return (
      <motion.div
        ref={containerRef}
        className="flex justify-end mb-4"
        variants={messageVariants}
        initial="hidden"
        animate="visible"
      >
        <div
          className="px-4 py-3"
          style={{
            maxWidth: "min(70%, 480px)",
            background: "rgba(255, 122, 26, 0.06)",
            border: "1px solid rgba(255, 122, 26, 0.15)",
            borderRadius: "16px 16px 4px 16px",
          }}
        >
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--ink-100)" }}
          >
            {message.content}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      className="mb-6"
      variants={messageVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-[720px]">
        {/* Ember dot — Dan's mark */}
        <div className="flex items-start gap-3 mb-2">
          <div
            className={isStreaming ? "animate-ember-dot-pulse" : ""}
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "var(--ember)",
              boxShadow: "0 0 12px var(--ember)",
              flexShrink: 0,
              marginTop: "6px",
            }}
          />
          <span
            className="font-mono text-[10px] uppercase tracking-[0.15em] mt-1"
            style={{ color: "var(--ink-30)" }}
          >
            Dan Peña
          </span>
        </div>

        {/* Message content */}
        <div className="pl-[22px]">
          <div
            className="text-sm leading-relaxed prose prose-invert max-w-none"
            style={{ color: "var(--ink-100)" }}
          >
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-3 last:mb-0">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong
                    className="font-semibold"
                    style={{ color: "var(--ember-soft)" }}
                  >
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em
                    className="italic"
                    style={{ color: "var(--violet-mist)" }}
                  >
                    {children}
                  </em>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-3 space-y-1.5">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-3 space-y-1.5">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-sm leading-relaxed">{children}</li>
                ),
                code: ({ children, className }) => {
                  const isBlock = className?.includes("language-");
                  if (isBlock) {
                    return (
                      <code className="text-xs font-mono" style={{ color: "var(--ember-soft)" }}>
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code
                      className="px-1.5 py-0.5 rounded text-xs font-mono"
                      style={{
                        background: "var(--obsidian-0)",
                        border: "1px solid var(--hairline)",
                        color: "var(--ember-soft)",
                      }}
                    >
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => (
                  <pre
                    className="p-4 rounded-lg mb-3 overflow-x-auto text-xs font-mono"
                    style={{
                      background: "var(--obsidian-0)",
                      border: "1px solid var(--hairline)",
                    }}
                  >
                    {children}
                  </pre>
                ),
                h1: ({ children }) => (
                  <h1 className="text-xl font-display font-bold mb-3 mt-4" style={{ color: "var(--ink-100)" }}>
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-display font-bold mb-2 mt-3" style={{ color: "var(--ink-100)" }}>
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-display font-semibold mb-2 mt-3" style={{ color: "var(--ink-100)" }}>
                    {children}
                  </h3>
                ),
                blockquote: ({ children }) => (
                  <blockquote
                    className="pl-4 my-3 italic"
                    style={{
                      borderLeft: "2px solid var(--violet-mist)",
                      color: "var(--ink-70)",
                    }}
                  >
                    {children}
                  </blockquote>
                ),
              }}
            >
              {displayedContent}
            </ReactMarkdown>

            {/* Streaming cursor — violet square */}
            {isStreaming && (
              <span
                className="inline-block ml-1 animate-violet-pulse"
                style={{
                  width: "6px",
                  height: "6px",
                  background: "var(--violet-mist)",
                  verticalAlign: "text-bottom",
                }}
              />
            )}
          </div>
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && !isStreaming && (
          <div className="pl-[22px] mt-4 pt-3">
            {/* Sources header */}
            <div
              className="font-mono text-[10px] uppercase tracking-[0.2em] mb-2.5"
              style={{ color: "var(--ink-30)" }}
            >
              ┌ SOURCES
            </div>

            {/* Source chips */}
            <div className="flex flex-wrap gap-1.5">
              {message.sources.map((source, idx) => {
                const icon =
                  source.source_type === "book"
                    ? "📄"
                    : source.source_type === "youtube"
                      ? "🎥"
                      : "🌐";

                return (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 font-mono transition-colors duration-150 cursor-default"
                    style={{
                      background: "var(--obsidian-3)",
                      border: "1px solid var(--hairline)",
                      borderRadius: "999px",
                      padding: "4px 10px",
                      fontSize: "11px",
                      color: "var(--ink-50)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--hairline-bright)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--hairline)";
                    }}
                  >
                    <span>{icon}</span>
                    <span>{source.title}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
