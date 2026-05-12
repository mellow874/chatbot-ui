"use client";

import { useState, useEffect } from "react";
import { Plus, Menu, X, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import { Conversation } from "@/lib/conversations";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({
  conversations,
  activeId,
  onNewChat,
  onSelectConversation,
  isOpen,
  onToggle,
}: SidebarProps) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Sign out?")) {
      logout();
    }
  };

  return (
    <>
      {/* Mobile hamburger button */}
      {isMobile && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 z-50 p-2 text-orange-500 hover:bg-white/5 rounded-lg transition-colors md:hidden"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Backdrop (mobile) */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-48 bg-gradient-to-b from-[#0a0a0a] to-[#5e0743] border-r border-orange-500/10 flex flex-col h-screen transition-all duration-300 z-40 ${
          isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : ""
        }`}
      >
        {/* Logo area */}
        <div className="p-4 border-b border-orange-500/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-purple-600 rounded flex items-center justify-center shadow-lg">
              <span className="text-lg font-bold text-white font-display">M</span>
            </div>
            <div>
              <h2 className="font-display text-sm font-semibold text-white">QLA Mentor</h2>
              <p className="text-xs text-text-muted">Melsoft Holdings</p>
            </div>
          </div>
        </div>

        {/* New Chat button */}
        <div className="px-3 py-4 border-b border-orange-500/10">
          <button
            onClick={() => {
              onNewChat();
              if (isMobile) onToggle();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-500/10 transition-colors duration-200 text-sm font-medium"
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                onSelectConversation(conv.id);
                if (isMobile) onToggle();
              }}
              className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-sm truncate ${
                activeId === conv.id
                  ? "bg-orange-500/20 border-l-3 border-orange-500 text-white font-medium"
                  : "text-text-muted hover:bg-white/5 border-l-3 border-transparent"
              }`}
            >
              {conv.title}
            </button>
          ))}

          {conversations.length === 0 && (
            <p className="text-text-dim text-xs px-3 py-4 italic">
              No conversations yet. Start a new chat.
            </p>
          )}
        </div>

        {/* Bottom section */}
        <div className="border-t border-orange-500/10 p-3 space-y-2">
          <button
            onClick={() => {
              router.push("/profile");
              if (isMobile) onToggle();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-text-muted hover:text-orange-500 hover:bg-white/5 rounded-lg transition-colors text-sm"
          >
            <User size={16} />
            Profile
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-text-muted hover:text-red-500 hover:bg-white/5 rounded-lg transition-colors text-sm"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
