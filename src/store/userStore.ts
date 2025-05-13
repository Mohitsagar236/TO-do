import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface UserStore {
  user: User | null;
  darkMode: boolean;
  setUser: (user: User | null) => void;
  toggleDarkMode: () => void;
  signOut: () => Promise<void>;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      darkMode: false,
      setUser: (user) => set({ user }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
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