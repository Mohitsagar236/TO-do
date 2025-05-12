import React from 'react';
import { Sun, Moon, User } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { Button } from './ui/Button';

export default function Header() {
  const { darkMode, toggleDarkMode, user } = useUserStore();

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
          <div className="flex items-center space-x-2">
            <User size={18} />
            <span className="text-sm font-medium">
              {user?.name || 'Guest User'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}