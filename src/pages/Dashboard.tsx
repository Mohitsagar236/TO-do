import React, { useState } from 'react';
import { TaskForm } from '../components/ui/TaskForm';
import { TaskList } from '../components/TaskList';
import { KanbanBoard } from '../components/KanbanBoard';
import { Calendar } from '../components/Calendar';
import { Button } from '../components/ui/Button';

function Dashboard() {
  const [view, setView] = useState<'list' | 'kanban' | 'calendar'>('list');

  return (
    <div className="container mx-auto max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Dashboard</h1>
        <div className="space-x-2">
          <Button
            variant={view === 'list' ? 'primary' : 'outline'}
            onClick={() => setView('list')}
          >
            List
          </Button>
          <Button
            variant={view === 'kanban' ? 'primary' : 'outline'}
            onClick={() => setView('kanban')}
          >
            Kanban
          </Button>
          <Button
            variant={view === 'calendar' ? 'primary' : 'outline'}
            onClick={() => setView('calendar')}
          >
            Calendar
          </Button>
        </div>
      </div>
      
      <div className="space-y-8">
        <TaskForm />
        {view === 'list' && <TaskList />}
        {view === 'kanban' && <KanbanBoard />}
        {view === 'calendar' && <Calendar />}
      </div>
    </div>
  );
}

export default Dashboard;