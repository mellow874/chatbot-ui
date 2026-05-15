"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/motion";

interface EmptyStateProps {
  onSuggestionClick: (s: string) => void;
}

const SUGGESTIONS = [
  {
    n: "01",
    q: "How do I structure my first acquisition with zero personal capital?",
    tag: "DEAL MECHANICS",
  },
  {
    n: "02",
    q: "What does OPM actually mean, and how do I deploy it?",
    tag: "CAPITAL STRATEGY",
  },
  {
    n: "03",
    q: "How do I find and evaluate undervalued companies?",
    tag: "DEAL FLOW",
  },
  {
    n: "04",
    q: "What should a Dream Team look like in year one?",
    tag: "PEOPLE & CULTURE",
  },
];

export default function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-start justify-center h-full flex-1 px-6 py-12 max-w-2xl mx-auto w-full">

      {/* Opening line */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.15,0,0,1] }}
        className="mb-1"
      >
        <p className="type-label">DAN PEÑA · QLA METHODOLOGY</p>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.15,0,0,1], delay: 0.06 }}
        className="type-display-italic"
        style={{
          fontFamily: "var(--font-display, 'Cormorant', Georgia, serif)",
          fontStyle: "italic",
          fontSize: "clamp(2.6rem, 5vw, 4rem)",
          fontWeight: 300,
          color: "var(--bone)",
          lineHeight: 1.08,
          letterSpacing: "-0.01em",
          marginBottom: "0",
        }}
      >
        Ask Dan
        <br />
        <span style={{ color: "var(--text-secondary)" }}>anything.</span>
      </motion.h1>

      {/* Divider */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.15,0,0,1], delay: 0.22 }}
        style={{
          transformOrigin: "left",
          height: "1px",
          width: "100%",
          background: "var(--border-subtle)",
          margin: "2.5rem 0",
        }}
      />

      {/* Briefing entries */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="w-full space-y-0"
      >
        {SUGGESTIONS.map(({ n, q, tag }) => (
          <motion.button
            key={n}
            variants={fadeUp}
            onClick={() => onSuggestionClick(q)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(null)}
            className="w-full flex items-baseline gap-5 py-4 text-left group"
            style={{
              borderBottom: "1px solid var(--border-ghost)",
              transition: "border-color 160ms ease",
              borderBottomColor: hovered === n ? "var(--border-violet)" : "var(--border-ghost)",
            }}
          >
            {/* Number */}
            <span
              className="type-mono flex-shrink-0"
              style={{
                fontSize: "13px",
                color: hovered === n ? "var(--violet-text)" : "var(--text-ghost)",
                transition: "color 160ms ease",
                minWidth: "24px",
                userSelect: "none",
              }}
            >
              {n}
            </span>

            {/* Question */}
            <div className="flex-1 min-w-0">
              <p
                className="text-[14px] leading-snug"
                style={{
                  color: hovered === n ? "var(--bone)" : "var(--text-secondary)",
                  fontWeight: 400,
                  transition: "color 160ms ease",
                }}
              >
                {q}
              </p>
            </div>

            {/* Tag */}
            <span
              className="type-label flex-shrink-0"
              style={{
                color: hovered === n ? "var(--violet-text)" : "var(--text-ghost)",
                transition: "color 160ms ease",
                fontSize: "8px",
              }}
            >
              {tag}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
