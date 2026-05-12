"use client";

import ReactMarkdown from "react-markdown";
import { Message } from "@/lib/conversations";

interface MessageProps {
  message: Message;
  isStreaming?: boolean;
}

export default function MessageComponent({ message, isStreaming }: MessageProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 animate-slide-up">
        <div
          className="max-w-[70%] rounded-lg px-4 py-3 border-l-2 border-orange-500"
          style={{
            background: "rgba(255, 115, 0, 0.1)",
          }}
        >
          <p className="text-text-primary text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 animate-slide-up">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-6 h-6 mt-1 flex-shrink-0 bg-gradient-to-br from-maroon to-purple-600 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-xs font-bold text-white font-display">D</span>
        </div>

        {/* Message content */}
        <div className="flex-1 pr-4">
          <div className="border-l border-maroon/50 pl-4">
            <div className="text-text-primary text-sm leading-relaxed prose prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2">{children}</p>,
                  strong: ({ children }) => (
                    <strong className="font-semibold text-orange-400">{children}</strong>
                  ),
                  em: ({ children }) => <em className="italic text-text-muted">{children}</em>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-sm">{children}</li>,
                  code: ({ children }) => (
                    <code className="bg-black/40 px-1.5 py-0.5 rounded text-orange-300 text-xs font-mono">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-black/40 p-3 rounded mb-2 overflow-x-auto text-xs font-mono">
                      {children}
                    </pre>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>

              {isStreaming && (
                <span
                  className="inline-block w-0.5 h-4 ml-1 bg-orange-500 animate-blink"
                  style={{
                    verticalAlign: "text-bottom",
                  }}
                />
              )}
            </div>
          </div>

          {/* Sources */}
          {message.sources && message.sources.length > 0 && !isStreaming && (
            <div className="mt-4 pt-3 border-t border-text-dim/20">
              <div className="text-xs text-text-muted font-mono tracking-wider mb-2 uppercase">
                Sources
              </div>
              <div className="flex flex-wrap gap-1 text-xs">
                {message.sources.map((source, idx) => {
                  const icon =
                    source.source_type === "book"
                      ? "📄"
                      : source.source_type === "youtube"
                        ? "🎥"
                        : "🌐";

                  return (
                    <span key={idx} className="text-text-muted">
                      {icon} {source.title}
                      {idx < message.sources!.length - 1 && " |"}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
