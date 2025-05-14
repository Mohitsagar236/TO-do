import React, { useState, useEffect } from 'react';
import { TaskForm } from '../components/ui/TaskForm';
import { TaskList } from '../components/TaskList';
import { KanbanBoard } from '../components/KanbanBoard';
import { Calendar } from '../components/Calendar';
import { PomodoroTimer } from '../components/PomodoroTimer';
import { TimeTracker } from '../components/TimeTracker';
import { DashboardSummary } from '../components/DashboardSummary';
import { HabitTracker } from '../components/HabitTracker';
import { FocusMode } from '../components/FocusMode';
import { MindMap } from '../components/MindMap';
import { AgendaView } from '../components/AgendaView';
import { RoutineManager } from '../components/RoutineManager';
import { ProgressDisplay } from '../components/ProgressDisplay';
import { PluginStore } from '../components/PluginStore';
import { Button } from '../components/ui/Button';
import { useUserStore } from '../store/userStore';
import { useRoutineStore } from '../store/routineStore';
import { useProgressStore } from '../store/progressStore';
import { useTaskStore } from '../store/taskStore';
import { LayoutGrid, Calendar as CalendarIcon, ListTodo, GitBranch, Activity, Clock, Star, ChevronRight, ChevronLeft, Zap, Crown, X } from 'lucide-react';
import toast from 'react-hot-toast';

function Dashboard() {
  const { preferences, subscription } = useUserStore();
  const { addTask } = useTaskStore();
  const checkAndExecuteRoutines = useRoutineStore((state) => state.checkAndExecuteRoutines);
  const { fetchProgress, fetchLeaderboard } = useProgressStore();
  const [view, setView] = useState<'list' | 'kanban' | 'calendar' | 'habits' | 'mindmap' | 'agenda'>(
    preferences.defaultView
  );
  const [focusModeActive, setFocusModeActive] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    checkAndExecuteRoutines();
    fetchProgress();
    fetchLeaderboard();

    const interval = setInterval(checkAndExecuteRoutines, 60000);
    return () => clearInterval(interval);
  }, [checkAndExecuteRoutines, fetchProgress, fetchLeaderboard]);

  const handleAddTask = async (taskData: any) => {
    try {
      const task = {
        title: taskData.title,
        description: taskData.description || '',
        dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
        priority: taskData.priority || 'medium',
        category: taskData.category || 'personal',
        completed: false,
        status: 'todo'
      };

      await addTask(task);
      toast.success('Task added successfully!');
    } catch (error) {
      console.error('Failed to add task:', error);
      toast.error('Failed to add task');
    }
  };

  const isPremium = subscription?.plan === 'pro' || subscription?.plan === 'team';

  const viewOptions = [
    { id: 'list', label: 'List', icon: ListTodo, color: 'from-blue-500 to-blue-600', description: 'Simple task list view' },
    { id: 'kanban', label: 'Kanban', icon: LayoutGrid, color: 'from-green-500 to-green-600', description: 'Drag & drop task management' },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon, color: 'from-purple-500 to-purple-600', description: 'Calendar view of tasks' },
    { id: 'habits', label: 'Habits', icon: Star, color: 'from-yellow-500 to-yellow-600', premium: true, description: 'Track daily habits' },
    { id: 'mindmap', label: 'Mind Map', icon: GitBranch, color: 'from-red-500 to-red-600', premium: true, description: 'Visual task relationships' },
    { id: 'agenda', label: 'Agenda', icon: Clock, color: 'from-indigo-500 to-indigo-600', description: 'Timeline view of tasks' },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-2">Welcome back!</h1>
              <p className="opacity-90">
                {isPremium ? (
                  <span className="flex items-center">
                    <Crown className="w-5 h-5 mr-2 text-yellow-300" />
                    Premium Member
                  </span>
                ) : (
                  'Free Plan'
                )}
              </p>
            </div>
            <Button
              onClick={() => setFocusModeActive(!focusModeActive)}
              className={`w-full sm:w-auto ${
                focusModeActive 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              {focusModeActive ? (
                <>
                  <X className="w-5 h-5 mr-2" />
                  Exit Focus Mode
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5 mr-2" />
                  Enter Focus Mode
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <DashboardSummary />

        {/* View Selector */}
        {!focusModeActive && (
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {viewOptions.map((viewOption) => {
                const Icon = viewOption.icon;
                const isDisabled = viewOption.premium && !isPremium;
                const isActive = view === viewOption.id;
                
                return (
                  <div
                    key={viewOption.id}
                    className={`
                      relative group
                      ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    onClick={() => !isDisabled && setView(viewOption.id as any)}
                  >
                    <div className={`
                      h-24 rounded-xl transition-all duration-300
                      ${isActive ? `bg-gradient-to-r ${viewOption.color} text-white` : 'bg-gray-50 dark:bg-gray-700'}
                      ${isDisabled ? 'opacity-60' : 'hover:scale-105'}
                      flex flex-col items-center justify-center gap-2
                    `}>
                      <Icon className={`w-6 h-6 ${isActive ? 'text-white' : ''}`} />
                      <span className="text-sm font-medium">{viewOption.label}</span>
                      {isDisabled && (
                        <div className="absolute top-2 right-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                        </div>
                      )}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-full left-0 right-0 mt-2 p-2 bg-gray-900 text-white text-xs rounded-lg z-10">
                      {viewOption.description}
                      {isDisabled && ' (Premium)'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content and Sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-9 space-y-6">
            {/* Task Form */}
            {!focusModeActive && <TaskForm onSubmit={handleAddTask} />}

            {/* Main View */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[600px]">
              {focusModeActive ? (
                <FocusMode onExit={() => setFocusModeActive(false)} />
              ) : (
                <div className="p-6">
                  {view === 'list' && <TaskList />}
                  {view === 'kanban' && <KanbanBoard />}
                  {view === 'calendar' && <Calendar />}
                  {view === 'habits' && isPremium && <HabitTracker />}
                  {view === 'mindmap' && isPremium && <MindMap />}
                  {view === 'agenda' && <AgendaView />}
                </div>
              )}
            </div>
          </div>

          <div className={`xl:col-span-3 transition-all duration-300 ${sidebarCollapsed ? 'xl:col-span-1' : 'xl:col-span-3'}`}>
            <div className="sticky top-4 space-y-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="absolute -left-3 top-1/2 transform -translate-y-1/2 hidden xl:flex z-10 bg-white dark:bg-gray-800"
              >
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>

              <div className={`transition-all duration-300 space-y-6 ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                <PomodoroTimer />
                <TimeTracker />
                <ProgressDisplay />
                {isPremium && <RoutineManager />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;