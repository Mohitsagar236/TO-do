import React, { useState } from 'react';
import { TaskForm } from '../components/ui/TaskForm';
import { TaskList } from '../components/TaskList';
import { KanbanBoard } from '../components/KanbanBoard';
import { Calendar } from '../components/Calendar';
import { PomodoroTimer } from '../components/PomodoroTimer';
import { TimeTracker } from '../components/TimeTracker';
import { Button } from '../components/ui/Button';

function Dashboard() {
  const [view, setView] = useState<'list' | 'kanban' | 'calendar'>('list');

  return (
    <div className="container mx-auto max-w-7xl">
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
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <TaskForm />
          <div className="overflow-x-auto">
            {view === 'list' && <TaskList />}
            {view === 'kanban' && <KanbanBoard />}
            {view === 'calendar' && <Calendar />}
          </div>
        </div>
        <div className="space-y-6">
          <PomodoroTimer />
          <TimeTracker />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;