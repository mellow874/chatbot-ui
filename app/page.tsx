"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Menu, Plus, User, Send, X } from "lucide-react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

type Source = { title: string; url?: string; source_type: string };
type Message = { role: "user" | "assistant"; content: string; sources?: Source[] };
type Conversation = { id: string; title: string; messages: Message[] };

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("chat_conversations");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed);
        if (parsed.length > 0) setActiveId(parsed[0].id);
      } catch (e) {
        handleNewChat();
      }
    } else {
      handleNewChat();
    }
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("chat_conversations", JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeId, isStreaming]);

  const activeConversation = conversations.find((c) => c.id === activeId);

  const handleNewChat = () => {
    const newChat: Conversation = { id: uuidv4(), title: "New Chat", messages: [] };
    setConversations((prev) => [newChat, ...prev]);
    setActiveId(newChat.id);
    setSidebarOpen(false);
  };

  const handleSend = async () => {
    if (!input.trim() || !activeId || isStreaming) return;

    const userMessage: Message = { role: "user", content: input };
    setInput("");

    let updatedConvos = [...conversations];
    let chatIndex = updatedConvos.findIndex((c) => c.id === activeId);
    if (chatIndex === -1) return;

    if (updatedConvos[chatIndex].messages.length === 0) {
      updatedConvos[chatIndex].title = input.slice(0, 30) + (input.length > 30 ? "..." : "");
    }

    updatedConvos[chatIndex].messages.push(userMessage);
    updatedConvos[chatIndex].messages.push({ role: "assistant", content: "", sources: [] });
    setConversations(updatedConvos);
    setIsStreaming(true);

    const history = updatedConvos[chatIndex].messages.slice(-11, -1).map(m => ({
      role: m.role,
      content: m.content
    }));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_APP_PASSWORD}`
        },
        body: JSON.stringify({
          question: userMessage.content,
          history: history,
          session_token: process.env.NEXT_PUBLIC_APP_PASSWORD
        })
      });

      if (!response.ok) throw new Error("Network response was not ok");
      if (!response.body) throw new Error("No body in response");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let assistantMessageContent = "";
      let sources: Source[] = [];

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (trimmed.startsWith("data:")) {
              const dataStr = trimmed.slice(5).trim();
              if (dataStr === "[DONE]") continue;
              try {
                const data = JSON.parse(dataStr);
                if (data.message) assistantMessageContent += data.message;
                if (data.sources) sources = data.sources;
              } catch (e) { }
            } else if (trimmed.startsWith("{")) {
              try {
                const data = JSON.parse(trimmed);
                if (data.message) assistantMessageContent += data.message;
                if (data.sources) sources = data.sources;
              } catch (e) { }
            } else {
              // Assume raw string
              if (!trimmed.startsWith("[") && !trimmed.startsWith("]")) {
                // Try to avoid blindly appending broken json
                assistantMessageContent += trimmed + " ";
              }
            }
          }

          setConversations((prev) => {
            const next = [...prev];
            const idx = next.findIndex((c) => c.id === activeId);
            if (idx !== -1) {
              const messages = next[idx].messages;
              messages[messages.length - 1] = {
                role: "assistant",
                content: assistantMessageContent,
                sources: sources.length > 0 ? sources : undefined
              };
            }
            return next;
          });
        }
      }
    } catch (err) {
      console.error(err);
      setConversations((prev) => {
        const next = [...prev];
        const idx = next.findIndex((c) => c.id === activeId);
        if (idx !== -1) {
          next[idx].messages[next[idx].messages.length - 1].content += "\n\n*(Error connecting to the backend)*";
        }
        return next;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border bg-card transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <button onClick={handleNewChat} className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              New Chat
            </button>
            <button className="md:hidden ml-2 p-2 hover:bg-accent rounded-md" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => { setActiveId(c.id); setSidebarOpen(false); }}
                className={`w-full truncate rounded-md px-3 py-2 text-left text-sm transition-colors ${activeId === c.id ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"}`}
              >
                {c.title}
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-border">
            <button onClick={() => router.push("/profile")} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
              <User className="h-4 w-4" />
              Profile
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col h-full w-full bg-background relative">
        {/* Header (Mobile) */}
        <div className="flex items-center justify-between border-b border-border p-4 md:hidden bg-card/80 backdrop-blur-sm z-10 sticky top-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-accent rounded-md text-foreground">
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold text-foreground">Dan Peña Chatbot</span>
          <div className="w-9" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          {activeConversation?.messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-4">
              <h2 className="text-3xl font-bold text-foreground">Dan Peña QLA Chatbot</h2>
              <p className="text-muted-foreground max-w-md text-center">Ask me anything about the Quantum Leap Advantage methodology. I am here to help you succeed.</p>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6 pb-20">
              {activeConversation?.messages.map((m, i) => (
                <div key={i} className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex max-w-[85%] flex-col rounded-2xl p-5 shadow-sm ${m.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card text-card-foreground border border-border rounded-tl-sm"}`}>
                    <ReactMarkdown className="prose dark:prose-invert max-w-none text-sm break-words">
                      {m.content}
                    </ReactMarkdown>
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-4 border-t border-border/50 pt-3 text-xs text-muted-foreground/80">
                        <span className="font-semibold text-muted-foreground">Sources: </span>
                        {m.sources.map((s, idx) => (
                          <span key={idx}>
                            <a href={s.url || "#"} className="hover:underline">{s.title}</a>{idx < m.sources!.length - 1 ? " | " : ""}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-gradient-to-t from-background via-background to-transparent pt-10 absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-3xl relative flex items-end gap-2 bg-card border border-input rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-ring transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the Dan Peña chatbot..."
              className="w-full resize-none bg-transparent pl-3 pr-2 py-3 text-sm text-foreground focus:outline-none max-h-32 overflow-y-auto"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="rounded-xl bg-primary p-3 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shrink-0 mb-1 mr-1"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="text-center mt-2 text-xs text-muted-foreground">
            Dan Peña AI can make mistakes. Consider verifying important information.
          </div>
        </div>
      </div>
    </div>
  );
}
