import React from 'react';
import { TaskForm } from '../components/ui/TaskForm';
import { TaskList } from '../components/TaskList';

function Dashboard() {
  return (
    <div className="container mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Dashboard</h1>
      
      <div className="space-y-8">
        <TaskForm />
        <TaskList />
      </div>
    </div>
  );
}

export default Dashboard;