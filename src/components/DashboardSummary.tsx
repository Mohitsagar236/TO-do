import React from 'react';
import { useTaskStore } from '../store/taskStore';
import { CheckCircle, Clock, AlertCircle, Calendar, Target, Award, TrendingUp } from 'lucide-react';

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold opacity-90">Task Progress</h3>
            <p className="text-3xl font-bold">{completionRate.toFixed(0)}%</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-sm opacity-90">
            {completedTasks} of {totalTasks} tasks completed
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold opacity-90">Time Management</h3>
            <p className="text-3xl font-bold">{dueSoonTasks}</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Tasks due soon</span>
          </div>
          <p className="text-sm opacity-90">
            {dueSoonTasks} tasks due in the next 3 days
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold opacity-90">Priority Tasks</h3>
            <p className="text-3xl font-bold">{highPriorityTasks}</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>High priority tasks</span>
          </div>
          <p className="text-sm opacity-90">
            {highPriorityTasks} tasks need immediate attention
          </p>
        </div>
      </div>

      {/* Premium Stats */}
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl shadow-lg text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold opacity-90">Productivity Score</h3>
            <p className="text-3xl font-bold">92</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4" />
            <span>Top 5% of users</span>
          </div>
          <p className="text-sm opacity-90">
            15% improvement from last week
          </p>
        </div>
      </div>
    </div>
  );
}