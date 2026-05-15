"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authenticate } from "@/lib/auth";
import { motion } from "framer-motion";
import SplashCursor from "@/components/effects/SplashCursor";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const authenticated = localStorage.getItem("qla_authenticated");
    if (authenticated === "true") {
      router.push("/");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setError("Enter access code");
      return;
    }

    if (password !== process.env.NEXT_PUBLIC_APP_PASSWORD) {
      setError("Access denied");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    authenticate(password);
    setError("");
    setShowWelcome(true);
  };

  const hasValue = password.length > 0;

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "var(--obsidian-0)" }}>
      {/* Splash cursor — WebGL fluid sim */}
      <SplashCursor />

      {/* Subtle ambient gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 80%, rgba(124, 58, 237, 0.12) 0%, transparent 60%)",
        }}
      />

      {!showWelcome ? (
        <div className="flex items-center justify-center h-full relative z-10">
          {/* Login Card */}
          <div
            className={`w-full transition-all duration-300 ${isShaking ? "animate-shake" : ""}`}
            style={{
              maxWidth: "400px",
              background: "rgba(12, 10, 20, 0.6)",
              backdropFilter: "blur(24px) saturate(1.5)",
              WebkitBackdropFilter: "blur(24px) saturate(1.5)",
              border: "1px solid var(--hairline-bright)",
              borderRadius: "20px",
              padding: "40px 32px",
            }}
          >
            {/* Monogram */}
            <div className="flex justify-center mb-6">
              <div
                className="flex items-center justify-center"
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "16px",
                  background: "var(--obsidian-3)",
                }}
              >
                <img 
                  src="/brand/logo.png" 
                  alt="QLA" 
                  className="w-12 h-12 object-contain opacity-90" 
                  style={{ mixBlendMode: 'screen' }}
                />
              </div>
            </div>

            {/* Title */}
            <h1
              className="text-center font-display italic font-semibold mb-6"
              style={{
                fontSize: "22px",
                color: "var(--ink-100)",
                letterSpacing: "-0.01em",
              }}
            >
              The Trillion Dollar Mentor
            </h1>

            {/* Divider with ember dot */}
            <div className="relative mb-8">
              <div
                className="h-px w-full"
                style={{
                  background: "linear-gradient(to right, transparent, var(--hairline-bright), transparent)",
                }}
              />
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--ember)",
                  boxShadow: "0 0 8px var(--ember)",
                }}
              />
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Floating label input */}
              <div className="relative">
                <input
                  ref={inputRef}
                  type="password"
                  id="access-code"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="w-full peer text-sm font-medium pt-5 pb-2 px-4 rounded-xl transition-all duration-200"
                  style={{
                    background: "var(--obsidian-2)",
                    border: `1px solid ${isFocused ? "rgba(124, 58, 237, 0.4)" : "var(--hairline)"}`,
                    color: "var(--ink-100)",
                    caretColor: "var(--violet-mist)",
                    boxShadow: isFocused
                      ? "0 0 0 3px rgba(124, 58, 237, 0.15), 0 4px 24px -8px rgba(124, 58, 237, 0.3)"
                      : "none",
                    outline: "none",
                  }}
                  autoFocus
                />
                <label
                  htmlFor="access-code"
                  className="absolute left-4 transition-all duration-200 pointer-events-none font-mono"
                  style={{
                    top: isFocused || hasValue ? "6px" : "50%",
                    transform: isFocused || hasValue ? "none" : "translateY(-50%)",
                    fontSize: isFocused || hasValue ? "9px" : "12px",
                    color: isFocused ? "var(--violet-mist)" : "var(--ink-30)",
                    letterSpacing: isFocused || hasValue ? "0.15em" : "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  Access code
                </label>
              </div>

              {/* Error */}
              {error && (
                <p
                  className="text-center text-xs font-medium animate-slide-up"
                  style={{ color: "#ef4444" }}
                >
                  {error}
                </p>
              )}

              {/* Enter button with shimmer */}
              <button
                type="submit"
                className="relative w-full py-3 px-4 rounded-xl font-semibold tracking-widest text-white uppercase text-sm transition-all duration-300 hover:brightness-110 hover:scale-[1.02] active:scale-95 overflow-hidden"
                style={{
                  background: "var(--grad-ember-button)",
                  boxShadow: "0 4px 20px -6px var(--ember)",
                }}
              >
                {/* Shimmer pseudo-element */}
                <span
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
                    animation: "buttonShimmer 4s ease-in-out infinite",
                  }}
                />
                <span className="relative z-10">ENTER</span>
              </button>
            </form>

            {/* Footer */}
            <p
              className="text-center mt-8 font-mono"
              style={{
                fontSize: "10px",
                color: "var(--ink-30)",
                letterSpacing: "0.05em",
              }}
            >
              Secure access protected · Session persists locally
            </p>
          </div>
        </div>
      ) : (
        <WelcomeOverlay />
      )}
    </div>
  );
}

function WelcomeOverlay() {
  const router = useRouter();
  const [showFirst, setShowFirst] = useState(false);
  const [showSecond, setShowSecond] = useState(false);
  const [showFinal, setShowFinal] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowFirst(true), 800);
    const t2 = setTimeout(() => setShowSecond(true), 2400);
    const t3 = setTimeout(() => setShowFinal(true), 4200);
    const t4 = setTimeout(() => {
      router.push("/");
    }, 5500);

    return () => {
      [t1, t2, t3, t4].forEach(clearTimeout);
    };
  }, [router]);

  return (
    <div
      className="flex flex-col items-center justify-center h-full relative overflow-hidden z-10 w-full"
      style={{ background: "var(--obsidian-0)" }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, var(--violet-glow) 0%, transparent 70%)",
            filter: "blur(60px)",
            animation: "pulse-glow 3s ease-in-out infinite",
          }}
        />
      </div>

      {/* Logo Monogram */}
      <div
        className="flex items-center justify-center mb-10 animate-slide-up"
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "20px",
          background: "var(--obsidian-3)",
          border: "1px solid var(--hairline-bright)",
        }}
      >
        <img 
          src="/brand/logo.png" 
          alt="QLA" 
          className="w-16 h-16 object-contain opacity-90" 
          style={{ mixBlendMode: 'screen' }}
        />
      </div>

      {/* Typewriter Messages */}
      <div className="space-y-6 text-center max-w-2xl px-8 min-h-[160px]">
        {showFirst && (
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl font-bold tracking-tight"
            style={{ color: "var(--ink-100)", fontFamily: "'Cormorant Garamond', serif" }}
          >
            Don&apos;t negotiate with mediocrity.
          </motion.h1>
        )}
        
        {showSecond && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg md:text-xl font-light italic"
            style={{ color: "var(--ink-70)", fontFamily: "'Cormorant Garamond', serif" }}
          >
            Your goals are too small. Let&apos;s build an empire.
          </motion.p>
        )}

        {showFinal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-4 flex items-center justify-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-[var(--ember)] animate-pulse shadow-[0_0_8px_var(--ember)]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--ink-30)]">
              Entering the Vault
            </span>
          </motion.div>
        )}
      </div>

      {/* Progress Bar (Cinematic) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 5.5, ease: "linear" }}
          style={{
            height: "100%",
            background: "linear-gradient(90deg, var(--violet-mist), var(--ember), var(--violet-mist))",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.15; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.25; transform: translate(-50%, -50%) scale(1.1); }
        }
      `}</style>
    </div>
  );
}
