import React from 'react';
import { X, Trash2, Copy, Check, Bookmark, MessageSquare } from 'lucide-react';
import { Message } from '../types';
import ReactMarkdown from 'react-markdown';

interface BookmarksSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: Message[];
  onRemoveBookmark: (id: string) => void;
}

export const BookmarksSidebar: React.FC<BookmarksSidebarProps> = ({
  isOpen,
  onClose,
  bookmarks,
  onRemoveBookmark,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#fdfbf7] shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col border-l border-stone-200 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Saved Bookmarks"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200 bg-white/50">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-700" />
            <h2 className="font-serif text-xl font-bold text-stone-800">Saved Passages</h2>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {bookmarks.length}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full text-stone-500 transition-colors"
            aria-label="Close bookmarks"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {bookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-stone-400 text-center">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                <Bookmark className="w-8 h-8 opacity-50" />
              </div>
              <p className="font-medium">No bookmarks yet</p>
              <p className="text-sm mt-1 max-w-[200px]">
                Save scripture explanations or verses to access them here.
              </p>
            </div>
          ) : (
            bookmarks.map((msg) => (
              <div 
                key={msg.id} 
                className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider">
                    <MessageSquare className="w-3 h-3" />
                    {msg.role === 'user' ? 'Question' : 'Answer'}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="p-1.5 text-stone-400 hover:text-amber-700 hover:bg-stone-50 rounded-lg transition-colors"
                      title="Copy text"
                    >
                      {copiedId === msg.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => onRemoveBookmark(msg.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="text-sm text-stone-700 font-serif leading-relaxed line-clamp-6">
                  <ReactMarkdown 
                    components={{
                      // Strip styling for preview
                      p: ({children}) => <p className="mb-2">{children}</p>,
                      blockquote: ({children}) => <div className="italic text-stone-600 pl-2 border-l-2 border-amber-200 my-2">{children}</div>
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
                
                <div className="mt-3 pt-3 border-t border-stone-100 flex justify-between items-center">
                   <span className="text-[10px] text-stone-400">
                     {new Date(msg.timestamp).toLocaleDateString()}
                   </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};