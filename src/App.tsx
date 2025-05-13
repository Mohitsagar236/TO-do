import React, { useEffect } from 'react';
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

// Pages
import Dashboard from './pages/Dashboard';
import AllTasks from './pages/AllTasks';
import Login from './pages/Login';

function App() {
  const { darkMode, user } = useUserStore();
  const fetchTasks = useTaskStore((state) => state.fetchTasks);
  const { isOnline, cacheData } = useOfflineStore();

  useEffect(() => {
    if (user) {
      fetchTasks().then((tasks) => {
        if (tasks) {
          cacheData(tasks, 'tasks');
        }
      }).catch(console.error);
    }
  }, [user, fetchTasks, cacheData]);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 dark:bg-gray-900">
        {user && (
          <div className="lg:flex">
            <Sidebar />
          </div>
        )}
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <Routes>
              <Route
                path="/login"
                element={user ? <Navigate to="/" replace /> : <Login />}
              />
              <Route
                path="/"
                element={user ? <Dashboard /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/tasks"
                element={user ? <AllTasks /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/analytics"
                element={user ? <ProductivityAnalytics /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/team"
                element={user ? <TeamPanel /> : <Navigate to="/login" replace />}
              />
            </Routes>
          </main>
        </div>
      </div>
      <OfflineIndicator />
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
        }} 
      />
    </div>
  );
}

export default App;