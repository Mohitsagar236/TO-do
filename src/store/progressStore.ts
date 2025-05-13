import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProgress, Badge, LeaderboardEntry } from '../types';
import { supabase } from '../lib/supabase';
import { useUserStore } from './userStore';
import ConfettiGenerator from 'canvas-confetti';

interface ProgressStore {
  progress: UserProgress | null;
  leaderboard: LeaderboardEntry[];
  fetchProgress: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  unlockBadge: (badgeId: string) => Promise<void>;
  updateStreak: () => Promise<void>;
  checkBadgeUnlocks: () => Promise<void>;
}

const BADGES: Badge[] = [
  {
    id: 'first-task',
    name: 'First Steps',
    description: 'Complete your first task',
    icon: '🎯',
    requirement: { type: 'tasks', value: 1 },
  },
  {
    id: 'productive-week',
    name: 'Productive Week',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    requirement: { type: 'streak', value: 7 },
  },
  {
    id: 'task-master',
    name: 'Task Master',
    description: 'Complete 100 tasks',
    icon: '👑',
    requirement: { type: 'tasks', value: 100 },
  },
  {
    id: 'xp-warrior',
    name: 'XP Warrior',
    description: 'Earn 1000 XP',
    icon: '⚔️',
    requirement: { type: 'xp', value: 1000 },
  },
];

const calculateLevel = (xp: number): number => {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      progress: null,
      leaderboard: [],

      fetchProgress: async () => {
        const user = useUserStore.getState().user;
        if (!user) return;

        const { data, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (!data) {
          // Create initial progress record
          const initialProgress = {
            user_id: user.id,
            xp: 0,
            level: 1,
            badges: [],
            streak_days: 0,
            last_task_date: new Date().toISOString(),
            tasks_completed: 0,
          };

          const { data: newProgress, error: createError } = await supabase
            .from('user_progress')
            .insert([initialProgress])
            .select()
            .single();

          if (createError) throw createError;
          set({ progress: newProgress });
        } else {
          set({ progress: data });
        }
      },

      fetchLeaderboard: async () => {
        const { data, error } = await supabase
          .from('user_progress')
          .select(`
            user_id,
            xp,
            level,
            badges,
            users (
              name
            )
          `)
          .order('xp', { ascending: false })
          .limit(10);

        if (error) throw error;

        const leaderboard = data.map((entry, index) => ({
          userId: entry.user_id,
          userName: entry.users?.name || 'Unknown User',
          xp: entry.xp,
          level: entry.level,
          badges: entry.badges?.length || 0,
          rank: index + 1,
        }));

        set({ leaderboard });
      },

      addXP: async (amount: number) => {
        const user = useUserStore.getState().user;
        if (!user) return;

        const currentProgress = get().progress;
        if (!currentProgress) return;

        const newXP = currentProgress.xp + amount;
        const newLevel = calculateLevel(newXP);

        const { error } = await supabase
          .from('user_progress')
          .update({
            xp: newXP,
            level: newLevel,
          })
          .eq('user_id', user.id);

        if (error) throw error;

        set((state) => ({
          progress: state.progress
            ? { ...state.progress, xp: newXP, level: newLevel }
            : null,
        }));

        // Level up celebration
        if (newLevel > currentProgress.level) {
          ConfettiGenerator({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }

        await get().checkBadgeUnlocks();
      },

      unlockBadge: async (badgeId: string) => {
        const user = useUserStore.getState().user;
        if (!user) return;

        const currentProgress = get().progress;
        if (!currentProgress) return;

        const badge = BADGES.find((b) => b.id === badgeId);
        if (!badge) return;

        const updatedBadges = [
          ...(currentProgress.badges || []),
          { ...badge, unlockedAt: new Date() },
        ];

        const { error } = await supabase
          .from('user_progress')
          .update({ badges: updatedBadges })
          .eq('user_id', user.id);

        if (error) throw error;

        set((state) => ({
          progress: state.progress
            ? { ...state.progress, badges: updatedBadges }
            : null,
        }));

        // Badge unlock celebration
        ConfettiGenerator({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      },

      updateStreak: async () => {
        const user = useUserStore.getState().user;
        if (!user) return;

        const currentProgress = get().progress;
        if (!currentProgress) return;

        const lastTaskDate = new Date(currentProgress.lastTaskDate);
        const today = new Date();
        const diffDays = Math.floor(
          (today.getTime() - lastTaskDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        let newStreak = currentProgress.streakDays;
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }

        const { error } = await supabase
          .from('user_progress')
          .update({
            streak_days: newStreak,
            last_task_date: today.toISOString(),
          })
          .eq('user_id', user.id);

        if (error) throw error;

        set((state) => ({
          progress: state.progress
            ? {
                ...state.progress,
                streakDays: newStreak,
                lastTaskDate: today,
              }
            : null,
        }));

        await get().checkBadgeUnlocks();
      },

      checkBadgeUnlocks: async () => {
        const progress = get().progress;
        if (!progress) return;

        const unlockedBadgeIds = progress.badges.map((b) => b.id);

        for (const badge of BADGES) {
          if (unlockedBadgeIds.includes(badge.id)) continue;

          const shouldUnlock = (() => {
            switch (badge.requirement.type) {
              case 'tasks':
                return progress.tasksCompleted >= badge.requirement.value;
              case 'streak':
                return progress.streakDays >= badge.requirement.value;
              case 'xp':
                return progress.xp >= badge.requirement.value;
              default:
                return false;
            }
          })();

          if (shouldUnlock) {
            await get().unlockBadge(badge.id);
          }
        }
      },
    }),
    {
      name: 'progress-store',
    }
  )
);