import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storage } from '../lib/storage';
import { supabase } from '../lib/supabase';

interface UserStore {
  user: any | null;
  darkMode: boolean;
  preferences: any;
  setUser: (user: any | null) => void;
  validateSession: () => Promise<boolean>;
  toggleDarkMode: () => void;
  updatePreferences: (preferences: any) => void;
  resetPreferences: () => void;
  signOut: () => Promise<void>;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: storage.getUser(),
      darkMode: false,
      preferences: {
        defaultView: 'list',
        showCompletedTasks: true,
        enableNotifications: true,
        enableSounds: true,
        emailNotifications: 'important',
        taskSortOrder: 'dueDate',
        defaultPriority: 'medium',
        timeFormat: '12h',
        dateFormat: 'MM/DD/YYYY',
        language: 'en',
        colorTheme: 'blue',
        enableEncryption: false,
        enableTracking: true,
      },

      validateSession: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            storage.clearUser();
            set({ user: null });
            return false;
          }
          
          // Update stored user data with latest session data
          storage.saveUser(session.user);
          set({ user: session.user });
          return true;
        } catch (error) {
          console.error('Session validation error:', error);
          storage.clearUser();
          set({ user: null });
          return false;
        }
      },

      setUser: (user) => {
        if (user) {
          storage.saveUser(user);
        } else {
          storage.clearUser();
        }
        set({ user });
      },

      toggleDarkMode: () => {
        set((state) => {
          const newDarkMode = !state.darkMode;
          if (newDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { darkMode: newDarkMode };
        });
      },

      updatePreferences: (newPreferences) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...newPreferences,
          }
        }));
      },

      resetPreferences: () => {
        set({
          preferences: {
            defaultView: 'list',
            showCompletedTasks: true,
            enableNotifications: true,
            enableSounds: true,
            emailNotifications: 'important',
            taskSortOrder: 'dueDate',
            defaultPriority: 'medium',
            timeFormat: '12h',
            dateFormat: 'MM/DD/YYYY',
            language: 'en',
            colorTheme: 'blue',
            enableEncryption: false,
            enableTracking: true,
          }
        });
      },

      signOut: async () => {
        try {
          await supabase.auth.signOut();
          storage.clearUser();
          set({ user: null });
        } catch (error) {
          console.error('Error signing out:', error);
          throw error;
        }
      }
    }),
    {
      name: 'user-store'
    }
  )
);