import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  User, 
  Bot, 
  Loader2, 
  ArrowLeft,
  Sparkles,
  Zap,
  Terminal
} from 'lucide-react';
import { mentorAgent } from '../geminiService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatPageProps {
  onBack: () => void;
  currentContext: any;
}

export const ChatPage: React.FC<ChatPageProps> = ({ onBack, currentContext }) => {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Greetings. I've analyzed your upcoming milestones. You have an AI/ML Mid-Term in 10 days. I've injected preparation blocks into your schedule. Shall we review your focus areas?",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = userInput;
    setUserInput('');
    setIsLoading(true);

    try {
      const result = await mentorAgent(currentInput, currentContext);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Mentor Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm experiencing a temporary neural disconnect. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-transparent text-slate-300">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Bot className="text-purple-400" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100 tracking-tight">Senior Mentor AI</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">Academic Intelligence Protocol</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Neural Link Active</span>
        </div>
      </header>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-slate-800 border border-white/10' : 'bg-purple-500/10 border border-purple-500/20'
                }`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} className="text-purple-400" />}
                </div>
                <div className={`p-4 rounded-2xl border ${
                  msg.role === 'user' 
                    ? 'bg-slate-800/50 border-white/10 rounded-tr-none' 
                    : 'bg-purple-500/5 border-purple-500/10 rounded-tl-none'
                }`}>
                  <p className="text-sm leading-relaxed text-slate-200">{msg.content}</p>
                  <span className="text-[9px] text-slate-600 mt-2 block font-mono">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Loader2 size={14} className="text-purple-400 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 rounded-tl-none">
              <div className="flex gap-1">
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 rounded-full bg-purple-400" />
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 rounded-full bg-purple-400" />
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 rounded-full bg-purple-400" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-8 border-t border-white/5 bg-[#0a0a0c]/50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Query the Senior Mentor..."
            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-600"
          />
          <button 
            onClick={handleSend}
            disabled={!userInput.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-600/20"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        <div className="mt-4 flex justify-center gap-6">
          <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            <Zap size={12} className="text-purple-500" />
            Recalculate Schedule
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            <Terminal size={12} className="text-blue-500" />
            Inject Prep Blocks
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            <Sparkles size={12} className="text-amber-500" />
            Micro-Consistency
          </div>
        </div>
      </div>
    </div>
  );
};
