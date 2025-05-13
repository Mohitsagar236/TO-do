import React from 'react';
import { useUserStore } from '../store/userStore';
import { Button } from './ui/Button';

export function UserPreferences() {
  const { preferences, updatePreferences } = useUserStore();

  const handleViewChange = (view: 'list' | 'kanban' | 'calendar') => {
    updatePreferences({ defaultView: view });
  };

  const handleToggleCompletedTasks = () => {
    updatePreferences({ showCompletedTasks: !preferences.showCompletedTasks });
  };

  const handleToggleNotifications = () => {
    updatePreferences({ enableNotifications: !preferences.enableNotifications });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">Preferences</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2 dark:text-gray-300">Default View</h3>
          <div className="flex space-x-2">
            <Button
              variant={preferences.defaultView === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleViewChange('list')}
            >
              List
            </Button>
            <Button
              variant={preferences.defaultView === 'kanban' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleViewChange('kanban')}
            >
              Kanban
            </Button>
            <Button
              variant={preferences.defaultView === 'calendar' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleViewChange('calendar')}
            >
              Calendar
            </Button>
          </div>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={preferences.showCompletedTasks}
              onChange={handleToggleCompletedTasks}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm dark:text-gray-300">Show completed tasks</span>
          </label>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={preferences.enableNotifications}
              onChange={handleToggleNotifications}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm dark:text-gray-300">Enable notifications</span>
          </label>
        </div>
      </div>
    </div>
  );
}