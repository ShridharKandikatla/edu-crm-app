import { useState, useRef, useEffect } from 'react';
import { config } from '../../config/env';

const API_BASE = config.apiUrl.replace(/\/api\/?$/, '');

const THINKING_DOTS = (
  <div className="flex items-center gap-1 px-3 py-2">
    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
);

export default function ChatBot({ onLeadCreated }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [started, setStarted] = useState(false);
  const [engine, setEngine] = useState(null);
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [started, messages.length]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMsg = { role: 'user', content: msg, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, conversationId }),
      });
      const data = await res.json();

      if (data.success && data.data) {
        const reply = data.data.reply || data.data.message || "I'm here to help! Could you tell me more?";
        setMessages(prev => [...prev, { role: 'assistant', content: reply, ts: Date.now() }]);
        if (data.data.conversationId && !conversationId) {
          setConversationId(data.data.conversationId);
        }
        if (data.data.engine) {
          setEngine(data.data.engine);
        }
        if (data.data.leadCreated && onLeadCreated) {
          onLeadCreated(data.data);
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I'm having trouble right now. Please try using the form below, or call us at +91 98765 43210.",
          ts: Date.now(),
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I couldn't connect. Please try the inquiry form or call us directly.",
        ts: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const quickReplies = [
    'Tell me about courses',
    'What are the fees?',
  ];

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center" style={{ animation: 'fadeUp 0.4s ease' }}>
        <div className="relative mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[0.6rem] font-bold text-white">
            AI
          </div>
        </div>
        <h3 className="mb-1 text-lg font-bold text-white">Chat with UniBot</h3>
        <p className="mb-5 max-w-xs text-xs text-white/35">
          Ask about courses, fees, or anything else. Our AI assistant is here to help!
        </p>
        <button
          onClick={() => {
            setStarted(true);
            setMessages([{
              role: 'assistant',
              content: "Hi there! 👋 I'm UniBot, your AI assistant. I can help you explore our programmes, understand fees, check schedules, or answer any questions.\n\nWhat would you like to know?",
              ts: Date.now(),
            }]);
          }}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30"
        >
          Start Chat
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: 'min(480px, 75vh)' }}>
      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
        {engine && (
          <div className="mb-3 flex justify-center">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.6rem] font-semibold ${
              engine === 'groq' ? 'bg-amber-500/15 text-amber-300' :
              engine === 'openai' ? 'bg-emerald-500/15 text-emerald-300' :
              'bg-white/10 text-white/40'
            }`}>
              {engine === 'groq' && '✦ Powered by Grok'}
              {engine === 'openai' && '✦ Powered by GPT'}
              {engine === 'mock' && 'Demo Mode'}
            </span>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`mb-3 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-indigo-600 text-white rounded-br-md'
                : 'bg-white/[0.06] text-white/80 border border-white/[0.07] rounded-bl-md'
            }`}>
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="mb-3 flex justify-start">
            <div className="rounded-2xl rounded-bl-md border border-white/[0.07] bg-white/[0.06]">
              {THINKING_DOTS}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies — show only at start */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-2">
          {quickReplies.map(q => (
            <button
              key={q}
              onClick={() => send(q)}
              className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[0.7rem] text-white/40 transition-all hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-300"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about courses, fees..."
            className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
            disabled={loading}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition-all hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
