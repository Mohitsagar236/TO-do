export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  priority: Priority;
  category: string;
  createdAt: Date;
  assignedTo?: User;
  sharedWith?: User[];
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