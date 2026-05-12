"use client";

interface EmptyStateProps {
  onSuggestionClick: (suggestion: string) => void;
}

const SUGGESTIONS = [
  "How do I structure my first acquisition?",
  "What is OPM and how do I use it?",
  "Build me a Dream Team from scratch.",
];

export default function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full flex-1 px-4">
      {/* Avatar */}
      <div className="w-16 h-16 bg-gradient-to-br from-maroon to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-6">
        <span className="text-3xl font-bold text-white font-display">D</span>
      </div>

      {/* Heading */}
      <h1 className="font-display text-4xl font-bold text-center text-white mb-3">
        Ask Dan Anything.
      </h1>

      {/* Subtitle */}
      <p className="text-text-muted text-center mb-12 text-sm">
        QLA methodology • Deal structuring • High performance • OPM
      </p>

      {/* Suggestion chips */}
      <div className="space-y-3 max-w-2xl w-full">
        {SUGGESTIONS.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => onSuggestionClick(suggestion)}
            className="w-full px-6 py-3 border border-orange-500/40 text-orange-500/80 hover:bg-orange-500/10 hover:border-orange-500/60 rounded-lg transition-all duration-200 text-sm text-left font-medium"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
