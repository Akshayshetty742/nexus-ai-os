import React from 'react';
import { motion } from 'motion/react';
import { 
  Terminal, 
  BookOpen, 
  Activity, 
  CheckCircle2, 
  Circle, 
  Flame,
  Trophy
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Habit } from '../types';
import { StreakService } from '../lib/streakService';
import { format, eachDayOfInterval, subDays, isSameDay } from 'date-fns';

interface HabitMatrixProps {
  habits: Habit[];
  onToggle: (habitId: string) => void;
}

const ICON_MAP: Record<string, any> = {
  Terminal,
  BookOpen,
  Activity
};

export const HabitMatrix: React.FC<HabitMatrixProps> = ({ habits, onToggle }) => {
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Habit Matrix</h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Automatic Streak Tracking Active</p>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
            35-Day Matrix
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {habits.map((habit) => {
          const Icon = ICON_MAP[habit.icon] || Terminal;
          const isCompletedToday = habit.history.includes(format(new Date(), 'yyyy-MM-dd'));

          return (
            <motion.div
              key={habit.id}
              layout
              className="glass-card glass-border rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 group hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-center gap-4 w-full md:w-1/3">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-500 group-hover:rotate-6",
                  habit.color === 'cyan' ? "bg-gradient-to-br from-cyan-500 to-blue-600" :
                  habit.color === 'blue' ? "bg-gradient-to-br from-blue-500 to-indigo-600" :
                  "bg-gradient-to-br from-emerald-500 to-teal-600"
                )}>
                  <Icon size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{habit.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Flame size={14} className={cn(habit.streak > 0 ? "text-orange-500" : "text-slate-600")} />
                    <span className={cn(
                      "text-xs font-bold uppercase tracking-widest",
                      habit.streak > 0 ? "text-orange-400" : "text-slate-600"
                    )}>
                      {habit.streak} Day Streak
                    </span>
                    {habit.streak >= 5 && (
                      <span className="ml-2 px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-500 text-[8px] font-black uppercase tracking-tighter flex items-center gap-1">
                        <Trophy size={8} /> Elite
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-between w-full">
                <div className="flex gap-2">
                  {last7Days.map((date, i) => {
                    const isCompleted = habit.history.includes(format(date, 'yyyy-MM-dd'));
                    const isToday = isSameDay(date, new Date());
                    
                    return (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                          isCompleted 
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" 
                            : "bg-slate-900/50 text-slate-700 border border-white/5",
                          isToday && !isCompleted && "border-white/20"
                        )}>
                          {isCompleted ? <CheckCircle2 size={16} /> : <Circle size={12} />}
                        </div>
                        <span className="text-[8px] font-bold text-slate-600 uppercase">{format(date, 'EEE')}</span>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => onToggle(habit.id)}
                  className={cn(
                    "px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2",
                    isCompletedToday
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg shadow-cyan-600/20"
                  )}
                >
                  {isCompletedToday ? (
                    <>
                      <CheckCircle2 size={18} />
                      Completed
                    </>
                  ) : (
                    "Complete Today"
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
