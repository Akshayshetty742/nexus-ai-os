export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'exam' | 'hackathon' | 'study-block' | 'holiday';
  registered?: boolean;
  registrationDate?: Date;
  daysUnregistered?: number;
}

export interface Task {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: 'class' | 'study' | 'break' | 'event' | 'task';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  description?: string;
}

export interface StudyPlan {
  subject: string;
  topics: {
    name: string;
    weightage: string;
    deadline: string;
    subtopics: string[];
    isImportant?: boolean;
  }[];
  examDates: {
    type: string;
    date: string;
  }[];
}

export interface Opportunity {
  title: string;
  location: string;
  date: string;
  type: 'hackathon' | 'workshop' | 'seminar';
  link: string;
  relevance: string;
}

export interface SparkTask {
  title: string;
  duration: string;
  benefit: string;
}

export interface Habit {
  id: string;
  title: string;
  icon: string;
  color: string;
  streak: number;
  lastCompleted?: string; // ISO date string
  history: string[]; // List of ISO date strings (YYYY-MM-DD)
}

export interface HabitLog {
  [habitId: string]: string[]; // habitId -> array of completed dates
}
