import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, TaskComment } from '../types';
import { supabase } from '../lib/supabase';
import { useUserStore } from './userStore';
import { useOfflineStore } from './offlineStore';

interface TaskStore {
  tasks: Task[];
  comments: { [taskId: string]: TaskComment[] };
  selectedTask: Task | null;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  fetchTasks: () => Promise<Task[]>;
  fetchComments: (taskId: string) => Promise<void>;
  addComment: (taskId: string, content: string, mentions: string[]) => Promise<void>;
  shareTask: (taskId: string, email: string, permission: 'view' | 'edit') => Promise<void>;
  assignTask: (taskId: string, email: string) => Promise<void>;
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
        const user = useUserStore.getState().user;
        if (!user) return [];

        try {
          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          const tasks = data.map((task) => ({
            ...task,
            dueDate: task.due_date ? new Date(task.due_date) : null,
            createdAt: new Date(task.created_at),
          }));

          set({ tasks });
          return tasks;
        } catch (error) {
          console.error('Error fetching tasks:', error);
          const offlineData = useOfflineStore.getState().getOfflineData('tasks');
          set({ tasks: offlineData });
          return offlineData;
        }
      },

      addTask: async (task) => {
        const user = useUserStore.getState().user;
        if (!user) return;

        const { isOnline, addPendingChange } = useOfflineStore.getState();

        try {
          const taskData = {
            title: task.title,
            description: task.description,
            completed: task.completed || false,
            due_date: task.dueDate ? task.dueDate.toISOString() : null,
            priority: task.priority || 'medium',
            category: task.category || 'personal',
            user_id: user.id,
            status: task.status || 'todo'
          };

          if (!isOnline) {
            addPendingChange({
              type: 'create',
              entity: 'task',
              data: taskData,
            });

            const newTask = {
              ...taskData,
              id: Math.random().toString(36).substr(2, 9),
              createdAt: new Date(),
            };

            set((state) => ({
              tasks: [newTask, ...state.tasks],
            }));
            return;
          }

          const { data, error } = await supabase
            .from('tasks')
            .insert([taskData])
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            tasks: [
              {
                ...data,
                dueDate: data.due_date ? new Date(data.due_date) : null,
                createdAt: new Date(data.created_at),
              },
              ...state.tasks,
            ],
          }));
        } catch (error) {
          console.error('Error adding task:', error);
          throw error;
        }
      },

      deleteTask: async (id) => {
        const { isOnline, addPendingChange } = useOfflineStore.getState();

        try {
          if (!isOnline) {
            addPendingChange({
              type: 'delete',
              entity: 'task',
              data: { id },
            });
          } else {
            const { error } = await supabase
              .from('tasks')
              .delete()
              .match({ id });

            if (error) throw error;
          }

          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
          }));
        } catch (error) {
          console.error('Error deleting task:', error);
          throw error;
        }
      },

      toggleTask: async (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;

        const { isOnline, addPendingChange } = useOfflineStore.getState();

        try {
          const updatedTask = { ...task, completed: !task.completed };

          if (!isOnline) {
            addPendingChange({
              type: 'update',
              entity: 'task',
              data: updatedTask,
            });
          } else {
            const { error } = await supabase
              .from('tasks')
              .update({ completed: !task.completed })
              .match({ id });

            if (error) throw error;
          }

          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === id ? { ...t, completed: !t.completed } : t
            ),
          }));
        } catch (error) {
          console.error('Error toggling task:', error);
          throw error;
        }
      },

      updateTask: async (id, updatedFields) => {
        const { isOnline, addPendingChange } = useOfflineStore.getState();

        try {
          if (!isOnline) {
            addPendingChange({
              type: 'update',
              entity: 'task',
              data: { id, ...updatedFields },
            });
          } else {
            const { error } = await supabase
              .from('tasks')
              .update(updatedFields)
              .match({ id });

            if (error) throw error;
          }

          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id ? { ...task, ...updatedFields } : task
            ),
          }));
        } catch (error) {
          console.error('Error updating task:', error);
          throw error;
        }
      },

      fetchComments: async (taskId) => {
        try {
          const { data, error } = await supabase
            .from('task_comments')
            .select(`
              *,
              user:users(id, name, avatar_url)
            `)
            .eq('task_id', taskId)
            .order('created_at', { ascending: true });

          if (error) throw error;

          set((state) => ({
            comments: {
              ...state.comments,
              [taskId]: data,
            },
          }));
        } catch (error) {
          console.error('Error fetching comments:', error);
          throw error;
        }
      },

      addComment: async (taskId, content, mentions) => {
        const user = useUserStore.getState().user;
        if (!user) return;

        try {
          const { data, error } = await supabase
            .from('task_comments')
            .insert([
              {
                task_id: taskId,
                user_id: user.id,
                content,
                mentions,
              },
            ])
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            comments: {
              ...state.comments,
              [taskId]: [...(state.comments[taskId] || []), data],
            },
          }));
        } catch (error) {
          console.error('Error adding comment:', error);
          throw error;
        }
      },

      shareTask: async (taskId, email, permission) => {
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

          if (userError) throw userError;

          const { error } = await supabase.from('task_shares').insert([
            {
              task_id: taskId,
              user_id: userData.id,
              permission,
            },
          ]);

          if (error) throw error;
        } catch (error) {
          console.error('Error sharing task:', error);
          throw error;
        }
      },

      assignTask: async (taskId, email) => {
        const user = useUserStore.getState().user;
        if (!user) return;

        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

          if (userError) throw userError;

          const { error } = await supabase.from('task_assignments').insert([
            {
              task_id: taskId,
              assigned_to: userData.id,
              assigned_by: user.id,
            },
          ]);

          if (error) throw error;
        } catch (error) {
          console.error('Error assigning task:', error);
          throw error;
        }
      },
    }),
    {
      name: 'task-store',
    }
  )
);