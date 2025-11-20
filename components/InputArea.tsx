import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Mic, MicOff } from 'lucide-react';

interface InputAreaProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          
          // Only gather final results to append
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            setText(prev => {
              const trimmed = prev.trim();
              return trimmed ? `${trimmed} ${finalTranscript}` : finalTranscript;
            });
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!text.trim() || isLoading) return;
    onSend(text);
    setText('');
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-4 pb-4 sm:pt-10 sm:pb-8 px-3 sm:px-4 z-10">
      <div className="max-w-3xl mx-auto relative">
        <div className={`relative flex items-end bg-white border shadow-lg rounded-2xl overflow-hidden transition-all duration-200 ${isListening ? 'ring-2 ring-red-500/50 border-red-500/50' : 'border-stone-300 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500'}`}>
          <label htmlFor="chat-input" className="sr-only">Ask a question regarding scripture</label>
          <textarea
            id="chat-input"
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Ask a question regarding scripture..."}
            className="w-full max-h-[150px] sm:max-h-[200px] py-3 pl-4 pr-24 sm:py-4 sm:pl-5 bg-transparent border-none focus:ring-0 resize-none font-sans text-base text-stone-700 placeholder-stone-400 leading-relaxed scrollbar-hide"
            rows={1}
            aria-label="Message input"
            style={{ minHeight: '56px' }}
            autoFocus
          />
          
          <div className="absolute right-2 bottom-2 flex gap-1">
            {/* Voice Input Button */}
            {recognitionRef.current && (
              <button
                onClick={toggleListening}
                className={`p-2 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  isListening 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500 animate-pulse' 
                    : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100 focus:ring-stone-500'
                }`}
                aria-label={isListening ? "Stop recording" : "Start voice input"}
                title={isListening ? "Stop recording" : "Start voice input"}
                type="button"
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}

            {/* Send Button */}
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || isLoading}
              className="p-2 rounded-xl bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
              aria-label="Send message"
              title="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" aria-label="Loading" />
              ) : (
                <Send className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
        <p className="text-center text-[10px] sm:text-xs text-stone-400 mt-2 sm:mt-3 font-medium">
          AI can make mistakes. Please verify important verses.
        </p>
      </div>
    </div>
  );
};