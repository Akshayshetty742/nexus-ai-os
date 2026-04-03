/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  Clock, 
  Trophy, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Search,
  ChevronRight,
  LayoutDashboard,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Loader2,
  Box as LucideBox,
  Cpu,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Activity,
  Bot,
  MessageSquare,
  Upload,
  Bell,
  MapPin,
  Users,
  Terminal,
  BookOpen,
  Mic
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addDays, isSameDay, subDays, startOfMonth, eachDayOfInterval } from 'date-fns';
import { cn } from './lib/utils';
import { Task, StudyPlan, Opportunity, SparkTask, CalendarEvent, Habit } from './types';
import { syllabusAgent, schedulerAgent, opportunityAgent, sparkAgent, mentorAgent, fastAgent } from './geminiService';
import { NexusLanding } from './components/NexusLanding';
import { ChatPage } from './components/ChatPage';
import { HabitMatrix } from './components/HabitMatrix';
import { LiveVoice } from './components/LiveVoice';
import { StreakService } from './lib/streakService';

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'DSA: Graph Algorithms', startTime: '09:00', endTime: '10:30', type: 'class', priority: 'high', completed: false, description: 'Focus on Dijkstra and A* Search' },
  { id: '2', title: 'AI/ML Lab: Neural Networks', startTime: '11:00', endTime: '13:00', type: 'class', priority: 'high', completed: false, description: 'Backpropagation implementation' },
  { id: '3', title: 'Lunch Break', startTime: '13:00', endTime: '14:00', type: 'break', priority: 'low', completed: true },
  { id: '4', title: 'OS: Process Scheduling', startTime: '14:00', endTime: '15:30', type: 'study', priority: 'medium', completed: false, description: 'Round Robin vs Priority Scheduling' },
];

const NavIcon: React.FC<{ icon: React.ReactNode; active: boolean; onClick: () => void; label: string }> = ({ icon, active, onClick, label }) => (
  <button
    onClick={onClick}
    className={cn(
      "relative group p-3 rounded-2xl transition-all duration-300",
      active 
        ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/20" 
        : "text-slate-600 hover:text-slate-300 hover:bg-white/5"
    )}
  >
    {icon}
    <div className="absolute left-full ml-4 px-2 py-1 rounded bg-slate-800 text-[10px] font-bold text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
      {label}
    </div>
    {active && (
      <motion.div
        layoutId="active-nav"
        className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-500 rounded-full"
      />
    )}
  </button>
);

