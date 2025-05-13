export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  reminderAt?: Date;
  priority: Priority;
  status: TaskStatus;
  category: string;
  createdAt: Date;
  parentTaskId?: string;
  subtasks?: Task[];
  tags?: Tag[];
  assignedTo?: User;
  sharedWith?: User[];
  recurrence?: TaskRecurrence;
  timeEntries?: TimeEntry[];
  isEncrypted?: boolean;
  encryptionKey?: string;
  passwordProtected?: boolean;
  passwordHash?: string;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: string;
  type: 'pomodoro' | 'manual';
  createdAt: Date;
}

export interface PomodoroSettings {
  id: string;
  userId: string;
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  createdAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  userId: string;
}

export interface TaskRecurrence {
  id: string;
  taskId: string;
  frequency: RecurrenceFrequency;
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  monthOfYear?: number;
  startDate: Date;
  endDate?: Date;
  lastGeneratedAt?: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  user: User;
  content: string;
  mentions: string[];
  createdAt: Date;
}

export interface TaskShare {
  id: string;
  taskId: string;
  userId: string;
  permission: 'view' | 'edit';
  createdAt: Date;
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  assignedTo: string;
  assignedBy: string;
  createdAt: Date;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly';
  target: number;
  unit?: string;
  reminderTime?: string;
  createdAt: Date;
  archivedAt?: Date;
  color: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  date: Date;
  value: number;
  notes?: string;
  createdAt: Date;
}

export interface HabitStreak {
  id: string;
  habitId: string;
  userId: string;
  startDate: Date;
  endDate?: Date;
  length: number;
}

export interface UserPoints {
  id: string;
  userId: string;
  points: number;
  level: number;
  createdAt: Date;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  userId: string;
  tasks: TaskTemplateItem[];
  createdAt: Date;
}

export interface TaskTemplateItem {
  title: string;
  description?: string;
  priority: Priority;
  category: string;
  durationEstimate?: number;
  dependencies?: string[];
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  userId: string;
  templateId: string;
  schedule: RoutineSchedule;
  lastRun?: Date;
  createdAt: Date;
}

export interface RoutineSchedule {
  type: 'daily' | 'weekly' | 'monthly';
  time?: string;
  days?: number[];
  dayOfMonth?: number;
  startDate: Date;
  endDate?: Date;
}