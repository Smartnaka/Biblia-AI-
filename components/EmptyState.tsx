import React from 'react';
import { ScrollText, Heart, History, Zap } from 'lucide-react';

interface EmptyStateProps {
  onSuggestionClick: (text: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSuggestionClick }) => {
  const suggestions = [
    {
      icon: <ScrollText className="w-5 h-5 text-amber-600" aria-hidden="true" />,
      title: "Theological Inquiry",
      prompt: "What is the significance of the curtain tearing in the temple?"
    },
    {
      icon: <Heart className="w-5 h-5 text-rose-600" aria-hidden="true" />,
      title: "Comfort & Peace",
      prompt: "Find me verses about anxiety and God's peace."
    },
    {
      icon: <History className="w-5 h-5 text-blue-600" aria-hidden="true" />,
      title: "Historical Context",
      prompt: "Who were the Samaritans and why were they disliked?"
    },
    {
      icon: <Zap className="w-5 h-5 text-yellow-600" aria-hidden="true" />,
      title: "Practical Application",
      prompt: "What does Proverbs say about handling money?"
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20 animate-in fade-in duration-700">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800">
            Explore the Word of God
          </h2>
          <p className="text-stone-500 text-lg max-w-lg mx-auto font-light">
            Ask questions, search for verses, or seek understanding with AI-assisted biblical retrieval.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => onSuggestionClick(suggestion.prompt)}
              className="p-4 rounded-xl border border-stone-200 bg-white hover:border-amber-300 hover:shadow-md transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label={`Ask about ${suggestion.title}: ${suggestion.prompt}`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-stone-50 group-hover:bg-amber-50 transition-colors">
                  {suggestion.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 group-hover:text-amber-800">
                    {suggestion.title}
                  </h3>
                  <p className="text-sm text-stone-500 mt-1 line-clamp-2">
                    "{suggestion.prompt}"
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};