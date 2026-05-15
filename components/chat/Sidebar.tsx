"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Menu, X, LogOut, User, ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "@/lib/auth";
import { Conversation } from "@/lib/conversations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

// ── Recency grouping helpers ────────────────────────────────────────
function getRecencyGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  if (date >= today) return "Today";
  if (date >= yesterday) return "Yesterday";
  if (date >= weekAgo) return "Previous 7 Days";
  return "Older";
}

const GROUP_ORDER = ["Today", "Yesterday", "Previous 7 Days", "Older"];

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [plusHovered, setPlusHovered] = useState(false);

  // Check mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Persist collapse preference
  useEffect(() => {
    const saved = localStorage.getItem("qla_sidebar_collapsed");
    if (saved === "true") setIsCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("qla_sidebar_collapsed", String(next));
  };

  // ⌘N keyboard shortcut for new chat
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        onNewChat();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onNewChat]);

  const handleLogout = () => {
    if (window.confirm("Sign out?")) {
      logout();
    }
  };

  // Group conversations by recency
  // TODO: Use updatedAt when the Conversation type adds it; using createdAt for now
  const grouped = useMemo(() => {
    const groups: Record<string, Conversation[]> = {};
    conversations.forEach((conv) => {
      const group = getRecencyGroup(conv.createdAt);
      if (!groups[group]) groups[group] = [];
      groups[group].push(conv);
    });
    return groups;
  }, [conversations]);

  const sidebarWidth = isMobile ? 240 : isCollapsed ? 64 : 240;
  const showLabels = isMobile || !isCollapsed;

  return (
    <>
      {/* Mobile hamburger button */}
      {isMobile && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg transition-colors duration-150 md:hidden"
          style={{ color: "var(--violet-mist)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(124, 58, 237, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Backdrop (mobile) */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            className="fixed inset-0 z-30 md:hidden"
            style={{
              background: "rgba(7, 6, 10, 0.7)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
            onClick={onToggle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className="flex flex-col h-screen z-40 flex-shrink-0 overflow-hidden"
        style={{
          width: isMobile ? 240 : sidebarWidth,
          background: "var(--grad-sidebar)",
          borderRight: "1px solid var(--hairline)",
          boxShadow: "1px 0 40px -20px var(--violet-glow)",
          transition: isMobile ? "transform 320ms var(--ease-out-expo)" : "width 280ms var(--ease-out-expo)",
          transform: isMobile ? (isOpen ? "translateX(0)" : "translateX(-100%)") : "none",
          position: isMobile ? "fixed" : "relative",
        }}
      >
        {/* ── Logo block ─────────────────────────────────── */}
        <div
          className="flex items-center gap-3 px-4 py-4"
          style={{
            borderBottom: "1px solid var(--hairline)",
            minHeight: "64px",
          }}
        >
          {/* Monogram tile */}
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "var(--obsidian-3)",
            }}
          >
            <img 
              src="/brand/logo.png" 
              alt="QLA" 
              className="w-7 h-7 object-contain opacity-90" 
              style={{ mixBlendMode: 'screen' }}
            />
          </div>

          {/* Brand text */}
          {showLabels && (
            <div className="overflow-hidden">
              <div
                className="font-display text-sm font-semibold"
                style={{ color: "var(--ink-100)" }}
              >
                QLA Mentor
              </div>
              <div
                className="font-mono text-[9px] uppercase"
                style={{
                  color: "var(--ink-30)",
                  letterSpacing: "0.15em",
                }}
              >
                MELSOFT · QLA
              </div>
            </div>
          )}
        </div>

        {/* ── New Chat button ────────────────────────────── */}
        <div className="px-3 py-3" style={{ borderBottom: "1px solid var(--hairline)" }}>
          <button
            onClick={() => {
              onNewChat();
              if (isMobile) onToggle();
            }}
            className="w-full flex items-center justify-center gap-2 rounded-lg transition-all duration-200 text-sm"
            style={{
              border: "1px solid var(--hairline-bright)",
              background: "transparent",
              color: "var(--ink-70)",
              padding: showLabels ? "8px 12px" : "8px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--obsidian-3)";
              e.currentTarget.style.borderColor = "rgba(167, 139, 250, 0.4)";
              setPlusHovered(true);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "var(--hairline-bright)";
              setPlusHovered(false);
            }}
            aria-label="New chat"
          >
            <motion.div
              animate={{ rotate: plusHovered ? 90 : 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Plus size={16} />
            </motion.div>
            {showLabels && (
              <>
                <span>New Chat</span>
                <span
                  className="ml-auto font-mono text-[10px]"
                  style={{ color: "var(--ink-30)" }}
                >
                  ⌘N
                </span>
              </>
            )}
          </button>
        </div>

        {/* ── Conversations list ─────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-2 py-3">
          {conversations.length === 0 ? (
            <p
              className="text-xs px-3 py-4 italic"
              style={{ color: "var(--ink-30)" }}
            >
              {showLabels ? "No conversations yet. Start a new chat." : ""}
            </p>
          ) : (
            GROUP_ORDER.map((group) => {
              const items = grouped[group];
              if (!items || items.length === 0) return null;

              return (
                <div key={group} className="mb-3">
                  {/* Section header */}
                  {showLabels && (
                    <div
                      className="font-mono uppercase px-3 pt-2 pb-1.5"
                      style={{
                        fontSize: "10px",
                        color: "var(--ink-30)",
                        letterSpacing: "0.2em",
                      }}
                    >
                      {group}
                    </div>
                  )}

                  {/* Conversation items */}
                  {items.map((conv) => {
                    const isActive = activeId === conv.id;
                    return (
                      <button
                        key={conv.id}
                        onClick={() => {
                          onSelectConversation(conv.id);
                          if (isMobile) onToggle();
                        }}
                        className="w-full text-left rounded-lg transition-all duration-150 flex items-center gap-2 group"
                        style={{
                          padding: showLabels ? "6px 10px" : "6px",
                          justifyContent: showLabels ? "flex-start" : "center",
                          background: isActive
                            ? "rgba(124, 58, 237, 0.10)"
                            : "transparent",
                          color: isActive
                            ? "var(--ink-100)"
                            : "var(--ink-70)",
                          fontSize: "13px",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = "rgba(124, 58, 237, 0.06)";
                            e.currentTarget.style.color = "var(--ink-100)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "var(--ink-70)";
                          }
                        }}
                        title={conv.title}
                      >
                        {/* Violet dot indicator */}
                        <div
                          className="flex-shrink-0 rounded-full transition-all duration-200"
                          style={{
                            width: "6px",
                            height: "6px",
                            background: isActive ? "var(--violet-mist)" : "transparent",
                            transform: isActive ? "scale(1)" : "scale(0)",
                            boxShadow: isActive
                              ? "0 0 6px rgba(167, 139, 250, 0.8)"
                              : "none",
                            opacity: isActive ? 0.8 : 0,
                          }}
                        />

                        {/* Title */}
                        {showLabels && (
                          <span className="truncate flex-1">{conv.title}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* ── Bottom section ─────────────────────────────── */}
        <div
          className="mt-auto"
          style={{ borderTop: "1px solid var(--hairline)" }}
        >
          {/* Profile dropdown */}
          <div className="px-3 py-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="w-full flex items-center gap-2.5 rounded-lg transition-colors duration-150 px-2 py-2"
                  style={{ color: "var(--ink-70)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(124, 58, 237, 0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                  aria-label="User menu"
                >
                  {/* Avatar */}
                  <div
                    className="flex items-center justify-center flex-shrink-0 font-display"
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "var(--obsidian-3)",
                      color: "var(--ink-100)",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    L
                  </div>
                  {showLabels && (
                    <span className="text-sm truncate flex-1 text-left">
                      Larreth
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="top"
                align="start"
                sideOffset={8}
                className="w-48"
                style={{
                  background: "var(--obsidian-2)",
                  border: "1px solid var(--hairline-bright)",
                  borderRadius: "12px",
                }}
              >
                <DropdownMenuItem
                  onClick={() => {
                    router.push("/profile");
                    if (isMobile) onToggle();
                  }}
                  className="cursor-pointer rounded-md px-3 py-2 text-sm transition-colors"
                  style={{ color: "var(--ink-70)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--ink-100)";
                    e.currentTarget.style.background = "rgba(124, 58, 237, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--ink-70)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <User size={14} className="mr-2" />
                  Profile
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="cursor-pointer rounded-md px-3 py-2 text-sm transition-colors"
                  style={{ color: "var(--ink-70)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--ink-100)";
                    e.currentTarget.style.background = "rgba(124, 58, 237, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--ink-70)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <Settings size={14} className="mr-2" />
                  Settings
                  {/* TODO: Wire settings page */}
                </DropdownMenuItem>

                <DropdownMenuSeparator
                  style={{ background: "var(--hairline)" }}
                />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer rounded-md px-3 py-2 text-sm transition-colors"
                  style={{ color: "var(--ink-70)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#ef4444";
                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--ink-70)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <LogOut size={14} className="mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Collapse toggle (desktop only) */}
          {!isMobile && (
            <button
              onClick={toggleCollapse}
              className="w-full flex items-center justify-center py-2 transition-colors duration-150"
              style={{
                borderTop: "1px solid var(--hairline)",
                color: "var(--ink-30)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--ink-70)";
                e.currentTarget.style.background = "rgba(124, 58, 237, 0.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--ink-30)";
                e.currentTarget.style.background = "transparent";
              }}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronLeft size={16} />
              )}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
