import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useTaskStore } from '../store/taskStore';
import { useProgressStore } from '../store/progressStore';
import { useHabitStore } from '../store/habitStore';
import { Button } from './ui/Button';
import {
  Calendar,
  Clock,
  Download,
  Filter,
  TrendingUp,
  Award,
  Target,
  Zap,
} from 'lucide-react';
import { format, startOfWeek, addDays, isWithinInterval, subDays } from 'date-fns';
import toast from 'react-hot-toast';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function ProductivityAnalytics() {
  const tasks = useTaskStore((state) => state.tasks);
  const { progress } = useProgressStore();
  const habits = useHabitStore((state) => state.habits);
  const [dateRange, setDateRange] = React.useState('week');
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  const categories = useMemo(() => {
    return ['all', ...new Set(tasks.map((task) => task.category))];
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const now = new Date();
    const interval = {
      start: dateRange === 'week' ? startOfWeek(now) : subDays(now, 30),
      end: now,
    };

    return tasks.filter((task) => {
      const isInRange = task.createdAt && isWithinInterval(new Date(task.createdAt), interval);
      const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
      return isInRange && matchesCategory;
    });
  }, [tasks, dateRange, selectedCategory]);

  // Time Usage Data
  const timeUsageData = useMemo(() => {
    const categoryTime: { [key: string]: number } = {};
    filteredTasks.forEach((task) => {
      const timeSpent = task.timeEntries?.reduce((total, entry) => {
        return total + (entry.duration ? parseFloat(entry.duration) : 0);
      }, 0) || 0;
      categoryTime[task.category] = (categoryTime[task.category] || 0) + timeSpent;
    });

    return Object.entries(categoryTime).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredTasks]);

  // Task Completion Data
  const completionData = useMemo(() => {
    const days = dateRange === 'week' ? 7 : 30;
    const data = [];
    const startDate = subDays(new Date(), days - 1);

    for (let i = 0; i < days; i++) {
      const date = addDays(startDate, i);
      const dayTasks = filteredTasks.filter(
        (task) => task.createdAt && format(new Date(task.createdAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      data.push({
        date: format(date, 'MMM dd'),
        completed: dayTasks.filter((t) => t.completed).length,
        total: dayTasks.length,
      });
    }

    return data;
  }, [filteredTasks, dateRange]);

  // Productivity Score
  const productivityScore = useMemo(() => {
    const completed = filteredTasks.filter((t) => t.completed).length;
    const total = filteredTasks.length;
    const onTime = filteredTasks.filter(
      (t) => t.completed && t.dueDate && new Date(t.completedAt!) <= new Date(t.dueDate)
    ).length;

    return {
      completion: total ? (completed / total) * 100 : 0,
      onTime: completed ? (onTime / completed) * 100 : 0,
      streak: progress?.streakDays || 0,
      habitConsistency: habits.length
        ? (habits.filter((h) => h.completions?.length > 0).length / habits.length) * 100
        : 0,
    };
  }, [filteredTasks, progress, habits]);

  const handleExport = async () => {
    try {
      const data = {
        timeUsage: timeUsageData,
        taskCompletion: completionData,
        productivityScore,
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `productivity-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Report exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">Productivity Analytics</h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg p-1">
            <Button
              variant={dateRange === 'week' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setDateRange('week')}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Week
            </Button>
            <Button
              variant={dateRange === 'month' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setDateRange('month')}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Month
            </Button>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Productivity Score Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
              <h3 className="text-2xl font-bold dark:text-white">
                {productivityScore.completion.toFixed(1)}%
              </h3>
            </div>
            <Target className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">On-Time Rate</p>
              <h3 className="text-2xl font-bold dark:text-white">
                {productivityScore.onTime.toFixed(1)}%
              </h3>
            </div>
            <Clock className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Streak</p>
              <h3 className="text-2xl font-bold dark:text-white">
                {productivityScore.streak} days
              </h3>
            </div>
            <Zap className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Habit Consistency</p>
              <h3 className="text-2xl font-bold dark:text-white">
                {productivityScore.habitConsistency.toFixed(1)}%
              </h3>
            </div>
            <Award className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Time Usage Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Time Usage by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={timeUsageData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => entry.name}
                >
                  {timeUsageData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Completion Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Task Completion Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={completionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10B981"
                  name="Completed"
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3B82F6"
                  name="Total"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Productivity Score Trend */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow col-span-2">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Daily Productivity Score</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={completionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="completed"
                  fill="#3B82F6"
                  name="Productivity Score"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Productivity Insights</h3>
        <div className="space-y-4">
          {productivityScore.completion > 80 && (
            <div className="flex items-center text-green-500">
              <TrendingUp className="w-5 h-5 mr-2" />
              <p>Great job! Your task completion rate is above 80%.</p>
            </div>
          )}
          {productivityScore.streak > 5 && (
            <div className="flex items-center text-yellow-500">
              <Zap className="w-5 h-5 mr-2" />
              <p>You're on a {productivityScore.streak} day streak! Keep it up!</p>
            </div>
          )}
          {productivityScore.onTime < 50 && (
            <div className="flex items-center text-red-500">
              <Clock className="w-5 h-5 mr-2" />
              <p>Try to improve your on-time completion rate for better productivity.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}