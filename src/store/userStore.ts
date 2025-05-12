import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface UserStore {
  user: User | null;
  darkMode: boolean;
  setUser: (user: User | null) => void;
  toggleDarkMode: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      darkMode: false,
      setUser: (user) => set({ user }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    }),
    {
      name: 'user-store',
    }
  )
);