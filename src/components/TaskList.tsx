import React, { useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle, Circle, Trash2, MessageSquare, Share2, UserPlus, Clock, Tag, AlertCircle, Filter, SortAsc, List } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { Task } from '../types';
import { Button } from './ui/Button';
import { TaskDetails } from './TaskDetails';
import toast from 'react-hot-toast';

export function TaskList() {
  const { tasks, toggleTask, deleteTask } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created'>('dueDate');

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
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'completed') return task.completed;
    if (filter === 'active') return !task.completed;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    active: tasks.filter(t => !t.completed).length,
    highPriority: tasks.filter(t => t.priority === 'high' && !t.completed).length
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Tasks</p>
              <p className="text-2xl font-bold">{taskStats.total}</p>
            </div>
            <List className="w-8 h-8 text-white/80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Completed</p>
              <p className="text-2xl font-bold">{taskStats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-white/80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Active</p>
              <p className="text-2xl font-bold">{taskStats.active}</p>
            </div>
            <Clock className="w-8 h-8 text-white/80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">High Priority</p>
              <p className="text-2xl font-bold">{taskStats.highPriority}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-white/80" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({taskStats.total})
              </Button>
              <Button
                variant={filter === 'active' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('active')}
              >
                Active ({taskStats.active})
              </Button>
              <Button
                variant={filter === 'completed' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('completed')}
              >
                Completed ({taskStats.completed})
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <SortAsc className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="created">Sort by Created</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {sortedTasks.map((task) => (
          <div
            key={task.id}
            className={`group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 ${
              task.completed ? 'opacity-75' : ''
            }`}
          >
            <div className="p-4">
              <div className="flex items-start gap-4">
                <button
                  onClick={() => handleToggleTask(task.id)}
                  className="flex-shrink-0 mt-1"
                >
                  {task.completed ? (
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
                
                <div className="flex-grow min-w-0">
                  <h3 
                    className={`text-lg font-medium dark:text-white truncate ${
                      task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''
                    }`}
                    onClick={() => setSelectedTask(task)}
                  >
                    {task.title}
                  </h3>
                  
                  {task.description && (
                    <p className="mt-1 text-gray-600 dark:text-gray-300 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-white ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    
                    {task.category && (
                      <span className="flex items-center text-gray-500 dark:text-gray-400">
                        <Tag className="w-4 h-4 mr-1" />
                        {task.category}
                      </span>
                    )}
                    
                    {task.dueDate && (
                      <span className="flex items-center text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4 mr-1" />
                        {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
            </div>
          </div>
        ))}

        {sortedTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No tasks found</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {filter === 'completed' 
                ? "You haven't completed any tasks yet"
                : filter === 'active'
                ? "You don't have any active tasks"
                : "Start by adding your first task"}
            </p>
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskDetails task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
}