
import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { MessageBubble } from './components/MessageBubble';
import { InputArea } from './components/InputArea';
import { EmptyState } from './components/EmptyState';
import { BookmarksSidebar } from './components/BookmarksSidebar';
import { SummaryModal } from './components/SummaryModal';
import { initializeChat, sendMessageStream, resetChat, generateChatSummary } from './services/geminiService';
import { Message, BibleVersion } from './types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY_MESSAGES = 'biblia_ai_messages';
const STORAGE_KEY_VERSION = 'biblia_ai_version';
const STORAGE_KEY_BOOKMARKS = 'biblia_ai_bookmarks';

const getFriendlyErrorMessage = (error: unknown): string => {
  const msg = error instanceof Error ? error.message : String(error);
  const lowerMsg = msg.toLowerCase();

  if (lowerMsg.includes('fetch failed') || lowerMsg.includes('network') || lowerMsg.includes('offline')) {
    return "⚠️ **Connection Error**\n\nI couldn't connect to the internet to retrieve scripture data. Please check your network connection and try again.";
  }
  if (lowerMsg.includes('429') || lowerMsg.includes('quota') || lowerMsg.includes('exhausted')) {
    return "⏳ **Usage Limit Reached**\n\nI've processed too many requests in a short time. Please wait a moment before asking another question.";
  }
  if (lowerMsg.includes('503') || lowerMsg.includes('overloaded') || lowerMsg.includes('500')) {
    return "🔧 **Service Unavailable**\n\nThe scripture analysis service is temporarily busy. Please try again in a few moments.";
  }
  if (lowerMsg.includes('safety') || lowerMsg.includes('blocked')) {
    return "🛡️ **Content Filtered**\n\nI cannot answer this query due to safety guidelines. Please try rephrasing your question.";
  }
  
  return `❌ **Unexpected Error**\n\nSomething went wrong: ${msg}\n\nPlease try rephrasing your question or starting a new chat.`;
};

