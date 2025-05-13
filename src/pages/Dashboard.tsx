import React, { useState, useEffect } from 'react';
import { TaskForm } from '../components/ui/TaskForm';
import { TaskList } from '../components/TaskList';
import { KanbanBoard } from '../components/KanbanBoard';
import { Calendar } from '../components/Calendar';
import { PomodoroTimer } from '../components/PomodoroTimer';
import { TimeTracker } from '../components/TimeTracker';
import { DashboardSummary } from '../components/DashboardSummary';
import { UserPreferences } from '../components/UserPreferences';
import { HabitTracker } from '../components/HabitTracker';
import { FocusMode } from '../components/FocusMode';
import { MindMap } from '../components/MindMap';
import { AgendaView } from '../components/AgendaView';
import { RoutineManager } from '../components/RoutineManager';
import { ProgressDisplay } from '../components/ProgressDisplay';
import { Button } from '../components/ui/Button';
import { useUserStore } from '../store/userStore';
import { useRoutineStore } from '../store/routineStore';
import { useProgressStore } from '../store/progressStore';

function Dashboard() {
  const { preferences } = useUserStore();
  const checkAndExecuteRoutines = useRoutineStore((state) => state.checkAndExecuteRoutines);
  const { fetchProgress, fetchLeaderboard } = useProgressStore();
  const [view, setView] = useState<'list' | 'kanban' | 'calendar' | 'habits' | 'mindmap' | 'agenda' | 'routines' | 'progress'>(
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

  return (
    <div className="container mx-auto max-w-7xl">
      <DashboardSummary />
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={view === 'list' ? 'primary' : 'outline'}
            onClick={() => setView('list')}
            size="sm"
          >
            List
          </Button>
          <Button
            variant={view === 'kanban' ? 'primary' : 'outline'}
            onClick={() => setView('kanban')}
            size="sm"
          >
            Kanban
          </Button>
          <Button
            variant={view === 'calendar' ? 'primary' : 'outline'}
            onClick={() => setView('calendar')}
            size="sm"
          >
            Calendar
          </Button>
          <Button
            variant={view === 'habits' ? 'primary' : 'outline'}
            onClick={() => setView('habits')}
            size="sm"
          >
            Habits
          </Button>
          <Button
            variant={view === 'mindmap' ? 'primary' : 'outline'}
            onClick={() => setView('mindmap')}
            size="sm"
          >
            Mind Map
          </Button>
          <Button
            variant={view === 'agenda' ? 'primary' : 'outline'}
            onClick={() => setView('agenda')}
            size="sm"
          >
            Agenda
          </Button>
          <Button
            variant={view === 'routines' ? 'primary' : 'outline'}
            onClick={() => setView('routines')}
            size="sm"
          >
            Routines
          </Button>
          <Button
            variant={view === 'progress' ? 'primary' : 'outline'}
            onClick={() => setView('progress')}
            size="sm"
          >
            Progress
          </Button>
          <Button
            variant={focusModeActive ? 'primary' : 'outline'}
            onClick={() => setFocusModeActive(!focusModeActive)}
            size="sm"
          >
            Focus Mode
          </Button>
        </div>
      </div>
      
      {focusModeActive ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <FocusMode />
          </div>
          <div>
            <PomodoroTimer />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 space-y-6">
            <TaskForm />
            <div className="overflow-x-auto">
              {view === 'list' && <TaskList />}
              {view === 'kanban' && <KanbanBoard />}
              {view === 'calendar' && <Calendar />}
              {view === 'habits' && <HabitTracker />}
              {view === 'mindmap' && <MindMap />}
              {view === 'agenda' && <AgendaView />}
              {view === 'routines' && <RoutineManager />}
              {view === 'progress' && <ProgressDisplay />}
            </div>
          </div>
          <div className="space-y-6">
            <UserPreferences />
            <PomodoroTimer />
            <TimeTracker />
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;