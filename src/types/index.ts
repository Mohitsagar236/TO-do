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