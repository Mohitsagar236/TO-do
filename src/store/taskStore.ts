import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, TaskComment } from '../types';
import { storage } from '../lib/storage';

interface TaskStore {
  tasks: Task[];
  comments: { [taskId: string]: TaskComment[] };
  selectedTask: Task | null;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  fetchTasks: () => Promise<Task[]>;
  fetchComments: (taskId: string) => Promise<void>;
  addComment: (taskId: string, content: string, mentions: string[]) => Promise<void>;
  selectTask: (task: Task | null) => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      comments: {},
      selectedTask: null,

      selectTask: (task) => set({ selectedTask: task }),

      fetchTasks: async () => {
        const tasks = storage.getTasks();
        set({ tasks });
        return tasks;
      },

      addTask: (task) => {
        const newTask = {
          ...task,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          completed: false,
          status: task.status || 'todo',
          priority: task.priority || 'medium',
          category: task.category || 'personal'
        };

        set((state) => {
          const tasks = [newTask, ...state.tasks];
          storage.saveTasks(tasks);
          return { tasks };
        });
      },

      deleteTask: (id) => {
        set((state) => {
          const tasks = state.tasks.filter((t) => t.id !== id);
          storage.saveTasks(tasks);
          return { tasks };
        });
      },

      toggleTask: (id) => {
        set((state) => {
          const tasks = state.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          );
          storage.saveTasks(tasks);
          return { tasks };
        });
      },

      updateTask: (id, updates) => {
        set((state) => {
          const tasks = state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          );
          storage.saveTasks(tasks);
          return { tasks };
        });
      },

      fetchComments: async (taskId) => {
        const comments = storage.getComments(taskId);
        set((state) => ({
          comments: {
            ...state.comments,
            [taskId]: comments
          }
        }));
      },

      addComment: async (taskId, content, mentions) => {
        const comment = {
          id: Math.random().toString(36).substr(2, 9),
          taskId,
          content,
          mentions,
          createdAt: new Date(),
          user: storage.getUser()
        };

        set((state) => {
          const taskComments = [...(state.comments[taskId] || []), comment];
          storage.saveComments(taskId, taskComments);
          return {
            comments: {
              ...state.comments,
              [taskId]: taskComments
            }
          };
        });
      }
    }),
    {
      name: 'task-store'
    }
  )
);