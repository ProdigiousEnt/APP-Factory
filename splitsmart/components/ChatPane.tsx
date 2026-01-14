
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ReceiptData } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Bot, CornerDownLeft } from 'lucide-react';

interface ChatPaneProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  receipt: ReceiptData | null;
}

const ChatPane: React.FC<ChatPaneProps> = ({ messages, onSendMessage, receipt }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Dynamic Instruction Header */}
      <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 leading-tight">AI Split Assistant</h3>
            <p className="text-[11px] text-zinc-500 font-medium">Try: "Sarah and I shared the Nachos"</p>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 pb-32 space-y-6 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-zinc-200 text-zinc-600' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>

                <div className={`p-4 rounded-2xl shadow-sm ${msg.role === 'user'
                    ? 'bg-zinc-900 text-white rounded-tr-none'
                    : 'bg-zinc-50 text-zinc-800 border border-zinc-100 rounded-tl-none'
                  }`}>
                  <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-zinc-100">
        <form
          onSubmit={handleSubmit}
          className="relative max-w-2xl mx-auto flex items-end gap-2"
        >
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Who paid for what?"
              rows={1}
              className="w-full bg-zinc-100 text-zinc-900 rounded-2xl px-5 py-4 pr-12 text-sm font-medium placeholder:text-zinc-400 focus:bg-zinc-50 focus:ring-2 focus:ring-indigo-600/20 transition-all resize-none max-h-32"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className={`absolute right-2 bottom-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${input.trim()
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 translate-y-0 opacity-100'
                  : 'bg-zinc-200 text-zinc-400 translate-y-1 opacity-0 pointer-events-none'
                }`}
            >
              <Send size={18} />
            </button>
          </div>
        </form>
        <p className="text-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-3 mb-2">Powered by Gemini 1.5</p>
      </div>
    </div>
  );
};

export default ChatPane;
