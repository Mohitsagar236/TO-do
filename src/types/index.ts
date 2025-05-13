export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type UserType = 'student' | 'developer' | 'freelancer' | 'startup';

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
  xpReward?: number;
  completedOnTime?: boolean;
  courseId?: string;
  assignmentType?: 'homework' | 'exam' | 'project' | 'reading';
  grade?: number;
  githubIssueId?: string;
  repositoryUrl?: string;
  clientId?: string;
  projectId?: string;
  billable?: boolean;
  rate?: number;
  teamId?: string;
  sprintId?: string;
  storyPoints?: number;
}

export interface UserProgress {
  id: string;
  userId: string;
  xp: number;
  level: number;
  badges: Badge[];
  streakDays: number;
  lastTaskDate: Date;
  tasksCompleted: number;
  createdAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: {
    type: 'tasks' | 'streak' | 'xp';
    value: number;
  };
  unlockedAt?: Date;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  xp: number;
  level: number;
  badges: number;
  rank: number;
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
  userType?: UserType;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: Theme;
  defaultView: 'list' | 'kanban' | 'calendar';
  showCompletedTasks: boolean;
  enableNotifications: boolean;
  semester?: string;
  defaultCourse?: string;
  githubToken?: string;
  defaultRepository?: string;
  defaultClient?: string;
  defaultRate?: number;
  defaultTeam?: string;
  defaultSprint?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  instructor: string;
  schedule: string;
  credits: number;
  grade?: number;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  type: 'homework' | 'exam' | 'project' | 'reading';
  dueDate: Date;
  weight: number;
  grade?: number;
}

export interface GitHubIssue {
  id: string;
  number: number;
  title: string;
  state: string;
  repository: string;
  assignees: string[];
  labels: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  tags: string[];
}

export interface Client {
  id: string;
  name: string;
  email: string;
  rate: number;
  currency: string;
  projects: Project[];
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  budget: number;
  rate: number;
}

export interface Invoice {
  id: string;
  clientId: string;
  projectId: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid';
  dueDate: Date;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}

export interface TeamMember {
  userId: string;
  role: 'admin' | 'member';
  joinedAt: Date;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  goals: string[];
  status: 'planning' | 'active' | 'review' | 'completed';
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