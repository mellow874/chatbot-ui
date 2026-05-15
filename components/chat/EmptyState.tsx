"use client";

import { motion } from "framer-motion";

interface EmptyStateProps {
  onSuggestionClick: (suggestion: string) => void;
}

const SUGGESTIONS = [
  {
    label: "01 / DEAL STRUCTURING",
    question: "How do I structure my first acquisition?",
  },
  {
    label: "02 / CAPITAL",
    question: "What is OPM and how do I use it?",
  },
  {
    label: "03 / TEAM",
    question: "Build me a Dream Team from scratch.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3 + i * 0.08,
      duration: 0.32,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

const headingVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export default function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full flex-1 px-4">
      {/* Vertical ember line — ritual mark */}
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: "2px",
          height: "40px",
          background: "var(--ember)",
          boxShadow: "0 0 12px var(--ember)",
          marginBottom: "24px",
          transformOrigin: "top",
        }}
      />

      {/* Heading */}
      <motion.h1
        className="font-display text-center font-semibold mb-3"
        style={{
          fontSize: "clamp(36px, 5vw, 52px)",
          letterSpacing: "-0.02em",
          color: "var(--ink-100)",
          lineHeight: 1.1,
        }}
        variants={headingVariants}
        initial="hidden"
        animate="visible"
      >
        What&apos;s the deal?
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-center mb-12 text-sm"
        style={{ color: "var(--ink-50)", maxWidth: "420px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        Ask Dan anything. Deal flow, OPM, Dream Team, QLA fundamentals.
      </motion.p>

      {/* Suggestion cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl w-full">
        {SUGGESTIONS.map((suggestion, idx) => (
          <motion.button
            key={idx}
            custom={idx}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            onClick={() => onSuggestionClick(suggestion.question)}
            className="group relative text-left rounded-xl transition-all duration-200 overflow-hidden"
            style={{
              background: "var(--obsidian-2)",
              border: "1px solid var(--hairline)",
              padding: "16px 20px",
            }}
            whileHover={{
              y: -2,
              transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--hairline-bright)";
              e.currentTarget.style.boxShadow =
                "0 8px 32px -12px rgba(124, 58, 237, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--hairline)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Mono label */}
            <div
              className="font-mono text-[8px] uppercase mb-2"
              style={{
                letterSpacing: "0.15em",
                color: "var(--ink-30)",
              }}
            >
              {suggestion.label}
            </div>

            {/* Question + arrow */}
            <div className="flex items-center justify-between gap-2">
              <span
                className="text-sm leading-snug"
                style={{ color: "var(--ink-100)" }}
              >
                {suggestion.question}
              </span>
              <span
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0 translate-x-2 group-hover:translate-x-0"
                style={{ color: "var(--ink-50)" }}
              >
                →
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
