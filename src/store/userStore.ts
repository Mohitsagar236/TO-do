import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Subscription } from '../types';
import { supabase } from '../lib/supabase';

interface UserPreferences {
  defaultView: 'list' | 'kanban' | 'calendar';
  showCompletedTasks: boolean;
  enableNotifications: boolean;
  enableSounds: boolean;
  emailNotifications: 'none' | 'important' | 'all' | 'daily' | 'weekly';
  taskSortOrder: 'dueDate' | 'priority' | 'created';
  defaultPriority: 'low' | 'medium' | 'high';
  timeFormat: '12h' | '24h';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  language: string;
  colorTheme: string;
  enableEncryption: boolean;
  enableTracking: boolean;
}

const defaultPreferences: UserPreferences = {
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
  resetPreferences: () => void;
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

      toggleDarkMode: () => {
        set((state) => {
          const newDarkMode = !state.darkMode;
          // Update document class for Tailwind dark mode
          if (newDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { darkMode: newDarkMode };
        });
      },

      updatePreferences: (newPreferences) => {
        set((state) => {
          const updatedPreferences = {
            ...state.preferences,
            ...newPreferences,
          };

          // Save preferences to Supabase if user is logged in
          if (state.user) {
            supabase
              .from('users')
              .update({ 
                preferences: updatedPreferences 
              }, {
                headers: {
                  'Content-Type': 'application/json',
                  'Prefer': 'return=minimal'
                }
              })
              .eq('id', state.user.id)
              .then(({ error }) => {
                if (error) {
                  console.error('Failed to save preferences:', error);
                }
              });
          }

          return { preferences: updatedPreferences };
        });
      },

      resetPreferences: () => {
        set({ preferences: defaultPreferences });
      },

      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        set({
          user: null,
          subscription: null,
          preferences: defaultPreferences,
        });
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

          // Also fetch user preferences
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('preferences')
            .eq('id', user.id)
            .single();

          if (!userError && userData?.preferences) {
            set((state) => ({
              preferences: {
                ...state.preferences,
                ...userData.preferences,
              },
            }));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      },
    }),
    {
      name: 'user-store',
      partialize: (state) => ({
        darkMode: state.darkMode,
        preferences: state.preferences,
      }),
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

    // Apply dark mode preference
    if (store.darkMode) {
      document.documentElement.classList.add('dark');
    }
  } else if (event === 'SIGNED_OUT') {
    store.setUser(null);
    store.resetPreferences();
  }
});