import React from 'react';
import { format } from 'date-fns';
import { CheckCircle, Circle, Trash2 } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { Task } from '../types';
import { Button } from './ui/Button';

export function TaskList() {
  const { tasks, toggleTask, deleteTask } = useTaskStore();

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => toggleTask(task.id)}
              className="focus:outline-none"
            >
              {task.completed ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <Circle className="w-6 h-6 text-gray-400" />
              )}
            </button>
            <div>
              <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{task.description}</p>
              )}
              <div className="flex items-center space-x-2 mt-1">
                <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
                <span className="text-xs text-gray-500">
                  {task.category}
                </span>
                {task.dueDate && (
                  <span className="text-xs text-gray-500">
                    Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => deleteTask(task.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      {tasks.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No tasks yet. Add some tasks to get started!
        </p>
      )}
    </div>
  );
}