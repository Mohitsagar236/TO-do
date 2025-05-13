import React from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { useTaskStore } from '../store/taskStore';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export function Calendar() {
  const tasks = useTaskStore((state) => state.tasks);

  const events = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    start: task.dueDate ? new Date(task.dueDate) : new Date(),
    end: task.dueDate ? new Date(task.dueDate) : new Date(),
    allDay: true,
  }));

  return (
    <div className="h-[600px] bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
      />
    </div>
  );
}