"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

const QLA_STEPS = [
  {
    id: 1,
    title: "Set Your Quantum Leap Goal",
    description: "A goal so unrealistic it forces you to become someone new. 100x, not 10%. If your goal doesn't scare you, it's too small."
  },
  {
    id: 2,
    title: "Build a Dream Team",
    description: "Surround yourself with people 10x more accomplished than you. A board of advisors who've already done what you're trying to do. Mentors over books."
  },
  {
    id: 3,
    title: "Master the QLA Mindset",
    description: "High performance isn't motivation — it's identity, standards, and refusing to negotiate with mediocrity. You become what you tolerate."
  },
  {
    id: 4,
    title: "Identify the Right Industry",
    description: "Fragmented, boring, cash-flowing, ripe for roll-up. Avoid sexy. The best deals are in industries nobody on Twitter is talking about."
  },
  {
    id: 5,
    title: "Find & Structure Deals",
    description: "LOIs, due diligence, deal structure, negotiation. The art of the acquisition. You send 100 LOIs to close 1 deal — that's the game."
  },
  {
    id: 6,
    title: "Use OPM (Other People's Money)",
    description: "Banks, DFIs, seller financing, earn-outs. Your money is the worst money to use. Leverage other people's capital to build your empire."
  },
  {
    id: 7,
    title: "Execute & Scale",
    description: "Integration, operational excellence, then exit or compound. Execution is everything — strategy without execution is hallucination."
  }
];

