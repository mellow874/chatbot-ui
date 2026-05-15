"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authenticate } from "@/lib/auth";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import VoidShader from "@/components/ui/VoidShader";
import Image from "next/image";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showWelcome, setShowWelcome]   = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("qla_authenticated") === "true") router.push("/");
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) { setError("Enter your access code."); return; }
    if (password !== process.env.NEXT_PUBLIC_APP_PASSWORD) {
      setError("Access denied. Invalid code.");
      setIsShaking(true);
      setShakeCount(c => c + 1);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    authenticate(password);
    setError("");
    setShowWelcome(true);
  };

  if (showWelcome) return <WelcomeOverlay />;

  return (
    <div
      className="relative w-screen h-screen flex overflow-hidden"
      style={{ background: "var(--void)" }}
    >
      {/* Shader background — full bleed */}
      <VoidShader className="absolute inset-0 z-0 opacity-100" />

      {/* ── LEFT PANEL — 38.2% — the statement ── */}
      <div
        className="hidden lg:flex z-10 flex-col justify-between p-12"
        style={{
          width: "38.2%",
          maxWidth: "560px",
          borderRight: "1px solid var(--border-ghost)",
          background: "rgba(3,3,5,0.45)",
          backdropFilter: "blur(24px)",
        }}
      >
        <div>
          <p className="type-label" style={{ color: "var(--text-ghost)" }}>MELSOFT HOLDINGS</p>
        </div>

        {/* The statement */}
        <div>
          <p
            className="type-display-italic"
            style={{
              fontFamily: "var(--font-display, 'Cormorant', Georgia, serif)",
              fontStyle: "italic",
              fontSize: "clamp(3rem, 4.5vw, 5.5rem)",
              fontWeight: 300,
              color: "var(--bone)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            Make it right.
            <br />
            <span style={{ color: "var(--text-secondary)" }}>
              Make it inevitable.
            </span>
          </p>
          <div
            className="mt-6 rule-violet"
            style={{ width: "80px" }}
          />
          <p
            className="type-mono text-[11px] mt-4"
            style={{ color: "var(--text-muted)", lineHeight: 1.6 }}
          >
            Dan Peña · Quantum Leap Advantage
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full animate-live-ring"
            style={{ background: "var(--signal)" }}
          />
          <p className="type-label" style={{ fontSize: "8px" }}>PRIVATE TERMINAL</p>
        </div>
      </div>

      {/* ── RIGHT PANEL — 61.8% — the gate ── */}
      <div
        className="flex-1 flex items-center justify-center z-10 px-8"
        style={{ background: "rgba(3,3,5,0.6)", backdropFilter: "blur(8px)" }}
      >
        <div
          key={`shake-${shakeCount}`}
          className={`w-full max-w-sm ${isShaking ? "animate-shake" : ""}`}
        >

          {/* Mobile brand */}
          <div className="mb-10 lg:hidden">
            <p
              className="type-display-italic text-3xl"
              style={{
                fontFamily: "var(--font-display, 'Cormorant', Georgia, serif)",
                fontStyle: "italic",
                fontWeight: 300,
                color: "var(--bone)",
              }}
            >
              QLA Mentor
            </p>
            <p className="type-label mt-1">MELSOFT HOLDINGS</p>
          </div>

          {/* Section label */}
          <p className="type-label mb-6" style={{ color: "var(--text-ghost)" }}>
            SECURE ACCESS
          </p>

          <h2
            style={{
              fontFamily: "var(--font-display, 'Cormorant', Georgia, serif)",
              fontSize: "2.25rem",
              fontWeight: 300,
              color: "var(--bone)",
              letterSpacing: "-0.01em",
              lineHeight: 1.1,
              marginBottom: "0.5rem",
            }}
          >
            Welcome back.
          </h2>
          <p
            className="text-sm mb-8"
            style={{ color: "var(--text-muted)" }}
          >
            Enter your private access code to continue.
          </p>

          <form onSubmit={handleLogin} className="space-y-3">
            {/* Password */}
            <div
              className={`surface-input flex items-center gap-3 px-4 h-13 transition-all duration-180`}
              style={{ 
                borderRadius: "6px", 
                height: "52px",
                borderColor: isFocused ? "var(--border-hot)" : "var(--border-subtle)",
                boxShadow: isFocused ? "0 0 0 3px var(--violet-dim), 0 0 24px var(--violet-glow)" : "none",
              }}
            >
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Access code"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoFocus
                className="flex-1 bg-transparent outline-none text-sm"
                style={{
                  color: "var(--bone)",
                  caretColor: "var(--violet)",
                  fontFamily: "inherit",
                  fontSize: "14px",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ color: "var(--text-muted)", flexShrink: 0 }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--bone-dim)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)")}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2 px-4 py-2.5 text-xs animate-enter-fade"
                style={{
                  background: "rgba(255,59,59,0.06)",
                  border: "1px solid rgba(255,59,59,0.18)",
                  borderRadius: "6px",
                  color: "var(--danger)",
                  fontFamily: "var(--font-mono, monospace)",
                  letterSpacing: "0.02em",
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full h-[52px] text-sm font-medium tracking-[0.08em] transition-all duration-150"
              style={{
                background: "var(--violet)",
                color: "white",
                borderRadius: "6px",
                border: "none",
                fontFamily: "var(--font-mono, monospace)",
                letterSpacing: "0.12em",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.88")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
            >
              ENTER
            </button>
          </form>

          <p
            className="type-label text-center mt-8"
            style={{ color: "var(--text-ghost)", fontSize: "8px" }}
          >
            SESSION LOCAL · SSL SECURED
          </p>
        </div>
      </div>
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
      style={{ background: "var(--void)" }}
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
        className="flex items-center justify-center mb-10 animate-enter-fade"
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "20px",
          background: "var(--void-3)",
          border: "1px solid var(--border-ghost)",
        }}
      >
        <Image 
          src="/brand/logo.png" 
          alt="QLA" 
          width={64}
          height={64}
          className="object-contain opacity-90" 
          style={{ mixBlendMode: 'screen' }}
        />
      </div>

      {/* Typewriter Messages */}
      <div className="space-y-6 text-center max-w-2xl px-8 min-h-[160px]">
        {showFirst && (
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display-italic text-4xl md:text-5xl tracking-tight"
            style={{ color: "var(--bone)", fontFamily: "var(--font-display, 'Cormorant', Georgia, serif)" }}
          >
            Don&apos;t negotiate with mediocrity.
          </motion.h1>
        )}
        
        {showSecond && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg md:text-xl font-light italic"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-display, 'Cormorant', Georgia, serif)" }}
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
            <div className="w-2 h-2 rounded-full animate-live-ring" style={{ background: "var(--signal)" }} />
            <span className="type-label uppercase tracking-[0.3em] text-[var(--text-muted)]">
              Entering the Vault
            </span>
          </motion.div>
        )}
      </div>

      {/* Progress Bar (Cinematic) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{ background: "var(--border-ghost)" }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 5.5, ease: "linear" }}
          style={{
            height: "100%",
            background: "linear-gradient(90deg, var(--violet-dim), var(--violet), var(--violet-dim))",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.15; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.25; transform: translate(-50%, -50%) scale(1.1); }
        }
      `}</style>
    </div>
  );
}
