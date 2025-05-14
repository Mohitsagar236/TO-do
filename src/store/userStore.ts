import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storage } from '../lib/storage';

interface UserStore {
  user: any | null;
  darkMode: boolean;
  preferences: any;
  setUser: (user: any | null) => void;
  toggleDarkMode: () => void;
  updatePreferences: (preferences: any) => void;
  resetPreferences: () => void;
  signOut: () => void;
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

      setUser: (user) => {
        storage.saveUser(user);
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

      signOut: () => {
        storage.clearUser();
        set({ user: null });
      }
    }),
    {
      name: 'user-store'
    }
  )
);