export default function QLAJourney() {
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null);
  const [hoveredStepId, setHoveredStepId] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const router = useRouter();
  
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();

  // ── Orbit Behavior ──────────────────────────────────────────────────
  useEffect(() => {
    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const shouldRotate = !isHovering && !selectedStepId && !isReduced;

      if (shouldRotate) {
        // 60s per rev = 360deg / 60000ms = 0.006 deg/ms
        setRotation((prev) => (prev + 0.006 * deltaTime) % 360);
      }
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isHovering, selectedStepId]);

  // ── Responsive Scaling ──────────────────────────────────────────────
  const [dimensions, setDimensions] = useState({ radius: 240, nodeSize: 48 });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setDimensions({ radius: 140, nodeSize: 40 });
      } else {
        setDimensions({ radius: 240, nodeSize: 48 });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { radius, nodeSize } = dimensions;
  const activeStep = QLA_STEPS.find(s => s.id === selectedStepId);

  return (
    <div 
      className="relative w-full h-[600px] flex items-center justify-center overflow-visible"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Background glow blob */}
      <div 
        className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none"
        style={{ background: "var(--violet-glow)", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
      />

      {/* Orbit ring */}
      <div 
        className="absolute rounded-full border border-[var(--hairline-bright)] pointer-events-none"
        style={{ 
          width: radius * 2, 
          height: radius * 2, 
          boxShadow: "0 0 40px rgba(124, 58, 237, 0.08)" 
        }}
      />

      {/* Center node */}
      <div className="relative z-10">
        <div 
          className="w-20 h-20 rounded-2xl bg-[var(--obsidian-3)] border border-[var(--hairline-bright)] flex items-center justify-center shadow-[0_0_50px_-10px_rgba(124,58,237,0.3)]"
        >
          <img 
            src="/brand/logo.png" 
            alt="QLA" 
            className="w-14 h-14 object-contain opacity-90" 
            style={{ mixBlendMode: 'screen' }}
          />
        </div>
      </div>

      {/* Orbiting nodes */}
      {QLA_STEPS.map((step, index) => {
        const stepAngle = (index / QLA_STEPS.length) * Math.PI * 2;
        const currentAngle = stepAngle + (rotation * Math.PI) / 180;
        const x = Math.cos(currentAngle) * radius;
        const y = Math.sin(currentAngle) * radius;
        
        const isHovered = hoveredStepId === step.id;
        const isActive = selectedStepId === step.id;

        return (
          <div
            key={step.id}
            className="absolute z-20"
            style={{ 
              left: `calc(50% + ${x}px - ${nodeSize/2}px)`, 
              top: `calc(50% + ${y}px - ${nodeSize/2}px)`,
              width: nodeSize,
              height: nodeSize
            }}
          >
            <motion.button
              className="w-full h-full rounded-full flex items-center justify-center transition-all duration-200"
              style={{ 
                background: "var(--obsidian-3)",
                border: "1px solid var(--hairline-bright)",
                borderColor: isActive 
                  ? "var(--ember)" 
                  : isHovered 
                    ? "rgba(167, 139, 250, 0.5)" 
                    : "var(--hairline-bright)",
                boxShadow: isActive
                  ? "0 0 24px var(--ember)"
                  : isHovered
                    ? "0 0 24px rgba(124, 58, 237, 0.4)"
                    : "none",
                transform: isHovered ? "scale(1.18)" : "scale(1)"
              }}
              onMouseEnter={() => setHoveredStepId(step.id)}
              onMouseLeave={() => setHoveredStepId(null)}
              onClick={() => setSelectedStepId(step.id)}
            >
              <span 
                className="font-display text-lg transition-colors duration-200"
                style={{ 
                  color: (isHovered || isActive) ? "var(--ink-100)" : "var(--ink-70)",
                  fontFamily: "'Cormorant Garamond', serif"
                }}
              >
                {step.id}
              </span>

              {/* Stub for Step 5 session progress */}
              {step.id === 5 && (
                <div 
                  className="absolute -top-0.5 -right-0.5 w-[4px] h-[4px] rounded-full bg-[var(--ember)]" 
                  style={{ boxShadow: "0 0 6px var(--ember)" }}
                />
              )}
            </motion.button>

            {/* Hover label */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 4, x: "-50%" }}
                  animate={{ opacity: 1, y: 0, x: "-50%" }}
                  exit={{ opacity: 0, y: 4, x: "-50%" }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-full left-1/2 mt-3 pointer-events-none whitespace-nowrap z-30"
                >
                  <div 
                    className="px-3 py-1.5 rounded-lg border border-[var(--hairline)]"
                    style={{ 
                      background: "rgba(12, 10, 20, 0.85)", 
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)"
                    }}
                  >
                    <span 
                      className="font-display text-sm font-medium"
                      style={{ color: "var(--ink-100)", fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {step.title}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* ── Step Dialog ────────────────────────────────────────────────── */}
      <Dialog open={!!selectedStepId} onOpenChange={(open) => !open && setSelectedStepId(null)}>
        <DialogContent 
          className="max-w-[520px] bg-[var(--obsidian-2)] border-[var(--hairline-bright)] rounded-[20px] p-8 focus:outline-none"
          style={{
            boxShadow: "0 0 0 1px rgba(124, 58, 237, 0.15), 0 24px 80px -16px rgba(124, 58, 237, 0.3)"
          }}
        >
          {activeStep && (
            <>
              <div className="flex flex-col">
                <span 
                  className="font-mono text-[11px] uppercase tracking-[0.2em] mb-4"
                  style={{ color: "var(--ink-30)" }}
                >
                  STEP 0{activeStep.id} / 07
                </span>

                {/* Ritual mark */}
                <div 
                  className="w-[2px] h-8 bg-[var(--ember)] mb-3"
                  style={{ boxShadow: "0 0 12px var(--ember)" }}
                />

                <DialogTitle 
                  className="text-[28px] font-semibold leading-tight mb-4"
                  style={{ 
                    fontFamily: "'Cormorant Garamond', serif",
                    letterSpacing: "-0.015em",
                    color: "var(--ink-100)"
                  }}
                >
                  {activeStep.title}
                </DialogTitle>

                <DialogDescription 
                  className="text-[15px] leading-relaxed"
                  style={{ color: "var(--ink-70)", fontFamily: "'DM Sans', sans-serif" }}
                >
                  {activeStep.description}
                </DialogDescription>

                <div 
                  className="w-full h-px my-6"
                  style={{ background: "var(--hairline)" }}
                />

                <button
                  onClick={() => {
                    // TODO: ChatArea should read ?seed= query param and seed the first message
                    router.push(`/?seed=step-${activeStep.id}`);
                    setSelectedStepId(null);
                  }}
                  className="w-full py-3 px-4 rounded-xl font-semibold tracking-[0.05em] uppercase text-sm transition-all duration-300 hover:brightness-110 active:scale-[0.98] text-white"
                  style={{ background: "var(--grad-ember-button)" }}
                >
                  Start a session on this →
                </button>

                <button
                  onClick={() => {
                    // TODO: View related conversations implementation
                  }}
                  className="mt-4 text-[12px] text-[var(--ink-50)] hover:text-[var(--ink-100)] hover:underline transition-all duration-200 text-center"
                >
                  View related conversations
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
