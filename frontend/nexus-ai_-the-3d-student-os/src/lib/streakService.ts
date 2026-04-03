import { Habit, HabitLog } from '../types';
import { format, subDays, isSameDay, parseISO } from 'date-fns';

const HABITS_KEY = 'senior_top_habits';
const LOG_KEY = 'senior_top_habit_log';

export const StreakService = {
  getHabits: (): Habit[] => {
    const stored = localStorage.getItem(HABITS_KEY);
    if (!stored) return [
      { id: 'coding', title: 'Coding', icon: 'Terminal', color: 'cyan', streak: 0, history: [] },
      { id: 'study', title: 'OS Study', icon: 'BookOpen', color: 'blue', streak: 0, history: [] },
      { id: 'exercise', title: 'Exercise', icon: 'Activity', color: 'emerald', streak: 0, history: [] },
    ];
    return JSON.parse(stored);
  },

  saveHabits: (habits: Habit[]) => {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  },

  calculateStreak: (history: string[]): number => {
    if (history.length === 0) return 0;
    
    const sortedDates = [...new Set(history)].sort((a, b) => b.localeCompare(a));
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');

    // If the latest date is not today or yesterday, streak is broken
    if (sortedDates[0] !== todayStr && sortedDates[0] !== yesterdayStr) {
      return 0;
    }

    let streak = 0;
    let checkDate = parseISO(sortedDates[0]);

    for (let i = 0; i < sortedDates.length; i++) {
      const current = parseISO(sortedDates[i]);
      const expected = subDays(checkDate, i);
      
      if (isSameDay(current, expected)) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  },

  toggleHabit: (habitId: string, habits: Habit[]): { updatedHabits: Habit[], isCompleted: boolean } => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    let isCompleted = false;

    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const history = [...habit.history];
        const index = history.indexOf(todayStr);
        
        if (index > -1) {
          history.splice(index, 1);
          isCompleted = false;
        } else {
          history.push(todayStr);
          isCompleted = true;
        }

        const streak = StreakService.calculateStreak(history);
        return { ...habit, history, streak, lastCompleted: isCompleted ? todayStr : habit.lastCompleted };
      }
      return habit;
    });

    StreakService.saveHabits(updatedHabits);
    return { updatedHabits, isCompleted };
  }
};
