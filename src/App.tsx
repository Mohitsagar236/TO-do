import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useUserStore } from './store/userStore';
import { useTaskStore } from './store/taskStore';
import { useOfflineStore } from './store/offlineStore';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ProductivityAnalytics } from './components/ProductivityAnalytics';
import { TeamPanel } from './components/TeamPanel';
import { SubscriptionBanner } from './components/SubscriptionBanner';
import { UserPreferences } from './components/UserPreferences';

// Pages
import Dashboard from './pages/Dashboard';
import AllTasks from './pages/AllTasks';
import Login from './pages/Login';
import Pricing from './pages/Pricing';
import AuthCallback from './pages/AuthCallback';

// Constants
const LOADING_TIMEOUT = 3000; // 3 seconds timeout for loading

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const user = useUserStore((state) => state.user);
  const isOffline = useOfflineStore((state) => state.isOffline);
  const darkMode = useUserStore((state) => state.darkMode);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);

  // Handle initial loading
  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, LOADING_TIMEOUT);

    return () => clearTimeout(loadingTimer);
  }, []);

  // Update dark mode class on body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Fetch initial data
  useEffect(() => {
    if (user) {
      fetchTasks().catch(console.error);
    }
  }, [user, fetchTasks]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {!isOffline && <OfflineIndicator />}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
          duration: 3000,
        }}
      />
      
      {user ? (
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/tasks" element={<AllTasks />} />
                <Route path="/analytics" element={<ProductivityAnalytics />} />
                <Route path="/team" element={<TeamPanel />} />
                <Route path="/preferences" element={<UserPreferences />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <SubscriptionBanner />
            </main>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </div>
  );
}

export default App;