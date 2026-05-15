"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { motion } from "framer-motion";
import Sidebar from "@/components/chat/Sidebar";
import { Spotlight } from "@/components/ui/spotlight";
import { SplineScene } from "@/components/ui/splite";
import { Conversation, getConversations, getActiveConversationId } from "@/lib/conversations";
import { getProfile, updateProfile } from "@/lib/api";
import { useSidebar } from "@/context/SidebarContext";

export default function ProfilePage() {
  const [profileText, setProfileText] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const router = useRouter();
  const { setCollapsed } = useSidebar();

  // Auto-collapse sidebar on mount, restore on unmount
  useEffect(() => {
    setCollapsed(true);
    return () => setCollapsed(false);
  }, [setCollapsed]);

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

  const handleSave = async (text: string) => {
    setProfileText(text);
    try {
      await updateProfile(text);
    } catch (err) {
      console.error("Error saving profile:", err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#08090f] overflow-hidden">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onNewChat={() => router.push("/")}
        onSelectConversation={(id) => {
          router.push("/");
        }}
      />

      <div className="flex flex-1 h-full overflow-hidden">
        
        {/* LEFT PANEL — SCROLLABLE */}
        <div className="flex-1 h-full overflow-y-auto scrollbar-hide px-12 py-16 bg-[#08090f] relative">
          <motion.div 
            className="max-w-2xl mx-auto flex flex-col"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Back Button */}
            <motion.button
              variants={itemVariants}
              onClick={() => router.push("/")}
              className="w-fit p-2 -ml-2 mb-8 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white/80"
            >
              <ArrowLeft size={20} />
            </motion.button>

            {/* TOP SECTION */}
            <motion.div variants={itemVariants} className="mb-12">
              <p className="text-white/30 text-[10px] tracking-[0.35em] font-mono uppercase mb-6">
                PRIVATE PROFILE · THE VAULT
              </p>
              <h1 className="font-serif italic text-4xl md:text-5xl text-white/90 leading-tight">
                Larreth Jimu
              </h1>
              <p className="text-white/30 text-[11px] tracking-[0.3em] font-mono uppercase mt-2">
                CEO, Melsoft Holdings
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="w-full h-px bg-white/10 my-8" />

            {/* MEMBER STATS */}
            <motion.div variants={itemVariants} className="space-y-2 mb-8">
              <p className="text-white/25 text-[10px] tracking-[0.3em] font-mono uppercase">
                Member Since · May 2024
              </p>
              <p className="text-white/25 text-[10px] tracking-[0.3em] font-mono uppercase">
                ID · QLA-772-ALFA
              </p>
              <p className="text-white/25 text-[10px] tracking-[0.3em] font-mono uppercase">
                Conversations · {conversations.length}
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="w-full h-px bg-white/10 my-8" />

            {/* PROFILE DOCUMENT SECTION */}
            <motion.div variants={itemVariants} className="flex flex-col relative pb-32">
              <p className="text-white/30 text-[10px] tracking-[0.35em] font-mono uppercase mb-6">
                PROFILE DOCUMENT
              </p>
              
              <div className="relative group">
                <TextareaAutosize
                  value={profileText}
                  onChange={(e) => handleSave(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-white/50 text-sm leading-[1.8] font-light focus:ring-0 focus:outline-none resize-none placeholder:text-white/10"
                  placeholder="The philosophy of high performance..."
                />
                
                {/* FIX 1: Scroll Fade Height (h-16) */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#08090f] to-transparent pointer-events-none z-10" />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* RIGHT PANEL — FIXED, NO SCROLL */}
        <motion.div 
          className="relative w-[50%] h-full overflow-hidden flex-shrink-0 bg-[#08090f]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.6 }}
        >
          {/* Glow - no pointer events */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-950/40 blur-[100px]" />
          </div>

          {/* Spline — z-index 1, receives ALL pointer events */}
          <div className="absolute inset-0 z-[1]">
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
              style={{ pointerEvents: 'auto' }}
            />
          </div>

          {/* ALL overlays — z-index 10+, NO pointer events */}
          <div className="absolute inset-y-0 left-0 w-48 z-10 bg-gradient-to-r from-[#08090f] to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-32 z-10 bg-gradient-to-b from-[#08090f] to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-32 z-10 bg-gradient-to-t from-[#08090f] to-transparent pointer-events-none" />
          
          <Spotlight className="-top-40 left-0 md:-top-20 z-20 pointer-events-none" fill="white" />
          
          {/* Brand text — pointer-events-none */}
          <p className="absolute bottom-6 left-8 z-20 text-white/20 text-[10px] tracking-[0.35em] font-mono uppercase pointer-events-none">
            Dan Peña · QLA Methodology
          </p>

          {/* Begin Session label — pointer-events-none */}
          <p className="absolute bottom-6 right-8 z-20 text-white/20 text-[10px] tracking-[0.4em] font-mono uppercase pointer-events-none">
            Begin Session →
          </p>
        </motion.div>

      </div>
    </div>
  );
}
