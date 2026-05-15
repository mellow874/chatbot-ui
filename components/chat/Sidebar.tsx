"use client";

import { useState, useEffect } from "react";
import { Plus, Menu, X, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "@/lib/auth";
import { Conversation } from "@/lib/conversations";
import { useSidebar } from "@/context/SidebarContext";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  isOpen?: boolean; // legacy mobile open state
  onToggle?: () => void; // legacy mobile toggle
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
  const { collapsed, setCollapsed } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  // Check mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Sign out?")) {
      logout();
      router.push("/login");
    }
  };

  const sessions = conversations.slice(0, 7); // Show limited dots in rail

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden bg-black/50 backdrop-blur-sm"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <motion.div
        className="relative z-40 flex flex-col h-full bg-[#0a0a0f] border-r border-white/[0.04] overflow-hidden"
        initial={false}
        animate={{ 
          width: isMobile ? (isOpen ? 240 : 0) : (collapsed ? 48 : 240) 
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onHoverStart={() => !isMobile && collapsed && setCollapsed(false)}
        onHoverEnd={() => !isMobile && !collapsed && router.pathname === '/profile' && setCollapsed(true)} 
        // Note: I'll use the profile-specific collapse in the page component instead of router.pathname check here for simplicity
      >
        <AnimatePresence mode="wait">
          {collapsed && !isMobile ? (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center h-full py-6 gap-8"
            >
              {/* Logo dot */}
              <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.4)]" />
              
              {/* New session */}
              <button 
                onClick={onNewChat}
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white/80 hover:border-white/20 transition-colors"
              >
                <Plus size={12} />
              </button>

              {/* Session dots */}
              <div className="flex flex-col gap-3 flex-1 items-center pt-2">
                {conversations.map((conv, i) => (
                  <div 
                    key={conv.id} 
                    onClick={() => onSelectConversation(conv.id)}
                    className={`w-1.5 h-1.5 rounded-full transition-colors cursor-pointer ${
                      activeId === conv.id ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]' : 'bg-white/10 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>

              {/* Bottom icons */}
              <div className="flex flex-col gap-4 items-center mb-2">
                <User 
                  size={14} 
                  className="text-white/30 hover:text-white/70 cursor-pointer transition-colors" 
                  onClick={() => router.push('/profile')}
                />
                <LogOut 
                  size={14} 
                  className="text-white/30 hover:text-white/70 cursor-pointer transition-colors" 
                  onClick={handleLogout}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full w-[240px]"
            >
              {/* HEADER */}
              <div className="px-6 py-6 border-b border-white/[0.04]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-serif italic text-xl text-white/90">QLA</p>
                    <p className="text-[9px] tracking-[0.2em] font-mono uppercase text-white/30 mt-0.5">
                      MENTOR · VAULT
                    </p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.4)]" />
                </div>
              </div>

              {/* NEW SESSION */}
              <div className="px-4 py-4 border-b border-white/[0.04]">
                <button
                  onClick={onNewChat}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border border-white/10 text-white/60 hover:text-white/90 hover:bg-white/[0.02] hover:border-white/20 transition-all group"
                >
                  <Plus size={14} className="text-white/40 group-hover:text-white/80" />
                  <span className="text-[11px] font-mono uppercase tracking-wider">New session</span>
                </button>
              </div>

              {/* SESSIONS LEDGER */}
              <div className="flex-1 overflow-y-auto py-4 px-2 scrollbar-hide">
                <p className="px-4 text-[9px] font-mono uppercase tracking-[0.2em] text-white/20 mb-4">
                  History
                </p>
                {conversations.map((conv, index) => {
                  const isActive = activeId === conv.id;
                  const displayNum = String(conversations.length - index).padStart(2, "0");

                  return (
                    <button
                      key={conv.id}
                      onClick={() => onSelectConversation(conv.id)}
                      className={`w-full flex items-baseline gap-4 px-4 py-3 text-left rounded-lg transition-all mb-1 group ${
                        isActive ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <span className={`font-mono text-[10px] flex-none ${
                        isActive ? 'text-indigo-400' : 'text-white/20 group-hover:text-white/40'
                      }`}>
                        {displayNum}
                      </span>
                      <span className={`text-[12px] truncate ${
                        isActive ? 'text-white/90' : 'text-white/40 group-hover:text-white/60'
                      }`}>
                        {conv.title}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* FOOTER */}
              <div className="px-4 py-4 border-t border-white/[0.04] space-y-1">
                <button
                  onClick={() => router.push("/profile")}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.02] transition-all"
                >
                  <User size={14} />
                  <span className="text-[10px] font-mono uppercase tracking-wider">Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/40 hover:text-danger hover:bg-danger/5 transition-all"
                >
                  <LogOut size={14} />
                  <span className="text-[10px] font-mono uppercase tracking-wider">Sign out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
