import React, { useState } from 'react';
import { X, FileText, Copy, Check, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: string;
  isLoading: boolean;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  isOpen,
  onClose,
  summary,
  isLoading,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="summary-title"
      >
        <div className="bg-[#fdfbf7] w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white/50 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-800">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 id="summary-title" className="font-serif text-xl font-bold text-stone-800">Conversation Summary</h2>
                <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">Key Theological Points</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-600 transition-colors"
              aria-label="Close summary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4 text-stone-400">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                <p className="text-sm font-medium">Synthesizing conversation...</p>
              </div>
            ) : (
              <div className="prose prose-stone prose-base max-w-none font-serif prose-headings:font-bold prose-headings:text-stone-800 prose-p:text-stone-700 prose-a:text-amber-700 prose-strong:text-amber-900">
                <ReactMarkdown>
                  {summary}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Footer */}
          {!isLoading && (
            <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 rounded-b-2xl flex justify-end">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 hover:border-amber-300 text-stone-700 rounded-lg shadow-sm transition-all active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span className="text-sm font-semibold">{copied ? 'Copied' : 'Copy Summary'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};