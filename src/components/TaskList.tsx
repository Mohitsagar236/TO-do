import React, { useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle, Circle, Trash2, MessageSquare, Share2, UserPlus } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { Task } from '../types';
import { Button } from './ui/Button';
import { TaskDetails } from './TaskDetails';
import toast from 'react-hot-toast';

export function TaskList() {
  const { tasks, toggleTask, deleteTask } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleToggleTask = async (id: string) => {
    try {
      await toggleTask(id);
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 dark:text-red-400';
      case 'medium':
        return 'text-yellow-500 dark:text-yellow-400';
      case 'low':
        return 'text-green-500 dark:text-green-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
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
              onClick={() => handleToggleTask(task.id)}
              className="focus:outline-none"
            >
              {task.completed ? (
                <CheckCircle className="w-6 h-6 text-green-500 dark:text-green-400" />
              ) : (
                <Circle className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              )}
            </button>
            <div>
              <h3 
                className={`font-medium ${
                  task.completed 
                    ? 'line-through text-gray-500 dark:text-gray-400' 
                    : 'text-gray-900 dark:text-white'
                } cursor-pointer`}
                onClick={() => setSelectedTask(task)}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
              )}
              <div className="flex items-center space-x-2 mt-1">
                <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {task.category}
                </span>
                {task.dueDate && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTask(task)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTask(task)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTask(task)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <UserPlus className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteTask(task.id)}
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
      {tasks.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No tasks yet. Add some tasks to get started!
        </p>
      )}
      {selectedTask && (
        <TaskDetails task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
}