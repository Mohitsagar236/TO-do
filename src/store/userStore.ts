import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface Theme {
  primary: string;
  secondary: string;
  accent: string;
}

interface UserPreferences {
  theme: Theme;
  defaultView: 'list' | 'kanban' | 'calendar';
  showCompletedTasks: boolean;
  enableNotifications: boolean;
}

interface UserStore {
  user: User | null;
  darkMode: boolean;
  preferences: UserPreferences;
  setUser: (user: User | null) => void;
  toggleDarkMode: () => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  signOut: () => Promise<void>;
}

const defaultPreferences: UserPreferences = {
  theme: {
    primary: '#3b82f6',
    secondary: '#1e40af',
    accent: '#60a5fa',
  },
  defaultView: 'list',
  showCompletedTasks: true,
  enableNotifications: true,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      darkMode: false,
      preferences: defaultPreferences,
      setUser: (user) => set({ user }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      updatePreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        })),
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

// Set up auth state listener
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    useUserStore.setState({
      user: {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata.name || session.user.email!.split('@')[0],
        isPremium: false,
      },
    });
  } else if (event === 'SIGNED_OUT') {
    useUserStore.setState({ user: null });
  }
});