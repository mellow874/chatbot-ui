"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import Sidebar from "@/components/chat/Sidebar";
import QLAJourney from "@/components/profile/QLAJourney";
import { Conversation, getConversations, getActiveConversationId } from "@/lib/conversations";
import { getProfile, updateProfile } from "@/lib/api";

export default function ProfilePage() {
  const [profileText, setProfileText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setConversations(getConversations());
    setActiveId(getActiveConversationId());
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const text = await getProfile();
        if (text) setProfileText(text);
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      const success = await updateProfile(profileText);
      if (!success) throw new Error("Failed to save");
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      console.error("Error saving profile:", err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-transparent overflow-hidden">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onNewChat={() => router.push("/")}
        onSelectConversation={() => router.push("/")}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main scroll area - overflow visible to allow labels to float out */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar overflow-x-visible">
        <div className="flex flex-col lg:flex-row min-h-full overflow-visible">
          
          {/* Left Column: User identity panel (40%) */}
          <div className="w-full lg:w-[40%] px-4 md:px-8 py-8 lg:border-r border-[var(--hairline)] overflow-visible">
            <div className="flex items-center gap-4 mb-12">
              <button
                onClick={() => router.push("/")}
                className="p-2 hover:bg-[var(--obsidian-3)] rounded-lg transition-colors text-[var(--ink-50)] hover:text-[var(--ember)]"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="font-display text-3xl font-bold text-[var(--ink-100)]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  The Vault
                </h1>
                <p className="text-[var(--ink-50)] text-xs font-mono uppercase tracking-widest mt-1">
                  Private Profile · Dan Peña QLA
                </p>
              </div>
            </div>

            {/* Identity Card */}
            <div className="mb-10">
              <div className="flex items-center gap-6 mb-8">
                <div 
                  className="w-24 h-24 rounded-3xl bg-[var(--obsidian-3)] border border-[var(--hairline-bright)] flex items-center justify-center shadow-2xl"
                >
                  <span className="text-4xl font-display font-bold text-[var(--ink-100)]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    L
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-[var(--ink-100)]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    Larreth Jimu
                  </h2>
                  <p className="text-[var(--ink-50)] text-sm mb-2">CEO, Melsoft Holdings</p>
                  <div className="flex items-center gap-2 text-[var(--ember)] font-mono text-[10px] uppercase tracking-wider">
                    <MessageSquare size={12} />
                    <span>Conversations: {conversations.length}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-xs font-mono text-[var(--ink-30)]">
                <p>MEMBER SINCE: MAY 2024</p>
                <p>ID: QLA-772-ALFA</p>
              </div>
            </div>

            {/* Profile Document */}
            <div className="space-y-4">
              <label className="block text-[10px] font-mono text-[var(--ember)] uppercase tracking-[0.2em]">
                Profile Document
              </label>
              <TextareaAutosize
                value={profileText}
                onChange={(e) => setProfileText(e.target.value)}
                minRows={10}
                maxRows={15}
                className="w-full bg-[var(--obsidian-2)] text-[var(--ink-100)] placeholder-[var(--ink-30)] border border-[var(--hairline)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--violet-mist)] transition-all resize-none text-sm leading-relaxed"
                placeholder="Describe your goals, deals, and board members..."
              />
              
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[var(--ink-30)]">
                  {profileText.length.toLocaleString()} CHARACTERS
                </span>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`px-6 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest transition-all ${
                    saveStatus === "success"
                      ? "bg-green-500/20 text-green-400 border border-green-500/50"
                      : isSaving
                      ? "bg-[var(--obsidian-3)] text-[var(--ink-30)]"
                      : "bg-[var(--grad-ember-button)] text-white hover:brightness-110"
                  }`}
                >
                  {isSaving ? "SYNCING..." : saveStatus === "success" ? "SYNCED" : "SYNC TO VAULT"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: QLA Journey (60%) */}
          <div className="w-full lg:w-[60%] relative flex items-center justify-center min-h-[500px] lg:min-h-0 overflow-visible">
             <QLAJourney />
          </div>

        </div>
      </main>
    </div>
  );
}
