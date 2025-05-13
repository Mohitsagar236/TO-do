import React, { useState } from 'react';
import { format, parse, startOfWeek, getDay, addMinutes } from 'date-fns';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { useTaskStore } from '../store/taskStore';
import { Task } from '../types';
import { Button } from './ui/Button';
import { Clock, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface TimeBlock {
  id: string;
  title: string;
  start: Date;
  end: Date;
  taskId?: string;
}

export function AgendaView() {
  const { tasks, updateTask } = useTaskStore();
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [blockDuration, setBlockDuration] = useState(30);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setShowAddBlock(true);
  };

  const handleAddTimeBlock = async () => {
    if (!selectedTask) {
      toast.error('Please select a task');
      return;
    }

    const newBlock: TimeBlock = {
      id: Math.random().toString(36).substr(2, 9),
      title: selectedTask.title,
      start: new Date(),
      end: addMinutes(new Date(), blockDuration),
      taskId: selectedTask.id,
    };

    setTimeBlocks([...timeBlocks, newBlock]);
    setShowAddBlock(false);
    setSelectedTask(null);

    // Update task with time block information
    await updateTask(selectedTask.id, {
      timeBlocks: [...(selectedTask.timeBlocks || []), newBlock],
    });

    toast.success('Time block added');
  };

  const events = [
    ...timeBlocks,
    ...tasks
      .filter((task) => task.dueDate)
      .map((task) => ({
        id: task.id,
        title: task.title,
        start: task.dueDate!,
        end: addMinutes(task.dueDate!, 30),
        taskId: task.id,
      })),
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">Agenda</h2>
        <Button onClick={() => setShowAddBlock(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Time Block
        </Button>
      </div>

      {showAddBlock && (
        <div className="mb-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Add Time Block</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                Select Task
              </label>
              <select
                value={selectedTask?.id || ''}
                onChange={(e) => setSelectedTask(tasks.find((t) => t.id === e.target.value) || null)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select a task...</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={blockDuration}
                  onChange={(e) => setBlockDuration(parseInt(e.target.value))}
                  min="15"
                  step="15"
                  className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddBlock(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTimeBlock}>Add Block</Button>
            </div>
          </div>
        </div>
      )}

      <div className="h-[600px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectSlot={handleSelectSlot}
          views={['day', 'week']}
          defaultView="week"
          step={15}
          timeslots={4}
          className="rounded-lg shadow bg-white dark:bg-gray-800"
        />
      </div>
    </div>
  );
}