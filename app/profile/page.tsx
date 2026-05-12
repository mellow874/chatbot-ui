"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import Sidebar from "@/components/chat/Sidebar";
import { Conversation, getConversations, getActiveConversationId } from "@/lib/conversations";
import { mockGetProfile, mockPutProfile } from "@/lib/mockBackend";

export default function ProfilePage() {
  const [profileText, setProfileText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Load conversations
    setConversations(getConversations());
    setActiveId(getActiveConversationId());
  }, []);

  useEffect(() => {
    // Load profile from backend
    const loadProfile = async () => {
      try {
        const useMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";
        let data;

        if (useMock) {
          data = await mockGetProfile();
        } else {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/profile`,
            {
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_APP_PASSWORD}`,
              },
            }
          );
          data = await res.json();
        }

        if (data?.profile_text) {
          setProfileText(data.profile_text);
        }
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
      const useMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";

      if (useMock) {
        await mockPutProfile(profileText);
      } else {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/profile`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_APP_PASSWORD}`,
            },
            body: JSON.stringify({ profile_text: profileText }),
          }
        );

        if (!res.ok) throw new Error("Failed to save");
      }

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
    <div className="flex h-screen w-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onNewChat={() => router.push("/")}
        onSelectConversation={() => router.push("/")}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main content */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#080810] via-[#0f0f1a] to-[#0a1733]">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.push("/")}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-muted hover:text-orange-500"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="font-display text-4xl font-bold text-white">Your Profile</h1>
              <p className="text-text-muted text-sm mt-1">
                This is what Dan knows about you. Keep it current.
              </p>
            </div>
          </div>

          {/* Profile Card */}
          <div
            className="rounded-lg p-8 border border-border mb-8"
            style={{
              background: "linear-gradient(135deg, #0a1733 0%, #1a0a2e 100%)",
            }}
          >
            {/* User Info Header */}
            <div className="flex items-start gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-maroon to-purple-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-2xl font-bold text-white font-display">L</span>
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-white">Larreth Jimu</h2>
                <p className="text-text-muted text-sm">CEO, Melsoft Holdings</p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-orange-500/20 via-transparent to-orange-500/20 mb-8" />

            {/* Profile Document Label */}
            <label className="block text-xs font-semibold text-orange-500 uppercase tracking-widest mb-4">
              Profile Document
            </label>

            {/* Textarea */}
            <TextareaAutosize
              value={profileText}
              onChange={(e) => setProfileText(e.target.value)}
              minRows={12}
              maxRows={20}
              placeholder="Describe your business, your deals, your board, your goals...
Dan will read this before every conversation."
              className="w-full bg-[#1a1a2e] text-text-primary placeholder-text-dim border border-border-soft rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200 resize-none font-medium leading-relaxed"
            />

            {/* Character count */}
            <div className="text-right text-xs text-text-muted mt-3">
              {profileText.length.toLocaleString()} characters
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={handleSave}
                disabled={isSaving || profileText.trim().length === 0}
                className={`ml-auto px-6 py-3 rounded-lg font-semibold uppercase tracking-wider text-sm transition-all duration-200 ${
                  saveStatus === "success"
                    ? "bg-green-600/20 text-green-400 border border-green-500/50"
                    : saveStatus === "error"
                      ? "bg-red-600/20 text-red-400 border border-red-500/50"
                      : isSaving || profileText.trim().length === 0
                        ? "bg-text-dim text-text-muted cursor-not-allowed"
                        : "bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:brightness-110 active:scale-95"
                }`}
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : saveStatus === "success" ? (
                  <div className="flex items-center gap-2">
                    <Check size={16} />
                    Saved ✓
                  </div>
                ) : saveStatus === "error" ? (
                  "Failed — try again"
                ) : (
                  "SAVE PROFILE"
                )}
              </button>
            </div>

            {/* Info callout */}
            <div className="mt-8 p-4 rounded-lg border border-orange-500/20 bg-orange-500/5">
              <p className="text-sm text-text-muted leading-relaxed">
                <span className="text-orange-500 mr-2">ⓘ</span>
                Dan reads this profile at the start of every conversation. Update it whenever your situation
                changes — new deals, new board members, new capital raised. The more specific you are, the better
                his answers.
              </p>
            </div>

            {/* Last updated */}
            <p className="text-xs text-text-dim mt-6">
              Last updated: {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
