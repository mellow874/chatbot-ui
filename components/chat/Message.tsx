"use client";

import { useRef, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Message } from "@/lib/conversations";

interface MessageProps {
  message: Message;
  isStreaming?: boolean;
}

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

  // USER MESSAGE
  if (isUser) {
    return (
      <div ref={containerRef} className="flex justify-end py-2">
        <div
          className="max-w-[78%] px-4 py-3 text-sm leading-relaxed"
          style={{
            background: "var(--void-2)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "8px 2px 8px 8px",
            color: "var(--text-secondary)",
          }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  // ASSISTANT MESSAGE
  return (
    <div ref={containerRef} className="py-5">
      {/* Document header */}
      <div className="flex items-center gap-3 mb-3">
        <span className="type-label" style={{ color: "var(--violet-text)" }}>DAN PEÑA</span>
        <div className="rule-violet flex-1" style={{ maxWidth: "80px" }} />
      </div>

      {/* Content */}
      <div className="prose-void text-sm">
        <ReactMarkdown
          components={{
            p:          ({ children }) => <p>{children}</p>,
            strong:     ({ children }) => <strong>{children}</strong>,
            em:         ({ children }) => <em>{children}</em>,
            ul:         ({ children }) => <ul>{children}</ul>,
            ol:         ({ children }) => <ol>{children}</ol>,
            li:         ({ children }) => <li>{children}</li>,
            code:       ({ children }) => <code>{children}</code>,
            pre:        ({ children }) => <pre>{children}</pre>,
            h1:         ({ children }) => <h1>{children}</h1>,
            h2:         ({ children }) => <h2>{children}</h2>,
            h3:         ({ children }) => <h3>{children}</h3>,
            blockquote: ({ children }) => <blockquote>{children}</blockquote>,
            hr:         () => <hr className="rule" style={{ margin: "1rem 0" }} />,
          }}
        >
          {displayedContent}
        </ReactMarkdown>

        {/* Streaming cursor */}
        {isStreaming && (
          <span
            className="inline-block w-0.5 h-[1em] ml-0.5 animate-cursor-blink"
            style={{
              background: "var(--violet-text)",
              verticalAlign: "text-bottom",
              borderRadius: "1px",
            }}
          />
        )}
      </div>

      {/* Sources */}
      {message.sources && message.sources.length > 0 && !isStreaming && (
        <div className="mt-4 pt-3 rule">
          <p className="type-label mb-2" style={{ marginTop: "12px" }}>SOURCES</p>
          <div className="flex flex-wrap gap-1.5">
            {message.sources.map((src, i) => (
              <span
                key={i}
                className="type-mono text-[10px] px-2 py-1"
                style={{
                  background: "var(--void-2)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "4px",
                  color: "var(--text-muted)",
                }}
              >
                {src.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
