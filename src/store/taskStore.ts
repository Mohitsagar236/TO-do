import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task } from '../types';
import { supabase } from '../lib/supabase';
import { useUserStore } from './userStore';

interface TaskStore {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  fetchTasks: () => Promise<void>;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      fetchTasks: async () => {
        const user = useUserStore.getState().user;
        if (!user) return;

        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        set({
          tasks: data.map((task) => ({
            ...task,
            dueDate: task.due_date ? new Date(task.due_date) : undefined,
            createdAt: new Date(task.created_at),
          })),
        });
      },
      addTask: async (task) => {
        const user = useUserStore.getState().user;
        if (!user) return;

        const { data, error } = await supabase.from('tasks').insert([
          {
            title: task.title,
            description: task.description,
            completed: task.completed,
            due_date: task.dueDate?.toISOString(),
            priority: task.priority,
            category: task.category,
            user_id: user.id,
          },
        ]).select().single();

        if (error) throw error;

        set((state) => ({
          tasks: [
            {
              ...data,
              dueDate: data.due_date ? new Date(data.due_date) : undefined,
              createdAt: new Date(data.created_at),
            },
            ...state.tasks,
          ],
        }));
      },
      deleteTask: async (id) => {
        const { error } = await supabase.from('tasks').delete().match({ id });
        
        if (error) throw error;

        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },
      toggleTask: async (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;

        const { error } = await supabase
          .from('tasks')
          .update({ completed: !task.completed })
          .match({ id });

        if (error) throw error;

        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
          ),
        }));
      },
      updateTask: async (id, updatedTask) => {
        const { error } = await supabase
          .from('tasks')
          .update({
            ...updatedTask,
            due_date: updatedTask.dueDate?.toISOString(),
          })
          .match({ id });

        if (error) throw error;

        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updatedTask } : task
          ),
        }));
      },
    }),
    {
      name: 'task-store',
    }
  )
);