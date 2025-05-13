import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, TaskComment, User } from '../types';
import { supabase } from '../lib/supabase';
import { useUserStore } from './userStore';

interface TaskStore {
  tasks: Task[];
  comments: Record<string, TaskComment[]>;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  fetchTasks: () => Promise<void>;
  shareTask: (taskId: string, userId: string, permission: 'view' | 'edit') => Promise<void>;
  assignTask: (taskId: string, userId: string) => Promise<void>;
  addComment: (taskId: string, content: string, mentions: string[]) => Promise<void>;
  fetchComments: (taskId: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      comments: {},
      fetchTasks: async () => {
        const user = useUserStore.getState().user;
        if (!user) return;

        const { data, error } = await supabase
          .from('tasks')
          .select(`
            *,
            task_assignments(assigned_to),
            task_shares(user_id, permission)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        set({
          tasks: data.map((task) => ({
            ...task,
            dueDate: task.due_date ? new Date(task.due_date) : undefined,
            createdAt: new Date(task.created_at),
            assignedTo: task.task_assignments?.[0]?.assigned_to,
            sharedWith: task.task_shares?.map((share) => share.user_id) || [],
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
          comments: { ...state.comments, [id]: [] },
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
      shareTask: async (taskId, userId, permission) => {
        const { error } = await supabase.from('task_shares').insert({
          task_id: taskId,
          user_id: userId,
          permission,
        });

        if (error) throw error;
        await get().fetchTasks();
      },
      assignTask: async (taskId, userId) => {
        const user = useUserStore.getState().user;
        if (!user) return;

        const { error } = await supabase.from('task_assignments').insert({
          task_id: taskId,
          assigned_to: userId,
          assigned_by: user.id,
        });

        if (error) throw error;
        await get().fetchTasks();
      },
      addComment: async (taskId, content, mentions) => {
        const user = useUserStore.getState().user;
        if (!user) return;

        const { data, error } = await supabase.from('task_comments').insert({
          task_id: taskId,
          user_id: user.id,
          content,
          mentions,
        }).select().single();

        if (error) throw error;

        set((state) => ({
          comments: {
            ...state.comments,
            [taskId]: [
              ...(state.comments[taskId] || []),
              {
                ...data,
                createdAt: new Date(data.created_at),
                user: user,
              },
            ],
          },
        }));
      },
      fetchComments: async (taskId) => {
        const { data, error } = await supabase
          .from('task_comments')
          .select(`
            *,
            users!task_comments_user_id_fkey (
              id,
              email,
              raw_user_meta_data->name
            )
          `)
          .eq('task_id', taskId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        set((state) => ({
          comments: {
            ...state.comments,
            [taskId]: data.map((comment) => ({
              ...comment,
              createdAt: new Date(comment.created_at),
              user: {
                id: comment.users.id,
                email: comment.users.email,
                name: comment.users.name || comment.users.email.split('@')[0],
                isPremium: false,
              },
            })),
          },
        }));
      },
    }),
    {
      name: 'task-store',
    }
  )
);