/**
 * Mock Backend for QLA Chatbot
 * Used during development before the real FastAPI backend is ready
 */

export type Source = {
  title: string;
  url?: string;
  source_type: "book" | "youtube" | "website";
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const DAN_PENA_RESPONSES = [
  {
    keywords: ["acquisition", "deal", "first", "structure"],
    response: `The key to your first acquisition is understanding OPM—Other People's Money. Here's the framework:

**Phase 1: Preparation**
- Build your dream team: lawyer, accountant, banker, advisor
- Create a 100-page business plan. Don't skip this.
- Pre-qualify your buyer or seller

**Phase 2: The Deal Structure**
- Use leverage: 80% debt, 20% equity is your target
- Seller financing is your friend—they have confidence in their business
- Structure: asset purchase > stock purchase (always)

**Phase 3: Execution**
- Due diligence takes 90 days minimum
- Lock the price before due diligence (not after)
- Control is more important than ownership

Your first deal will be small. That's OK. Each deal teaches you. The second deal is 2x the size. The third is 10x. This is how empires are built.

What industry are you targeting?`,
    sources: [
      { title: "Your First 100 Million (Ch. 3)", source_type: "book", url: "https://example.com" },
      {
        title: "YouTube: How to Structure Your First Deal",
        source_type: "youtube",
        url: "https://youtube.com",
      },
      { title: "QLA Deal Framework", source_type: "website", url: "https://danpena.co.uk" },
    ],
  },
  {
    keywords: ["opm", "leverage", "money"],
    response: `OPM is the acceleration pedal of business. Most people are broke because they think they need their own money to do deals. Wrong.

**The OPM Hierarchy:**
1. **Supplier financing** - your vendor floats the inventory
2. **Customer pre-payment** - they pay before you deliver
3. **Seller financing** - the owner carries a note
4. **Bank debt** - requires 20% down, covenants
5. **Equity** - most expensive, most dilutive (use last)

**Why OPM Wins:**
- You control $10M in assets with $2M (yours + others)
- Returns are calculated on YOUR capital, not the asset value
- Risk is spread across multiple capital sources

**The Rule:** If you're using your own money, the deal is too small.

Document everything. Create a private placement memorandum (PPM). Show credibility through proper structure. This is how you go from employee to entrepreneur.`,
    sources: [
      { title: "The 10-Week Plan to $1M (Module 2)", source_type: "book" },
      {
        title: "YouTube: OPM Masterclass",
        source_type: "youtube",
      },
      { title: "Private Capital Sources Guide", source_type: "website" },
    ],
  },
  {
    keywords: ["dream team", "board", "advisor", "build"],
    response: `Your dream team is the difference between a $1M company and a $1B company.

**The Core 5:**
1. **Legal Eagle** - M&A attorney with deal experience (not a real estate lawyer)
2. **Bean Counter** - CPA with acquisition expertise, not just taxes
3. **Banker** - relationship manager who understands leverage, not just deposits
4. **Advisor** - someone who's built $100M+ before (your mentor)
5. **CFO** - in-house after you hit $10M revenue

**Where to Find Them:**
- Ask your accountant for referrals (they know everyone)
- Join industry groups and chambers
- Look for people who've failed before—they learn faster
- Equity is your lever—offer 0.5% of each deal for performance

**The Rule:** You'll spend 40% of your time managing your team. Build it right.

Who are the first two people you're going to recruit?`,
    sources: [
      { title: "Billionaire Boot Camp (Week 2)", source_type: "book" },
      { title: "YouTube: Building Your Inner Circle", source_type: "youtube" },
      { title: "Advisor Network Database", source_type: "website" },
    ],
  },
];

const LARRETH_PROFILE = `Larreth Jimu
CEO, Melsoft Holdings

Background:
- Founded Melsoft Holdings in 2018
- Portfolio: Software development, real estate, e-commerce
- 3 successful exits totaling $45M+
- Current focus: African tech expansion and private equity

Current Situation:
- Managing $250M AUM across 12 companies
- Building a holding company structure (HoldCo) for tax efficiency
- Expanding into AI and automation (your division)
- Board: 5 members including 2 institutional investors

Capital Structure:
- $45M working capital ($18M in equity, $27M in debt)
- Target leverage ratio: 2.5x EBITDA
- Capital costs: 6% (debt), 22% (equity)

Recent Deals:
- Q2 2024: Acquired logistics startup for $12M (8x leverage)
- Q3 2024: Led $8M Series A for AI tools company
- Q4 2024: Refinancing $15M in maturing debt at 5.8%

Goals for Next 24 Months:
- Acquire 2 companies >$20M revenue each
- Build Melsoft's own AI product (this project)
- Target: $500M AUM by end of 2025
- Exit at least 1 portfolio company at 4x MOIC

Challenges:
- Debt refinancing cycle (15% of portfolio due in 12 months)
- Finding acquisition targets with >30% EBITDA margins
- Retaining technical talent across remote teams`;

/**
 * Mock chat response with streaming simulation
 */
export async function mockChat(
  message: string,
  conversationHistory?: ChatMessage[]
): Promise<ReadableStream<Uint8Array>> {
  // Find matching response based on keywords
  let selectedResponse =
    DAN_PENA_RESPONSES.find((r) => r.keywords.some((k) => message.toLowerCase().includes(k))) ||
    DAN_PENA_RESPONSES[Math.floor(Math.random() * DAN_PENA_RESPONSES.length)];

  // Return a ReadableStream that simulates streaming
  return new ReadableStream((controller) => {
    let charIndex = 0;
    const fullResponse = selectedResponse.response;

    const streamChunk = () => {
      // Send 3-5 characters at a time
      const chunkSize = Math.random() > 0.5 ? 4 : 5;
      const chunk = fullResponse.slice(charIndex, charIndex + chunkSize);

      if (chunk.length === 0) {
        // Send sources when done
        const sourcesData = {
          done: true,
          sources: selectedResponse.sources,
        };
        const data = `data: ${JSON.stringify(sourcesData)}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));
        controller.close();
        return;
      }

      const data = `data: ${JSON.stringify({ message: chunk })}\n\n`;
      controller.enqueue(new TextEncoder().encode(data));
      charIndex += chunkSize;

      // Simulate variable streaming speed (40-80ms between chunks)
      setTimeout(streamChunk, Math.random() * 40 + 40);
    };

    streamChunk();
  });
}

/**
 * Mock get profile
 */
export async function mockGetProfile(): Promise<{ profile_text: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ profile_text: LARRETH_PROFILE });
    }, 300);
  });
}

/**
 * Mock put profile
 */
export async function mockPutProfile(profileText: string): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Profile saved:", profileText.slice(0, 50) + "...");
      resolve({ success: true });
    }, 500);
  });
}
