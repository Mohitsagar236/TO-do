import React from 'react';
import { Sun, Moon, User, LogOut } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { Button } from './ui/Button';
import toast from 'react-hot-toast';

export default function Header() {
  const { darkMode, toggleDarkMode, user, signOut } = useUserStore();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="h-16 px-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          TaskMaster
        </h1>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDarkMode}
            className="w-10"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="flex items-center space-x-2">
                  <User size={18} className="text-gray-600 dark:text-gray-300" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {user.name}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-10"
                >
                  <LogOut size={18} />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}