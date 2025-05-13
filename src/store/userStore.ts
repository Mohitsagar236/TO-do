import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface UserStore {
  user: User | null;
  darkMode: boolean;
  setUser: (user: User | null) => void;
  toggleDarkMode: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      darkMode: false,
      setUser: (user) => set({ user }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      signIn: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.user) {
          set({
            user: {
              id: data.user.id,
              email: data.user.email!,
              name: data.user.user_metadata.name || email.split('@')[0],
              isPremium: false,
            },
          });
        }
      },
      signUp: async (email: string, password: string, name: string) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });
        
        if (error) throw error;
        
        if (data.user) {
          set({
            user: {
              id: data.user.id,
              email: data.user.email!,
              name: name,
              isPremium: false,
            },
          });
        }
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        set({ user: null });
      },
    }),
    {
      name: 'user-store',
    }
  )
);