
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AppState } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string, isEdit: boolean) => void;
  status: AppState;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, status }) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'chat' | 'edit'>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === AppState.GENERATING || status === AppState.EDITING) return;
    onSendMessage(input, mode === 'edit');
    setInput('');
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-2xl border border-gray-100 shadow-sm">
      {/* Mode Toggle */}
      <div className="flex p-2 border-b border-gray-50">
        <button
          onClick={() => setMode('chat')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'chat' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Ask Designer
        </button>
        <button
          onClick={() => setMode('edit')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'edit' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Edit Image
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="text-center py-10 space-y-2">
            <p className="text-gray-400 text-sm">Ask about furniture styles or suggest edits like</p>
            <p className="text-amber-600 text-xs italic">"Add a blue velvet sofa" or "Change the lighting to warm sunset"</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
              msg.role === 'user' 
                ? 'bg-amber-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {msg.isImageEdit && <span className="block text-[10px] uppercase tracking-wider opacity-70 mb-1">Image Edit Request</span>}
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.role === 'model' && msg.content.includes('http') && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-[10px] font-bold text-gray-500 mb-1">RECOMMENDED LINKS:</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {(status === AppState.GENERATING || status === AppState.EDITING) && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3 flex gap-1">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-50 bg-gray-50/50 rounded-b-2xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'chat' ? "Ask the designer..." : "Describe your edit..."}
            className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
          <button 
            type="submit"
            disabled={!input.trim() || status === AppState.GENERATING || status === AppState.EDITING}
            className="bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {mode === 'chat' ? 'Ask' : 'Edit'}
          </button>
        </div>
        <p className="mt-2 text-[10px] text-gray-400 text-center uppercase tracking-widest">
          {mode === 'chat' ? "Expert advice & Shopping" : "Visual AI transformation"}
        </p>
      </form>
    </div>
  );
};

export default ChatInterface;
