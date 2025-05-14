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
import { LayoutGrid, Calendar as CalendarIcon, ListTodo, GitBranch, Activity, Clock, Star, ChevronRight, ChevronLeft, Zap, Trophy, Target, TrendingUp } from 'lucide-react';

function Dashboard() {
  const { preferences, subscription } = useUserStore();
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

  const isPremium = subscription?.plan === 'pro' || subscription?.plan === 'team';

  return (
    <div className="container mx-auto max-w-7xl p-4 lg:p-6 space-y-6">
      {/* Premium Features Banner */}
      {!isPremium && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Zap className="w-8 h-8" />
              <div>
                <h3 className="text-lg font-semibold">Unlock Premium Features</h3>
                <p className="text-sm opacity-90">Get access to AI-powered insights, unlimited projects, and more!</p>
              </div>
            </div>
            <Button
              onClick={() => window.location.href = '/pricing'}
              className="bg-white text-purple-600 hover:bg-purple-50"
            >
              Upgrade Now
            </Button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Tasks Completed</p>
              <h3 className="text-3xl font-bold">24</h3>
            </div>
            <Trophy className="w-12 h-12 opacity-80" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-blue-400 rounded-full h-2">
              <div className="bg-white rounded-full h-2 w-3/4"></div>
            </div>
            <p className="text-sm mt-2">75% of weekly goal</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Focus Time</p>
              <h3 className="text-3xl font-bold">3.5h</h3>
            </div>
            <Clock className="w-12 h-12 opacity-80" />
          </div>
          <p className="text-sm mt-4">↑ 15% from last week</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Productivity Score</p>
              <h3 className="text-3xl font-bold">92</h3>
            </div>
            <Target className="w-12 h-12 opacity-80" />
          </div>
          <p className="text-sm mt-4">Top 5% of users</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Current Streak</p>
              <h3 className="text-3xl font-bold">7</h3>
            </div>
            <TrendingUp className="w-12 h-12 opacity-80" />
          </div>
          <p className="text-sm mt-4">Personal best!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-9 space-y-6">
          {/* View Selector */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'list', label: 'List', icon: ListTodo },
                { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
                { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
                { id: 'habits', label: 'Habits', icon: Star, premium: true },
                { id: 'mindmap', label: 'Mind Map', icon: GitBranch, premium: true },
                { id: 'agenda', label: 'Agenda', icon: Clock },
              ].map((viewOption) => {
                const Icon = viewOption.icon;
                const isDisabled = viewOption.premium && !isPremium;
                return (
                  <Button
                    key={viewOption.id}
                    variant={view === viewOption.id ? 'primary' : 'outline'}
                    onClick={() => !isDisabled && setView(viewOption.id as any)}
                    disabled={isDisabled}
                    className="flex items-center"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {viewOption.label}
                    {isDisabled && <Zap className="w-3 h-3 ml-2 text-yellow-500" />}
                  </Button>
                );
              })}
              <Button
                variant={focusModeActive ? 'primary' : 'outline'}
                onClick={() => setFocusModeActive(!focusModeActive)}
                className="ml-auto"
              >
                <Activity className="w-4 h-4 mr-2" />
                Focus Mode
              </Button>
            </div>
          </div>

          {/* AI Assistant (Premium Feature) */}
          {isPremium && (
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1 rounded-lg shadow-lg">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <input
                      type="text"
                      placeholder="Ask AI Assistant to help organize your tasks, analyze productivity, or suggest improvements..."
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <Button className="flex-shrink-0">Ask AI</Button>
                </div>
              </div>
            </div>
          )}

          {/* Task Form */}
          {!focusModeActive && <TaskForm />}

          {/* Main View */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            {focusModeActive ? (
              <FocusMode />
            ) : (
              <>
                {view === 'list' && <TaskList />}
                {view === 'kanban' && <KanbanBoard />}
                {view === 'calendar' && <Calendar />}
                {view === 'habits' && isPremium && <HabitTracker />}
                {view === 'mindmap' && isPremium && <MindMap />}
                {view === 'agenda' && <AgendaView />}
              </>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className={`xl:col-span-3 transition-all duration-300 ${sidebarCollapsed ? 'xl:col-span-1' : 'xl:col-span-3'}`}>
          <div className="sticky top-4 space-y-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="absolute -left-3 top-1/2 transform -translate-y-1/2 hidden xl:flex"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>

            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ${
              sidebarCollapsed ? 'xl:w-16' : ''
            }`}>
              {!sidebarCollapsed && (
                <>
                  <div className="p-4 border-b dark:border-gray-700">
                    <PomodoroTimer />
                  </div>
                  <div className="p-4 border-b dark:border-gray-700">
                    <TimeTracker />
                  </div>
                  <div className="p-4">
                    <ProgressDisplay />
                  </div>
                </>
              )}
            </div>

            {!sidebarCollapsed && isPremium && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                <RoutineManager />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;