// lib/test-fixtures.ts
// Use these in Message.tsx Storybook or manual dev testing.
// Delete before production build.

export const TEST_MESSAGES = [
  {
    role: "assistant" as const,
    content: `Here is the reality of acquiring a company with **zero personal capital**.

You are not buying the company. You are buying **control** of the company's cash flow. The distinction matters enormously.

The sequence is:
1. Identify a business generating £2M–£10M EBITDA with an owner who wants out
2. Structure the deal so the business's own cash services the acquisition debt
3. Put in **no more than 10%** of your own money — ideally zero
4. Use OPM — Other People's Money — for the rest

> "The sign of a sophisticated deal is that the seller's own business pays for itself."

This is not creative financing. It is **standard LBO mechanics**, applied at the small-cap level where competition is lowest.

Do you want me to walk through the debt stack structure?`,
  },
  {
    role: "assistant" as const,
    content: `Your Dream Team in year one has **four seats**. No more.

- **The Operator**: runs day-to-day. Not you.
- **The CFO**: controls cash, builds reporting. Not a bookkeeper.
- **The Rainmaker**: owns revenue. Commission-only if possible.
- **The Executor**: project management, holds everyone accountable. Often you, initially.

\`\`\`
Revenue > Costs > EBITDA > Debt Service > Your Equity
\`\`\`

Everything else is overhead until you hit £5M revenue.`,
  },
];
