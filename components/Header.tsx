
import React from 'react';
import { BookOpen, ChevronDown, Plus, Bookmark, FileText, WifiOff } from 'lucide-react';
import { BibleVersion } from '../types';

interface HeaderProps {
  version: BibleVersion;
  onVersionChange: (version: BibleVersion) => void;
  onNewChat: () => void;
  onToggleBookmarks: () => void;
  onSummarize: () => void;
  hasMessages: boolean;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  version, 
  onVersionChange, 
  onNewChat, 
  onToggleBookmarks,
  onSummarize,
  hasMessages,
  isOnline
}) => {
  return (
    <header 
      className="relative z-20 bg-white/80 backdrop-blur-md border-b border-stone-200 shadow-sm"
      role="banner"
    >
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
        {/* Logo & Title */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-bible-gold/10 p-1.5 sm:p-2 rounded-lg" aria-hidden="true">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700" />
          </div>
          <div>
            <h1 className="font-serif text-lg sm:text-2xl font-bold text-stone-800 tracking-tight leading-none">Biblia AI</h1>
            <p className="text-[10px] sm:text-xs text-stone-500 font-medium uppercase tracking-wider hidden sm:block">Scripture Intelligence</p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          
          {/* Offline Indicator */}
          {!isOnline && (
             <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-stone-100 border border-stone-200 rounded text-[10px] font-bold uppercase tracking-wide text-stone-500" title="Offline Mode">
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
             </div>
          )}

          {/* Summarize Button - Only show if there are messages */}
          {hasMessages && (
            <button
              onClick={onSummarize}
              disabled={!isOnline}
              className="flex p-2 text-stone-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors relative focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
              title={isOnline ? "Summarize Conversation" : "Summarize unavailable offline"}
              aria-label="Summarize Conversation"
            >
              <FileText className="w-5 h-5" />
            </button>
          )}

          {/* Bookmarks Button */}
          <button
            onClick={onToggleBookmarks}
            className="p-2 text-stone-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors relative focus:outline-none focus:ring-2 focus:ring-amber-500"
            title="View Saved Bookmarks"
            aria-label="View Saved Bookmarks"
          >
            <Bookmark className="w-5 h-5" />
          </button>

          <div className="w-px h-5 sm:h-6 bg-stone-200 mx-0.5 hidden sm:block" />

          {/* New Chat Button */}
          <button 
            onClick={onNewChat}
            className="flex items-center gap-2 px-3 py-2 sm:px-3 sm:py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-50 rounded-lg transition-all shadow-sm active:scale-95 group focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
            title="Start a new conversation"
            aria-label="Start a new conversation and clear history"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" aria-hidden="true" />
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-wide">New Chat</span>
          </button>

          {/* Bible Version Selector */}
          <div className="relative group">
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-stone-50 hover:bg-stone-100 rounded-lg border border-stone-200 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-amber-500/50">
              <span className="hidden sm:inline text-xs font-bold text-stone-600 uppercase tracking-wide" id="version-label">Version:</span>
              <select 
                value={version}
                onChange={(e) => onVersionChange(e.target.value as BibleVersion)}
                className="appearance-none bg-transparent border-none p-0 text-sm font-serif font-semibold text-amber-800 focus:ring-0 cursor-pointer pr-3 sm:pr-4 focus:outline-none"
                aria-labelledby="version-label"
                aria-label="Select Bible Translation"
              >
                {Object.values(BibleVersion).map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-stone-400 absolute right-0.5 sm:right-3 pointer-events-none" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Offline Banner */}
      {!isOnline && (
        <div className="sm:hidden bg-stone-100 border-t border-stone-200 py-1 px-2 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wide text-stone-500">
          <WifiOff className="w-3 h-3" />
          <span>Offline Mode</span>
        </div>
      )}
    </header>
  );
};