export default function App() {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [version, setVersion] = useState<BibleVersion>(BibleVersion.ESV);
  const [bookmarks, setBookmarks] = useState<Message[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Offline State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const processingQueueRef = useRef(false);
  const messagesRef = useRef(messages); // Keep track of latest messages for async operations
  
  // Summary State
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Session ID to force InputArea reset on new chat
  const [sessionId, setSessionId] = useState(() => uuidv4());

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync messagesRef with state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Handle Online/Offline Status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processOfflineQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Try to process queue on mount if online
    if (navigator.onLine) {
        processOfflineQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Process Pending Messages
  const processOfflineQueue = async () => {
    if (processingQueueRef.current) return;
    processingQueueRef.current = true;

    try {
      // Find pending messages from the ref to ensure we have the latest state
      // Filter for user messages that are pending
      const pendingMessages = messagesRef.current.filter(m => m.status === 'pending' && m.role === 'user');

      if (pendingMessages.length === 0) {
        processingQueueRef.current = false;
        return;
      }

      setIsLoading(true);

      for (const msg of pendingMessages) {
        if (!navigator.onLine) break; // Stop processing if we go offline again

        // Update status to sent for this specific message
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'sent' } : m));
        
        // Send to API
        await performFullSend(msg.content);
        
        // Small delay to prevent race conditions or rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error("Error processing offline queue:", error);
    } finally {
      setIsLoading(false);
      processingQueueRef.current = false;
    }
  };

  // Load from local storage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY_MESSAGES);
    const savedVersion = localStorage.getItem(STORAGE_KEY_VERSION);
    const savedBookmarks = localStorage.getItem(STORAGE_KEY_BOOKMARKS);

    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Failed to parse messages", e);
      }
    }
    if (savedVersion && Object.values(BibleVersion).includes(savedVersion as BibleVersion)) {
      setVersion(savedVersion as BibleVersion);
    }
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (e) {
        console.error("Failed to parse bookmarks", e);
      }
    }

    // Initialize Gemini chat
    initializeChat(savedVersion as BibleVersion || BibleVersion.ESV, savedMessages ? JSON.parse(savedMessages) : []);
  }, []);

  // Save to local storage updates
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VERSION, version);
  }, [version]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleVersionChange = (newVersion: BibleVersion) => {
    setVersion(newVersion);
    // Re-initialize chat with new version context
    initializeChat(newVersion, messages);
  };

  const handleNewChat = () => {
    setMessages([]);
    resetChat();
    setSessionId(uuidv4()); // Update session ID to force InputArea re-render
    initializeChat(version);
    
    // Close any open modals/sidebars
    setSummaryOpen(false);
    setSidebarOpen(false);
  };

  const handleToggleBookmark = (message: Message) => {
    setBookmarks(prev => {
      const exists = prev.some(b => b.id === message.id);
      if (exists) {
        return prev.filter(b => b.id !== message.id);
      } else {
        return [...prev, message];
      }
    });
  };

  const handleRemoveBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const handleSummarize = async () => {
    if (messages.length === 0) return;
    
    setSummaryOpen(true);
    setIsSummarizing(true);
    setSummaryText('');

    try {
      const text = await generateChatSummary(messages);
      setSummaryText(text);
    } catch (error) {
      setSummaryText(getFriendlyErrorMessage(error));
    } finally {
      setIsSummarizing(false);
    }
  };

  // Core function to interact with Gemini API
  const performFullSend = async (text: string) => {
    const botMsgId = uuidv4();
    const botMessagePlaceholder: Message = {
      id: botMsgId,
      role: 'model',
      content: '',
      isStreaming: true,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, botMessagePlaceholder]);

    let fullContent = '';

    try {
      await sendMessageStream(text, (chunk) => {
        fullContent += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMsgId 
              ? { ...msg, content: fullContent } 
              : msg
          )
        );
      });

      // Finalize message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === botMsgId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );
    } catch (error) {
      console.error("Detailed error:", error);
      const friendlyError = getFriendlyErrorMessage(error);
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === botMsgId 
            ? { ...msg, content: friendlyError, isStreaming: false } 
            : msg
        )
      );
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMsgId = uuidv4();
    const status = isOnline ? 'sent' : 'pending';
    
    const userMessage: Message = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      status: status
    };

    setMessages(prev => [...prev, userMessage]);

    if (isOnline) {
      setIsLoading(true);
      await performFullSend(text);
      setIsLoading(false);
    } else {
      // Just added to state as pending. 
      // UI will show "Waiting for connection..."
      // processOfflineQueue will pick it up when online.
    }
  };

  return (
    <div className="min-h-screen bg-bible-paper flex flex-col font-sans text-stone-800 relative">
      <Header 
        version={version}
        onVersionChange={handleVersionChange}
        onNewChat={handleNewChat}
        onToggleBookmarks={() => setSidebarOpen(true)}
        onSummarize={handleSummarize}
        hasMessages={messages.length > 0}
        isOnline={isOnline}
      />

      <main className="flex-1 flex flex-col w-full max-w-3xl mx-auto pt-4 pb-32 sm:pb-40 relative z-0">
        {messages.length === 0 ? (
          <EmptyState onSuggestionClick={handleSendMessage} />
        ) : (
          <div className="px-3 sm:px-4 flex-1">
            {messages.map(msg => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                isBookmarked={bookmarks.some(b => b.id === msg.id)}
                onToggleBookmark={handleToggleBookmark}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Key prop ensures InputArea resets when session changes */}
      <InputArea 
        key={sessionId}
        onSend={handleSendMessage} 
        isLoading={isLoading} 
      />

      <BookmarksSidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        bookmarks={bookmarks}
        onRemoveBookmark={handleRemoveBookmark}
      />

      <SummaryModal
        isOpen={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        summary={summaryText}
        isLoading={isSummarizing}
      />
    </div>
  );
}
