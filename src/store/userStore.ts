import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Subscription } from '../types';
import { supabase } from '../lib/supabase';

interface UserPreferences {
  defaultView: 'list' | 'kanban' | 'calendar';
  showCompletedTasks: boolean;
  enableNotifications: boolean;
  taskSortOrder: 'dueDate' | 'priority' | 'created';
  defaultPriority: 'low' | 'medium' | 'high';
}

const defaultPreferences: UserPreferences = {
  defaultView: 'list',
  showCompletedTasks: true,
  enableNotifications: true,
  taskSortOrder: 'dueDate',
  defaultPriority: 'medium'
};

interface UserStore {
  user: User | null;
  subscription: Subscription | null;
  darkMode: boolean;
  preferences: UserPreferences;
  setUser: (user: User | null) => void;
  setSubscription: (subscription: Subscription | null) => void;
  toggleDarkMode: () => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  signOut: () => Promise<void>;
  fetchSubscription: () => Promise<void>;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      subscription: null,
      darkMode: false,
      preferences: defaultPreferences,

      setUser: (user) => set({ user }),

      setSubscription: (subscription) => set({ subscription }),

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      updatePreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        })),

      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        set({ user: null, subscription: null });
      },

      fetchSubscription: async () => {
        const user = get().user;
        if (!user) return;

        try {
          const { data: subscription, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (error) throw error;

          set({ subscription });
        } catch (error) {
          console.error('Error fetching subscription:', error);
        }
      },
    }),
    {
      name: 'user-store',
    }
  )
);

// Set up auth state listener
supabase.auth.onAuthStateChange(async (event, session) => {
  const store = useUserStore.getState();

  if (session?.user) {
    store.setUser({
      id: session.user.id,
      email: session.user.email!,
      name: session.user.user_metadata.name || session.user.email!.split('@')[0],
      isPremium: false,
    });
    store.fetchSubscription();
  } else if (event === 'SIGNED_OUT') {
    store.setUser(null);
  }
});