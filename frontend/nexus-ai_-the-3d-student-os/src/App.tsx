/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { mentorAgent } from "./geminiService";
import { 
  Calendar, Clock, Trophy, Zap, CheckCircle2, ChevronRight, 
  LayoutDashboard, Sparkles, Loader2, ArrowLeft, X,
  Activity, Bot, BookOpen, Mic, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addDays } from 'date-fns';
import { cn } from './lib/utils';

// Types & Services
import { Task, Opportunity, CalendarEvent, Habit } from './types';

import { StreakService } from './lib/streakService';

// Components
import { NexusLanding } from './components/NexusLanding';
import { HabitMatrix } from './components/HabitMatrix';
import { LiveVoice } from './components/LiveVoice';

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'DSA: Graph Algorithms', startTime: '09:00', endTime: '10:30', type: 'class', priority: 'high', completed: false, description: 'Focus on Dijkstra and A* Search' },
  { id: '2', title: 'AI/ML Lab: Neural Networks', startTime: '11:00', endTime: '13:00', type: 'class', priority: 'high', completed: false, description: 'Backpropagation implementation' },
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

export default function App() {
  const [userInput, setUserInput] = useState("");
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'tasks' | 'habits' | 'mentor'>('dashboard');
  
  // State
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [syllabusText, setSyllabusText] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [habits, setHabits] = useState<Habit[]>([
    { id: "1", name: "Coding", icon: "Terminal", color: "cyan", completedDates: [] },
    { id: "2", name: "OS Study", icon: "BookOpen", color: "blue", completedDates: [] },
    { id: "3", name: "Exercise", icon: "Activity", color: "green", completedDates: [] },
  ]);

  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [showMentorDrawer, setShowMentorDrawer] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [showLiveVoice, setShowLiveVoice] = useState(false);

  const handleToggleHabit = (id: string) => {
    const today = new Date().toDateString();
    setHabits((prev: Habit[]) =>
      prev.map((h) => {
        if (h.id === id) {
          const alreadyDone = h.completedDates?.includes(today);
          return {
            ...h,
            completedDates: alreadyDone
              ? h.completedDates.filter((d: string) => d !== today)
              : [...(h.completedDates || []), today],
          };
        }
        return h;
      })
    );
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    const userText = text;

    setUserInput("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setMessages((prev) => [...prev, { role: "assistant", content: "Thinking..." }]);

    try {
      const res = await mentorAgent(userText);
      setMessages((prev) => {
        const updated = [...prev];
        updated.pop(); 
        return [...updated, { role: "assistant", content: typeof res === 'string' ? res : (res as any).response }];
      });
    } catch (error) {
      setMessages((prev) => {
        const updated = [...prev];
        updated.pop();
        return [...updated, { role: "assistant", content: "Error getting response." }];
      });
    }
  };

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    setEvents(prev => prev.map(event => event.taskId === id ? { ...event, type: "completed" } : event));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setEvents(prev => prev.filter(e => e.taskId !== id));
  };

  const handleGeneratePlan = async () => {
    if (!syllabusText.trim()) return;
    setLoading(prev => ({ ...prev, syllabus: true }));

    try {
      let result;
      try {
        
      } catch (err) {
        console.log("API failed → using fallback");
        result = syllabusText;
      }

      let topics: any[] = [];
      // Fixed syntax error here: added opening brace for if statement
      if (typeof result === "object" && (result as any)?.topics) {
        topics = (result as any).topics;
      } else if (typeof result === "string") {
        topics = (result as string).split("\n").filter((t: string) => t.trim() !== "");
      }

      const newTasks: Task[] = topics.map((topic: any, index: number) => ({
        id: `task-${Date.now()}-${index}`,
        title: typeof topic === 'string' ? topic : (topic.name || 'Untitled Topic'),
        completed: false,
        startTime: "09:00",
        endTime: "10:00",
        type: "study",
        priority: "medium",
        description: "Generated from syllabus"
      }));

      setTasks(newTasks);

      const newEvents: CalendarEvent[] = newTasks.map((task, index) => ({
        id: `event-${task.id}`,
        title: task.title,
        date: addDays(new Date(), index),
        type: "study",
        taskId: task.id
      }));

      setEvents(newEvents);
    } finally {
      setLoading(prev => ({ ...prev, syllabus: false }));
    }
  };

  if (showLanding) return <NexusLanding onNavigate={(id: any) => { setShowLanding(false); setActiveTab(id); }} />;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-400 flex overflow-hidden">
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] z-0" />
      <LiveVoice isOpen={showLiveVoice} onClose={() => setShowLiveVoice(false)} />
      
      <motion.aside initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="fixed left-6 top-6 bottom-6 w-20 bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-4 flex flex-col items-center gap-8 z-50">
        <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center shadow-lg"><Zap className="text-cyan-400 w-6 h-6" /></div>
        <nav className="flex flex-col gap-6 mt-6">
          <NavIcon icon={<LayoutDashboard size={24} />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} label="Dashboard" />
          <NavIcon icon={<Calendar size={24} />} active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} label="Calendar" />
          <NavIcon icon={<CheckCircle2 size={24} />} active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} label="Tasks" />
          <NavIcon icon={<Activity size={24} />} active={activeTab === 'habits'} onClick={() => setActiveTab('habits')} label="Habits" />
        </nav>
        <button onClick={() => setShowLanding(true)} className="mt-auto p-3 rounded-2xl text-slate-600 hover:text-slate-300"><ArrowLeft size={24} /></button>
      </motion.aside>

      <main className="flex-1 ml-32 p-8 lg:p-12 max-w-7xl mx-auto w-full overflow-y-auto z-10">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="text-3xl font-bold text-slate-100 capitalize">{activeTab}</h2>
          <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 text-sm">
             <Clock size={16} /> <span>{format(new Date(), 'EEEE, do MMMM')}</span>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'tasks' && (
            <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl">
              <div className="flex gap-3 mb-8">
                <div className="relative flex-1">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-900 text-white border border-white/10 focus:border-cyan-500 outline-none transition-all"
                    placeholder="Enter syllabus (e.g. Data Structures, React...)"
                    value={syllabusText}
                    onChange={(e) => setSyllabusText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGeneratePlan()}
                  />
                </div>
                <button onClick={handleGeneratePlan} disabled={loading.syllabus || !syllabusText.trim()} className="bg-cyan-600 px-6 rounded-2xl text-white font-medium hover:bg-cyan-500 disabled:opacity-50 flex items-center gap-2">
                  {loading.syllabus ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />} Generate
                </button>
              </div>
              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 group">
                    <div className="flex items-center gap-4">
                      <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} className="w-5 h-5 rounded accent-cyan-500 cursor-pointer" />
                      <span className={cn("text-slate-200 transition-all", task.completed && "line-through text-slate-600")}>{task.title}</span>
                    </div>
                    <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"><X size={18}/></button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'mentor' && (
            <motion.div key="mentor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl">
              <div className="flex flex-col h-[70vh] justify-between">
                <div className="flex-1 overflow-y-auto p-4 text-white space-y-3">
                  {messages.length === 0 ? (
                    <p className="text-gray-400">Ask anything to your AI mentor...</p>
                  ) : (
                    messages.map((msg, index) => (
                      <div key={index} className={`p-3 rounded-xl max-w-[80%] ${msg.role === "user" ? "bg-cyan-600 ml-auto text-right" : "bg-slate-800"}`}>{msg.content}</div>
                    ))
                  )}
                </div>
                <div className="flex gap-3 mt-4">
                  <input type="text" placeholder="Ask your mentor..." value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend(userInput)} className="flex-1 p-3 rounded-xl bg-slate-900 text-white border border-white/10" />
                  <button onClick={() => handleSend(userInput)} className="bg-cyan-600 px-5 rounded-xl text-white">Send</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="space-y-3">
                {events.length === 0 ? <p className="text-slate-500 italic">No events generated yet.</p> : events.map(event => (
                  <div key={event.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-slate-200">{event.title}</div>
                      <div className="text-xs text-cyan-500">{format(new Date(event.date), 'PPP')}</div>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded-md border border-cyan-500/20">{event.type}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <HabitMatrix habits={habits} onToggle={handleToggleHabit} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowLiveVoice(true)} className="w-14 h-14 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-2xl"><Mic size={24} /></motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab('mentor')} className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 text-cyan-400 flex items-center justify-center shadow-2xl"><Bot size={24} /></motion.button>
      </div>
    </div>
  );
}