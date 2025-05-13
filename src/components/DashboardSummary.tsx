import React from 'react';
import { useTaskStore } from '../store/taskStore';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export function DashboardSummary() {
  const tasks = useTaskStore((state) => state.tasks);

  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const dueSoonTasks = tasks.filter((task) => {
    if (!task.dueDate || task.completed) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  }).length;

  const highPriorityTasks = tasks.filter(
    (task) => task.priority === 'high' && !task.completed
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
            <p className="text-2xl font-semibold dark:text-white">
              {completionRate.toFixed(1)}%
            </p>
          </div>
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          {completedTasks} of {totalTasks} tasks completed
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Due Soon</p>
            <p className="text-2xl font-semibold dark:text-white">{dueSoonTasks}</p>
          </div>
          <Clock className="w-8 h-8 text-yellow-500" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          Tasks due in the next 3 days
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">High Priority</p>
            <p className="text-2xl font-semibold dark:text-white">{highPriorityTasks}</p>
          </div>
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          High priority tasks remaining
        </p>
      </div>
    </div>
  );
}