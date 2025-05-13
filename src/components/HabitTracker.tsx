import React, { useState } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { useHabitStore } from '../store/habitStore';
import { Button } from './ui/Button';
import { Plus, Trophy, Trash2, Award } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function HabitTracker() {
  const { habits, completions, addHabit, completeHabit, archiveHabit, getStreak, calculatePoints } = useHabitStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    frequency: 'daily' as const,
    target: 1,
    unit: '',
    color: '#3b82f6',
  });

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addHabit(newHabit);
      setNewHabit({
        name: '',
        description: '',
        frequency: 'daily',
        target: 1,
        unit: '',
        color: '#3b82f6',
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add habit:', error);
    }
  };

  const handleComplete = async (habitId: string) => {
    try {
      await completeHabit(habitId, 1);
    } catch (error) {
      console.error('Failed to complete habit:', error);
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(new Date());
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const weekDays = getWeekDays();

  const getCompletionData = (habitId: string) => {
    const habitCompletions = completions[habitId] || [];
    return weekDays.map(day => ({
      date: format(day, 'EEE'),
      completed: habitCompletions.some(c => format(c.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">Habits</h2>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Habit
        </Button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddHabit} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
          <div>
            <label className="block text-sm font-medium dark:text-gray-300">Name</label>
            <input
              type="text"
              value={newHabit.name}
              onChange={e => setNewHabit({ ...newHabit, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-gray-300">Description</label>
            <textarea
              value={newHabit.description}
              onChange={e => setNewHabit({ ...newHabit, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">Frequency</label>
              <select
                value={newHabit.frequency}
                onChange={e => setNewHabit({ ...newHabit, frequency: e.target.value as 'daily' | 'weekly' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">Color</label>
              <input
                type="color"
                value={newHabit.color}
                onChange={e => setNewHabit({ ...newHabit, color: e.target.value })}
                className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Habit</Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {habits.map(habit => (
          <div
            key={habit.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
            style={{ borderLeft: `4px solid ${habit.color}` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold dark:text-white">{habit.name}</h3>
                {habit.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{habit.description}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-yellow-500">
                  <Trophy className="w-5 h-5" />
                  <span className="font-medium">{calculatePoints(habit.id)}</span>
                </div>
                <div className="flex items-center space-x-1 text-blue-500">
                  <Award className="w-5 h-5" />
                  <span className="font-medium">{getStreak(habit.id)} days</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => archiveHabit(habit.id)}
                  className="text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getCompletionData(habit.id)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke={habit.color}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <div className="grid grid-cols-7 gap-1 flex-1">
                {weekDays.map(day => {
                  const isCompleted = (completions[habit.id] || []).some(
                    c => format(c.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                  );
                  return (
                    <div
                      key={day.toString()}
                      className={`h-8 rounded flex items-center justify-center text-sm ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {format(day, 'dd')}
                    </div>
                  );
                })}
              </div>
              <Button
                onClick={() => handleComplete(habit.id)}
                className="ml-4"
                disabled={
                  (completions[habit.id] || []).some(c =>
                    format(c.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                  )
                }
              >
                Complete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}