const SeniorTopSidebar: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  context: { tasks: Task[]; calendarEvents: CalendarEvent[]; habits: Habit[] };
  onAction: (result: any) => void;
}> = ({ isOpen, onClose, context, onAction }) => {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<{ id: string; role: 'user' | 'assistant'; content: string; sources?: { title: string, uri: string }[] }[]>([
    { id: '1', role: 'assistant', content: "Senior Top online. I'm monitoring your academic trajectory. What's the mission today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const input = text || userInput;
    if (!input.trim()) return;
    
    const userMsg = { id: Date.now().toString(), role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setUserInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const result = await mentorAgent(input, context, history);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: result.response,
        sources: result.sources
      }]);
      
      if (result.action) {
        onAction(result);
      }
    } catch (error) {
      console.error("Mentor failed:", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: "Connection to neural node lost. Retry mission." }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Expose handleSend for proactive triggers
  useEffect(() => {
    const handleProactive = (e: any) => {
      if (e.detail?.message) {
        handleSend(e.detail.message);
      }
    };
    window.addEventListener('senior-top-proactive', handleProactive);
    return () => window.removeEventListener('senior-top-proactive', handleProactive);
  }, [messages]); // Add messages to dependencies to ensure handleSend has latest history

  return (
    <div className={cn(
      "fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#020617]/80 backdrop-blur-2xl border-l border-white/5 z-[101] flex flex-col shadow-2xl transition-transform duration-500",
      isOpen ? "translate-x-0" : "translate-x-full"
    )}>
      {/* Sidebar Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 glow-cyan">
            <Terminal size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">Senior Top</h2>
            <p className="text-[10px] uppercase tracking-widest font-bold text-cyan-500/60">Proactive Assistant</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-slate-500 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-[90%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                msg.role === 'assistant' ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-800 text-slate-400"
              )}>
                {msg.role === 'assistant' ? <Bot size={16} /> : <Users size={16} />}
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed",
                msg.role === 'assistant' 
                  ? "bg-slate-900/50 text-slate-300 border border-white/5" 
                  : "bg-cyan-600 text-white shadow-lg shadow-cyan-600/20"
              )}>
                {msg.content}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-cyan-500/60">Search Grounding Sources</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((source, i) => (
                        <a 
                          key={i} 
                          href={source.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] text-slate-400 hover:bg-white/10 transition-colors"
                        >
                          <ExternalLink size={10} />
                          {source.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex gap-4 max-w-[90%]">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 flex gap-1">
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/5 bg-slate-900/30">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Command Senior Top..."
                className="w-full bg-slate-900 border border-white/5 rounded-xl py-4 pl-4 pr-12 text-sm text-slate-200 placeholder:text-slate-600 focus:ring-1 focus:ring-cyan-500/50 transition-all"
              />
              <button 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-cyan-400 transition-colors"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.onchange = (e: any) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleSend(`[FILE UPLOADED: ${file.name}] I'm uploading my syllabus. Please analyze it and create a study plan.`);
                    }
                  };
                  input.click();
                }}
              >
                <Upload size={18} />
              </button>
            </div>
            <button 
              onClick={() => handleSend()}
              disabled={!userInput.trim() || isTyping}
              className="p-4 rounded-xl bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50 transition-all shadow-lg shadow-cyan-600/20 flex items-center justify-center"
            >
              {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'mentor'>('dashboard');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'opportunities' | 'habits' | 'community'>('dashboard');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    { id: 'e1', title: 'AI/ML Mid-Term', date: addDays(new Date(), 10), type: 'exam' },
    { id: 'e2', title: 'DSA Final', date: addDays(new Date(), 25), type: 'exam' },
    { id: 'h1', title: 'Pune Hackathon', date: addDays(new Date(), 5), type: 'hackathon', registered: false, registrationDate: subDays(new Date(), 4) },
    { id: 'hol1', title: 'Ganesh Chaturthi', date: addDays(new Date(), 2), type: 'holiday' },
  ]);
  const [conflictLog, setConflictLog] = useState<string | null>(null);
  const [mentorResponse, setMentorResponse] = useState<string | null>(null);
  const [examMode, setExamMode] = useState(false);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [showMentorDrawer, setShowMentorDrawer] = useState(false);
  const [showLiveVoice, setShowLiveVoice] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Initialize habits
  useEffect(() => {
    setHabits(StreakService.getHabits());
  }, []);

  const handleToggleHabit = (habitId: string) => {
    const { updatedHabits, isCompleted } = StreakService.toggleHabit(habitId, habits);
    setHabits(updatedHabits);
    
    if (isCompleted) {
      const habit = updatedHabits.find(h => h.id === habitId);
      if (habit) {
        // Trigger proactive AI insight
        const message = `I just completed my ${habit.title} habit. I'm on a ${habit.streak}-day streak!`;
        window.dispatchEvent(new CustomEvent('senior-top-proactive', { detail: { message } }));
      }
    }
  };

  // Proactive AI Notification
  useEffect(() => {
    if (!showLanding) {
      const timer = setTimeout(() => {
        setNotification("I noticed a new hackathon in Pune next week. Should I add it to your tracker?");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showLanding]);

  // Auto-generate study blocks before exams
  useEffect(() => {
    const exams = calendarEvents.filter(e => e.type === 'exam');
    const existingStudyBlocks = calendarEvents.filter(e => e.type === 'study-block');
    
    const newStudyBlocks: CalendarEvent[] = [];
    exams.forEach(exam => {
      for (let i = 1; i <= 3; i++) {
        const studyDate = subDays(exam.date, i);
        const alreadyExists = existingStudyBlocks.some(b => isSameDay(b.date, studyDate));
        if (!alreadyExists) {
          newStudyBlocks.push({
            id: `sb-${exam.id}-${i}`,
            title: `Prep: ${exam.title}`,
            date: studyDate,
            type: 'study-block'
          });
        }
      }
    });

    if (newStudyBlocks.length > 0) {
      setCalendarEvents(prev => [...prev, ...newStudyBlocks]);
    }
  }, [calendarEvents]);

  // Logic for hackathon drift
  useEffect(() => {
    setCalendarEvents(prev => prev.map(event => {
      if (event.type === 'hackathon' && !event.registered && event.registrationDate) {
        const diff = Math.floor((new Date().getTime() - event.registrationDate.getTime()) / (1000 * 60 * 60 * 24));
        return { ...event, daysUnregistered: diff };
      }
      return event;
    }));
  }, []);

  // Auto-fetch opportunities on mount
  useEffect(() => {
    handleFetchOpportunities();
  }, []);

  const handleMentorQuery = async (query: string) => {
    setLoading(prev => ({ ...prev, mentor: true }));
    try {
      const context = { tasks, calendarEvents };
      const { response, action } = await mentorAgent(query, context);
      setMentorResponse(response);
      
      if (action === 'recalculate-schedule') {
        handleRecalculateSchedule();
      } else if (action === 'update-calendar') {
        // AI could suggest specific updates, for now we just log it
        console.log("AI suggested calendar update");
      }
    } catch (error) {
      console.error("Mentor failed:", error);
    } finally {
      setLoading(prev => ({ ...prev, mentor: false }));
    }
  };

  const handleFetchOpportunities = async () => {
    setLoading(prev => ({ ...prev, opportunities: true }));
    try {
      const data = await opportunityAgent();
      setOpportunities(data);
    } catch (error) {
      console.error("Failed to fetch opportunities:", error);
    } finally {
      setLoading(prev => ({ ...prev, opportunities: false }));
    }
  };

  const handleRecalculateSchedule = async (missedTaskTitle?: string) => {
    setLoading(prev => ({ ...prev, scheduler: true }));
    try {
      const { newTasks, conflictLog } = await schedulerAgent(tasks, missedTaskTitle);
      setTasks(newTasks);
      setConflictLog(conflictLog || null);
    } catch (error) {
      console.error("Scheduler failed:", error);
    } finally {
      setLoading(prev => ({ ...prev, scheduler: false }));
    }
  };

  const handleNavigateFromLanding = (nodeId: string, query?: string) => {
    setShowLanding(false);
    if (nodeId === 'mentor') {
      setShowMentorDrawer(true);
      setActiveTab('dashboard');
      setCurrentPage('dashboard');
      return;
    }
    
    switch (nodeId) {
      case 'calendar':
      case 'tasks':
        setActiveTab('dashboard');
        setCurrentPage('dashboard');
        break;
      case 'habits':
        setActiveTab('habits');
        setCurrentPage('dashboard');
        break;
      case 'opportunities':
        setActiveTab('opportunities');
        setCurrentPage('dashboard');
        break;
      case 'community':
        setActiveTab('community');
        setCurrentPage('dashboard');
        break;
      default:
        setActiveTab('dashboard');
        setCurrentPage('dashboard');
    }
  };

  if (showLanding) {
    return <NexusLanding onNavigate={handleNavigateFromLanding} />;
  }

  if (currentPage === 'mentor') {
    return <ChatPage onBack={() => setCurrentPage('dashboard')} currentContext={{ tasks, calendarEvents, habits }} />;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-400 font-sans selection:bg-cyan-900 flex overflow-hidden">
      {/* Background Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] z-0" />

      <SeniorTopSidebar 
        isOpen={showMentorDrawer} 
        onClose={() => setShowMentorDrawer(false)} 
        context={{ tasks, calendarEvents, habits }} 
        onAction={(result) => {
          if (result.action === 'recalculate-schedule') {
            handleRecalculateSchedule();
          } else if (result.action === 'add-study-plan' && result.studyPlan) {
            setStudyPlan(result.studyPlan);
            
            // Add exam dates to calendar
            const newEvents: CalendarEvent[] = result.studyPlan.examDates.map((ed: any, i: number) => ({
              id: `exam-${Date.now()}-${i}`,
              title: `${result.studyPlan.subject}: ${ed.type}`,
              date: new Date(ed.date),
              type: 'exam'
            }));
            setCalendarEvents(prev => [...prev, ...newEvents]);

            // Add important topics as tasks
            const newTasks: Task[] = result.studyPlan.topics
              .filter((t: any) => t.isImportant)
              .map((t: any, i: number) => ({
                id: `task-${Date.now()}-${i}`,
                title: `IMP: ${t.name}`,
                startTime: '10:00',
                endTime: '12:00',
                type: 'study',
                priority: 'high',
                completed: false,
                description: `Focus on: ${t.subtopics.join(', ')}`
              }));
            setTasks(prev => [...prev, ...newTasks]);
            
            setNotification(`New study plan for ${result.studyPlan.subject} integrated into your mission control.`);
          }
        }}
      />

      <LiveVoice 
        isOpen={showLiveVoice} 
        onClose={() => setShowLiveVoice(false)} 
      />

      {/* Proactive Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md"
          >
            <div className="glass-card glass-border rounded-2xl p-4 flex items-center gap-4 shadow-2xl border-cyan-500/30">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Bell size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-200 font-medium">{notification}</p>
                <div className="flex gap-3 mt-2">
                  <button onClick={() => setNotification(null)} className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest hover:text-cyan-300">Add to Tracker</button>
                  <button onClick={() => setNotification(null)} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-400">Dismiss</button>
                </div>
              </div>
              <button onClick={() => setNotification(null)} className="text-slate-600 hover:text-slate-400">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Floating Side-Nav */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="fixed left-6 top-6 bottom-6 w-20 bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-4 flex flex-col items-center gap-8 z-50 shadow-2xl"
      >
        <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-600/10">
          <Zap className="text-cyan-400 w-6 h-6" />
        </div>

        <nav className="flex flex-col gap-6">
          <NavIcon 
            icon={<LayoutDashboard size={24} />} 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            label="Dashboard"
          />
          <NavIcon 
            icon={<Trophy size={24} />} 
            active={activeTab === 'opportunities'} 
            onClick={() => setActiveTab('opportunities')} 
            label="Events"
          />
          <NavIcon 
            icon={<Activity size={24} />} 
            active={activeTab === 'habits'} 
            onClick={() => setActiveTab('habits')} 
            label="Habits"
          />
          <NavIcon 
            icon={<MapPin size={24} />} 
            active={activeTab === 'community'} 
            onClick={() => setActiveTab('community')} 
            label="Community"
          />
          <div className="w-8 h-[1px] bg-white/5 my-2" />
          <NavIcon 
            icon={<Bot size={24} />} 
            active={showMentorDrawer} 
            onClick={() => setShowMentorDrawer(true)} 
            label="Senior Top"
          />
        </nav>

        <button 
          onClick={() => setShowLanding(true)}
          className="mt-auto p-3 rounded-2xl text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all"
        >
          <ArrowLeft size={24} />
        </button>
      </motion.aside>

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex transition-all duration-500",
        showMentorDrawer ? "mr-md" : "mr-0"
      )}>
        <main className="flex-1 ml-32 p-8 lg:p-12 max-w-7xl mx-auto w-full overflow-y-auto">
          <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-100 tracking-tight mb-1">
                {activeTab === 'dashboard' && "Senior Top Dashboard"}
                {activeTab === 'opportunities' && "Hackathon Tracker"}
                {activeTab === 'habits' && "Habit Matrix"}
                {activeTab === 'community' && "Regional Tech Hubs"}
              </h2>
              <div className="flex items-center gap-2">
                <p className="text-slate-600 uppercase text-[10px] tracking-[0.2em] font-bold">Senior Top Protocol v1.0</p>
                {!process.env.GEMINI_API_KEY && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[8px] font-bold uppercase tracking-widest border border-amber-500/20">
                    Neural Link Offline (Check API Key)
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900/50 border border-white/5 focus-within:border-cyan-500/30 transition-all">
                <Terminal size={16} className="text-cyan-500" />
                <input 
                  type="text" 
                  placeholder="Quick Command..." 
                  className="bg-transparent border-none outline-none text-xs text-slate-300 w-48 placeholder:text-slate-700"
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value;
                      if (!val) return;
                      (e.target as HTMLInputElement).value = '';
                      setNotification("Processing neural command...");
                      const res = await fastAgent(val);
                      setNotification(res);
                    }
                  }}
                />
              </div>
              <div className="px-4 py-2 rounded-full glass-card glass-border flex items-center gap-2 text-sm font-medium text-slate-400">
                <Clock size={16} className="text-slate-500" />
                <span>{format(new Date(), 'EEEE, do MMMM')}</span>
              </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Habit Matrix - Centerpiece */}
                <div className="xl:col-span-2 space-y-8">
                  {studyPlan && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card glass-border rounded-3xl p-6 border-cyan-500/30 bg-cyan-500/5"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                            <BookOpen size={20} />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-100">{studyPlan.subject} Roadmap</h3>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">AI-Generated Study Plan</p>
                          </div>
                        </div>
                        <button onClick={() => setStudyPlan(null)} className="text-slate-600 hover:text-slate-400">
                          <X size={16} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {studyPlan.topics.map((topic, i) => (
                          <div key={i} className={cn(
                            "p-4 rounded-2xl border transition-all",
                            topic.isImportant ? "bg-purple-500/10 border-purple-500/30" : "bg-white/5 border-white/5"
                          )}>
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-sm font-bold text-slate-200">{topic.name}</h4>
                              {topic.isImportant && (
                                <span className="px-2 py-0.5 rounded bg-purple-500 text-white text-[8px] font-black uppercase tracking-widest">IMP</span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 mb-2">Weightage: {topic.weightage} • Deadline: {topic.deadline}</p>
                            <div className="flex flex-wrap gap-1">
                              {topic.subtopics.slice(0, 3).map((s, j) => (
                                <span key={j} className="px-2 py-0.5 rounded-full bg-white/5 text-[8px] text-slate-400">{s}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  <HabitMatrix habits={habits} onToggle={handleToggleHabit} />
                  
                  {/* Hackathon Tracker - Bottom Widget */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Local Opportunities</h3>
                      <button onClick={() => setActiveTab('opportunities')} className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest hover:text-cyan-300">View All</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {opportunities.slice(0, 2).map((opp, i) => (
                        <div key={i} className="glass-card glass-border rounded-2xl p-4 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                            <Trophy size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-200 truncate">{opp.title}</h4>
                            <p className="text-[10px] text-slate-500">{opp.location} • {opp.date}</p>
                          </div>
                          <ArrowRight size={16} className="text-slate-700" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Task List - Right Column */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Missions</h3>
                    <button 
                      onClick={() => handleRecalculateSchedule()}
                      className="p-1.5 rounded-lg bg-white/5 text-slate-500 hover:text-cyan-400 transition-colors"
                    >
                      <Zap size={14} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {tasks.map(task => (
                      <div 
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className={cn(
                          "glass-card glass-border rounded-2xl p-4 cursor-pointer transition-all hover:border-cyan-500/30",
                          task.completed ? "opacity-50" : "opacity-100"
                        )}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest",
                            task.priority === 'high' ? "bg-red-500/10 text-red-400" : "bg-slate-800 text-slate-400"
                          )}>
                            {task.type}
                          </span>
                          {task.completed && <CheckCircle2 size={14} className="text-emerald-500" />}
                        </div>
                        <h4 className="text-sm font-bold text-slate-200">{task.title}</h4>
                        <p className="text-[10px] text-slate-600 mt-1">{task.startTime} — {task.endTime}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'opportunities' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-500">Real-time tracking of innovation nodes in Maharashtra.</p>
                <button 
                  onClick={handleFetchOpportunities}
                  disabled={loading.opportunities}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  {loading.opportunities ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} className="text-cyan-400" />}
                  Refresh Nodes
                </button>
              </div>
              
              <motion.div 
                key="opportunities"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {loading.opportunities ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-72 bg-[#111114] rounded-3xl border border-white/5 animate-pulse" />
                  ))
                ) : opportunities.length > 0 ? (
                  opportunities.map((opp, i) => (
                    <OpportunityCard 
                      key={i} 
                      opportunity={opp} 
                      onClick={() => setSelectedOpportunity(opp)}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-center glass-card glass-border rounded-[2.5rem]">
                    <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-700 mb-6">
                      <Trophy size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-300 mb-2">No Active Nodes Found</h3>
                    <p className="text-sm text-slate-500 max-w-xs">The neural network couldn't locate any active hackathons. Try refreshing the connection.</p>
                    <button 
                      onClick={handleFetchOpportunities}
                      className="mt-8 px-8 py-4 rounded-2xl bg-cyan-600 text-white font-bold text-sm hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-600/20"
                    >
                      Reconnect to Tracker
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {activeTab === 'habits' && (
            <motion.div 
              key="habits"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <HabitMatrix habits={habits} onToggle={handleToggleHabit} />
            </motion.div>
          )}

          {activeTab === 'community' && (
            <motion.div 
              key="community"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[
                { name: 'Pune Tech Hub', members: '1.2k', active: '45', icon: <MapPin />, desc: 'Maharashtra\'s primary innovation node for student developers.' },
                { name: 'Mumbai AI Circle', members: '850', active: '12', icon: <Cpu />, desc: 'Deep learning and LLM research collaborative.' },
                { name: 'Nagpur Devs', members: '420', active: '8', icon: <Users />, desc: 'Central India\'s growing ecosystem for open source.' },
                { name: 'Nashik Innovation Lab', members: '310', active: '5', icon: <Zap />, desc: 'Focus on Agri-Tech and hardware integration.' },
                { name: 'Aurangabad Code Hub', members: '280', active: '3', icon: <Terminal />, desc: 'Industrial automation and software protocols.' },
              ].map((hub, i) => (
                <div key={i} className="glass-card glass-border rounded-3xl p-8 hover:border-cyan-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                      {hub.icon}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-1">Active Now</span>
                      <span className="text-xl font-bold text-slate-100">{hub.active}</span>
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-slate-100 mb-2">{hub.name}</h4>
                  <p className="text-xs text-slate-500 mb-6 leading-relaxed">{hub.desc}</p>
                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{hub.members} Members</span>
                    <button className="px-4 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 text-[10px] font-bold uppercase tracking-widest transition-all">Join Node</button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>

    {/* Opportunity Modal */}
    <AnimatePresence>
        {selectedOpportunity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedOpportunity(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl glass-card glass-border rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedOpportunity(null)}
                className="absolute top-8 right-8 p-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-500 transition-all"
              >
                <X size={24} />
              </button>

              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  {selectedOpportunity.type === 'hackathon' ? <Trophy size={40} /> : <Zap size={40} />}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight mb-2">{selectedOpportunity.title}</h2>
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-widest">
                    {selectedOpportunity.type}
                  </span>
                </div>
              </div>

              <div className="space-y-6 mb-10">
                <div className="flex items-center gap-4 text-slate-400">
                  <Search size={20} className="text-purple-500" />
                  <span className="text-lg">{selectedOpportunity.location}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <Calendar size={20} className="text-purple-500" />
                  <span className="text-lg">{selectedOpportunity.date}</span>
                </div>
                <div className="p-6 rounded-3xl bg-cyan-900/10 border border-cyan-500/20">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3">AI Relevance Analysis</h4>
                  <p className="text-slate-300 leading-relaxed italic">
                    "{selectedOpportunity.relevance}"
                  </p>
                </div>
              </div>

              <a 
                href={selectedOpportunity.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-cyan-600/20"
              >
                Access Opportunity Node
                <ExternalLink size={20} />
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowLiveVoice(true)}
          className="w-14 h-14 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-2xl shadow-cyan-600/40 hover:bg-cyan-500 transition-all group"
        >
          <Mic size={24} className="group-hover:animate-pulse" />
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowMentorDrawer(true)}
          className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 text-cyan-400 flex items-center justify-center shadow-2xl hover:bg-slate-800 transition-all"
        >
          <Terminal size={24} />
        </motion.button>
      </div>

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#111114] border-t border-white/5 p-4 flex justify-around lg:hidden z-50 backdrop-blur-xl bg-opacity-80">
        <MobileNavItem icon={<LucideBox size={20} />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <MobileNavItem icon={<Trophy size={20} />} active={activeTab === 'opportunities'} onClick={() => setActiveTab('opportunities')} />
        <MobileNavItem icon={<Activity size={20} />} active={activeTab === 'habits'} onClick={() => setActiveTab('habits')} />
      </nav>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
        active 
          ? "bg-indigo-500/10 text-indigo-400" 
          : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function MobileNavItem({ icon, active, onClick }: { icon: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-3 rounded-xl transition-all",
        active ? "bg-indigo-500/10 text-indigo-400" : "text-slate-500"
      )}
    >
      {icon}
    </button>
  );
}

function OpportunityCard({ opportunity, onClick }: { opportunity: Opportunity, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="glass-card glass-border rounded-3xl p-8 hover:border-cyan-400/30 transition-all group flex flex-col shadow-xl cursor-pointer"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400/60 group-hover:scale-110 transition-transform">
          {opportunity.type === 'hackathon' ? <Trophy size={28} /> : <Zap size={28} />}
        </div>
        <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400/60 text-[10px] font-bold uppercase tracking-widest">
          {opportunity.type}
        </span>
      </div>
      
      <h4 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-cyan-400/60 transition-colors leading-tight">{opportunity.title}</h4>
      <div className="space-y-3 mb-8 flex-1">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Search size={16} className="text-slate-600" />
          <span>{opportunity.location}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Calendar size={16} className="text-slate-600" />
          <span>{opportunity.date}</span>
        </div>
        <div className="mt-6 p-4 rounded-2xl bg-slate-900/50 border border-white/5">
          <p className="text-xs text-slate-600 italic leading-relaxed">
            "{opportunity.relevance}"
          </p>
        </div>
      </div>

      <a 
        href={opportunity.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-full py-4 rounded-2xl bg-cyan-600/80 hover:bg-cyan-500/80 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
      >
        Access Node
        <ExternalLink size={16} />
      </a>
    </div>
  );
}
