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
import { LayoutGrid, Calendar as CalendarIcon, ListTodo, GitBranch, Activity, Clock, Star, ChevronRight, ChevronLeft } from 'lucide-react';

function Dashboard() {
  const { preferences } = useUserStore();
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

  const views = [
    { id: 'list', label: 'List', icon: ListTodo },
    { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'habits', label: 'Habits', icon: Star },
    { id: 'mindmap', label: 'Mind Map', icon: GitBranch },
    { id: 'agenda', label: 'Agenda', icon: Clock },
  ] as const;

  return (
    <div className="container mx-auto max-w-7xl p-4 lg:p-6 space-y-6">
      <DashboardSummary />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-9 space-y-6">
          {/* View Selector */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex flex-wrap gap-2">
              {views.map((viewOption) => {
                const Icon = viewOption.icon;
                return (
                  <Button
                    key={viewOption.id}
                    variant={view === viewOption.id ? 'primary' : 'outline'}
                    onClick={() => setView(viewOption.id)}
                    className="flex items-center"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {viewOption.label}
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

          {/* Task Form */}
          {!focusModeActive && <TaskForm />}

          {/* Main View */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm overflow-x-auto">
            {focusModeActive ? (
              <FocusMode />
            ) : (
              <>
                {view === 'list' && <TaskList />}
                {view === 'kanban' && <KanbanBoard />}
                {view === 'calendar' && <Calendar />}
                {view === 'habits' && <HabitTracker />}
                {view === 'mindmap' && <MindMap />}
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

            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-all duration-300 ${
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

            {!sidebarCollapsed && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
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