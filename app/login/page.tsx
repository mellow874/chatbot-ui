"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authenticate } from "@/lib/auth";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated
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

    // Success - authenticate and show welcome
    authenticate(password);
    setError("");
    setShowWelcome(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#720075] to-[#5e0743]">
      {/* Animated background glow */}
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-radial from-orange-600 to-transparent opacity-20 blur-3xl -translate-x-1/2 pointer-events-none" />

      {!showWelcome ? (
        <div className="flex items-center justify-center h-full">
          {/* Login Card */}
          <div
            className={`w-full max-w-md px-8 py-12 rounded-lg backdrop-blur-xl border border-orange-500/20 shadow-2xl transition-all duration-300 ${
              isShaking ? "animate-shake" : ""
            }`}
            style={{
              background: "rgba(10, 23, 51, 0.6)",
              boxShadow:
                "0 0 80px rgba(114, 0, 117, 0.3), 0 0 20px rgba(255, 115, 0, 0.1)",
            }}
          >
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-4xl font-bold text-white font-display">M</span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent mb-8" />

            {/* Heading */}
            <h1 className="text-center font-display text-3xl font-bold text-white mb-2">
              The Trillion Dollar Mentor
            </h1>
            <p className="text-center text-text-muted mb-8 text-sm tracking-wide">
              Private access — Melsoft Holdings
            </p>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter access code"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="w-full bg-[#1a1a2e] text-white placeholder-text-dim border-b-2 border-orange-500 px-0 py-3 focus:outline-none transition-shadow duration-200 focus:shadow-lg focus:shadow-orange-500/30 font-medium tracking-wide"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center font-medium">{error}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-sm font-semibold tracking-widest text-white uppercase text-sm transition-all duration-300 hover:brightness-110 hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #ff7300 0%, #cc5a00 100%)",
                }}
              >
                ENTER
              </button>
            </form>

            {/* Footer hint */}
            <p className="text-center text-text-dim text-xs mt-8">
              Secure access protected • Session persists locally
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
  const [step, setStep] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Step 0: Show logo + name (0-1.5s)
    // Step 1: Show subtitle line 1 (1.5-2.7s)
    // Step 2: Show subtitle line 2 (2.7-3.8s)
    // Step 3: Show progress bar (0-3.5s)
    // At 3.5s: transition to chat

    const timer1 = setTimeout(() => setStep(1), 1500);
    const timer2 = setTimeout(() => setStep(2), 2700);
    const timer3 = setTimeout(() => {
      router.push("/");
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-[#0a0a0a] via-[#720075] to-[#5e0743] relative overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-purple-600 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
          style={{
            animation: "pulse 3s ease-in-out infinite",
          }}
        />
      </div>

      {/* Logo */}
      <div
        className="w-24 h-24 bg-gradient-to-br from-orange-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg mb-12 animate-fade-in"
        style={{
          animation: "slideUp 0.6s ease-out",
        }}
      >
        <span className="text-4xl font-bold text-white font-display">M</span>
      </div>

      {/* Main text */}
      <h1
        className="text-5xl font-display font-bold text-center text-white mb-8 px-4"
        style={{
          animation: step >= 0 ? "slideUp 0.8s ease-out 0.3s forwards" : "none",
          opacity: step >= 0 ? 1 : 0,
        }}
      >
        Welcome back, Mr. Larreth.
      </h1>

      {/* Subtitle lines with typewriter effect */}
      <div className="space-y-3 text-center mb-16 max-w-xl px-4">
        <p
          className="text-lg font-light text-text-muted whitespace-nowrap overflow-hidden"
          style={{
            animation:
              step >= 1
                ? "typewriter 1.2s steps(40) forwards, slideUp 0.6s ease-out 0.5s forwards"
                : "none",
            opacity: step >= 1 ? 1 : 0,
            borderRight: step >= 1 ? "2px solid var(--orange)" : "none",
          }}
        >
          The Trillion Dollar Man is waiting for you.
        </p>
        <p
          className="text-lg font-light text-text-muted whitespace-nowrap overflow-hidden"
          style={{
            animation:
              step >= 2
                ? "typewriter 1.2s steps(40) forwards, slideUp 0.6s ease-out 0.5s forwards"
                : "none",
            opacity: step >= 2 ? 1 : 0,
            borderRight: step >= 2 ? "2px solid var(--orange)" : "none",
          }}
        >
          Pour yourself a coffee. Let's build an empire.
        </p>
      </div>

      {/* Loading bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent">
        <div
          style={{
            width: "0%",
            height: "100%",
            background: "linear-gradient(90deg, transparent, #ff7300, transparent)",
            animation: "fillBar 3.5s ease-out forwards",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes typewriter {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        @keyframes fillBar {
          to {
            width: 100%;
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}
