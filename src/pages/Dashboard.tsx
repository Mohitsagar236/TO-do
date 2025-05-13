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
import { LayoutGrid, Calendar as CalendarIcon, ListTodo, GitBranch, Activity, Clock, Star } from 'lucide-react';

function Dashboard() {
  const { preferences } = useUserStore();
  const checkAndExecuteRoutines = useRoutineStore((state) => state.checkAndExecuteRoutines);
  const { fetchProgress, fetchLeaderboard } = useProgressStore();
  const [view, setView] = useState<'list' | 'kanban' | 'calendar' | 'habits' | 'mindmap' | 'agenda'>(
    preferences.defaultView
  );
  const [focusModeActive, setFocusModeActive] = useState(false);

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
    <div className="container mx-auto max-w-7xl space-y-6">
      <DashboardSummary />

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Column - Main Content */}
        <div className="xl:col-span-3 space-y-6">
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

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm divide-y divide-gray-200 dark:divide-gray-700">
            <div className="p-4">
              <PomodoroTimer />
            </div>
            <div className="p-4">
              <TimeTracker />
            </div>
          </div>

          {/* Progress Display */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <ProgressDisplay />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;