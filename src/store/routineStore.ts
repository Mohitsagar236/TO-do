import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TaskTemplate, Routine } from '../types';
import { supabase } from '../lib/supabase';
import { useUserStore } from './userStore';
import { useTaskStore } from './taskStore';
import { addDays, format, parse, isSameDay } from 'date-fns';

interface RoutineStore {
  templates: TaskTemplate[];
  routines: Routine[];
  fetchTemplates: () => Promise<void>;
  fetchRoutines: () => Promise<void>;
  addTemplate: (template: Omit<TaskTemplate, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateTemplate: (id: string, template: Partial<TaskTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  addRoutine: (routine: Omit<Routine, 'id' | 'userId' | 'createdAt' | 'lastRun'>) => Promise<void>;
  updateRoutine: (id: string, routine: Partial<Routine>) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  executeRoutine: (routineId: string) => Promise<void>;
  checkAndExecuteRoutines: () => Promise<void>;
}

export const useRoutineStore = create<RoutineStore>()(
  persist(
    (set, get) => ({
      templates: [],
      routines: [],

      fetchTemplates: async () => {
        const user = useUserStore.getState().user;
        if (!user) return;

        const { data, error } = await supabase
          .from('task_templates')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        set({
          templates: data.map(template => ({
            ...template,
            createdAt: new Date(template.created_at),
          })),
        });
      },

      fetchRoutines: async () => {
        const user = useUserStore.getState().user;
        if (!user) return;

        const { data, error } = await supabase
          .from('routines')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        set({
          routines: data.map(routine => ({
            ...routine,
            createdAt: new Date(routine.created_at),
            lastRun: routine.last_run ? new Date(routine.last_run) : undefined,
          })),
        });
      },

      addTemplate: async (template) => {
        const user = useUserStore.getState().user;
        if (!user) return;

        const { data, error } = await supabase
          .from('task_templates')
          .insert([
            {
              ...template,
              user_id: user.id,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        set(state => ({
          templates: [
            {
              ...data,
              createdAt: new Date(data.created_at),
            },
            ...state.templates,
          ],
        }));
      },

      updateTemplate: async (id, template) => {
        const { error } = await supabase
          .from('task_templates')
          .update(template)
          .eq('id', id);

        if (error) throw error;

        set(state => ({
          templates: state.templates.map(t =>
            t.id === id ? { ...t, ...template } : t
          ),
        }));
      },

      deleteTemplate: async (id) => {
        const { error } = await supabase
          .from('task_templates')
          .delete()
          .eq('id', id);

        if (error) throw error;

        set(state => ({
          templates: state.templates.filter(t => t.id !== id),
        }));
      },

      addRoutine: async (routine) => {
        const user = useUserStore.getState().user;
        if (!user) return;

        const { data, error } = await supabase
          .from('routines')
          .insert([
            {
              ...routine,
              user_id: user.id,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        set(state => ({
          routines: [
            {
              ...data,
              createdAt: new Date(data.created_at),
              lastRun: data.last_run ? new Date(data.last_run) : undefined,
            },
            ...state.routines,
          ],
        }));
      },

      updateRoutine: async (id, routine) => {
        const { error } = await supabase
          .from('routines')
          .update(routine)
          .eq('id', id);

        if (error) throw error;

        set(state => ({
          routines: state.routines.map(r =>
            r.id === id ? { ...r, ...routine } : r
          ),
        }));
      },

      deleteRoutine: async (id) => {
        const { error } = await supabase
          .from('routines')
          .delete()
          .eq('id', id);

        if (error) throw error;

        set(state => ({
          routines: state.routines.filter(r => r.id !== id),
        }));
      },

      executeRoutine: async (routineId) => {
        const routine = get().routines.find(r => r.id === routineId);
        const template = get().templates.find(t => t.id === routine?.templateId);
        
        if (!routine || !template) return;

        const addTask = useTaskStore.getState().addTask;

        // Create tasks from template
        for (const taskTemplate of template.tasks) {
          await addTask({
            title: taskTemplate.title,
            description: taskTemplate.description,
            priority: taskTemplate.priority,
            category: taskTemplate.category,
            completed: false,
          });
        }

        // Update last run time
        await get().updateRoutine(routineId, {
          lastRun: new Date(),
        });
      },

      checkAndExecuteRoutines: async () => {
        const routines = get().routines;
        const now = new Date();

        for (const routine of routines) {
          const shouldExecute = (() => {
            if (!routine.lastRun) return true;

            const schedule = routine.schedule;
            const lastRun = new Date(routine.lastRun);

            switch (schedule.type) {
              case 'daily':
                return !isSameDay(lastRun, now);
              case 'weekly':
                return schedule.days?.includes(now.getDay()) &&
                  !isSameDay(lastRun, now);
              case 'monthly':
                return schedule.dayOfMonth === now.getDate() &&
                  !isSameDay(lastRun, now);
              default:
                return false;
            }
          })();

          if (shouldExecute) {
            await get().executeRoutine(routine.id);
          }
        }
      },
    }),
    {
      name: 'routine-store',
    }
  )
);