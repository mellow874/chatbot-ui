// lib/motion.ts
// Sovereign Void — Motion System
// All durations in seconds (Framer Motion convention)
// All easings as cubic-bezier arrays

export const EASE_ARRIVE  = [0.15, 0, 0, 1] as const;   // quartic out — arrives fast, settles precisely
export const EASE_SMOOTH  = [0.4, 0, 0.2, 1] as const;  // material standard — for color/opacity only
export const EASE_OUT     = [0, 0, 0.2, 1]  as const;   // exits

export const DUR = {
  instant:  0.12,   // hover color changes
  fast:     0.16,   // sidebar item hover, button color
  input:    0.18,   // input border/shadow on focus
  message:  0.28,   // message entry animation — the primary rhythm
  page:     0.40,   // page-level fades (login → chat)
  stagger:  0.07,   // delay between list items
  staggerDelay: 0.20, // initial delay before stagger begins
} as const;

// CSS string versions for non-Framer elements (inline styles, CSS vars)
export const CSS_EASE_ARRIVE = "cubic-bezier(0.15, 0, 0, 1)";
export const CSS_EASE_SMOOTH = "cubic-bezier(0.4, 0, 0.2, 1)";

// Framer motion variants — reusable
export const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show:   { opacity: 1, y: 0, transition: { duration: DUR.message, ease: EASE_ARRIVE } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: DUR.page, ease: EASE_SMOOTH } },
};

export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: DUR.stagger,
      delayChildren:   DUR.staggerDelay,
    },
  },
};
