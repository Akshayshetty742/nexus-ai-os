import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  CheckSquare, 
  Activity, 
  Trophy, 
  Terminal, 
  Zap, 
  ArrowRight,
  X,
  Users,
  GraduationCap,
  LayoutDashboard,
  Rocket,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

interface NodeData {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  index: number;
}

const NODES: NodeData[] = [
  { id: 'mentor', label: 'Senior Top', icon: <GraduationCap />, color: 'from-cyan-500 to-blue-600', description: 'AI-driven academic mentorship & guidance', index: 0 },
  { id: 'calendar', label: 'Academic Calendar', icon: <Calendar />, color: 'from-blue-500 to-indigo-600', description: 'Perspective-shifted academic timeline', index: 1 },
  { id: 'tasks', label: 'Task Manager', icon: <LayoutDashboard />, color: 'from-indigo-500 to-purple-600', description: 'High-priority academic missions', index: 2 },
  { id: 'opportunities', label: 'Hackathon Tracker', icon: <Rocket />, color: 'from-purple-500 to-pink-600', description: 'Global & local innovation challenges', index: 3 },
  { id: 'community', label: 'Community', icon: <Users />, color: 'from-pink-500 to-rose-600', description: 'Collaborative student network', index: 4 },
];

export const NexusLanding: React.FC<{ onNavigate: (tab: string, query?: string) => void }> = ({ onNavigate }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#020617]">
      {/* Background Wallpaper */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1920" 
          alt="Futuristic Background" 
          className="w-full h-full object-cover opacity-40 scale-105 animate-pulse-slow"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/80 via-transparent to-[#020617]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-transparent to-[#020617]/80" />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        
        {/* Floating Particles (2D) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: Math.random() * 100 + "%", 
                opacity: Math.random() * 0.5 + 0.2,
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{ 
                y: [null, "-20%", "120%"],
                opacity: [null, 0.8, 0]
              }}
              transition={{ 
                duration: Math.random() * 20 + 10, 
                repeat: Infinity, 
                ease: "linear",
                delay: Math.random() * 10
              }}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full blur-[1px]"
            />
          ))}
        </div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6">
        
        {/* Header Branding */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-10 left-10 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Zap size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tighter uppercase">Senior Top</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">Senior Top Protocol v1.0</p>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isStarted ? (
            <motion.div 
              key="hero"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center max-w-3xl"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-6 leading-none">
                  ELEVATE YOUR <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                    ACADEMIC FLOW
                  </span>
                </h2>
                <p className="text-slate-400 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
                  The futuristic digital senior dashboard designed to navigate your academic trajectory with AI-driven precision.
                </p>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsStarted(true)}
                className="group relative px-10 py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xl rounded-2xl transition-all shadow-2xl shadow-cyan-500/20 flex items-center gap-4 mx-auto"
              >
                INITIATE PROTOCOL
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              key="nav"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-6xl"
            >
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-white mb-2">Select Navigation Node</h3>
                <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">Nexus Neural Network Active</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {NODES.map((node, i) => (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => onNavigate(node.id)}
                    className={cn(
                      "group relative glass-card glass-border rounded-[2rem] p-8 cursor-pointer transition-all duration-500",
                      hoveredNode === node.id ? "scale-105 -translate-y-2 border-cyan-500/50" : "hover:border-white/10"
                    )}
                  >
                    <div className={cn(
                      "w-16 h-16 rounded-2xl bg-gradient-to-br mb-6 flex items-center justify-center text-white shadow-lg transition-transform duration-500 group-hover:rotate-12",
                      node.color
                    )}>
                      {React.cloneElement(node.icon as React.ReactElement<any>, { size: 32 })}
                    </div>
                    
                    <h4 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      {node.label}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {node.description}
                    </p>

                    <div className="absolute bottom-6 right-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">
                      <ArrowRight size={20} className="text-cyan-400" />
                    </div>

                    {/* Glow effect */}
                    <div className={cn(
                      "absolute inset-0 -z-10 bg-gradient-to-br opacity-0 group-hover:opacity-10 blur-3xl transition-opacity rounded-[2rem]",
                      node.color
                    )} />
                  </motion.div>
                ))}
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-16 text-center"
              >
                <button 
                  onClick={() => setIsStarted(false)}
                  className="text-slate-600 hover:text-slate-400 text-xs font-bold uppercase tracking-[0.3em] transition-colors"
                >
                  Return to Core
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] z-20 opacity-20" />
    </div>
  );
};
