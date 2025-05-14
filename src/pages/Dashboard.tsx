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
import { LayoutGrid, Calendar as CalendarIcon, ListTodo, GitBranch, Activity, Clock, Star, ChevronRight, ChevronLeft, Zap } from 'lucide-react';

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

  const viewOptions = [
    { id: 'list', label: 'List', icon: ListTodo, color: 'from-blue-500 to-blue-600' },
    { id: 'kanban', label: 'Kanban', icon: LayoutGrid, color: 'from-green-500 to-green-600' },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon, color: 'from-purple-500 to-purple-600' },
    { id: 'habits', label: 'Habits', icon: Star, color: 'from-yellow-500 to-yellow-600', premium: true },
    { id: 'mindmap', label: 'Mind Map', icon: GitBranch, color: 'from-red-500 to-red-600', premium: true },
    { id: 'agenda', label: 'Agenda', icon: Clock, color: 'from-indigo-500 to-indigo-600' },
  ];

  return (
    <div className="container mx-auto max-w-7xl p-4 lg:p-6 space-y-6">
      <DashboardSummary />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-9 space-y-6">
          {/* View Selector */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {viewOptions.map((viewOption) => {
                const Icon = viewOption.icon;
                const isDisabled = viewOption.premium && !isPremium;
                const isActive = view === viewOption.id;
                
                return (
                  <Button
                    key={viewOption.id}
                    onClick={() => !isDisabled && setView(viewOption.id as any)}
                    disabled={isDisabled}
                    className={`
                      relative h-20 flex flex-col items-center justify-center gap-2
                      ${isActive ? `bg-gradient-to-r ${viewOption.color} text-white` : 'bg-gray-50 dark:bg-gray-700'}
                      ${isDisabled ? 'opacity-60' : ''}
                      rounded-xl transition-all duration-200
                    `}
                  >
                    <Icon className={`w-6 h-6 ${isActive ? 'text-white' : ''}`} />
                    <span className="text-sm">{viewOption.label}</span>
                    {isDisabled && (
                      <div className="absolute top-2 right-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                      </div>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Focus Mode Toggle */}
          <div className="flex justify-end">
            <Button
              variant={focusModeActive ? 'primary' : 'outline'}
              onClick={() => setFocusModeActive(!focusModeActive)}
              className="group"
            >
              <Activity className={`w-5 h-5 mr-2 ${focusModeActive ? 'text-white' : ''}`} />
              <span>{focusModeActive ? 'Exit Focus Mode' : 'Enter Focus Mode'}</span>
            </Button>
          </div>

          {/* Task Form */}
          {!focusModeActive && <TaskForm />}

          {/* Main View */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
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
  );
}

export default Dashboard;